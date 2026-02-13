import moment from './js/moment-es.js';

/**
 * Mapping of file extensions to MIME types for octet-stream workaround
 * @type {Object<string, string>}
 */
const EXT_MIME_MAPPINGS = {
    'mp3': 'audio/mpeg',
    'pdf': 'application/pdf',
    'zip': 'application/zip',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'exe': 'application/exe',
    'avi': 'video/x-msvideo',
    'torrent': 'application/x-bittorrent'
};

/** @type {string[]} Fields available for rule matching */
const RULE_FIELDS = ['mime', 'tabUrl', 'referrer', 'url', 'finalUrl', 'filename'];

/** @type {string} Special field name for date substitution */
const DATE_FIELD = 'date';

/** @type {string} Default action when filename conflicts occur */
const DEFAULT_CONFLICT_ACTION = 'uniquify';

/**
 * Normalize filename for Unicode compatibility
 * Handles German umlauts (ä,ö,ü), Nordic chars (å,æ,ø), and other Unicode characters
 * @param {string} filename - Raw filename from download API
 * @returns {string} - Unicode normalized filename
 */
function normalizeFilename(filename) {
    if (!filename || typeof filename !== 'string') {
        console.warn('normalizeFilename: Invalid filename input:', filename);
        return filename || '';
    }

    try {
        // Step 1: Try to decode any URL encoding
        let decoded = filename;
        if (filename.includes('%')) {
            try {
                decoded = decodeURIComponent(filename);
                console.log('Unicode filename decoded:', { original: filename, decoded: decoded });
            } catch (e) {
                // If decoding fails, use original filename
                console.log('Filename decode failed, using original:', filename);
                decoded = filename;
            }
        }

        // Step 2: Normalize Unicode to NFC form
        // (Canonical Decomposition, followed by Canonical Composition)
        const normalized = decoded.normalize('NFC');
        
        // Log Unicode normalization for debugging - only if actually normalized
        if (decoded !== normalized) {
            console.log('Unicode normalization applied:', {
                original: filename,
                decoded: decoded,
                normalized: normalized
            });
        }
        
        return normalized;
    } catch (error) {
        console.error('Error in normalizeFilename:', error, 'for filename:', filename);
        return filename; // Fallback to original filename
    }
}

/**
 * Create Unicode-aware regular expression
 * @param {string} pattern - Regex pattern
 * @param {string} flags - Regex flags (default: 'i')
 * @returns {RegExp} - Unicode-compatible regex
 */
function createUnicodeRegex(pattern, flags = 'i') {
    // Add unicode flag for proper Unicode property support
    const unicodeFlags = flags.includes('u') ? flags : flags + 'u';
    
    try {
        return new RegExp(pattern, unicodeFlags);
    } catch (error) {
        // Fallback to original pattern if Unicode regex fails
        console.warn('Unicode regex creation failed, using basic regex:', error);
        try {
            return new RegExp(pattern, flags);
        } catch (fallbackError) {
            console.error('Regex creation completely failed:', fallbackError);
            // Return a regex that matches everything as last resort
            return /.*/;
        }
    }
}

/**
 * Check if the extension has tabs permission
 * @returns {Promise<boolean>} True if tabs permission is granted
 */
async function hasTabsPermission() {
    return chrome.permissions.contains({ permissions: ['tabs'] });
}

/**
 * Get the URL of the currently active tab
 * @returns {Promise<string|null>} Active tab URL or null if permission denied/error
 */
async function getActiveTabUrl() {
    const hasPermission = await hasTabsPermission();
    if (!hasPermission) {
        return null;
    }
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab?.url ?? null;
    } catch (err) {
        console.warn('Failed to get active tab URL:', err);
        return null;
    }
}

/**
 * Main download filename determination handler
 * Processes downloads through user-defined rules for organization
 * Handles Unicode filenames, MIME type detection, and pattern substitution
 * @param {chrome.downloads.DownloadItem} downloadItem - Chrome download item
 * @param {function} suggest - Callback to provide filename suggestion
 */
