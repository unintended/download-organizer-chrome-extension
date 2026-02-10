import moment from './js/moment-es.js';

interface ExtMimeMappings {
  [key: string]: string;
}

interface RuleSubstitutions {
  [key: string]: string[];
}

interface DownloadRule {
  enabled: boolean;
  mime?: string;
  tabUrl?: string;
  referrer?: string;
  url?: string;
  finalUrl?: string;
  filename?: string;
  pattern: string;
  'conflict-action'?: chrome.downloads.FilenameConflictAction;
  description?: string;
}

interface DownloadItemExtended {
  mime: string;
  referrer: string;
  tabUrl: string | null;
  url: string;
  finalUrl: string;
  filename: string;
  startTime: Date;
}

const EXT_MIME_MAPPINGS: ExtMimeMappings = {
  mp3: 'audio/mpeg',
  pdf: 'application/pdf',
  zip: 'application/zip',
  png: 'image/png',
  jpg: 'image/jpeg',
  exe: 'application/exe',
  avi: 'video/x-msvideo',
  torrent: 'application/x-bittorrent',
};

const RULE_FIELDS = ['mime', 'tabUrl', 'referrer', 'url', 'finalUrl', 'filename'] as const;
const DATE_FIELD = 'date';
const DEFAULT_CONFLICT_ACTION: chrome.downloads.FilenameConflictAction = 'uniquify';

async function hasTabsPermission(): Promise<boolean> {
  return chrome.permissions.contains({ permissions: ['tabs'] });
}

async function getActiveTabUrl(): Promise<string | null> {
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

chrome.downloads.onDeterminingFilename.addListener(
  (downloadItem: chrome.downloads.DownloadItem, suggest: (suggestion?: chrome.downloads.DownloadFilenameSuggestion) => void) => {
    console.log('Downloading item %o', downloadItem);

    chrome.storage.local.get(['rulesets'], async ({ rulesets }: { rulesets?: DownloadRule[] }) => {
      const tabUrl = await getActiveTabUrl();

      const item: DownloadItemExtended = {
        mime: downloadItem.mime,
        referrer: decodeURI(downloadItem.referrer),
        tabUrl: tabUrl,
        url: decodeURI(downloadItem.url),
        finalUrl: decodeURI(downloadItem.finalUrl),
        filename: downloadItem.filename,
        startTime: new Date(downloadItem.startTime),
      };

      // Octet-stream workaround
      if (downloadItem.mime === 'application/octet-stream') {
        const matches = downloadItem.filename.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
        const extension = matches?.[1];

        if (extension && EXT_MIME_MAPPINGS[extension]) {
          item.mime = EXT_MIME_MAPPINGS[extension];
        }
      }

      let suggestion: chrome.downloads.DownloadFilenameSuggestion | undefined;

      if (!rulesets) {
        suggest();
        return;
      }

      rulesets.every((rule: DownloadRule) => {
        if (!rule.enabled) {
          console.log('Rule disabled: %o', rule);
          return true; // continue to the next rule
        }

        const substitutions: RuleSubstitutions = {};

        const success = RULE_FIELDS.every((field) => {
          if (!rule[field]) {
            substitutions[field] = [item[field] as string];
            return true; // skip this and continue to the next field
          }

          // tabUrl requires tabs permission; without it we cannot match
          if (field === 'tabUrl' && (item[field] == null || item[field] === '')) {
            return false;
          }

          const regex = new RegExp(rule[field]!, 'i');
          const matches = regex.exec(item[field] as string);
          if (!matches) {
            return false; // rule failed, break
          }
          matches.shift();
          substitutions[field] = [item[field] as string].concat(matches);
          return true;
        });

        if (!success) {
          console.log("Rule didn't match: %o", rule);
          return true; // continue to the next rule
        }

        console.log('Rule matched: %o', rule);

        let result = true;

        let filename = rule.pattern.replace(/\$\{(\w+)(?::(.+?))?\}/g, (orig, field, idx) => {
          if (field === DATE_FIELD) {
            if (idx) {
              return moment(item.startTime).format(idx);
            } else {
              return moment(item.startTime).format('YYYY-MM-DD');
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

        const conflictAction = rule['conflict-action'] || DEFAULT_CONFLICT_ACTION;

        if (result) {
          suggestion = {
            filename: filename,
            conflictAction: conflictAction,
          };
          return false; // suggestion found, do not continue to the next rule
        }

        return true;
      });

      if (suggestion !== undefined) {
        console.log('Selected suggestion: %s', JSON.stringify(suggestion));
        suggest(suggestion);
      } else {
        console.log('No matching rule was found');
        suggest();
      }
    });

    return true;
  }
);

async function createOffscreen(): Promise<void> {
  if (await chrome.offscreen.hasDocument()) {
    return;
  }

  await chrome.offscreen.createDocument({
    url: './offscreen.html',
    reasons: [chrome.offscreen.Reason.LOCAL_STORAGE],
    justification: 'migrate from localStorage config to storage.local',
  });

  console.debug('Offscreen iframe loaded');
}

// Migration and initialization logic
chrome.storage.local.get(['version', 'showChangelog']).then((values) => {
  if (values['version'] === undefined) {
    // migrate from localStorage
    createOffscreen().then(() => {
      chrome.runtime.sendMessage('getRulesetsFromLS', (response: string | undefined) => {
        console.log('received old rule sets: %s', response);
        if (response !== undefined) {
          // if has old rule sets to migrate
          chrome.storage.local
            .set({
              rulesets: JSON.parse(response),
              version: chrome.runtime.getManifest().version,
              showChangelog: true,
            })
            .then(() => {
              chrome.runtime.sendMessage('removeRulesetsFromLS', () => {
                console.log('rule sets migrated');
                chrome.offscreen.closeDocument();
                chrome.tabs.create({ url: 'options.html' });
              });
            });
        } else {
          // if just installed
          chrome.storage.local
            .set({
              version: chrome.runtime.getManifest().version,
              showChangelog: true,
            })
            .then(() => {
              chrome.offscreen.closeDocument();
              chrome.tabs.create({ url: 'options.html' });
            });
        }
      });
    });
  } else {
    // all migrated
    const version = values['version'];
    if (version === undefined || version !== chrome.runtime.getManifest().version) {
      chrome.storage.local
        .set({
          version: chrome.runtime.getManifest().version,
          showChangelog: true,
        })
        .then(() => {
          chrome.tabs.create({ url: 'options.html' });
        });
    }
  }
});