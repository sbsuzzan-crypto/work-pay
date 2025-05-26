/**
 * Reports Component
 * Handles reporting and export functionality
 */

class Reports {
    constructor() {
        this.initialized = false;
    }

    /**
     * Initialize reports component
     */
    init() {
        if (this.initialized) return;
        
        this.render();
        this.handleEvents();
        this.loadReports();
        
        this.initialized = true;
    }

    /**
     * Render reports section content
     */
    render() {
        const reportsSection = document.getElementById('reports');
        if (!reportsSection) return;

        reportsSection.innerHTML = `
            <h2 class="text-3xl font-bold mb-6">Reports & Export</h2>

            <!-- Export Options -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div class="bg-gray-800 p-6 rounded-lg text-center">
                    <i data-lucide="users" class="mx-auto mb-3 text-teal-400" size="32"></i>
                    <h3 class="font-semibold mb-2">Workers Report</h3>
                    <p class="text-sm text-gray-400 mb-4">Export all worker information</p>
                    <button onclick="window.Reports.exportWorkers()" class="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded text-sm w-full">Export CSV</button>
                </div>
                
                <div class="bg-gray-800 p-6 rounded-lg text-center">
                    <i data-lucide="clock" class="mx-auto mb-3 text-teal-400" size="32"></i>
                    <h3 class="font-semibold mb-2">Work Logs Report</h3>
                    <p class="text-sm text-gray-400 mb-4">Export all work entries</p>
                    <button onclick="window.Reports.exportWorkLogs()" class="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded text-sm w-full">Export CSV</button>
                </div>
                
                <div class="bg-gray-800 p-6 rounded-lg text-center">
                    <i data-lucide="dollar-sign" class="mx-auto mb-3 text-teal-400" size="32"></i>
                    <h3 class="font-semibold mb-2">Advances Report</h3>
                    <p class="text-sm text-gray-400 mb-4">Export advance records</p>
                    <button onclick="window.Reports.exportAdvances()" class="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded text-sm w-full">Export CSV</button>
                </div>
                
                <div class="bg-gray-800 p-6 rounded-lg text-center">
                    <i data-lucide="receipt" class="mx-auto mb-3 text-teal-400" size="32"></i>
                    <h3 class="font-semibold mb-2">Payroll Report</h3>
                    <p class="text-sm text-gray-400 mb-4">Export payroll history</p>
                    <button onclick="window.Reports.exportPayroll()" class="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded text-sm w-full">Export CSV</button>
                </div>
            </div>

            <!-- Data Management -->
            <div class="bg-gray-800 p-6 rounded-lg mb-6">
                <h3 class="text-xl font-semibold mb-4">Data Management</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="text-center">
                        <h4 class="font-semibold mb-2">Backup Data</h4>
                        <p class="text-sm text-gray-400 mb-4">Download complete backup</p>
                        <button onclick="window.Reports.backupData()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded w-full">Download Backup</button>
                    </div>
                    
                    <div class="text-center">
                        <h4 class="font-semibold mb-2">Restore Data</h4>
                        <p class="text-sm text-gray-400 mb-4">Upload backup file</p>
                        <input type="file" id="restoreFile" accept=".json" class="hidden" onchange="window.Reports.restoreData(this.files[0])">
                        <button onclick="document.getElementById('restoreFile').click()" class="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded w-full">Select File</button>
                    </div>
                    
                    <div class="text-center">
                        <h4 class="font-semibold mb-2">Clear All Data</h4>
                        <p class="text-sm text-gray-400 mb-4">Reset application</p>
                        <button onclick="window.Reports.clearAllData()" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded w-full">Clear Data</button>
                    </div>
                </div>
            </div>

            <!-- Summary Statistics -->
            <div class="bg-gray-800 p-6 rounded-lg">
                <h3 class="text-xl font-semibold mb-4">Summary Statistics</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-teal-400" id="totalWorkersCount">0</div>
                        <div class="text-sm text-gray-400">Total Workers</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-teal-400" id="totalWorkLogsCount">0</div>
                        <div class="text-sm text-gray-400">Total Work Logs</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-teal-400" id="totalAdvancesAmount">$0</div>
                        <div class="text-sm text-gray-400">Total Advances</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-teal-400" id="totalPayslipsCount">0</div>
                        <div class="text-sm text-gray-400">Total Payslips</div>
                    </div>
                </div>
            </div>
        `;

        // Initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    /**
     * Set up event listeners
     */
    handleEvents() {
        // Event listeners will be added here
    }

    /**
     * Load reports data
     */
    loadReports() {
        this.updateStatistics();
    }

    /**
     * Update summary statistics
     */
    updateStatistics() {
        const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
        const workLogs = window.Storage.load(window.CONFIG.STORAGE.workLogs, []);
        const advances = window.Storage.load(window.CONFIG.STORAGE.advances, []);
        const payslips = window.Storage.load(window.CONFIG.STORAGE.payslips, []);
        
        const totalAdvances = advances.reduce((sum, advance) => sum + parseFloat(advance.amount || 0), 0);
        
        document.getElementById('totalWorkersCount').textContent = workers.length;
        document.getElementById('totalWorkLogsCount').textContent = workLogs.length;
        document.getElementById('totalAdvancesAmount').textContent = window.UI.formatCurrency(totalAdvances);
        document.getElementById('totalPayslipsCount').textContent = payslips.length;
    }

    /**
     * Export workers to CSV
     */
    exportWorkers() {
        const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
        
        if (workers.length === 0) {
            window.UI.showToast('No workers to export', 'warning');
            return;
        }
        
        const headers = ['Name', 'Contact', 'Pay Type', 'Hourly Rate', 'Car Fare', 'Weekly Rent', 'Task Descriptions'];
        const csvContent = [
            headers.join(','),
            ...workers.map(worker => [
                `"${worker.name}"`,
                `"${worker.contact || ''}"`,
                worker.payType,
                worker.hourlyRate || '',
                worker.carFare ? 'Yes' : 'No',
                worker.weeklyRent || 0,
                `"${(worker.taskDescriptions || []).join('; ')}"`
            ].join(','))
        ].join('\n');
        
        this.downloadCSV(csvContent, 'workers');
    }

    /**
     * Export work logs to CSV
     */
    exportWorkLogs() {
        const workLogs = window.Storage.load(window.CONFIG.STORAGE.workLogs, []);
        
        if (workLogs.length === 0) {
            window.UI.showToast('No work logs to export', 'warning');
            return;
        }
        
        const headers = ['Date', 'Worker', 'Hours', 'Contract Job', 'Contract Amount', 'Units', 'Unit Rate', 'Car Fare', 'Daily Earnings'];
        const csvContent = [
            headers.join(','),
            ...workLogs.map(log => [
                log.date,
                `"${log.workerName}"`,
                log.hours || '',
                `"${log.contractJob || ''}"`,
                log.contractAmount || '',
                log.units || '',
                log.unitRate || '',
                log.carFare || '',
                log.dailyEarnings || 0
            ].join(','))
        ].join('\n');
        
        this.downloadCSV(csvContent, 'work_logs');
    }

    /**
     * Export advances to CSV
     */
    exportAdvances() {
        const advances = window.Storage.load(window.CONFIG.STORAGE.advances, []);
        
        if (advances.length === 0) {
            window.UI.showToast('No advances to export', 'warning');
            return;
        }
        
        const headers = ['Date', 'Worker', 'Amount', 'Notes'];
        const csvContent = [
            headers.join(','),
            ...advances.map(advance => [
                advance.date,
                `"${advance.workerName}"`,
                advance.amount,
                `"${advance.notes || ''}"`
            ].join(','))
        ].join('\n');
        
        this.downloadCSV(csvContent, 'advances');
    }

    /**
     * Export payroll to CSV
     */
    exportPayroll() {
        const payslips = window.Storage.load(window.CONFIG.STORAGE.payslips, []);
        
        if (payslips.length === 0) {
            window.UI.showToast('No payroll records to export', 'warning');
            return;
        }
        
        const headers = ['Worker', 'Week Start', 'Week End', 'Gross Earnings', 'Deductions', 'Net Pay', 'Generated Date'];
        const csvContent = [
            headers.join(','),
            ...payslips.map(payslip => [
                `"${payslip.workerName}"`,
                payslip.weekStart,
                payslip.weekEnd,
                payslip.totalGrossEarnings,
                payslip.totalDeductions,
                payslip.netPay,
                payslip.generatedDate
            ].join(','))
        ].join('\n');
        
        this.downloadCSV(csvContent, 'payroll');
    }

    /**
     * Download CSV file
     */
    downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        URL.revokeObjectURL(url);
        window.UI.showToast(`${filename.replace('_', ' ')} exported successfully!`);
    }

