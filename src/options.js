var rulesets = JSON.parse(localStorage.getItem('rulesets')) || [];

function renderRules(openIdx) {
    var $rulesContainer = $('#rules-container');
    $rulesContainer.empty();

    if (!rulesets.length) {
        $rulesContainer.html('<div class="alert alert-info" role="alert"><strong>There is no rules yet!</strong> Press "Add Rule" to add a new one.</div>')
    }

    rulesets.forEach(function (ruleset, idx) {

        function updateTitle() {
            $('.panel-title', $rule).text(ruleset.pattern || 'Empty rule');
        }

        var $rule = $($('#rule-template').html());

        updateTitle();

        $('.panel-heading', $rule).click(function () {
            $('#collapse' + idx, $rule).collapse('toggle');
        });
        $('.panel-collapse', $rule).attr('id', 'collapse' + idx).collapse({
            'parent': '#rules-container',
            'toggle': false
        });
        if (idx === openIdx) {
            $('.panel-collapse', $rule).addClass('in');
        }

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
            updateTitle();
        });

        $('button', $rule).click(function () {
            rulesets.splice(idx, 1);
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

    $('#save-rules-btn').click(function () {
        rulesets = rulesets.filter(function (ruleset) {
            return !$.isEmptyObject(ruleset);
        });

        localStorage.setItem('rulesets', JSON.stringify(rulesets));
        renderRules();
    });


    renderRules();
});
