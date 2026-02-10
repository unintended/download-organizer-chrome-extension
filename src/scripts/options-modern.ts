// Modern Dashboard Integration for RegExp Download Organizer
// This extends the existing options.ts functionality with the new dashboard UI


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

declare const $: any;

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

class ModernDashboard {
  private currentRule: DownloadRule | null = null;
  private currentRuleIndex: number = -1;
  private rulesets: DownloadRule[] = [];

  constructor() {
    this.init();
  }

  async init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupDashboard());
    } else {
      this.setupDashboard();
    }
  }

  private setupDashboard() {
    this.setupEventListeners();
    this.loadRules();
    this.setupDragAndDrop();
    this.checkPermissions();
  }

  private setupEventListeners() {
    // New rule button
    document.getElementById('add-rule-btn')?.addEventListener('click', () => {
      this.showRuleForm();
    });

    // Header actions - Help and Changelog
    document.getElementById('help-btn')?.addEventListener('click', () => {
      this.showHelpDialog();
    });

    document.getElementById('changelog-btn')?.addEventListener('click', () => {
      this.showChangelogDialog();
    });

    // Sidebar actions
    document.getElementById('import-btn')?.addEventListener('click', () => {
      this.showImportDialog();
    });

    document.getElementById('export-btn')?.addEventListener('click', () => {
      this.exportRules();
    });

    document.getElementById('reset-btn')?.addEventListener('click', () => {
      this.showResetDialog();
    });

    // Form actions
    document.getElementById('save-rule-btn')?.addEventListener('click', () => {
      this.saveRule();
    });

    document.getElementById('cancel-rule-btn')?.addEventListener('click', () => {
      this.hideRuleForm();
    });

    document.getElementById('delete-rule-btn')?.addEventListener('click', () => {
      this.deleteRule();
    });
  }

  private async loadRules() {
    try {
      const storageData = await chrome.storage.local.get('rulesets');
      if (storageData.rulesets) {
        this.rulesets = structuredClone(storageData.rulesets) || [];
      } else {
        await this.resetRules();
      }
      this.renderRuleList();
    } catch (error) {
      console.error('Error loading rules:', error);
      this.showAlert('Error loading rules. Please refresh the page.', 'danger');
    }
  }

  private async saveRules(): Promise<void> {
    await chrome.storage.local.set({ rulesets: this.rulesets });
  }

  private async resetRules(): Promise<void> {
    await chrome.storage.local.set({ rulesets: DEFAULT_RULES });
    this.rulesets = structuredClone(DEFAULT_RULES);
  }

  private renderRuleList() {
    const list = document.getElementById('rule-list');
    const emptyState = document.getElementById('empty-state');
    
    if (!list) return;

    list.innerHTML = '';

    if (this.rulesets.length === 0) {
      emptyState?.style.setProperty('display', 'block');
      return;
    }

    emptyState?.style.setProperty('display', 'none');

    this.rulesets.forEach((rule, index) => {
      const item = this.createRuleListItem(rule, index);
      list.appendChild(item);
    });

    this.updateRuleCount();
  }

  private createRuleListItem(rule: DownloadRule, index: number): HTMLElement {
    const li = document.createElement('li');
    li.className = 'rule-item';
    li.draggable = true;
    li.dataset.index = index.toString();

    li.innerHTML = `
      <div class="rule-drag-handle" title="Drag to reorder"></div>
      <div class="rule-content">
        <div class="rule-header">
          <h4 class="rule-title">${this.escapeHtml(rule.description || 'Untitled Rule')}</h4>
          <label class="toggle-switch">
            <input type="checkbox" ${rule.enabled ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>
        <div class="rule-description">${this.generateRuleDescription(rule)}</div>
        <div class="rule-badges">${this.generateRuleBadges(rule)}</div>
      </div>
    `;

    // Event listeners
    li.addEventListener('click', (e) => {
      if (!e.target || !(e.target as HTMLElement).matches('input')) {
        this.selectRule(li, rule, index);
      }
    });

    const toggle = li.querySelector('input[type="checkbox"]') as HTMLInputElement;
    toggle?.addEventListener('change', (e) => {
      e.stopPropagation();
      rule.enabled = toggle.checked;
      this.updateRuleCount();
      this.saveRulesAsync();
    });

    return li;
  }

  private selectRule(element: HTMLElement, rule: DownloadRule, index: number) {
    // Remove active class from all items
    document.querySelectorAll('.rule-item').forEach(item => {
      item.classList.remove('active');
    });

    // Add active class to selected item
    element.classList.add('active');

    // Show rule form with data
    this.showRuleForm(rule, index);
  }

  private showRuleForm(rule?: DownloadRule, index: number = -1) {
    this.currentRule = rule || null;
    this.currentRuleIndex = index;
    
    const form = document.getElementById('rule-form');
    const emptyState = document.getElementById('empty-state');
    const deleteBtn = document.getElementById('delete-rule-btn');

    if (!form) return;

    if (rule) {
      this.populateForm(rule);
      deleteBtn?.style.setProperty('display', 'block');
      const title = document.getElementById('form-title');
      if (title) title.textContent = 'Edit Download Rule';
    } else {
      this.clearForm();
      deleteBtn?.style.setProperty('display', 'none');
      const title = document.getElementById('form-title');
      if (title) title.textContent = 'New Download Rule';
    }

    emptyState?.style.setProperty('display', 'none');
    form.style.display = 'block';
    form.classList.add('fade-in');

    // Scroll form into view
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private hideRuleForm() {
    const form = document.getElementById('rule-form');
    const emptyState = document.getElementById('empty-state');

    form?.style.setProperty('display', 'none');

    if (this.rulesets.length === 0) {
      emptyState?.style.setProperty('display', 'block');
    }

    // Clear active selection
    document.querySelectorAll('.rule-item').forEach(item => {
      item.classList.remove('active');
    });
  }

  private populateForm(rule: DownloadRule) {
    const setValue = (id: string, value: string) => {
      const element = document.getElementById(id) as HTMLInputElement | HTMLSelectElement;
      if (element) element.value = value || '';
    };

    setValue('rule-description', rule.description || '');
    setValue('rule-url', rule.url || '');
    setValue('rule-mime', rule.mime || '');
    setValue('rule-filename', rule.filename || '');
    setValue('rule-referrer', rule.referrer || '');
    setValue('rule-taburl', rule.tabUrl || '');
    setValue('rule-pattern', rule.pattern || '');
    setValue('rule-conflict', rule['conflict-action'] || 'uniquify');
  }

  private clearForm() {
    const clearField = (id: string) => {
      const element = document.getElementById(id) as HTMLInputElement | HTMLSelectElement;
      if (element) element.value = '';
    };

    clearField('rule-description');
    clearField('rule-url');
    clearField('rule-mime');
    clearField('rule-filename');
    clearField('rule-referrer');
    clearField('rule-taburl');
    clearField('rule-pattern');
    
    const conflictSelect = document.getElementById('rule-conflict') as HTMLSelectElement;
    if (conflictSelect) conflictSelect.value = 'uniquify';
  }

  private async saveRule() {
    const getValue = (id: string): string => {
      const element = document.getElementById(id) as HTMLInputElement | HTMLSelectElement;
      return element?.value || '';
    };

    // Validate required fields
    const pattern = getValue('rule-pattern');
    if (!pattern.trim()) {
      this.showAlert('Destination pattern is required.', 'warning');
      return;
    }

    // Check if at least one matcher is provided
    const hasMatchers = ['rule-url', 'rule-mime', 'rule-filename', 'rule-referrer', 'rule-taburl']
      .some(id => getValue(id).trim());

    if (!hasMatchers) {
      this.showAlert('At least one match criterion is required.', 'warning');
      return;
    }

    const ruleData: DownloadRule = {
      description: getValue('rule-description'),
      url: getValue('rule-url') || undefined,
      mime: getValue('rule-mime') || undefined,
      filename: getValue('rule-filename') || undefined,
      referrer: getValue('rule-referrer') || undefined,
      tabUrl: getValue('rule-taburl') || undefined,
      pattern: pattern,
      'conflict-action': getValue('rule-conflict') as chrome.downloads.FilenameConflictAction,
      enabled: true
    };

    try {
      if (this.currentRule && this.currentRuleIndex >= 0) {
        // Update existing rule
        this.rulesets[this.currentRuleIndex] = ruleData;
      } else {
        // Add new rule
        this.rulesets.push(ruleData);
      }

      await this.saveRules();
      this.renderRuleList();
      this.hideRuleForm();
      this.showAlert('Rule saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving rule:', error);
      this.showAlert('Error saving rule. Please try again.', 'danger');
    }
  }

  private async deleteRule() {
    if (this.currentRuleIndex >= 0) {
      try {
        this.rulesets.splice(this.currentRuleIndex, 1);
        await this.saveRules();
        this.renderRuleList();
        this.hideRuleForm();
        this.showAlert('Rule deleted successfully!', 'success');
      } catch (error) {
        console.error('Error deleting rule:', error);
        this.showAlert('Error deleting rule. Please try again.', 'danger');
      }
    }
  }

  private updateRuleCount() {
    const count = this.rulesets.length;
    const enabledCount = this.rulesets.filter(rule => rule.enabled).length;
    const countElement = document.querySelector('.rule-count');
    if (countElement) {
      countElement.textContent = `${count} rules (${enabledCount} enabled)`;
    }
  }

  private generateRuleDescription(rule: DownloadRule): string {
    const matchers: string[] = [];
    if (rule.url) matchers.push(`URL: ${this.truncate(rule.url, 25)}`);
    if (rule.mime) matchers.push(`Type: ${this.truncate(rule.mime, 25)}`);
    if (rule.filename) matchers.push(`File: ${this.truncate(rule.filename, 25)}`);

    return matchers.length > 0
      ? `→ ${rule.pattern || 'No destination'}`
      : 'No matchers configured';
  }

  private generateRuleBadges(rule: DownloadRule): string {
    const badges: string[] = [];
    if (rule.url) badges.push('<span class="badge badge-url">URL</span>');
    if (rule.mime) badges.push('<span class="badge badge-mime">MIME</span>');
    if (rule.filename) badges.push('<span class="badge badge-filename">FILE</span>');
    if (rule.referrer) badges.push('<span class="badge badge-referrer">REF</span>');
    if (rule.tabUrl) badges.push('<span class="badge badge-taburl">TAB</span>');
    if (!rule.enabled) badges.push('<span class="badge badge-disabled">DISABLED</span>');

    return badges.join('');
  }

  private setupDragAndDrop() {
    const list = document.getElementById('rule-list');
    if (!list) return;

    let draggedElement: HTMLElement | null = null;
    let dropIndicator: HTMLElement | null = null;

    list.addEventListener('dragstart', (e) => {
      const target = e.target as HTMLElement;
      draggedElement = target.closest('.rule-item');
      if (draggedElement) {
        draggedElement.classList.add('dragging');
        // Add preview effect to other items
        const allItems = list.querySelectorAll('.rule-item:not(.dragging)');
        allItems.forEach(item => item.classList.add('drag-preview'));
      }
    });

    list.addEventListener('dragend', (e) => {
      const target = e.target as HTMLElement;
      const item = target.closest('.rule-item');
      if (item) {
        item.classList.remove('dragging');
        
        // Remove all drag-related classes
        const allItems = list.querySelectorAll('.rule-item');
        allItems.forEach(item => {
          item.classList.remove('drag-preview', 'drag-over');
        });
        
        // Remove drop indicator if exists
        if (dropIndicator) {
          dropIndicator.remove();
          dropIndicator = null;
        }
      }
      draggedElement = null;
    });

    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      
      if (!draggedElement) return;
      
      const target = (e.target as HTMLElement).closest('.rule-item') as HTMLElement;
      
      if (target && target !== draggedElement) {
        // Remove previous drag-over effects
        list.querySelectorAll('.rule-item').forEach(item => {
          item.classList.remove('drag-over');
        });
        
        // Add drag-over effect to current target
        target.classList.add('drag-over');
        
        // Create or update drop indicator
        if (!dropIndicator) {
          dropIndicator = document.createElement('div');
          dropIndicator.className = 'drop-indicator';
          dropIndicator.innerHTML = '▲ Drop here to reorder';
          Object.assign(dropIndicator.style, {
            position: 'absolute',
            background: 'var(--primary-color)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '1001',
            pointerEvents: 'none',
            transform: 'translateX(-50%)',
            animation: 'bounce 0.6s ease-in-out infinite alternate'
          });
        }
        
        // Position drop indicator
        const rect = target.getBoundingClientRect();
        const listRect = list.getBoundingClientRect();
        dropIndicator.style.left = `${rect.left + rect.width / 2 - listRect.left}px`;
        dropIndicator.style.top = `${rect.top - listRect.top - 10}px`;
        
        if (!dropIndicator.parentElement) {
          list.style.position = 'relative';
          list.appendChild(dropIndicator);
        }
      }
    });

    list.addEventListener('dragleave', (e) => {
      const target = (e.target as HTMLElement).closest('.rule-item');
      if (target) {
        target.classList.remove('drag-over');
      }
    });

    list.addEventListener('drop', async (e) => {
      e.preventDefault();
      const target = (e.target as HTMLElement).closest('.rule-item') as HTMLElement;
      
      if (target && draggedElement && target !== draggedElement) {
        const targetIndex = parseInt(target.dataset.index || '0');
        const draggedIndex = parseInt(draggedElement.dataset.index || '0');

        // Reorder rules array
        const movedRule = this.rulesets.splice(draggedIndex, 1)[0];
        this.rulesets.splice(targetIndex, 0, movedRule);

        // Save and re-render
        await this.saveRules();
        this.renderRuleList();
        this.showAlert('✅ Rules reordered successfully!', 'success');
        
        // Add a subtle highlight effect to show which rule was moved
        setTimeout(() => {
          const newItem = list.querySelector(`[data-index="${targetIndex}"]`) as HTMLElement;
          if (newItem) {
            newItem.style.background = 'linear-gradient(90deg, rgba(37,99,235,0.1) 0%, transparent 100%)';
            newItem.style.transition = 'background 1s ease-out';
            setTimeout(() => {
              newItem.style.background = '';
            }, 1000);
          }
        }, 100);
      }
      
      // Clean up
      list.querySelectorAll('.rule-item').forEach(item => {
        item.classList.remove('drag-preview', 'drag-over');
      });
      
      if (dropIndicator) {
        dropIndicator.remove();
        dropIndicator = null;
      }
    });
  }

  private async checkPermissions() {
    try {
      const hasTabsPermission = await chrome.permissions.contains({ permissions: ['tabs'] });
      const hasTabUrlRules = this.rulesets.some(rule => rule.tabUrl);

      if (hasTabUrlRules && !hasTabsPermission) {
        this.showAlert(
          'Some rules use Tab URL matching but tabs permission is not granted. <button onclick="dashboard.requestTabsPermission()" class="btn btn-sm btn-primary">Grant Permission</button>',
          'warning'
        );
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  }

  async requestTabsPermission() {
    try {
      const granted = await chrome.permissions.request({ permissions: ['tabs'] });
      if (granted) {
        this.showAlert('Tabs permission granted! Tab URL matching is now enabled.', 'success');
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  }

  private showAlert(message: string, type: 'success' | 'warning' | 'danger' | 'info' = 'info') {
    const container = document.getElementById('alerts-container');
    if (!container) return;

    const alertId = 'alert-' + Date.now();
    const alertHtml = `
      <div class="alert alert-${type}" id="${alertId}" role="alert">
        ${message}
        <button type="button" class="close" onclick="document.getElementById('${alertId}').remove()">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', alertHtml);

    // Auto-remove after 5 seconds for success/info alerts
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        const alert = document.getElementById(alertId);
        alert?.remove();
      }, 5000);
    }
  }

  private showImportDialog() {
    // Create a file input for importing
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.txt';
    input.onchange = (e) => this.handleImport(e);
    input.click();
  }

  private async handleImport(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      
      if (Array.isArray(imported)) {
        this.rulesets = imported;
        await this.saveRules();
        this.renderRuleList();
        this.showAlert('Rules imported successfully!', 'success');
      } else {
        this.showAlert('Invalid file format. Expected JSON array.', 'danger');
      }
    } catch (error) {
      console.error('Import error:', error);
      this.showAlert('Error importing rules. Please check the file format.', 'danger');
    }
  }

  private exportRules() {
    const dataStr = JSON.stringify(this.rulesets, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'download-rules.json';
    link.click();
    
    URL.revokeObjectURL(url);
    this.showAlert('Rules exported successfully!', 'success');
  }

  private showResetDialog() {
    if (confirm('Are you sure you want to reset all rules to defaults? This cannot be undone.')) {
      this.resetToDefaults();
    }
  }

  private async resetToDefaults() {
    try {
      await this.resetRules();
      await this.loadRules();
      this.showAlert('Rules reset to defaults successfully!', 'success');
    } catch (error) {
      console.error('Reset error:', error);
      this.showAlert('Error resetting rules. Please try again.', 'danger');
    }
  }

  private showHelpDialog() {
    const helpContent = `
      <div class="help-modal">
        <div class="help-header">
          <h3>📚 Help & Documentation</h3>
        </div>
        <div class="help-content">
          <div class="help-section">
            <h4>🎯 Quick Start</h4>
            <p>Create rules to automatically organize your downloads into specific folders based on file patterns, MIME types, or URLs.</p>
          </div>
          
          <div class="help-section">
            <h4>🔧 Rule Features</h4>
            <ul>
              <li><strong>Pattern Matching:</strong> Use RegEx patterns to match filenames</li>
              <li><strong>MIME Types:</strong> Filter by file content types (e.g., "image/.*" for all images)</li>
              <li><strong>URL Matching:</strong> Match download URLs, tab URLs, or referrers</li>
              <li><strong>Dynamic Folders:</strong> Use date placeholders like {YYYY}/{MM} in folder patterns</li>
              <li><strong>Priority Order:</strong> Drag and drop to reorder rules - first match wins</li>
            </ul>
          </div>
          
          <div class="help-section">
            <h4>📝 Pattern Examples</h4>
            <ul>
              <li><code>documents/</code> - Simple folder path</li>
              <li><code>images/{YYYY}/</code> - Year-based organization</li>
              <li><code>projects/{MM}-{DD}/</code> - Month-day organization</li>
              <li><code>downloads/{DOMAIN}/</code> - Group by website domain</li>
            </ul>
          </div>
          
          <div class="help-section">
            <h4>🕹️ Tips</h4>
            <ul>
              <li>Test your RegEx patterns at <a href="https://regex101.com" target="_blank">regex101.com</a></li>
              <li>More specific rules should be placed higher in the list</li>
              <li>Use the preview feature to test rules before saving</li>
              <li>Export your rules as backup before major changes</li>
            </ul>
          </div>
        </div>
      </div>
    `;
    
    this.showCustomDialog(helpContent, 'Help - RegExp Download Organizer');
  }

  private showChangelogDialog() {
    const changelogContent = `
      <div class="changelog-modal">
        <div class="changelog-header">
          <h3>📋 What's New</h3>
        </div>
        <div class="changelog-content">
          <div class="version-section">
            <h4>🎉 Version 0.5.2 - Modern Dashboard</h4>
            <div class="release-date">Released: January 2026</div>
            <ul class="feature-list">
              <li><span class="badge new">NEW</span> Redesigned modern dashboard interface</li>
              <li><span class="badge new">NEW</span> Drag and drop rule reordering</li>
              <li><span class="badge new">NEW</span> Enhanced visual feedback for drag operations</li>
              <li><span class="badge new">NEW</span> Sidebar navigation with action buttons</li>
              <li><span class="badge improved">IMPROVED</span> Responsive design for all screen sizes</li>
              <li><span class="badge improved">IMPROVED</span> Better rule validation and error messaging</li>
              <li><span class="badge fixed">FIXED</span> CSP compliance for Chrome extensions</li>
              <li><span class="badge fixed">FIXED</span> Font loading issues in extension context</li>
            </ul>
          </div>
          
          <div class="version-section">
            <h4>⚡ Version 0.5.1 - CI/CD Integration</h4>
            <div class="release-date">Released: December 2025</div>
            <ul class="feature-list">
              <li><span class="badge new">NEW</span> Automated Chrome Web Store deployment</li>
              <li><span class="badge new">NEW</span> CLI tool for development workflow</li>
              <li><span class="badge new">NEW</span> TypeScript compilation pipeline</li>
              <li><span class="badge improved">IMPROVED</span> Documentation consolidation</li>
              <li><span class="badge improved">IMPROVED</span> Development environment setup</li>
            </ul>
          </div>
          
          <div class="version-section">
            <h4>🏗️ Previous Versions</h4>
            <ul class="feature-list">
              <li><strong>v0.5.0:</strong> Manifest V3 migration and performance improvements</li>
              <li><strong>v0.4.x:</strong> Enhanced regex support and folder organization</li>
              <li><strong>v0.3.x:</strong> Initial release with basic download organization</li>
            </ul>
          </div>
          
          <div class="roadmap-section">
            <h4>🚀 Coming Soon</h4>
            <ul class="feature-list">
              <li>Rule templates and sharing</li>
              <li>Advanced statistics and analytics</li>
              <li>Background sync with cloud storage</li>
              <li>Integration with popular cloud drives</li>
            </ul>
          </div>
        </div>
      </div>
    `;
    
    this.showCustomDialog(changelogContent, 'Changelog - RegExp Download Organizer');
  }

  private showCustomDialog(content: string, title: string) {
    // Remove existing dialog if any
    const existingDialog = document.querySelector('.custom-dialog');
    if (existingDialog) {
      existingDialog.remove();
    }

    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'custom-dialog';
    overlay.innerHTML = `
      <div class="dialog-backdrop">
        <div class="dialog-container">
          <div class="dialog-header">
            <h2>${this.escapeHtml(title)}</h2>
            <button class="dialog-close" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="dialog-body">
            ${content}
          </div>
        </div>
      </div>
    `;

    // Add styles for the dialog
    const styles = document.createElement('style');
    styles.textContent = `
      .custom-dialog {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease-out;
      }
      
      .dialog-backdrop {
        background: rgba(0, 0, 0, 0.5);
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        backdrop-filter: blur(4px);
      }
      
      .dialog-container {
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        max-width: 600px;
        max-height: 80vh;
        width: 90vw;
        position: relative;
        z-index: 1;
        animation: slideIn 0.3s ease-out;
      }
      
      .dialog-header {
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .dialog-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #1f2937;
      }
      
      .dialog-close {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 6px;
        color: #6b7280;
        transition: all 0.2s;
      }
      
      .dialog-close:hover {
        background: #f3f4f6;
        color: #374151;
      }
      
      .dialog-body {
        padding: 1.5rem;
        max-height: 60vh;
        overflow-y: auto;
      }
      
      .help-section, .version-section {
        margin-bottom: 2rem;
      }
      
      .help-section h4, .version-section h4 {
        color: #1f2937;
        margin: 0 0 0.75rem 0;
        font-size: 1.1rem;
        font-weight: 600;
      }
      
      .help-section ul, .version-section ul {
        margin: 0.5rem 0;
        padding-left: 1.5rem;
      }
      
      .help-section li, .version-section li {
        margin-bottom: 0.5rem;
        line-height: 1.5;
      }
      
      .feature-list {
        list-style: none;
        padding-left: 0;
      }
      
      .feature-list li {
        padding: 0.5rem 0;
        border-bottom: 1px solid #f3f4f6;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      
      .badge {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        white-space: nowrap;
      }
      
      .badge.new {
        background: #dcfce7;
        color: #166534;
      }
      
      .badge.improved {
        background: #dbeafe;
        color: #1d4ed8;
      }
      
      .badge.fixed {
        background: #fef3c7;
        color: #92400e;
      }
      
      .release-date {
        font-size: 0.875rem;
        color: #6b7280;
        margin-bottom: 1rem;
      }
      
      .roadmap-section h4 {
        color: #7c3aed;
      }
      
      code {
        background: #f3f4f6;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 0.875rem;
      }
      
      a {
        color: #2563eb;
        text-decoration: none;
      }
      
      a:hover {
        text-decoration: underline;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(-10px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
    `;

    // Append styles and dialog to document
    document.head.appendChild(styles);
    document.body.appendChild(overlay);

    // Add event listeners
    const closeButton = overlay.querySelector('.dialog-close');
    const backdrop = overlay.querySelector('.dialog-backdrop');
    
    const closeDialog = () => {
      overlay.style.animation = 'fadeIn 0.2s ease-out reverse';
      setTimeout(() => {
        overlay.remove();
        styles.remove();
      }, 200);
    };

    closeButton?.addEventListener('click', closeDialog);
    backdrop?.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeDialog();
      }
    });

    // Close on Escape key
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDialog();
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    document.addEventListener('keydown', handleKeydown);
  }

  private saveRulesAsync() {
    this.saveRules().catch(error => {
      console.error('Error saving rules:', error);
      this.showAlert('Error saving changes. Please try again.', 'danger');
    });
  }

  // Utility methods
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private truncate(text: string, length: number): string {
    return text.length > length ? text.substring(0, length) + '...' : text;
  }
}

// Initialize modern dashboard when the page loads
let dashboard: ModernDashboard | undefined;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    dashboard = new ModernDashboard();
    // Export for global access
    (window as any).dashboard = dashboard;
  });
} else {
  dashboard = new ModernDashboard();
  // Export for global access
  (window as any).dashboard = dashboard;
}