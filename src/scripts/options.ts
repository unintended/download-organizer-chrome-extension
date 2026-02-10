import moment from './js/moment-es.js';

interface DownloadRule {
  enabled: boolean;
  mime?: string;
  tabUrl?: string;
  referrer?: string;
  url?: string;
  finalUrl?: string;
  filename?: string;
  pattern?: string;
  'conflict-action'?: chrome.downloads.FilenameConflictAction;
  description?: string;
}

declare const $: any; // jQuery

const RULE_FIELDS = ['mime', 'tabUrl', 'referrer', 'url', 'finalUrl', 'filename'] as const;

const DEFAULT_RULES: DownloadRule[] = [
  {
    description: 'Windows installers and applications (.exe and .msi files)',
    mime: 'application/(x-msdownload|x-ms-installer|x-msi|exe)',
    pattern: 'installers/',
    enabled: true,
  },
  {
    description: 'Linux installers (.deb and .rpm files)',
    mime: 'application/(x-debian-package|x-redhat-package-manager|x-rpm)',
    pattern: 'installers/',
    enabled: true,
  },
  {
    description: 'Mac installers (.dmg files)',
    mime: 'application/x-apple-diskimage',
    pattern: 'installers/',
    enabled: true,
  },
  {
    description: 'Zip and GZip archives',
    mime: 'application/(zip|gzip|x-gzip)',
    pattern: 'archives/',
    enabled: true,
  },
  {
    description: 'Pictures',
    mime: 'image/.*',
    pattern: 'images/',
    enabled: true,
  },
  {
    description: 'Torrents',
    mime: 'application/x-bittorrent',
    pattern: 'torrents/',
    enabled: true,
  },
  {
    description: 'Organize downloads by domain-named folders',
    pattern: 'site/${referrer:1}/',
    referrer: '.+?://([^/]+)/.*',
    enabled: false,
  },
  {
    description: 'Organize everything else by date',
    mime: '.*',
    pattern: 'other/${date:YYYY-MM-DD}/',
    enabled: false,
  },
];

let rulesets: DownloadRule[] = [];

// Initialize rulesets
(async () => {
  const storageData = await chrome.storage.local.get('rulesets');
  if (storageData.rulesets) {
    rulesets = structuredClone(storageData.rulesets) || [];
  } else {
    await resetRules();
    await renderRules();
  }
})();

async function resetRules(): Promise<void> {
  await chrome.storage.local.set({ rulesets: DEFAULT_RULES });
  rulesets = structuredClone(DEFAULT_RULES);
}

async function saveRules(): Promise<void> {
  await chrome.storage.local.set({ rulesets: rulesets });
}

async function syncRulesToCloud(): Promise<void> {
  await chrome.storage.sync.set({ config: { rulesets: rulesets } });
}

async function syncRulesFromCloud(): Promise<void> {
  const result = await chrome.storage.sync.get(['config']);
  rulesets = result.config.rulesets;
  await saveRules();
  await renderRules();
}

function hasEnabledTabUrlRules(): boolean {
  return rulesets.some((rule) => rule.enabled !== false && rule.tabUrl);
}

async function updateTabUrlPermissionAlert(): Promise<void> {
  const hasTabUrlRules = hasEnabledTabUrlRules();
  const hasPermission = await chrome.permissions.contains({ permissions: ['tabs'] });
  const $alert = $('#taburl-permission-alert');
  if (hasTabUrlRules && !hasPermission) {
    $alert.collapse('show');
  } else {
    $alert.collapse('hide');
  }
}