    /**
     * Backup all data
     */
    backupData() {
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
                window.UI.showToast('Backup created successfully!');
            }
        } catch (error) {
            console.error('Error creating backup:', error);
            window.UI.showToast('Error creating backup', 'error');
        }
    }

    /**
     * Restore data from backup
     */
    async restoreData(file) {
        if (!file) return;
        
        const confirmed = await window.UI.showConfirmation(
            'This will replace all current data with the backup. Are you sure?',
            'Restore Data'
        );

        if (!confirmed) return;

        try {
            const text = await file.text();
            const importData = JSON.parse(text);
            
            const success = window.Storage.importAll(importData);
            
            if (success) {
                window.UI.showToast('Data restored successfully!');
                window.location.reload(); // Reload to refresh all components
            } else {
                window.UI.showToast('Failed to restore data', 'error');
            }
        } catch (error) {
            console.error('Error restoring data:', error);
            window.UI.showToast('Error restoring data: Invalid file format', 'error');
        }
    }

    /**
     * Clear all application data
     */
    async clearAllData() {
        const confirmed = await window.UI.showConfirmation(
            'This will permanently delete ALL data including workers, work logs, advances, and payslips. This action cannot be undone. Are you sure?',
            'Clear All Data'
        );

        if (confirmed) {
            const doubleConfirmed = await window.UI.showConfirmation(
                'Are you absolutely sure? This will delete everything!',
                'Final Confirmation'
            );

            if (doubleConfirmed) {
                try {
                    window.Storage.clear();
                    window.UI.showToast('All data cleared successfully!');
                    window.location.reload();
                } catch (error) {
                    console.error('Error clearing data:', error);
                    window.UI.showToast('Error clearing data', 'error');
                }
            }
        }
    }

    /**
     * Refresh reports data
     */
    refresh() {
        this.updateStatistics();
    }
}

window.Reports = new Reports(); 