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

const RULE_FIELDS = ['mime', 'referrer', 'url', 'filename'];
const DATE_FIELD = 'date';

chrome.downloads.onDeterminingFilename.addListener(function (downloadItem, suggest) {
    var rulesets = JSON.parse(localStorage.getItem('rulesets'));

    var item = {
        'mime': downloadItem.mime,
        'referrer': decodeURI(downloadItem.referrer),
        'url': decodeURI(downloadItem.url),
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

    rulesets.every(function (rule) {
        if (!rule.enabled) {
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
            return true; // continue to the next rule
        }

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

        if (result) {
            suggest({
                filename: filename,
                conflictAction: 'uniquify'
            });
        }
    });
});

var version = localStorage.getItem('version');

if (version !== null && version < '0.2.4') {
    var rulesetsStr = localStorage.getItem('rulesets');
    if (rulesetsStr) {
        var rulesets = JSON.parse(rulesetsStr);
        rulesets.forEach(rule => {
            rule.enabled = true;
        });
        localStorage.setItem('rulesets', JSON.stringify(rulesets));
    }
}

if (!version || version != chrome.runtime.getManifest().version) {
    // Open the options page directly after installing or updating the extension
    localStorage.setItem('version', chrome.runtime.getManifest().version);
    localStorage.setItem('showChangelog', true);
    chrome.tabs.create({ url: "options.html" });
}
