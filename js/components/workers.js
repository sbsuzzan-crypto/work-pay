/**
 * Workers Component
 * Handles worker management functionality
 */

class Workers {
    constructor() {
        this.initialized = false;
        this.currentWorker = null;
        this.searchTimeout = null;
    }

    /**
     * Initialize workers component
     */
    init() {
        if (this.initialized) return;
        
        this.render();
        this.handleEvents();
        this.loadWorkers();
        
        this.initialized = true;
    }

    /**
     * Render workers section content
     */
    render() {
        const workersSection = document.getElementById('workers');
        if (!workersSection) return;

        workersSection.innerHTML = `
            <div class="max-w-6xl mx-auto px-4 py-8">
                <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                    <div>
                        <h2 class="text-3xl font-extrabold text-primary mb-2 flex items-center gap-2">
                            <i data-lucide="users" class="w-8 h-8"></i>
                            Workers
                        </h2>
                        <p class="text-gray-400">Manage your workforce and their payment details</p>
                    </div>
                    <button onclick="window.Workers.openWorkerModal()" class="bg-teal-600 hover:bg-teal-700 px-6 py-3 rounded-lg shadow-sm flex items-center gap-2 transition-all">
                        <i data-lucide="plus" class="w-5 h-5"></i>
                        Add Worker
                    </button>
                </div>

                <!-- Search and Filters -->
                <div class="bg-white/90 dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 mb-6">
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex-1">
                            <label class="block text-xs font-semibold text-gray-500 mb-1">Search Workers</label>
                            <input type="text" id="workerSearch" class="form-input max-w-md w-full rounded-lg shadow-sm border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Search by name..." oninput="window.Workers.debouncedFilter()">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-500 mb-1">Filter by Type</label>
                            <select id="payTypeFilter" class="form-select max-w-xs w-full rounded-lg shadow-sm border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white" onchange="window.Workers.filterWorkers()">
                                <option value="">All Types</option>
                                <option value="hourly">Hourly</option>
                                <option value="contract">Contract</option>
                                <option value="both">Both</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Workers Grid/Table -->
                <div class="bg-white/90 dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <!-- Desktop Table View -->
                    <div class="hidden md:block overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th class="text-left p-4 font-semibold text-gray-900 dark:text-white">Worker</th>
                                    <th class="text-left p-4 font-semibold text-gray-900 dark:text-white">Pay Type</th>
                                    <th class="text-left p-4 font-semibold text-gray-900 dark:text-white">Rate Info</th>
                                    <th class="text-left p-4 font-semibold text-gray-900 dark:text-white">Benefits</th>
                                    <th class="text-left p-4 font-semibold text-gray-900 dark:text-white">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="workersTableBody" class="divide-y divide-gray-200 dark:divide-gray-600">
                                <!-- Workers will be populated here -->
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Mobile Card View -->
                    <div class="md:hidden" id="workersCardView">
                        <!-- Worker cards will be populated here -->
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
     * Load and display workers
     */
    loadWorkers() {
        const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
        const tbody = document.getElementById('workersTableBody');
        const cardView = document.getElementById('workersCardView');
        
        if (!tbody && !cardView) return;

        // Clear existing content
        if (tbody) tbody.innerHTML = '';
        if (cardView) cardView.innerHTML = '';
        
        if (workers.length === 0) {
            const emptyMessage = `
                <div class="p-8 text-center text-gray-400">
                    <i data-lucide="users" class="w-16 h-16 mx-auto mb-4 opacity-50"></i>
                    <h3 class="text-lg font-semibold mb-2">No workers found</h3>
                    <p class="mb-4">Add your first worker to get started with payroll management.</p>
                    <button onclick="window.Workers.openWorkerModal()" class="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-lg">
                        <i data-lucide="plus" class="w-4 h-4 mr-2 inline"></i>
                        Add Worker
                    </button>
                </div>
            `;
            
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="5">${emptyMessage}</td></tr>`;
            }
            if (cardView) {
                cardView.innerHTML = emptyMessage;
            }
            
