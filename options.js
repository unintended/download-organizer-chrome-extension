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
        $rulesContainer.html('<div class="alert alert-info" role="alert"><strong>There is no rules yet!</strong> Press "Add Rule" to add a new one.</div>')
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
    $('#add-rule-btn').click(function () {
        rulesets.unshift({});
        renderRules(0);
    });

    // add from text modal
    var $ruleModal = $('#addRuleFromTextModal');
    $('.btn-primary', $ruleModal).click(function () {
        var rule;
        try {
            rule = JSON.parse($('textarea', $ruleModal).val());
        } catch (e) {
            var $alert = $($('#error-alert-template').html());
            $('#alert-text', $alert).text('Wrong rule format');
            $('.rule-alert-container', $ruleModal).html($alert);
            return;
        }

        $ruleModal.modal('hide');
        rulesets.unshift(rule);
        saveRules();
        renderRules(0);
    });
    $('#add-rule-from-text-btn').click(function () {
        $('textarea', $ruleModal).val('');
        $('.rule-alert-container', $ruleModal).empty();
        $ruleModal.modal();
    });

    // show modal
    var $showRuleFromTextModal = $('#showRuleFromTextModal');
    $showRuleFromTextModal.on('shown.bs.modal', function (e) {
        $('textarea', $showRuleFromTextModal).select();
    });

    $('#reset-rules-btn').click(function () {
        if (confirm('Reset rules?')) {
            resetRules();
            renderRules();
        }
    });

    $('h1 small').text('version ' + chrome.runtime.getManifest().version)

    renderRules();
});
