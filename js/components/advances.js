/**
 * Advances Component
 * Handles advance tracking functionality
 */

class Advances {
    constructor() {
        this.initialized = false;
    }

    /**
     * Initialize advances component
     */
    init() {
        if (this.initialized) return;
        
        this.render();
        this.handleEvents();
        this.loadAdvances();
        
        this.initialized = true;
    }

    /**
     * Render advances section content
     */
    render() {
        const advancesSection = document.getElementById('advances');
        if (!advancesSection) return;

        advancesSection.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-3xl font-bold">Worker Advances</h2>
                <button onclick="window.Advances.openAdvanceModal()" class="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded flex items-center">
                    <i data-lucide="plus" class="mr-2"></i>
                    Log Advance
                </button>
            </div>

            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div class="bg-gray-800 p-6 rounded-lg">
                    <div class="flex items-center">
                        <i data-lucide="dollar-sign" class="text-teal-400 mr-3"></i>
                        <div>
                            <p class="text-gray-400">Total Advances</p>
                            <p class="text-2xl font-bold" id="totalAdvances">$0.00</p>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-800 p-6 rounded-lg">
                    <div class="flex items-center">
                        <i data-lucide="users" class="text-teal-400 mr-3"></i>
                        <div>
                            <p class="text-gray-400">Workers with Advances</p>
                            <p class="text-2xl font-bold" id="workersWithAdvances">0</p>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-800 p-6 rounded-lg">
                    <div class="flex items-center">
                        <i data-lucide="calendar" class="text-teal-400 mr-3"></i>
                        <div>
                            <p class="text-gray-400">This Month</p>
                            <p class="text-2xl font-bold" id="thisMonthAdvances">$0.00</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Filters -->
            <div class="bg-gray-800 p-4 rounded-lg mb-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <input type="text" id="advanceSearch" placeholder="Search advances..." 
                               class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                               onkeyup="window.Advances.filterAdvances()">
                    </div>
                    <div>
                        <select id="advanceWorkerFilter" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" onchange="window.Advances.filterAdvances()">
                            <option value="">All Workers</option>
                        </select>
                    </div>
                    <div>
                        <select id="advanceDateFilter" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" onchange="window.Advances.filterAdvances()">
                            <option value="">All Dates</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Advances Table -->
            <div class="bg-gray-800 rounded-lg overflow-hidden">
                <table class="w-full">
                    <thead class="bg-gray-700">
                        <tr>
                            <th class="text-left p-4">Date</th>
                            <th class="text-left p-4">Worker</th>
                            <th class="text-left p-4">Amount</th>
                            <th class="text-left p-4">Notes</th>
                            <th class="text-left p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="advancesTableBody">
                        <!-- Advances will be populated here -->
                    </tbody>
                </table>
            </div>

            <!-- Worker Advance Summary -->
            <div class="mt-6">
                <h3 class="text-xl font-semibold mb-4">Worker Advance Summary</h3>
                <div class="bg-gray-800 rounded-lg overflow-hidden">
                    <table class="w-full">
                        <thead class="bg-gray-700">
                            <tr>
                                <th class="text-left p-4">Worker</th>
                                <th class="text-left p-4">Total Advances</th>
                                <th class="text-left p-4">Number of Advances</th>
                                <th class="text-left p-4">Last Advance</th>
                                <th class="text-left p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="workerAdvanceSummaryBody">
                            <!-- Worker summary will be populated here -->
                        </tbody>
                    </table>
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
     * Load and display advances
     */
    loadAdvances() {
        const advances = window.Storage.load(window.CONFIG.STORAGE.advances, []);
        const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
        
        this.updateSummaryCards(advances);
        this.loadWorkerFilter(workers);
        this.displayAdvances(advances);
        this.displayWorkerSummary(advances, workers);
    }

    /**
     * Update summary cards
     */
    updateSummaryCards(advances) {
        const totalAmount = advances.reduce((sum, advance) => sum + parseFloat(advance.amount || 0), 0);
        const uniqueWorkers = new Set(advances.map(advance => advance.workerId)).size;
        
        // This month advances
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonthAdvances = advances.filter(advance => {
            const advanceDate = new Date(advance.date);
            return advanceDate.getMonth() === currentMonth && advanceDate.getFullYear() === currentYear;
        });
        const thisMonthAmount = thisMonthAdvances.reduce((sum, advance) => sum + parseFloat(advance.amount || 0), 0);
        
        document.getElementById('totalAdvances').textContent = window.UI.formatCurrency(totalAmount);
        document.getElementById('workersWithAdvances').textContent = uniqueWorkers;
        document.getElementById('thisMonthAdvances').textContent = window.UI.formatCurrency(thisMonthAmount);
    }

    /**
     * Load worker filter dropdown
     */
    loadWorkerFilter(workers) {
        const workerFilter = document.getElementById('advanceWorkerFilter');
        workerFilter.innerHTML = '<option value="">All Workers</option>';
        
        workers.forEach(worker => {
            const option = document.createElement('option');
            option.value = worker.id;
            option.textContent = worker.name;
            workerFilter.appendChild(option);
        });
    }

    /**
     * Display advances in table
     */
    displayAdvances(advances) {
        const tbody = document.getElementById('advancesTableBody');
        
        if (!tbody) return;

        tbody.innerHTML = '';
        
        if (advances.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="p-8 text-center text-gray-400">
                        No advances found. <a href="#" onclick="window.Advances.openAdvanceModal()" class="text-teal-400 hover:text-teal-300">Log your first advance</a>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Sort by date (newest first)
        advances.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        advances.forEach(advance => {
            const row = document.createElement('tr');
            row.className = 'border-t border-gray-600';
            
            row.innerHTML = `
                <td class="p-4">${window.UI.formatDate(advance.date)}</td>
                <td class="p-4">${advance.workerName}</td>
                <td class="p-4 font-semibold">$${parseFloat(advance.amount).toFixed(2)}</td>
                <td class="p-4">${advance.notes || '-'}</td>
                <td class="p-4">
                    <div class="flex space-x-2">
                        <button onclick="window.Advances.openAdvanceModal('${advance.id}')" class="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-sm">Edit</button>
                        <button onclick="window.Advances.deleteAdvance('${advance.id}')" class="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-sm">Delete</button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    /**
     * Display worker advance summary
     */
    displayWorkerSummary(advances, workers) {
        const tbody = document.getElementById('workerAdvanceSummaryBody');
        
        if (!tbody) return;

        tbody.innerHTML = '';
        
        // Group advances by worker
        const workerAdvances = {};
        advances.forEach(advance => {
            if (!workerAdvances[advance.workerId]) {
                workerAdvances[advance.workerId] = [];
            }
            workerAdvances[advance.workerId].push(advance);
        });
        
        if (Object.keys(workerAdvances).length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="p-8 text-center text-gray-400">
                        No worker advances to display
                    </td>
                </tr>
            `;
            return;
        }
        
        Object.entries(workerAdvances).forEach(([workerId, workerAdvanceList]) => {
            const worker = workers.find(w => w.id === workerId);
            if (!worker) return;
            
            const totalAmount = workerAdvanceList.reduce((sum, advance) => sum + parseFloat(advance.amount || 0), 0);
            const lastAdvance = workerAdvanceList.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            
            const row = document.createElement('tr');
            row.className = 'border-t border-gray-600';
            
            row.innerHTML = `
                <td class="p-4">${worker.name}</td>
                <td class="p-4 font-semibold">$${totalAmount.toFixed(2)}</td>
                <td class="p-4">${workerAdvanceList.length}</td>
                <td class="p-4">${window.UI.formatDate(lastAdvance.date)}</td>
                <td class="p-4">
                    <button onclick="window.Advances.viewWorkerAdvances('${workerId}')" class="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-sm">View Details</button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    /**
     * Open advance modal for add/edit
     */
    openAdvanceModal(advanceId = null) {
        window.Modals.openAdvanceModal(advanceId);
    }

    /**
     * Delete advance
     */
    async deleteAdvance(advanceId) {
        const confirmed = await window.UI.showConfirmation(
            'Are you sure you want to delete this advance?',
            'Delete Advance'
        );

        if (confirmed) {
            let advances = window.Storage.load(window.CONFIG.STORAGE.advances, []);
            advances = advances.filter(a => a.id !== advanceId);
            
            window.Storage.save(window.CONFIG.STORAGE.advances, advances);
            
            this.loadAdvances();
            window.PayrollApp.refreshData();
            window.UI.showToast('Advance deleted successfully!');
        }
    }

    /**
     * Filter advances based on search and filters
     */
    filterAdvances() {
        const searchTerm = document.getElementById('advanceSearch')?.value.toLowerCase() || '';
        const workerFilter = document.getElementById('advanceWorkerFilter')?.value || '';
        const dateFilter = document.getElementById('advanceDateFilter')?.value || '';
        
        const rows = document.querySelectorAll('#advancesTableBody tr');
        
        rows.forEach(row => {
            if (row.cells.length < 4) return; // Skip empty state row
            
            const workerName = row.cells[1]?.textContent.toLowerCase() || '';
            const notes = row.cells[3]?.textContent.toLowerCase() || '';
            const date = row.cells[0]?.textContent || '';
            const amount = row.cells[2]?.textContent || '';
            
            // Search filter
            const matchesSearch = workerName.includes(searchTerm) || 
                                notes.includes(searchTerm) || 
                                amount.includes(searchTerm);
            
            // Worker filter
            const matchesWorker = !workerFilter || 
                                row.cells[1]?.textContent === document.querySelector(`#advanceWorkerFilter option[value="${workerFilter}"]`)?.textContent;
            
            // Date filter
            let matchesDate = true;
            if (dateFilter) {
                const rowDate = new Date(row.cells[0]?.getAttribute('data-date') || row.cells[0]?.textContent);
                const today = new Date();
                
                switch (dateFilter) {
                    case 'today':
                        matchesDate = rowDate.toDateString() === today.toDateString();
                        break;
                    case 'week':
                        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        matchesDate = rowDate >= weekAgo;
                        break;
                    case 'month':
                        matchesDate = rowDate.getMonth() === today.getMonth() && 
                                    rowDate.getFullYear() === today.getFullYear();
                        break;
                }
            }
            
            if (matchesSearch && matchesWorker && matchesDate) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    /**
     * View worker advances details
     */
    viewWorkerAdvances(workerId) {
        const advances = window.Storage.load(window.CONFIG.STORAGE.advances, []);
        const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
        
        const worker = workers.find(w => w.id === workerId);
        const workerAdvances = advances.filter(a => a.workerId === workerId);
        
        if (!worker) return;
        
        const totalAmount = workerAdvances.reduce((sum, advance) => sum + parseFloat(advance.amount || 0), 0);
        
        const modalContent = `
            <div class="text-center mb-6">
                <h3 class="text-xl font-semibold mb-2">${worker.name} - Advance Details</h3>
                <p class="text-gray-400">Total Advances: <span class="text-teal-400 font-semibold">$${totalAmount.toFixed(2)}</span></p>
            </div>
            
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-700">
                        <tr>
                            <th class="text-left p-3">Date</th>
                            <th class="text-left p-3">Amount</th>
                            <th class="text-left p-3">Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${workerAdvances.sort((a, b) => new Date(b.date) - new Date(a.date)).map(advance => `
                            <tr class="border-t border-gray-600">
                                <td class="p-3">${window.UI.formatDate(advance.date)}</td>
                                <td class="p-3 font-semibold">$${parseFloat(advance.amount).toFixed(2)}</td>
                                <td class="p-3">${advance.notes || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="mt-6 flex justify-end">
                <button onclick="window.UI.closeAllModals()" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">Close</button>
            </div>
        `;
        
        window.UI.createModal(modalContent, { size: 'max-w-2xl' });
    }

    /**
     * Export advances to CSV
     */
    exportAdvancesToCSV() {
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
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `advances_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        URL.revokeObjectURL(url);
        window.UI.showToast('Advances exported successfully!');
    }

    /**
     * Refresh advances data
     */
    refresh() {
        this.loadAdvances();
    }
}

window.Advances = new Advances(); 