async function renderRules(openIdx?: number): Promise<void> {
  const $rulesContainer = $('#rules-container');
  $rulesContainer.empty();

  if (!rulesets.length) {
    $rulesContainer.html(
      '<div class="alert alert-info" role="alert"><strong>There is no rules yet!</strong> Press "New rule" to create a new one.</div>'
    );
  }

  rulesets.forEach((ruleset, idx) => {
    function updateTitle(): void {
      const keys = Object.keys(ruleset).filter((key) => key !== 'pattern');

      let filters: any = document.createTextNode('Empty rule');
      let folder = ' ';

      if (ruleset.pattern && keys.length) {
        filters = RULE_FIELDS.map((key) => {
          const isRuleSet = !!(ruleset as any)[key];
          const $label = $('<span class="label" data-toggle="tooltip" data-container="body"/>')
            .text(key.substr(0, 1).toUpperCase())
            .addClass(isRuleSet ? 'label-' + key : 'label-disabled');
          if (isRuleSet) {
            $label.tooltip({
              title: '<strong>' + key + ':</strong> ' + $('<div/>').text((ruleset as any)[key]).html(),
              html: true,
            });
          }
          return $label;
        });
        folder = ruleset.pattern;
      }

      const $titleContainer = $('.title-container', $rule);
      $titleContainer.empty();

      const title = $('<div class="col-sm-12">')
        .append(filters)
        .append($('<span class="glyphicon glyphicon-folder-open"/>'))
        .append($('<strong/>').text(folder));
      if (ruleset.description) {
        title.append('&emsp;').append($('<small class="text-muted"/>').text(ruleset.description));
      }
      $titleContainer.append(title);
      $titleContainer.click(() => {
        $('.panel-collapse', $rule).collapse('toggle');
      });
    }

    const $rule = $($('#rule-template').html());

    updateTitle();

    $('.panel-collapse', $rule).attr('id', 'collapse' + idx);
    $('.panel-collapse', $rule).toggleClass('in', idx === openIdx);

    // first item
    $('button.up', $rule).toggleClass('disabled', !idx);
    // last item
    $('button.down', $rule).toggleClass('disabled', idx + 1 === rulesets.length);

    $('input', $rule).tooltip();

    for (const field in ruleset) {
      const element = $('input[data-field="' + field + '"],select[data-field="' + field + '"]', $rule);
      if (typeof (ruleset as any)[field] === 'boolean' && element.is(':checkbox')) {
        element.prop('checked', (ruleset as any)[field]);
      } else if (element.is('select')) {
        const selected = (ruleset as any)[field];
        if (selected && selected.length) {
          element.find('option').each(function (this: HTMLOptionElement) {
            if ($(this).val() === selected) {
              $(this).prop('selected', true);
            }
          });
        }
      } else {
        element.val((ruleset as any)[field]);
      }
    }

    $('input', $rule).change(function (this: HTMLInputElement) {
      const field = $(this).data('field');
      if (field) {
        if ($(this).is(':checkbox')) {
          (ruleset as any)[field] = this.checked;
        } else {
          const val = $(this).val();
          if (val && val.length) {
            (ruleset as any)[field] = val;
          } else {
            delete (ruleset as any)[field];
          }
        }
      }
      saveRules().then(() => renderRules());
      updateTitle();
    });

    $('select', $rule).change(function (this: HTMLSelectElement) {
      const field = $(this).data('field');
      if (field) {
        const val = $(this).val();
        if (val && val.length) {
          (ruleset as any)[field] = val;
        } else {
          delete (ruleset as any)[field];
        }
      }
      saveRules().then(() => renderRules());
    });

    $('button.remove', $rule).click(() => {
      rulesets.splice(idx, 1);
      saveRules().then(() => renderRules());
    });

    $('button.share', $rule).click(() => {
      showRuleShareModal(ruleset);
    });

    $('button.up', $rule).click(() => {
      const tmp = rulesets[idx - 1];
      rulesets[idx - 1] = rulesets[idx];
      rulesets[idx] = tmp;
      saveRules().then(() => renderRules());
    });

    $('button.down', $rule).click(() => {
      const tmp = rulesets[idx + 1];
      rulesets[idx + 1] = rulesets[idx];
      rulesets[idx] = tmp;
      saveRules().then(() => renderRules());
    });

    $rulesContainer.append($rule);
  });

  rulesets.every((rule) => {
    if (!rule.enabled) {
      $('#disabled-rules-alert').show();
      return false;
    }
    return true;
  });

  await updateTabUrlPermissionAlert();
}

function showRuleShareModal(rule: DownloadRule): void {
  const $showRuleFromTextModal = $('#showRuleFromTextModal');
  $('textarea', $showRuleFromTextModal).val(JSON.stringify(rule));
  $showRuleFromTextModal.modal();
}

