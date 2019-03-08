const RULE_FIELDS = ['mime', 'referrer', 'url', 'filename'];

const DEFAULT_RULES = [
    { "description": "Windows installers and applications (.exe and .msi files)", "mime": "application/(x-msdownload|x-ms-installer|x-msi|exe)", "pattern": "installers/", "enabled": true },
    { "description": "Linux installers (.deb and .rpm files)", "mime": "application/(x-debian-package|x-redhat-package-manager|x-rpm)", "pattern": "installers/", "enabled": true },
    { "description": "Mac installers (.dmg files)", "mime": "application/x-apple-diskimage", "pattern": "installers/", "enabled": true },
    { "description": "Zip and GZip archives", "mime": "application/(zip|gzip)", "pattern": "archives/", "enabled": true },
    { "description": "Pictures", "mime": "image/.*", "pattern": "images/", "enabled": true },
    { "description": "Torrents", "mime": "application/x-bittorrent", "pattern": "torrents/", "enabled": true },
    { "description": "Organize downloads by domain-named folders", "pattern": "site/${referrer:1}/", "referrer": ".+?://([^/]+)/.*", "enabled": false },
    { "description": "Organize everything else by date", "mime": ".*", "pattern": "other/${date:YYYY-MM-DD}/", "enabled": false }
];

if (localStorage.getItem('rulesets') === null) {
    resetRules();
}

var rulesets = JSON.parse(localStorage.getItem('rulesets')) || [];

rulesets.every(rule => {
    if (!rule.enabled) {
        $("#disabled-rules-alert").show();
        return false;
    }
    return true;
});

function resetRules() {
    localStorage.setItem('rulesets', JSON.stringify(DEFAULT_RULES));
    rulesets = JSON.parse(localStorage.getItem('rulesets'));
}

function saveRules() {
    localStorage.setItem('rulesets', JSON.stringify(rulesets));
}

function renderRules(openIdx) {
    var $rulesContainer = $('#rules-container');
    $rulesContainer.empty();

    if (!rulesets.length) {
        $rulesContainer.html('<div class="alert alert-info" role="alert"><strong>There is no rules yet!</strong> Press "New rule" to create a new one.</div>')
    }

    rulesets.forEach(function (ruleset, idx) {

        function updateTitle() {
            var keys = Object.keys(ruleset).filter(function (key) {
                return key !== 'pattern'
            });

            var filters = document.createTextNode('Empty rule');
            var folder = ' ';

            if (ruleset.pattern && keys.length) {
                filters = RULE_FIELDS.map(function (key) {
                    var isRuleSet = ruleset[key];
                    var $label = $('<span class="label" data-toggle="tooltip" data-container="body"/>').text(key.substr(0, 1).toUpperCase())
                        .addClass(isRuleSet ? 'label-' + key : 'label-disabled');
                    if (isRuleSet) {
                        $label.tooltip({
                            'title': "<strong>" + key + ":</strong> " + $('<div/>').text(ruleset[key]).html(),
                            'html': true
                        });
                    }
                    return $label;
                });
                folder = ruleset.pattern;
            }

            var $titleContainer = $('.title-container', $rule);
            $titleContainer.empty();

            var title = $('<div class="col-sm-12">')
                .append(filters)
                .append($('<span class="glyphicon glyphicon-folder-open"/>'))
                .append($('<strong/>').text(folder));
            if (ruleset.description) {
                title.append('&emsp;')
                    .append($('<small class="text-muted"/>').text(ruleset.description));
            }
            $titleContainer.append(title);
            $titleContainer.click(function () {
                $('.panel-collapse', $rule).collapse('toggle');
            });
        }

        var $rule = $($('#rule-template').html());

        updateTitle();

        $('.panel-collapse', $rule).attr('id', 'collapse' + idx);
        $('.panel-collapse', $rule).toggleClass('in', idx === openIdx);

        // first item
        $('button.up', $rule).toggleClass('disabled', !idx);
        // last item
        $('button.down', $rule).toggleClass('disabled', idx + 1 == rulesets.length);

        $('input', $rule).tooltip();

        for (var field in ruleset) {
            var element = $('input[data-field="' + field + '"]', $rule);
            if (typeof ruleset[field] === "boolean" && element.is(':checkbox')) {
                element.prop('checked', ruleset[field]);
            } else {
                element.val(ruleset[field]);
            }
        }

        $('input', $rule).change(function () {
            var field = $(this).data('field');
            if (field) {
                if ($(this).is(':checkbox')) {
                    ruleset[field] = this.checked;
                } else {
                    var val = $(this).val();
                    if (val && val.length) {
                        ruleset[field] = val;
                    } else {
                        delete ruleset[field];
                    }
                }
            }
            saveRules();
            updateTitle();
        });

        $('button.remove', $rule).click(function () {
            rulesets.splice(idx, 1);
            saveRules();
            renderRules();
        });

        $('button.share', $rule).click(function () {
            showRuleShareModal(ruleset);
        });

        $('button.up', $rule).click(function () {
            var tmp = rulesets[idx - 1];
            rulesets[idx - 1] = rulesets[idx];
            rulesets[idx] = tmp;
            saveRules();
            renderRules();
        });

        $('button.down', $rule).click(function () {
            var tmp = rulesets[idx + 1];
            rulesets[idx + 1] = rulesets[idx];
            rulesets[idx] = tmp;
            saveRules();
            renderRules();
        });

        $rulesContainer.append($rule);
    });
}

