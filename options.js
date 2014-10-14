const DEFAULT_RULES = [
    { 'mime': 'image/.*', 'pattern': 'images/'},
    { 'mime': 'application/x-bittorrent', 'pattern': 'torrents/'}
];

if (localStorage.getItem('rulesets') === null) {
    resetRules();
}

var rulesets = JSON.parse(localStorage.getItem('rulesets')) || [];

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
            $('.panel-title a', $rule).text(ruleset.pattern && keys.length ?
                keys.join(', ') + ' ➞ ' + ruleset.pattern
                : 'Empty rule');
        }

        var $rule = $($('#rule-template').html());

        updateTitle();

        $('.panel-collapse', $rule).attr('id', 'collapse' + idx);
        $('.panel-title a', $rule).attr('href', '#collapse' + idx);
        $('.panel-collapse', $rule).toggleClass('in', idx === openIdx);

        // first item
        $('button.up', $rule).toggleClass('disabled', !idx);
        // last item
        $('button.down', $rule).toggleClass('disabled', idx + 1 == rulesets.length);

        $('input', $rule).tooltip();

        for (var field in ruleset) {
            $('input[data-field="' + field + '"]', $rule).val(ruleset[field]);
        }

        $('input', $rule).change(function () {
            var field = $(this).data('field');
            if (field) {
                var val = $(this).val();
                if (val && val.length) {
                    ruleset[field] = val;
                } else {
                    delete ruleset[field];
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
        rulesets.unshift({});
        renderRules(0);
    });
    // export rules
    $('#export-rules-btn').click(function() {
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
                throw {'message': 'simple object expected'};
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
                throw {'message': 'array expected'};
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
    reader.onload = function() {
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
//        $('#tab-links a[href="#tab-changelog"]').tab('show');
        $('#newBadge').show();
        localStorage.removeItem('showChangelog');
    }

    renderRules();
});
