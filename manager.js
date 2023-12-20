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

const RULE_FIELDS = ['mime', 'referrer', 'url', 'finalUrl', 'filename'];
const DATE_FIELD = 'date';
const DEFAULT_CONFLICT_ACTION = 'uniquify';

chrome.downloads.onDeterminingFilename.addListener(function (downloadItem, suggest) {

    console.log("Downloading item %o", downloadItem);

    chrome.storage.local.get(['rulesets'], ({ rulesets }) => {
        var item = {
            'mime': downloadItem.mime,
            'referrer': decodeURI(downloadItem.referrer),
            'url': decodeURI(downloadItem.url),
            'finalUrl': decodeURI(downloadItem.finalUrl),
            'filename': downloadItem.filename,
            'startTime': new Date(downloadItem.startTime)
        };
    
        // Octet-stream workaround
        if (downloadItem.mime == 'application/octet-stream') {
            var matches = downloadItem.filename.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
            var extension = matches && matches[1];
    
            if (EXT_MIME_MAPPINGS[extension]) {
                item.mime = EXT_MIME_MAPPINGS[extension];
            }
        }

        var suggestion = undefined;
    
        rulesets.every(function (rule) {
            if (!rule.enabled) {
                console.log("Rule disabled: %o", rule);
                return true; // continue to the next rule
            }
    
            var substitutions = {};
    
            var success = RULE_FIELDS.every(function (field) {
                if (!rule[field]) {
                    substitutions[field] = [item[field]];
                    return true; // skip this and continue to the next field
                }
    
                var regex = new RegExp(rule[field], 'i');
                var matches = regex.exec(item[field]);
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
    
            var result = true;
    
            var filename = rule['pattern'].replace(/\$\{(\w+)(?::(.+?))?\}/g, function (orig, field, idx) {
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
    
            var conflictAction = rule['conflict-action'];
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
            var version = values['version'];
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