chrome.downloads.onDeterminingFilename.addListener( function (downloadItem, suggest) {
    console.log("Downloading item %o", downloadItem);

    chrome.storage.local.get(['rulesets'], async ({ rulesets }) => {
        const tabUrl = await getActiveTabUrl()

        const item = {
            'mime': downloadItem.mime,
            'referrer': decodeURI(downloadItem.referrer),
            'tabUrl': tabUrl,
            'url': decodeURI(downloadItem.url),
            'finalUrl': decodeURI(downloadItem.finalUrl),
            'filename': normalizeFilename(downloadItem.filename), // Unicode normalization fix
            'startTime': new Date(downloadItem.startTime)
        };
    
        // Octet-stream workaround
        if (downloadItem.mime == 'application/octet-stream') {
            const matches = downloadItem.filename.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
            const extension = matches && matches[1];
    
            if (EXT_MIME_MAPPINGS[extension]) {
                item.mime = EXT_MIME_MAPPINGS[extension];
            }
        }

        let suggestion = undefined;

        rulesets.every(function (rule) {
            if (!rule.enabled) {
                console.log("Rule disabled: %o", rule);
                return true; // continue to the next rule
            }
    
            const substitutions = {};
    
            const success = RULE_FIELDS.every(function (field) {
                if (!rule[field]) {
                    substitutions[field] = [item[field]];
                    return true; // skip this and continue to the next field
                }

                // tabUrl requires tabs permission; without it we cannot match
                if (field === 'tabUrl' && (item[field] == null || item[field] === '')) {
                    return false;
                }
    
                const regex = createUnicodeRegex(rule[field], 'i'); // Unicode-aware regex
                const matches = regex.exec(item[field]);
                if (!matches) {
                    return false; // rule failed, break
                }
                matches.shift();
                substitutions[field] = [item[field]].concat(matches);
                return true;
            });
    
            if (!success) {
                console.log("Rule didn't match: %o", rule);
                return true; // continue to the next rule
            }
    
            console.log("Rule matched: %o", rule);
    
            let result = true;
    
            let filename = rule['pattern'].replace(/\$\{(\w+)(?::(.+?))?\}/g, function (orig, field, idx) {
                if (field === DATE_FIELD) {
                    if (idx) {
                        return moment(item.startTime).format(idx);
                    } else {
                        return moment(item.startTime).format("YYYY-MM-DD");
                    }
                }
    
                if (!substitutions[field]) {
                    console.log('Invalid field %s', field);
                    result = false;
                    return orig;
                }
    
                if (idx) {
                    if (!substitutions[field][idx]) {
                        console.log('Invalid index %s for field %s', idx, field);
                        result = false;
                        return orig;
                    }
                    return substitutions[field][idx];
                }
                return substitutions[field][0];
            });
    
            // if no exact filename specified use the original one
            if (/\/$/.test(filename)) {
                filename = filename + substitutions.filename[0];
            }
    
            // remove trailing slashes
            filename = filename.replace(/^\/+/, '');
    
            let conflictAction = rule['conflict-action'];
            if (!conflictAction) {
                conflictAction = DEFAULT_CONFLICT_ACTION;
            }
    
            if (result) {
                suggestion = {
                    filename: filename,
                    conflictAction: conflictAction
                };
                return false; // suggestion found, do not continue to the next rule
            }
        });

        if (suggestion !== undefined) {
            console.log("Selected suggestion: %s", JSON.stringify(suggestion));
            suggest(suggestion);
        } else {
            console.log("No matching rule was found")
            suggest();
        }
    });

    return true;
});

/**
 * Create offscreen document for localStorage migration
 * Required for accessing localStorage in Manifest V3
 * @returns {Promise<void>}
 */
async function createOffscreen() {
    if (await chrome.offscreen.hasDocument()) {
      return;
    }
  
    await chrome.offscreen.createDocument({
      url: './offscreen.html',
      reasons: ['LOCAL_STORAGE'],
      justification:
        'migrate from localStorage config to storage.local',
    });
  
    console.debug('Offscreen iframe loaded');
}

/**
 * Extension initialization and version migration logic
 * Handles migration from localStorage to storage.local for Manifest V3 compatibility
 * Opens options page if version changed or first install
 */
chrome.storage.local.get(['version', 'showChangelog']).then(
    ( values ) => {
        if (values['version'] === undefined) {
            // migrate from localStorate
            createOffscreen().then(
                () => {
                    chrome.runtime.sendMessage('getRulesetsFromLS', (response) => {
                        console.log('received old rule sets: %s', response);
                        if (response !== undefined) {
                            // if has old rule sets to migrate
                            chrome.storage.local.set({
                                'rulesets': JSON.parse(response),
                                'version': chrome.runtime.getManifest().version,
                                'showChangelog': true
                            }).then(
                                () => {
                                    chrome.runtime.sendMessage('removeRulesetsFromLS', (response) => {
                                        console.log('rule sets migrated');
                                        chrome.offscreen.closeDocument();
                                        chrome.tabs.create({ url: "options.html" });        
                                    });
                                }
                            );
                        } else {
                            // if just installed
                            chrome.storage.local.set({
                                'version': chrome.runtime.getManifest().version,
                                'showChangelog': true
                            }).then(
                                () =>  {
                                    chrome.offscreen.closeDocument();
                                    chrome.tabs.create({ url: "options.html" });        
                                }
                            );
                        }
                    });
                }
            );
        } else {
            // all migrated
            const version = values['version'];
            if (version === undefined || version != chrome.runtime.getManifest().version) {
                chrome.storage.local.set({
                    'version': chrome.runtime.getManifest().version,
                    'showChangelog': true
                }).then(
                    () =>  {
                        chrome.tabs.create({ url: "options.html" });        
                    }
                );
            }
        }
    }
);
