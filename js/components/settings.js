/**
 * Settings Component
 * Handles application settings functionality
 */

class Settings {
    constructor() {
        this.initialized = false;
        this.hasUnsavedChanges = false;
    }

    /**
     * Initialize settings component
     */
    init() {
        if (this.initialized) return;
        
        this.render();
        this.handleEvents();
        this.loadSettings();
        
        // Listen for changes in any input to show Save button
        setTimeout(() => {
            this.setupChangeListeners();
        }, 500);
        this.initialized = true;
    }

    /**
     * Setup change listeners for all form inputs
     */
    setupChangeListeners() {
        const inputs = document.querySelectorAll('.settings-container input, .settings-container select');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.markAsChanged());
            input.addEventListener('change', () => this.markAsChanged());
        });
        
        // Setup save button listener
        const saveBtn = document.getElementById('saveSettingsBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveAllSettings());
        }
    }

    /**
     * Mark settings as changed and show save button
     */
    markAsChanged() {
        this.hasUnsavedChanges = true;
        this.showSaveBar();
    }

    /**
     * Render settings content
     */
    render() {
        const content = document.getElementById('settings');
        if (!content) return;

        content.innerHTML = `
            <div class="settings-container max-w-4xl mx-auto px-4 py-8">
                <div class="mb-8 text-center">
                    <h1 class="text-3xl font-extrabold text-white mb-2 flex items-center justify-center gap-2">
                        <i data-lucide="settings" class="w-8 h-8 text-teal-400"></i>
                        Settings
                    </h1>
                    <p class="text-gray-400">Configure your payroll management system</p>
                </div>
                
                <!-- Settings Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <!-- Company Settings Card -->
                    <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700 hover:border-teal-500/30 transition-all duration-300">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="p-2 bg-teal-500/20 rounded-lg">
                                <i data-lucide="building" class="w-6 h-6 text-teal-400"></i>
                            </div>
                            <h2 class="text-xl font-semibold text-white">Company Information</h2>
                        </div>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                                <input type="text" id="companyName" 
                                       class="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200" 
                                       placeholder="Enter your company name">
                                <p class="text-xs text-gray-500 mt-1">This will appear on all generated payslips</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">Company Logo URL</label>
                                <div class="flex items-center gap-3">
                                    <input type="url" id="companyLogoUrl" 
                                           class="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200" 
                                           placeholder="https://example.com/logo.png" 
                                           oninput="window.Settings.previewLogo()">
                                    <div id="logoPreviewContainer" class="hidden">
                                        <img id="logoPreview" src="" alt="Logo Preview" 
                                             class="h-12 w-12 rounded-lg bg-white/10 p-1 border border-gray-600 object-contain">
                                    </div>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">Logo will be displayed on payslips (recommended: 100x100px)</p>
                            </div>
                        </div>
                    </div>

                    <!-- Currency & Format Settings Card -->
                    <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700 hover:border-teal-500/30 transition-all duration-300">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="p-2 bg-green-500/20 rounded-lg">
                                <i data-lucide="dollar-sign" class="w-6 h-6 text-green-400"></i>
                            </div>
                            <h2 class="text-xl font-semibold text-white">Currency & Format</h2>
                        </div>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">Currency Symbol</label>
                                <select id="currencySymbol" 
                                        class="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200">
                                    <option value="$">$ (USD - US Dollar)</option>
                                    <option value="€">€ (EUR - Euro)</option>
                                    <option value="£">£ (GBP - British Pound)</option>
                                    <option value="A$">A$ (AUD - Australian Dollar)</option>
                                    <option value="C$">C$ (CAD - Canadian Dollar)</option>
                                    <option value="¥">¥ (JPY - Japanese Yen)</option>
                                    <option value="₹">₹ (INR - Indian Rupee)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">Decimal Places</label>
                                <select id="decimalPlaces" 
                                        class="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200">
                                    <option value="0">0 (No decimals)</option>
                                    <option value="2" selected>2 (Standard)</option>
                                    <option value="3">3 (High precision)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Theme Settings Card -->
                    <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700 hover:border-teal-500/30 transition-all duration-300">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="p-2 bg-purple-500/20 rounded-lg">
                                <i data-lucide="palette" class="w-6 h-6 text-purple-400"></i>
                            </div>
                            <h2 class="text-xl font-semibold text-white">Theme Colors</h2>
                        </div>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">Primary Color</label>
                                <div class="flex items-center gap-3">
                                    <input type="color" id="pdfPrimaryColor" 
                                           class="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-600 bg-transparent">
                                    <input type="text" id="pdfPrimaryColorText" 
                                           class="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200" 
                                           placeholder="#0d9488">
                                </div>
                                <p class="text-xs text-gray-500 mt-1">Used for headers and accents in payslips</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">Accent Color</label>
                                <div class="flex items-center gap-3">
                                    <input type="color" id="pdfAccentColor" 
                                           class="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-600 bg-transparent">
                                    <input type="text" id="pdfAccentColorText" 
                                           class="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200" 
                                           placeholder="#14b8a6">
                                </div>
                                <p class="text-xs text-gray-500 mt-1">Used for highlights and secondary elements</p>
                            </div>
                        </div>
                    </div>

                    <!-- Storage & Backup Info Card -->
                    <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700 hover:border-teal-500/30 transition-all duration-300">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="p-2 bg-blue-500/20 rounded-lg">
                                <i data-lucide="database" class="w-6 h-6 text-blue-400"></i>
                            </div>
                            <h2 class="text-xl font-semibold text-white">Storage Information</h2>
                        </div>
                        <div class="space-y-4">
                            <div class="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                                <span class="text-gray-300">Storage Used:</span>
                                <span id="storageUsed" class="font-medium text-white">Calculating...</span>
                            </div>
                            <div class="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                                <span class="text-gray-300">Last Backup:</span>
                                <span id="lastBackup" class="font-medium text-white">Never</span>
                            </div>
                            <div class="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                                <span class="text-gray-300">Workers Backup:</span>
                                <span id="lastWorkersBackup" class="font-medium text-white">Never</span>
                            </div>
                            <div class="pt-2">
                                <button onclick="window.Settings.exportData()" 
                                        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                                    <i data-lucide="download" class="w-4 h-4"></i>
                                    Export All Data
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Danger Zone -->
                <div class="bg-gradient-to-br from-red-900/20 to-red-800/20 rounded-2xl p-6 shadow-xl border border-red-500/30">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="p-2 bg-red-500/20 rounded-lg">
                            <i data-lucide="alert-triangle" class="w-6 h-6 text-red-400"></i>
                        </div>
                        <h2 class="text-xl font-semibold text-red-400">Danger Zone</h2>
                    </div>
                    <p class="text-gray-300 mb-4">These actions cannot be undone. Please be careful.</p>
                    <button onclick="window.Settings.resetApplication()" 
                            class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                        Reset Application
                    </button>
                </div>

                <!-- Floating Save Button -->
                <div id="saveSettingsBar" class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300" style="display:none;">
                    <div class="bg-gradient-to-r from-teal-600 to-teal-500 rounded-full shadow-2xl border border-teal-400/30">
                        <button id="saveSettingsBtn" class="flex items-center gap-3 px-8 py-4 text-white font-semibold rounded-full hover:from-teal-500 hover:to-teal-400 transition-all duration-200 transform hover:scale-105">
                            <i data-lucide="save" class="w-5 h-5"></i>
                            Save All Changes
                            <div class="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Load current settings
        this.loadSettings();
    }

    /**
     * Set up event listeners
     */
    handleEvents() {
        // Setup color picker sync after render
        setTimeout(() => {
            this.setupColorPickerSync();
        }, 100);
    }

    /**
     * Load current settings
     */
    loadSettings() {
        const settings = window.Storage.load(window.CONFIG.STORAGE.settings, {});
        
        // Company settings
        const companyNameEl = document.getElementById('companyName');
        const companyLogoUrlEl = document.getElementById('companyLogoUrl');
        
        if (companyNameEl) companyNameEl.value = settings.companyName || '';
        if (companyLogoUrlEl) companyLogoUrlEl.value = settings.companyLogoUrl || '';
        
        // PDF settings
        const pdfPrimaryColorEl = document.getElementById('pdfPrimaryColor');
        const pdfPrimaryColorTextEl = document.getElementById('pdfPrimaryColorText');
        const pdfAccentColorEl = document.getElementById('pdfAccentColor');
        const pdfAccentColorTextEl = document.getElementById('pdfAccentColorText');
        
        if (pdfPrimaryColorEl) pdfPrimaryColorEl.value = settings.pdfPrimaryColor || '#0d9488';
        if (pdfPrimaryColorTextEl) pdfPrimaryColorTextEl.value = settings.pdfPrimaryColor || '#0d9488';
        if (pdfAccentColorEl) pdfAccentColorEl.value = settings.pdfAccentColor || '#14b8a6';
        if (pdfAccentColorTextEl) pdfAccentColorTextEl.value = settings.pdfAccentColor || '#14b8a6';
        
        // Currency settings
        const currencySymbolEl = document.getElementById('currencySymbol');
        const decimalPlacesEl = document.getElementById('decimalPlaces');
        
        if (currencySymbolEl) currencySymbolEl.value = settings.currencySymbol || '$';
        if (decimalPlacesEl) decimalPlacesEl.value = settings.decimalPlaces || '2';
        
        // Logo preview
        this.previewLogo();
        
        // Storage info
        this.updateStorageInfo();
        
        // Reset unsaved changes flag
        this.hasUnsavedChanges = false;
    }

    /**
     * Setup color picker synchronization
     */
    setupColorPickerSync() {
        // Primary color sync
        const pdfPrimaryColor = document.getElementById('pdfPrimaryColor');
        const pdfPrimaryColorText = document.getElementById('pdfPrimaryColorText');
        
        if (pdfPrimaryColor && pdfPrimaryColorText) {
            pdfPrimaryColor.addEventListener('change', (e) => {
                pdfPrimaryColorText.value = e.target.value;
                this.markAsChanged();
            });
            
            pdfPrimaryColorText.addEventListener('input', (e) => {
                if (this.isValidHexColor(e.target.value)) {
                    pdfPrimaryColor.value = e.target.value;
                }
                this.markAsChanged();
            });
        }
        
        // Accent color sync
        const pdfAccentColor = document.getElementById('pdfAccentColor');
        const pdfAccentColorText = document.getElementById('pdfAccentColorText');
        
        if (pdfAccentColor && pdfAccentColorText) {
            pdfAccentColor.addEventListener('change', (e) => {
                pdfAccentColorText.value = e.target.value;
                this.markAsChanged();
            });
            
            pdfAccentColorText.addEventListener('input', (e) => {
                if (this.isValidHexColor(e.target.value)) {
                    pdfAccentColor.value = e.target.value;
                }
                this.markAsChanged();
            });
        }
    }

    /**
     * Validate hex color format
     */
    isValidHexColor(hex) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    }

    /**
     * Preview logo
     */
    previewLogo() {
        const url = document.getElementById('companyLogoUrl')?.value;
        const img = document.getElementById('logoPreview');
        const container = document.getElementById('logoPreviewContainer');
        
        if (url && img && container) {
            img.src = url;
            img.onload = () => {
                container.classList.remove('hidden');
            };
            img.onerror = () => {
                container.classList.add('hidden');
            };
        } else if (container) {
            container.classList.add('hidden');
        }
    }

    /**
     * Update storage information with proper formatting
     */
    updateStorageInfo() {
        try {
            const storageInfo = window.Storage.getStorageInfo();
            const storageUsedEl = document.getElementById('storageUsed');
            
            if (storageUsedEl) {
                if (storageInfo && storageInfo.available) {
                    const sizeKB = storageInfo.totalSizeKB || 0;
                    const usagePercent = storageInfo.usagePercentage || 0;
                    storageUsedEl.textContent = `${sizeKB.toFixed(1)} KB (${usagePercent.toFixed(1)}%)`;
                } else {
                    storageUsedEl.textContent = 'Not available';
                }
            }

            // Update last backup times
            const lastBackup = window.Storage.load('lastBackup', null);
            const lastWorkersBackup = window.Storage.load('lastWorkersBackup', null);

            const lastBackupEl = document.getElementById('lastBackup');
            const lastWorkersBackupEl = document.getElementById('lastWorkersBackup');

            if (lastBackupEl) {
                lastBackupEl.textContent = lastBackup ? this.formatRelativeTime(new Date(lastBackup)) : 'Never';
            }

            if (lastWorkersBackupEl) {
                lastWorkersBackupEl.textContent = lastWorkersBackup ? this.formatRelativeTime(new Date(lastWorkersBackup)) : 'Never';
            }
        } catch (error) {
            console.warn('Error updating storage info:', error);
            const storageUsedEl = document.getElementById('storageUsed');
            if (storageUsedEl) {
                storageUsedEl.textContent = 'Error loading';
            }
        }
    }

    /**
     * Show save bar
     */
    showSaveBar() {
        const bar = document.getElementById('saveSettingsBar');
        if (bar) {
            bar.style.display = 'block';
            // Add animation
            setTimeout(() => {
                bar.style.transform = 'translateX(-50%) translateY(0)';
            }, 10);
        }
    }

    /**
     * Hide save bar
     */
    hideSaveBar() {
        const bar = document.getElementById('saveSettingsBar');
        if (bar) {
            bar.style.transform = 'translateX(-50%) translateY(100px)';
            setTimeout(() => {
                bar.style.display = 'none';
            }, 300);
        }
    }

    /**
     * Save all settings at once
     */
    async saveAllSettings() {
        try {
            // Show loading state
            const saveBtn = document.getElementById('saveSettingsBtn');
            const originalContent = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Saving...';
            saveBtn.disabled = true;

            const settings = window.Storage.load(window.CONFIG.STORAGE.settings, {});
            
            // Company settings
            const companyName = document.getElementById('companyName')?.value || '';
            const companyLogoUrl = document.getElementById('companyLogoUrl')?.value || '';
            
            settings.companyName = companyName;
            settings.companyLogoUrl = companyLogoUrl;
            
            // PDF/Theme settings
            settings.pdfPrimaryColor = document.getElementById('pdfPrimaryColorText')?.value || '#0d9488';
            settings.pdfAccentColor = document.getElementById('pdfAccentColorText')?.value || '#14b8a6';
            
            // Currency settings
            settings.currencySymbol = document.getElementById('currencySymbol')?.value || '$';
            settings.decimalPlaces = document.getElementById('decimalPlaces')?.value || '2';
            
            // Save to storage
            window.Storage.save(window.CONFIG.STORAGE.settings, settings);
            
            // Update document title if company name is set
            if (companyName) {
                document.title = `${companyName} - Payroll Manager`;
            } else {
                document.title = 'Worker Payroll Manager';
            }
            
            // Reset unsaved changes flag
            this.hasUnsavedChanges = false;
            
            // Hide save bar
            this.hideSaveBar();
            
            // Show success message
            window.UI.showToast('All settings saved successfully! Changes will be reflected in new payslips.', 'success');
            
            // Refresh other components that might use these settings
            if (window.PayrollApp && window.PayrollApp.refreshData) {
                window.PayrollApp.refreshData();
            }

            // Restore button
            setTimeout(() => {
                saveBtn.innerHTML = originalContent;
                saveBtn.disabled = false;
                if (window.lucide) {
                    window.lucide.createIcons();
                }
            }, 1000);

        } catch (error) {
            console.error('Error saving settings:', error);
            window.UI.showToast('Error saving settings. Please try again.', 'error');
            
            // Restore button
            const saveBtn = document.getElementById('saveSettingsBtn');
            saveBtn.innerHTML = originalContent;
            saveBtn.disabled = false;
        }
    }

    /**
     * Export all data
     */
    exportData() {
        try {
            const data = {
                version: window.CONFIG.VERSION,
                exportDate: new Date().toISOString(),
                workers: window.Storage.load(window.CONFIG.STORAGE.workers, []),
                contracts: window.Storage.load(window.CONFIG.STORAGE.contracts, []),
                workLogs: window.Storage.load(window.CONFIG.STORAGE.workLogs, []),
                advances: window.Storage.load(window.CONFIG.STORAGE.advances, []),
                payslips: window.Storage.load(window.CONFIG.STORAGE.payslips, []),
                carFareEntries: window.Storage.load(window.CONFIG.STORAGE.carFareEntries, []),
                settings: window.Storage.load(window.CONFIG.STORAGE.settings, {}),
                metadata: {
                    totalRecords: 0,
                    dataIntegrity: true,
                    checksum: this.generateChecksum(data)
                }
            };

            // Calculate total records
            data.metadata.totalRecords = 
                data.workers.length + 
                data.contracts.length + 
                data.workLogs.length + 
                data.advances.length + 
                data.payslips.length +
                data.carFareEntries.length;

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `payroll-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Save backup timestamp
            window.Storage.save('lastBackup', new Date().toISOString());
            this.updateStorageInfo();

            window.UI.showToast('Data exported successfully!', 'success');

        } catch (error) {
            console.error('Export error:', error);
            window.UI.showToast('Export failed: ' + error.message, 'error');
        }
    }

    /**
     * Generate data checksum for integrity verification
     */
    generateChecksum(data) {
        const str = JSON.stringify({
            workers: data.workers,
            contracts: data.contracts,
            workLogs: data.workLogs,
            advances: data.advances,
            payslips: data.payslips,
            carFareEntries: data.carFareEntries
        });
        
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(16);
    }

    /**
     * Reset entire application
     */
    async resetApplication() {
        const confirmed = await window.UI.showConfirmation(
            'This will permanently delete ALL data including workers, work logs, advances, and settings. This action cannot be undone. Are you absolutely sure?',
            'Reset Application',
            'Delete Everything'
        );

        if (confirmed) {
            try {
                // Clear all storage
                Object.values(window.CONFIG.STORAGE).forEach(key => {
                    window.Storage.remove(key);
                });
                
                // Clear backup timestamps
                window.Storage.remove('lastBackup');
                window.Storage.remove('lastWorkersBackup');
                
                // Reset document title
                document.title = 'Worker Payroll Manager';
                
                // Reload the page to reset everything
                window.location.reload();
                
            } catch (error) {
                console.error('Error resetting application:', error);
                window.UI.showToast('Error resetting application', 'error');
            }
        }
    }

    /**
     * Format relative time
     */
    formatRelativeTime(date) {
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) {
            return 'Just now';
        } else if (diff < 3600) {
            return Math.floor(diff / 60) + ' minutes ago';
        } else if (diff < 86400) {
            return Math.floor(diff / 3600) + ' hours ago';
        } else if (diff < 604800) {
            return Math.floor(diff / 86400) + ' days ago';
        } else {
            return date.toLocaleDateString();
        }
    }

    /**
     * Refresh settings data
     */
    refresh() {
        this.updateStorageInfo();
    }
}

window.Settings = new Settings(); 