function showRuleShareModal(rule) {
    var $showRuleFromTextModal = $('#showRuleFromTextModal');
    $('textarea', $showRuleFromTextModal).val(JSON.stringify(rule));

    $showRuleFromTextModal.modal();
}

$(function () {
    ///// Buttons
    // add rule button
    $('#add-rule-btn').click(function () {
        rulesets.unshift({ enabled: true });
        renderRules(0);
    });
    // export rules
    $('#export-rules-btn').click(function () {
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(rulesets, null, '  ')));
        pom.setAttribute('download', 'download_rules.json');
        pom.click();
    });
    $('#reset-rules-btn').click(function () {
        if (confirm('Reset rules?')) {
            resetRules();
            renderRules();
        }
    });

    ///// Modals
    // cleanup helper function
    function bindCleanupOnImportModal() {
        this.on('show.bs.modal', function () {
            $('textarea', this).val('');
            $('.rule-alert-container', this).empty();
        });
        this.on('shown.bs.modal', function () {
            $('textarea', this).focus();
        });
    }

    // add from text modal
    var $ruleModal = $('#addRuleFromTextModal');
    bindCleanupOnImportModal.apply($ruleModal);
    $('.btn-primary', $ruleModal).click(function () {
        var rule;
        try {
            rule = JSON.parse($('textarea', $ruleModal).val());
            if (rule.constructor.toString().indexOf('function Object()') !== 0) {
                throw { 'message': 'simple object expected' };
            }
        } catch (e) {
            var $alert = $($('#error-alert-template').html());
            $('#alert-text', $alert).text('Wrong rule format: ' + e.message);
            $('.rule-alert-container', $ruleModal).html($alert);
            return;
        }
        $ruleModal.modal('hide');
        rulesets.unshift(rule);
        saveRules();
        renderRules(0);
    });
    // import rules modal
    var $importRulesModal = $('#importRulesFromTextModal');
    bindCleanupOnImportModal.apply($importRulesModal);
    $importRulesModal.on('show.bs.modal', function () {
        $('#import-rules-replace-existing-ckbx').prop('checked', false);
        // clean file input
        var $importRulesFromTextModalFileInput = $('#importRulesFromTextModalFileInput');
        $importRulesFromTextModalFileInput.replaceWith($importRulesFromTextModalFileInput.val('').clone(true));
    });
    $('.btn-primary', $importRulesModal).click(function () {
        var rules;
        try {
            rules = JSON.parse($('textarea', $importRulesModal).val());
            if (!(rules instanceof Array)) {
                throw { 'message': 'array expected' };
            }
        } catch (e) {
            var $alert = $($('#error-alert-template').html());
            $('#alert-text', $alert).text('Wrong format: ' + e.message);
            $('.rule-alert-container', $importRulesModal).html($alert);
            return;
        }
        $importRulesModal.modal('hide');
        if ($('#import-rules-replace-existing-ckbx').prop('checked')) {
            rulesets = rules;
        } else {
            rulesets = rulesets.concat(rules);
        }
        saveRules();
        renderRules();
    });
    var reader = new FileReader();
    reader.onload = function () {
        $('textarea', $importRulesModal).val(reader.result);
    };
    $('#importRulesFromTextModalFileInput', $importRulesModal).change(function () {
        if (!this.files) {
            return;
        }
        var file = this.files[0];
        if (!file) {
            return;
        }
        reader.readAsText(file);
    });
    // link rule modal
    var $showRuleFromTextModal = $('#showRuleFromTextModal');
    $showRuleFromTextModal.on('shown.bs.modal', function () {
        var $textarea = $('textarea', $showRuleFromTextModal);
        $textarea.select().focus();
    });

    $('h1 small').text('version ' + chrome.runtime.getManifest().version);

    if (localStorage.getItem('showChangelog')) {
        $('#newBadge').show();
        localStorage.removeItem('showChangelog');
    }

    renderRules();
});

$(function () {
    $('.date-format-example').each(function () {
        $(this).text(moment().format($(this).attr("data-value")));
    });
});