$(() => {
  // Add rule button
  $('#add-rule-btn').click(() => {
    rulesets.unshift({ enabled: true });
    renderRules(0);
  });

  // Export rules
  $('#export-rules-btn').click(() => {
    const pom = document.createElement('a');
    pom.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(rulesets, null, '  '))
    );
    pom.setAttribute('download', 'download_rules.json');
    pom.click();
  });

  $('#sync-rules-to-cloud-btn').click(() => {
    if (confirm('Sync rules to cloud storage?')) {
      syncRulesToCloud();
    }
  });

  $('#sync-rules-from-cloud-btn').click(() => {
    if (confirm('Sync rules from cloud storage? All existing rules will be overridden.')) {
      syncRulesFromCloud();
    }
  });

  $('#reset-rules-btn').click(() => {
    if (confirm('Reset rules?')) {
      resetRules().then(() => renderRules());
    }
  });

  // Cleanup helper function for modals
  function bindCleanupOnImportModal(this: any): void {
    this.on('show.bs.modal', function (this: Element) {
      $('textarea', this).val('');
      $('.rule-alert-container', this).empty();
    });
    this.on('shown.bs.modal', function (this: Element) {
      $('textarea', this).focus();
    });
  }

  // Add from text modal
  const $ruleModal = $('#addRuleFromTextModal');
  bindCleanupOnImportModal.call($ruleModal);
  $('.btn-primary', $ruleModal).click(() => {
    let rule: DownloadRule;
    try {
      rule = JSON.parse($('textarea', $ruleModal).val());
      if (rule.constructor.toString().indexOf('function Object()') !== 0) {
        throw { message: 'simple object expected' };
      }
    } catch (e: any) {
      const $alert = $($('#error-alert-template').html());
      $('#alert-text', $alert).text('Wrong rule format: ' + e.message);
      $('.rule-alert-container', $ruleModal).html($alert);
      return;
    }
    $ruleModal.modal('hide');
    rulesets.unshift(rule);
    saveRules().then(async () => {
      await renderRules(0);
    });
  });

  // Import rules modal
  const $importRulesModal = $('#importRulesFromTextModal');
  bindCleanupOnImportModal.call($importRulesModal);
  $importRulesModal.on('show.bs.modal', () => {
    $('#import-rules-replace-existing-ckbx').prop('checked', false);
    const $importRulesFromTextModalFileInput = $('#importRulesFromTextModalFileInput');
    $importRulesFromTextModalFileInput.replaceWith($importRulesFromTextModalFileInput.val('').clone(true));
  });

  $('.btn-primary', $importRulesModal).click(() => {
    let rules: DownloadRule[];
    try {
      rules = JSON.parse($('textarea', $importRulesModal).val());
      if (!(rules instanceof Array)) {
        throw { message: 'array expected' };
      }
    } catch (e: any) {
      const $alert = $($('#error-alert-template').html());
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
    saveRules().then(() => renderRules());
  });

  const reader = new FileReader();
  reader.onload = () => {
    $('textarea', $importRulesModal).val(reader.result);
  };

  $('#importRulesFromTextModalFileInput', $importRulesModal).change(function (this: HTMLInputElement) {
    if (!this.files) {
      return;
    }
    const file = this.files[0];
    if (!file) {
      return;
    }
    reader.readAsText(file);
  });

  // Link rule modal
  const $showRuleFromTextModal = $('#showRuleFromTextModal');
  $showRuleFromTextModal.on('shown.bs.modal', () => {
    const $textarea = $('textarea', $showRuleFromTextModal);
    $textarea.select().focus();
  });

  $('h1 small').text('version ' + chrome.runtime.getManifest().version);

  chrome.storage.local.get(['showChangelog'], ({ showChangelog }) => {
    if (showChangelog) {
      $('#newBadge').show();
      chrome.storage.local.remove('showChangelog');
    }
  });

  renderRules();

  $('#request-tabs-permission-btn').click(async () => {
    try {
      const granted = await chrome.permissions.request({ permissions: ['tabs'] });
      if (granted) {
        await updateTabUrlPermissionAlert();
      }
    } catch (err) {
      console.error('Failed to request tabs permission:', err);
    }
  });
});

$(() => {
  $('.date-format-example').each(function (this: Element) {
    $(this).text(moment().format($(this).attr('data-value')));
  });
});