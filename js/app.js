/**
 * Main Application File
 * Initializes and coordinates all application components
 */

class PayrollApp {
    constructor() {
        this.initialized = false;
        this.currentWorker = null;
        this.currentContract = null;
        this.currentAdvance = null;
        this.currentPayslipData = null;
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('Initializing Worker Payroll Manager...');

            // Check if already initialized
            if (this.initialized) {
                console.warn('Application already initialized');
                return;
            }

            // Set up global error handlers
            this.setupGlobalErrorHandlers();

            // Debug: Check if all required components are available
            const componentStatus = {
                UI: !!window.UI,
                Storage: !!window.Storage,
                Modals: !!window.Modals,
                Workers: !!window.Workers,
                Contracts: !!window.Contracts,
                WorkLog: !!window.WorkLog,
                Advances: !!window.Advances,
                Payroll: !!window.Payroll,
                Reports: !!window.Reports,
                Settings: !!window.Settings,
                Dashboard: !!window.Dashboard,
                CONFIG: !!window.CONFIG
            };
            
            console.log('Component status:', componentStatus);

            // Check for missing critical components
            const missingComponents = Object.entries(componentStatus)
                .filter(([name, exists]) => !exists)
                .map(([name]) => name);

            if (missingComponents.length > 0) {
                throw new Error(`Missing critical components: ${missingComponents.join(', ')}`);
            }

            // Initialize Lucide icons
            if (window.lucide) {
                window.lucide.createIcons();
            }

            // Initialize UI manager
            if (window.UI && typeof window.UI.init === 'function') {
                window.UI.init();
            } else {
                console.warn('UI manager not available or missing init method');
            }

            // Initialize modals component
            if (window.Modals && typeof window.Modals.init === 'function') {
                window.Modals.init();
            } else {
                console.warn('Modals component not available or missing init method');
            }

            // Check for first-time user (non-blocking)
            try {
                await this.checkFirstTimeUser();
            } catch (error) {
                console.warn('First-time user check failed:', error);
            }

            // Load application settings (non-blocking)
            try {
                this.loadSettings();
            } catch (error) {
                console.warn('Settings loading failed:', error);
            }

            // Set default dates (non-blocking)
            try {
                this.setDefaultDates();
            } catch (error) {
                console.warn('Default dates setting failed:', error);
            }

            // Load and update data (non-blocking)
            try {
                await this.loadInitialData();
            } catch (error) {
                console.warn('Initial data loading failed:', error);
            }

            // Set up global event listeners (non-blocking)
            try {
                this.setupEventListeners();
            } catch (error) {
                console.warn('Event listeners setup failed:', error);
            }

            // Show default section
            try {
                if (window.UI && typeof window.UI.showSection === 'function') {
                    window.UI.showSection('dashboard');
                } else {
                    console.warn('Cannot show dashboard - UI.showSection not available');
                }
            } catch (error) {
                console.warn('Failed to show dashboard:', error);
            }

            // Optimize performance
            try {
                this.optimizePerformance();
            } catch (error) {
                console.warn('Performance optimization failed:', error);
            }

            // Monitor performance
            try {
                this.monitorPerformance();
                
                // Set up periodic performance monitoring
                setInterval(() => {
                    this.monitorPerformance();
                }, 60000); // Every minute
            } catch (error) {
                console.warn('Performance monitoring setup failed:', error);
            }

            // Mark as initialized
            this.initialized = true;

            console.log('Application initialized successfully');

            // Show success message if UI is available
            if (window.UI && typeof window.UI.showToast === 'function') {
                window.UI.showToast('Application loaded successfully!', 'success');
            }

        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.handleCriticalError(error);
        }
    }

    /**
     * Set up global error handlers
     */
    setupGlobalErrorHandlers() {
        // Handle uncaught JavaScript errors
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            // Only handle error if it's not null and we have error handling available
            if (event.error && this.handleError) {
                this.handleError(event.error, 'An unexpected error occurred');
            }
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            // Only handle error if we have error handling available
            if (event.reason && this.handleError) {
                this.handleError(event.reason, 'An operation failed unexpectedly');
            }
            event.preventDefault(); // Prevent the default browser behavior
        });

        // Handle storage quota exceeded
        window.addEventListener('storage', (event) => {
            if (event.key === null) {
                // Storage was cleared
                if (window.UI && window.UI.showToast) {
                    window.UI.showToast('Storage was cleared by another tab', 'warning');
                }
                if (this.refreshData) {
                    this.refreshData();
                }
            }
        });
    }

    /**
     * Handle application errors gracefully
     */
    handleError(error, userMessage = 'Something went wrong') {
        console.error('Application error:', error);
        
        // Hide any loading states
        window.UI.hideLoading();
        
        // Show user-friendly error message
        window.UI.showToast(userMessage, 'error');
        
        // Try to recover from common errors
        this.attemptErrorRecovery(error);
    }

    /**
     * Handle critical errors that prevent app initialization
     */
    handleCriticalError(error) {
        console.error('Critical error:', error);
        
        // Show critical error modal
        const errorModal = document.createElement('div');
        errorModal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
        errorModal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md mx-4">
                <div class="flex items-center mb-4">
                    <i data-lucide="alert-triangle" class="w-8 h-8 text-red-500 mr-3"></i>
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white">Application Error</h2>
                </div>
                <p class="text-gray-600 dark:text-gray-300 mb-6">
                    The application failed to start properly. This might be due to corrupted data or a browser issue.
                </p>
                <div class="flex gap-3">
                    <button onclick="window.PayrollApp.resetApp()" class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                        Reset App
                    </button>
                    <button onclick="window.location.reload()" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                        Reload Page
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorModal);
        
        // Initialize icons for the error modal
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    /**
     * Attempt to recover from common errors
     */
    attemptErrorRecovery(error) {
        // Handle null or undefined errors
        if (!error) {
            console.warn('Null or undefined error passed to recovery');
            return;
        }
        
        const errorMessage = (error.message || error.toString || (() => 'Unknown error'))();
        
        // Handle storage quota exceeded
        if (errorMessage.includes('QuotaExceededError') || errorMessage.includes('storage quota')) {
            if (window.UI && window.UI.showToast) {
                window.UI.showToast('Storage is full. Consider backing up and clearing old data.', 'warning');
            }
            return;
        }
        
        // Handle network errors
        if (errorMessage.includes('NetworkError') || errorMessage.includes('fetch')) {
            if (window.UI && window.UI.showToast) {
                window.UI.showToast('Network error. Please check your connection.', 'warning');
            }
            return;
        }
        
        // Handle JSON parsing errors
        if (errorMessage.includes('JSON') || errorMessage.includes('parse')) {
            console.warn('Data corruption detected, attempting recovery...');
            this.attemptDataRecovery();
            return;
        }
    }

    /**
     * Attempt to recover corrupted data
     */
    attemptDataRecovery() {
        try {
            // Check for auto-backup
            const autoBackup = window.Storage.load('autoBackup', null);
            if (autoBackup) {
                const confirmed = confirm(
                    'Data corruption detected. Would you like to restore from the last auto-backup?'
                );
                if (confirmed) {
                    window.Settings.validateAndImportData(autoBackup);
                    return;
                }
            }
            
            // If no backup, offer to reset
            const resetConfirmed = confirm(
                'Data corruption detected and no backup available. Reset the application?'
            );
            if (resetConfirmed) {
                this.resetApp();
            }
        } catch (recoveryError) {
            console.error('Recovery failed:', recoveryError);
            window.UI.showToast('Unable to recover data. Please reset the application.', 'error');
        }
    }

    /**
     * Check if this is a first-time user
     */
    async checkFirstTimeUser() {
        const hasVisited = window.Storage.load(window.CONFIG.STORAGE.hasVisited, false);
        
        if (!hasVisited) {
            await this.showWelcomeModal();
            window.Storage.save(window.CONFIG.STORAGE.hasVisited, true);
        }
    }

    /**
     * Show welcome modal for new users
     */
    async showWelcomeModal() {
        return new Promise((resolve) => {
            const modal = window.UI.createModal(`
                <div class="text-center">
                    <h2 class="text-2xl font-bold mb-4 text-teal-400">Welcome to Worker Payroll Manager</h2>
                    <p class="mb-6 text-gray-300">This application helps you manage worker payroll efficiently. All data is stored locally in your browser for complete privacy and offline functionality.</p>
                    <div class="mb-6">
                        <h3 class="font-semibold mb-2">Key Features:</h3>
                        <ul class="text-sm text-gray-400 space-y-1 text-left">
                            <li>• Worker and contract management</li>
                            <li>• Flexible work logging</li>
                            <li>• Advance tracking</li>
                            <li>• PDF payslip generation</li>
                            <li>• AI-powered assistance</li>
                        </ul>
                    </div>
                    <button id="welcomeModalCloseBtn" class="w-full bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded">
                        Get Started
                    </button>
                </div>
            `, { size: 'max-w-md' });

            // Add event listener to close button
            const closeBtn = modal.querySelector('#welcomeModalCloseBtn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    window.UI.closeModal(modal);
                    resolve();
                });
            }
        });
    }

    /**
     * Load application settings
     */
    loadSettings() {
        const settings = window.Storage.load(window.CONFIG.STORAGE.settings, window.CONFIG.DEFAULTS);
        
        // Apply settings to the application
        if (settings.companyName) {
            document.title = `${settings.companyName} - Payroll Manager`;
        }

        // Set API key if available
        if (settings.geminiApiKey) {
            window.API.setApiKey(settings.geminiApiKey);
        }
    }

    /**
     * Set default dates for forms
     */
    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        
        const dateFields = [
            'individualDate',
            'bulkHourlyDate', 
            'bulkUnitDate',
            'advanceDate',
            'payrollWeekEnd'
        ];

        dateFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = today;
            }
        });
    }

    /**
     * Load initial data and update UI
     */
    async loadInitialData() {
        try {
            // Show loading state
            if (window.UI && window.UI.showLoading) {
                window.UI.showLoading('Loading application data...');
            }

            // Load data from storage with performance monitoring
            const startTime = performance.now();
            
            const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
            const contracts = window.Storage.load(window.CONFIG.STORAGE.contracts, []);
            const workLogs = window.Storage.load(window.CONFIG.STORAGE.workLogs, []);
            const advances = window.Storage.load(window.CONFIG.STORAGE.advances, []);

            const loadTime = performance.now() - startTime;
            console.log(`Data loaded in ${loadTime.toFixed(2)}ms`);

            // Update dashboard statistics
            this.updateDashboardStats(workers, workLogs, advances);

            // Update checklist progress
            this.updateChecklistProgress(workers, contracts, workLogs);

            // Create auto-backup if significant data exists
            if (workers.length > 0 || workLogs.length > 0) {
                this.createAutoBackup();
            }

            console.log(`Loaded ${workers.length} workers, ${contracts.length} contracts, ${workLogs.length} work logs, ${advances.length} advances`);

            // Hide loading state
            if (window.UI && window.UI.hideLoading) {
                window.UI.hideLoading();
            }

        } catch (error) {
            console.error('Error loading initial data:', error);
            
            // Hide loading state
            if (window.UI && window.UI.hideLoading) {
                window.UI.hideLoading();
            }
            
            // Show user-friendly error
            if (window.UI && window.UI.showToast) {
                window.UI.showToast('Some data failed to load, but the app is still functional', 'warning');
            }
        }
    }

    /**
     * Create automatic backup of critical data
     */
    createAutoBackup() {
        try {
            const backupData = {
                timestamp: Date.now(),
                workers: window.Storage.load(window.CONFIG.STORAGE.workers, []),
                workLogs: window.Storage.load(window.CONFIG.STORAGE.workLogs, []),
                advances: window.Storage.load(window.CONFIG.STORAGE.advances, []),
                settings: window.Storage.load(window.CONFIG.STORAGE.settings, {})
            };

            // Only create backup if there's meaningful data
            if (backupData.workers.length > 0 || backupData.workLogs.length > 0) {
                window.Storage.save('autoBackup', backupData, false); // Don't create backup of backup
                console.log('Auto-backup created successfully');
            }
        } catch (error) {
            console.warn('Auto-backup creation failed:', error);
        }
    }

    /**
     * Monitor application performance
     */
    monitorPerformance() {
        try {
            // Monitor memory usage if available
            if (performance.memory) {
                const memory = performance.memory;
                console.log('Memory usage:', {
                    used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + ' MB',
                    total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + ' MB',
                    limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
                });
            }

            // Monitor storage usage
            if (window.Storage && window.Storage.getStorageStats) {
                const storageStats = window.Storage.getStorageStats();
                console.log('Storage usage:', {
                    size: Math.round(storageStats.totalSize / 1024) + ' KB',
                    percentage: storageStats.usagePercentage.toFixed(1) + '%',
                    items: storageStats.itemCount
                });

                // Warn if storage is getting full
                if (storageStats.usagePercentage > 80) {
                    if (window.UI && window.UI.showToast) {
                        window.UI.showToast('Storage is getting full. Consider backing up and clearing old data.', 'warning');
                    }
                }
            }
        } catch (error) {
            console.warn('Performance monitoring failed:', error);
        }
    }

    /**
     * Optimize application performance
     */
    optimizePerformance() {
        try {
            // Debounce resize events
            let resizeTimeout;
            const originalResize = window.onresize;
            window.onresize = function(event) {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    if (originalResize) originalResize.call(this, event);
                }, 250);
            };

            // Optimize scroll events
            let scrollTimeout;
            const optimizedScroll = () => {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    // Update any scroll-dependent UI elements
                    document.dispatchEvent(new CustomEvent('optimizedScroll'));
                }, 100);
            };

            window.addEventListener('scroll', optimizedScroll, { passive: true });

            // Preload critical resources
            this.preloadCriticalResources();

        } catch (error) {
            console.warn('Performance optimization failed:', error);
        }
    }

    /**
     * Preload critical resources
     */
    preloadCriticalResources() {
        try {
            // Preload commonly used icons
            const criticalIcons = ['users', 'clock', 'dollar-sign', 'file-text', 'settings'];
            
            if (window.lucide) {
                criticalIcons.forEach(icon => {
                    // Create and cache icon elements
                    const iconElement = document.createElement('i');
                    iconElement.setAttribute('data-lucide', icon);
                    iconElement.style.display = 'none';
                    document.body.appendChild(iconElement);
                });
                
                // Initialize all icons
                window.lucide.createIcons();
            }
        } catch (error) {
            console.warn('Resource preloading failed:', error);
        }
    }

    /**
     * Update dashboard statistics
     */
    updateDashboardStats(workers, workLogs, advances) {
        // Total workers
        const totalWorkersEl = document.getElementById('totalWorkers');
        if (totalWorkersEl) {
            totalWorkersEl.textContent = workers.length;
        }

        // Work logs this month
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonthLogs = workLogs.filter(log => {
            const logDate = new Date(log.date);
            return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
        });

        const workLogsThisMonthEl = document.getElementById('workLogsThisMonth');
        if (workLogsThisMonthEl) {
            workLogsThisMonthEl.textContent = thisMonthLogs.length;
        }

        // Total advances pending
        const totalAdvances = advances.reduce((sum, advance) => sum + parseFloat(advance.amount || 0), 0);
        const totalAdvancesPendingEl = document.getElementById('totalAdvancesPending');
        if (totalAdvancesPendingEl) {
            totalAdvancesPendingEl.textContent = window.UI.formatCurrency(totalAdvances);
        }
    }

    /**
     * Update checklist progress
     */
    updateChecklistProgress(workers, contracts, workLogs) {
        const payslips = window.Storage.load(window.CONFIG.STORAGE.payslips, []);

        this.updateChecklistItem('checklist-worker', workers.length > 0);
        this.updateChecklistItem('checklist-contract', contracts.length > 0);
        this.updateChecklistItem('checklist-worklog', workLogs.length > 0);
        this.updateChecklistItem('checklist-payroll', payslips.length > 0);
    }

    /**
     * Update individual checklist item
     */
    updateChecklistItem(itemId, completed) {
        const item = document.getElementById(itemId);
        if (!item) return;

        const icon = item.querySelector('i');
        
        if (completed) {
            item.classList.add('completed');
            if (icon) {
                icon.setAttribute('data-lucide', 'check-square');
            }
        } else {
            item.classList.remove('completed');
            if (icon) {
                icon.setAttribute('data-lucide', 'square');
            }
        }
        
        // Reinitialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    /**
     * Set up global event listeners
     */
    setupEventListeners() {
        // Navigation event listeners
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                if (section) {
                    window.UI.showSection(section);
                }
            });
        });

        // Global save event listener
        window.addEventListener('triggerSave', (e) => {
            this.handleGlobalSave(e.detail.section);
        });

        // Window beforeunload event
        window.addEventListener('beforeunload', (e) => {
            this.handleBeforeUnload(e);
        });

        // Storage event listener (for multiple tabs)
        window.addEventListener('storage', (e) => {
            this.handleStorageChange(e);
        });

        // Error event listener
        window.addEventListener('error', (e) => {
            this.handleGlobalError(e);
        });

        // Unhandled promise rejection
        window.addEventListener('unhandledrejection', (e) => {
            this.handleUnhandledRejection(e);
        });
    }

    /**
     * Handle global save action
     */
    handleGlobalSave(section) {
        console.log(`Global save triggered for section: ${section}`);
        
        // Trigger section-specific save if available
        const saveEvent = new CustomEvent('sectionSave', {
            detail: { section }
        });
        window.dispatchEvent(saveEvent);
    }

    /**
     * Handle before unload
     */
    handleBeforeUnload(e) {
        // Check if there are unsaved changes
        const hasUnsavedChanges = this.checkUnsavedChanges();
        
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            return e.returnValue;
        }
    }

    /**
     * Check for unsaved changes
     */
    checkUnsavedChanges() {
        // This would be implemented based on form states
        // For now, return false
        return false;
    }

    /**
     * Handle storage changes (multiple tabs)
     */
    handleStorageChange(e) {
        if (e.key && Object.values(window.CONFIG.STORAGE).includes(e.key)) {
            console.log(`Storage changed for key: ${e.key}`);
            
            // Refresh current section data
            const currentSection = window.UI.getCurrentSection();
            window.UI.initializeSection(currentSection);
        }
    }

    /**
     * Handle global errors
     */
    handleGlobalError(e) {
        console.error('Global error:', e.error);
        
        // Show user-friendly error message
        window.UI.showToast('An unexpected error occurred', 'error');
        
        // Log error details if debugging is enabled
        if (window.CONFIG.DEV.debug) {
            console.error('Error details:', {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                error: e.error
            });
        }
    }

    /**
     * Handle unhandled promise rejections
     */
    handleUnhandledRejection(e) {
        console.error('Unhandled promise rejection:', e.reason);
        
        // Show user-friendly error message
        window.UI.showToast('An error occurred while processing your request', 'error');
        
        // Prevent default browser behavior
        e.preventDefault();
    }

    /**
     * Refresh application data
     */
    async refreshData() {
        try {
            await this.loadInitialData();
            
            // Refresh current section
            const currentSection = window.UI.getCurrentSection();
            window.UI.initializeSection(currentSection);
            
            window.UI.showToast('Data refreshed successfully');
        } catch (error) {
            console.error('Error refreshing data:', error);
            window.UI.showToast('Error refreshing data', 'error');
        }
    }

    /**
     * Get application status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            currentSection: window.UI.getCurrentSection(),
            storage: window.Storage.getStorageInfo(),
            api: window.API.getStatus(),
            version: window.CONFIG.APP.version
        };
    }

    /**
     * Reset application
     */
    async resetApp() {
        const confirmed = await window.UI.showConfirmation(
            'This will clear all data and reset the application. Are you sure?',
            'Reset Application'
        );

        if (confirmed) {
            try {
                // Clear all storage
                window.Storage.clear();
                
                // Reload the page
                window.location.reload();
            } catch (error) {
                console.error('Error resetting application:', error);
                window.UI.showToast('Error resetting application', 'error');
            }
        }
    }

    /**
     * Export application data
     */
    exportData() {
        try {
            const exportData = window.Storage.exportAll();
            
            if (exportData) {
                const dataStr = JSON.stringify(exportData, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = `payroll_backup_${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                
                URL.revokeObjectURL(url);
                window.UI.showToast('Data exported successfully');
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            window.UI.showToast('Error exporting data', 'error');
        }
    }

    /**
     * Import application data
     */
    async importData(file) {
        try {
            const text = await file.text();
            const importData = JSON.parse(text);
            
            const success = window.Storage.importAll(importData);
            
            if (success) {
                window.UI.showToast('Data imported successfully');
                await this.refreshData();
            } else {
                window.UI.showToast('Failed to import data', 'error');
            }
        } catch (error) {
            console.error('Error importing data:', error);
            window.UI.showToast('Error importing data', 'error');
        }
    }
}

// Create global app instance
window.PayrollApp = new PayrollApp();

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.PayrollApp.init();
});

// Expose useful functions globally for backward compatibility
window.updateDashboardStats = () => window.PayrollApp.refreshData();
window.updateChecklistProgress = () => window.PayrollApp.refreshData();

// Development helpers
if (window.CONFIG.DEV.debug) {
    window.appStatus = () => window.PayrollApp.getStatus();
    window.resetApp = () => window.PayrollApp.resetApp();
    window.exportData = () => window.PayrollApp.exportData();
} 