            if (window.lucide) window.lucide.createIcons();
            return;
        }
        
        workers.forEach(worker => {
            // Prepare worker data
            let rateInfo = '';
            let payTypeDisplay = worker.payType.charAt(0).toUpperCase() + worker.payType.slice(1);
            
            if (worker.payType === 'hourly') {
                rateInfo = `$${worker.hourlyRate}/hour`;
            } else if (worker.payType === 'contract') {
                rateInfo = `${worker.taskDescriptions?.length || 0} task types`;
            } else if (worker.payType === 'both') {
                rateInfo = `$${worker.hourlyRate}/hour + ${worker.taskDescriptions?.length || 0} tasks`;
            }
            
            const benefits = [];
            if (worker.carFare && worker.carFareAmount) {
                benefits.push(`Car Fare: $${worker.carFareAmount}`);
            } else if (worker.carFare) {
                benefits.push('Car Fare: Enabled');
            }
            if (worker.weeklyRent > 0) benefits.push(`Rent: $${worker.weeklyRent}`);
            const benefitsText = benefits.length > 0 ? benefits.join(', ') : 'None';
            
            // Desktop table row
            if (tbody) {
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors';
                
                row.innerHTML = `
                    <td class="p-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                                <span class="text-teal-600 dark:text-teal-400 font-semibold">${worker.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                                <div class="font-semibold text-gray-900 dark:text-white">${worker.name}</div>
                                <div class="text-sm text-gray-500">${worker.contact || 'No contact info'}</div>
                            </div>
                        </div>
                    </td>
                    <td class="p-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                            ${payTypeDisplay}
                        </span>
                    </td>
                    <td class="p-4 text-gray-900 dark:text-white">${rateInfo}</td>
                    <td class="p-4 text-gray-900 dark:text-white">${benefitsText}</td>
                    <td class="p-4">
                        <div class="flex items-center gap-2">
                            <button onclick="window.Workers.viewWorkerProfile('${worker.id}')" class="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-xs text-white transition-colors">
                                <i data-lucide="eye" class="w-3 h-3 mr-1 inline"></i>
                                View
                            </button>
                            <button onclick="window.Workers.openWorkerModal('${worker.id}')" class="bg-yellow-600 hover:bg-yellow-700 px-3 py-1.5 rounded-lg text-xs text-white transition-colors">
                                <i data-lucide="edit" class="w-3 h-3 mr-1 inline"></i>
                                Edit
                            </button>
                            <button onclick="window.Workers.deleteWorker('${worker.id}')" class="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-xs text-white transition-colors">
                                <i data-lucide="trash-2" class="w-3 h-3 mr-1 inline"></i>
                                Delete
                            </button>
                        </div>
                    </td>
                `;
                
                tbody.appendChild(row);
            }
            
            // Mobile card view
            if (cardView) {
                const card = document.createElement('div');
                card.className = 'p-4 border-b border-gray-200 dark:border-gray-600 last:border-b-0';
                
                card.innerHTML = `
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                                <span class="text-teal-600 dark:text-teal-400 font-semibold text-lg">${worker.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                                <div class="font-semibold text-gray-900 dark:text-white">${worker.name}</div>
                                <div class="text-sm text-gray-500">${worker.contact || 'No contact info'}</div>
                            </div>
                        </div>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                            ${payTypeDisplay}
                        </span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                            <span class="text-gray-500">Rate Info:</span>
                            <div class="font-medium text-gray-900 dark:text-white">${rateInfo}</div>
                        </div>
                        <div>
                            <span class="text-gray-500">Benefits:</span>
                            <div class="font-medium text-gray-900 dark:text-white">${benefitsText}</div>
                        </div>
                    </div>
                    
                    <div class="flex gap-2">
                        <button onclick="window.Workers.viewWorkerProfile('${worker.id}')" class="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-xs text-white transition-colors text-center">
                            <i data-lucide="eye" class="w-3 h-3 mr-1 inline"></i>
                            View
                        </button>
                        <button onclick="window.Workers.openWorkerModal('${worker.id}')" class="flex-1 bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded-lg text-xs text-white transition-colors text-center">
                            <i data-lucide="edit" class="w-3 h-3 mr-1 inline"></i>
                            Edit
                        </button>
                        <button onclick="window.Workers.deleteWorker('${worker.id}')" class="flex-1 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-xs text-white transition-colors text-center">
                            <i data-lucide="trash-2" class="w-3 h-3 mr-1 inline"></i>
                            Delete
                        </button>
                    </div>
                `;
                
                cardView.appendChild(card);
            }
        });
        
        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    /**
     * Open worker modal for add/edit
     */
    openWorkerModal(workerId = null) {
        console.log('Opening worker modal for:', workerId);
        if (window.Modals && window.Modals.openWorkerModal) {
            window.Modals.openWorkerModal(workerId);
        } else {
            console.error('Modals component not available');
            window.UI.showToast('Error: Modal system not available', 'error');
        }
    }

    /**
     * View worker profile
     */
    viewWorkerProfile(workerId) {
        window.Modals.viewWorkerProfile(workerId);
    }

    /**
     * Delete worker
     */
    async deleteWorker(workerId) {
        const confirmed = await window.UI.showConfirmation(
            'Are you sure you want to delete this worker? This will also delete all associated work logs and advances.',
            'Delete Worker'
        );

        if (confirmed) {
            let workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
            let workLogs = window.Storage.load(window.CONFIG.STORAGE.workLogs, []);
            let advances = window.Storage.load(window.CONFIG.STORAGE.advances, []);
            
            workers = workers.filter(w => w.id !== workerId);
            workLogs = workLogs.filter(log => log.workerId !== workerId);
            advances = advances.filter(advance => advance.workerId !== workerId);
            
            window.Storage.save(window.CONFIG.STORAGE.workers, workers);
            window.Storage.save(window.CONFIG.STORAGE.workLogs, workLogs);
            window.Storage.save(window.CONFIG.STORAGE.advances, advances);
            
            this.loadWorkers();
            window.PayrollApp.refreshData();
            window.UI.showToast('Worker deleted successfully!');
        }
    }

    /**
     * Filter workers based on search and pay type
     */
    filterWorkers() {
        const searchTerm = document.getElementById('workerSearch')?.value.toLowerCase() || '';
        const payTypeFilter = document.getElementById('payTypeFilter')?.value || '';
        
        // Filter table rows (desktop)
        const rows = document.querySelectorAll('#workersTableBody tr');
        rows.forEach(row => {
            if (row.cells.length < 5) return; // Skip empty state row
            
            const nameCell = row.cells[0]?.textContent.toLowerCase() || '';
            const payTypeCell = row.cells[1]?.textContent.toLowerCase() || '';
            
            const matchesSearch = nameCell.includes(searchTerm);
            const matchesPayType = !payTypeFilter || payTypeCell.includes(payTypeFilter.toLowerCase());
            
            if (matchesSearch && matchesPayType) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
        
        // Filter card view (mobile)
        const cards = document.querySelectorAll('#workersCardView > div');
        cards.forEach(card => {
            const nameText = card.textContent.toLowerCase();
            const payTypeSpan = card.querySelector('span[class*="bg-teal"]')?.textContent.toLowerCase() || '';
            
            const matchesSearch = nameText.includes(searchTerm);
            const matchesPayType = !payTypeFilter || payTypeSpan.includes(payTypeFilter.toLowerCase());
            
            if (matchesSearch && matchesPayType) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    /**
     * Debounced filter function for better performance
     */
    debouncedFilter() {
        // Clear existing timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Set new timeout
        this.searchTimeout = setTimeout(() => {
            this.filterWorkers();
        }, 300); // 300ms delay
    }

    /**
     * Refresh workers data
     */
    refresh() {
        this.loadWorkers();
    }
}

// Create global workers instance
window.Workers = new Workers(); 