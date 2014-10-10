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
            var keys = Object.keys(ruleset).filter(function(key) { return key !== 'pattern' });
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



//        $('.panel-title', $rule).click(function () {
//            $('#collapse' + idx, $rule).collapse('toggle');
//        });
//
//        .collapse({
//            'parent': '#rules-container',
//            'toggle': false
//        });

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

$(function () {
    $('#add-rule-btn').click(function () {
        rulesets.push({});
        renderRules(rulesets.length - 1);
    });

//    $('#save-rules-btn').click(function () {
//        rulesets = rulesets.filter(function (ruleset) {
//            return !$.isEmptyObject(ruleset);
//        });
//
//        saveRules();
//        renderRules();
//    });

    $('#reset-rules-btn').click(function () {
        if (confirm('Reset rules?')) {
            resetRules();
            renderRules();
        }
    });

    $('h1 small').text('version ' + chrome.runtime.getManifest().version)

    renderRules();
});
