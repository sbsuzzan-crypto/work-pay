/**
 * WorkLog Component
 * Handles work logging functionality
 */

class WorkLog {
    constructor() {
        this.initialized = false;
        this.currentTab = 'individual';
    }

    /**
     * Initialize worklog component
     */
    init() {
        if (this.initialized) return;
        
        this.render();
        this.handleEvents();
        this.loadWorkLogs();
        
        this.initialized = true;
    }

    /**
     * Render worklog section content
     */
    render() {
        const worklogSection = document.getElementById('worklog');
        if (!worklogSection) return;

        worklogSection.innerHTML = `
            <div class="mb-8 text-center">
                <h2 class="text-3xl font-extrabold text-white mb-2 flex items-center justify-center gap-2">
                    <i data-lucide="clock" class="w-8 h-8 text-teal-400"></i>
                    Log Work
                </h2>
                <p class="text-gray-400">Track work hours, contract jobs, and car fare</p>
            </div>

            <!-- Enhanced Tab Navigation -->
            <div class="flex space-x-1 mb-8 bg-gray-800/50 p-1 rounded-xl border border-gray-700">
                <button onclick="window.WorkLog.switchTab('individual')" class="tab-button flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all duration-200 hover:bg-gray-700" id="individualTab">
                    <i data-lucide="user" class="w-4 h-4 inline mr-2"></i>
                    Individual Entry
                </button>
                <button onclick="window.WorkLog.switchTab('bulk')" class="tab-button flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all duration-200 hover:bg-gray-700" id="bulkTab">
                    <i data-lucide="users" class="w-4 h-4 inline mr-2"></i>
                    Bulk Entry
                </button>
                <button onclick="window.WorkLog.switchTab('carfare')" class="tab-button flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all duration-200 hover:bg-gray-700" id="carfareTab">
                    <i data-lucide="car" class="w-4 h-4 inline mr-2"></i>
                    Car Fare
                </button>
                <button onclick="window.WorkLog.switchTab('history')" class="tab-button flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all duration-200 hover:bg-gray-700" id="historyTab">
                    <i data-lucide="history" class="w-4 h-4 inline mr-2"></i>
                    Work History
                </button>
            </div>

            <!-- Individual Entry Tab -->
            <div id="individualEntry" class="tab-content">
                <div class="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-xl border border-gray-700 mb-6">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="p-2 bg-teal-500/20 rounded-lg">
                            <i data-lucide="user-plus" class="w-6 h-6 text-teal-400"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-white">Individual Work Entry</h3>
                    </div>
                    <form id="individualWorkForm" class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">Worker *</label>
                                <select id="individualWorker" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" required onchange="window.WorkLog.updateWorkerInfo('individual')">
                                    <option value="">Select Worker</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-2">Date *</label>
                                <input type="date" id="individualDate" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" required>
                            </div>
                        </div>

                        <!-- Worker Info Display -->
                        <div id="individualWorkerInfo" class="bg-gray-700 p-4 rounded hidden">
                            <!-- Worker info will be displayed here -->
                        </div>

                        <!-- Hourly Work Section -->
                        <div id="individualHourlySection" class="hidden">
                            <h4 class="font-semibold mb-2">Hourly Work</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2">Hours Worked</label>
                                    <input type="number" step="0.5" id="individualHours" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" onchange="window.WorkLog.calculateEarnings('individual')">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Hourly Rate</label>
                                    <input type="number" step="0.01" id="individualHourlyRate" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" readonly>
                                </div>
                            </div>
                        </div>

                        <!-- Contract Work Section -->
                        <div id="individualContractSection" class="hidden">
                            <h4 class="font-semibold mb-2">Contract Work</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2">Contract Job</label>
                                    <select id="individualContractJob" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" onchange="window.WorkLog.updateContractInfo('individual')">
                                        <option value="">Select Contract or Ad-hoc Task</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Contract Amount ($)</label>
                                    <input type="number" step="0.01" id="individualContractAmount" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" onchange="window.WorkLog.calculateEarnings('individual')">
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2">Units Completed</label>
                                    <input type="number" step="0.1" id="individualUnits" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" onchange="window.WorkLog.calculateEarnings('individual')">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Unit Rate ($)</label>
                                    <input type="number" step="0.01" id="individualUnitRate" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" onchange="window.WorkLog.calculateEarnings('individual')">
                                </div>
                            </div>
                        </div>

                        <!-- Note: Car fare is now managed separately in the Car Fare tab -->

                        <!-- Earnings Summary -->
                        <div class="bg-gray-700 p-4 rounded">
                            <h4 class="font-semibold mb-2">Daily Earnings Summary</h4>
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span class="text-gray-400">Hourly Earnings:</span>
                                    <div id="individualHourlyEarnings" class="font-semibold">$0.00</div>
                                </div>
                                <div>
                                    <span class="text-gray-400">Contract Earnings:</span>
                                    <div id="individualContractEarnings" class="font-semibold">$0.00</div>
                                </div>
                                <div>
                                    <span class="text-gray-400">Total Daily Earnings:</span>
                                    <div id="individualTotalEarnings" class="font-semibold text-teal-400">$0.00</div>
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-end">
                            <button type="submit" class="bg-teal-600 hover:bg-teal-700 px-6 py-2 rounded">Log Work Entry</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Bulk Entry Tab -->
            <div id="bulkEntry" class="tab-content hidden">
                <div class="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-xl border border-gray-700 mb-6">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="p-2 bg-blue-500/20 rounded-lg">
                            <i data-lucide="users" class="w-6 h-6 text-blue-400"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-white">Bulk Work Entry</h3>
                    </div>
                    
                    <!-- Bulk Entry Type Selection -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium mb-2">Entry Type</label>
                        <select id="bulkEntryType" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" onchange="window.WorkLog.switchBulkType()">
                            <option value="hourly">Hourly Work for Multiple Workers</option>
                            <option value="unit">Unit-based Work for Multiple Workers</option>
                        </select>
                    </div>

                    <!-- Bulk Hourly Entry -->
                    <div id="bulkHourlyEntry">
                        <form id="bulkHourlyForm" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2">Date *</label>
                                    <input type="date" id="bulkHourlyDate" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" required>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Hours Worked *</label>
                                    <input type="number" step="0.5" id="bulkHours" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" required>
                                </div>
                            </div>
                            
                            <div>
                                <div class="flex justify-between items-center mb-3">
                                    <label class="block text-sm font-medium">Select Workers</label>
                                    <div class="flex items-center gap-2">
                                        <button type="button" onclick="window.WorkLog.toggleAllHourlyWorkers(true)" 
                                                class="text-xs bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded transition-colors duration-200">
                                            <i data-lucide="check-square" class="w-3 h-3 inline mr-1"></i>
                                            Select All
                                        </button>
                                        <button type="button" onclick="window.WorkLog.toggleAllHourlyWorkers(false)" 
                                                class="text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded transition-colors duration-200">
                                            <i data-lucide="square" class="w-3 h-3 inline mr-1"></i>
                                            Clear All
                                        </button>
                                    </div>
                                </div>
                                <div id="bulkHourlyWorkers" class="space-y-2 max-h-60 overflow-y-auto bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                                    <!-- Workers will be populated here -->
                                </div>
                            </div>
                            
                            <div class="flex justify-end">
                                <button type="submit" class="bg-teal-600 hover:bg-teal-700 px-6 py-2 rounded">Log Bulk Hourly Entries</button>
                            </div>
                        </form>
                    </div>

                    <!-- Bulk Unit Entry -->
                    <div id="bulkUnitEntry" class="hidden">
                        <form id="bulkUnitForm" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2">Date *</label>
                                    <input type="date" id="bulkUnitDate" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" required>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Contract *</label>
                                    <select id="bulkContract" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" required onchange="window.WorkLog.updateBulkContractInfo()">
                                        <option value="">Select Contract</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div id="bulkContractInfo" class="bg-gray-700 p-3 rounded hidden">
                                <div class="text-sm">
                                    <span class="text-gray-400">Rate per Unit:</span>
                                    <span id="bulkContractRate" class="font-semibold text-teal-400">$0.00</span>
                                    <span class="text-gray-400 ml-4">Unit:</span>
                                    <span id="bulkContractUnit" class="font-semibold">-</span>
                                </div>
                            </div>
                            
                            <div>
                                <div class="flex justify-between items-center mb-3">
                                    <label class="block text-sm font-medium">Select Workers and Enter Units</label>
                                    <div class="flex items-center gap-2">
                                        <button type="button" onclick="window.WorkLog.toggleAllUnitWorkers(true)" 
                                                class="text-xs bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded transition-colors duration-200">
                                            <i data-lucide="check-square" class="w-3 h-3 inline mr-1"></i>
                                            Select All
                                        </button>
                                        <button type="button" onclick="window.WorkLog.toggleAllUnitWorkers(false)" 
                                                class="text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded transition-colors duration-200">
                                            <i data-lucide="square" class="w-3 h-3 inline mr-1"></i>
                                            Clear All
                                        </button>
                                    </div>
                                </div>
                                <div id="bulkUnitWorkers" class="space-y-3 max-h-80 overflow-y-auto bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                                    <!-- Workers will be populated here -->
                                </div>
                            </div>
                            
                            <div class="bg-gray-700 p-4 rounded">
                                <h4 class="font-semibold mb-2">Summary</h4>
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span class="text-gray-400">Selected Workers:</span>
                                        <div id="bulkSelectedCount" class="font-semibold">0</div>
                                    </div>
                                    <div>
                                        <span class="text-gray-400">Total Units:</span>
                                        <div id="bulkTotalUnits" class="font-semibold">0</div>
                                    </div>
                                    <div>
                                        <span class="text-gray-400">Total Earnings:</span>
                                        <div id="bulkTotalEarnings" class="font-semibold text-teal-400">$0.00</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="flex justify-end">
                                <button type="submit" class="bg-teal-600 hover:bg-teal-700 px-6 py-2 rounded">Log Bulk Unit Entries</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Car Fare Tab -->
            <div id="carfareEntry" class="tab-content hidden">
                <div class="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-xl border border-gray-700 mb-6">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="p-2 bg-orange-500/20 rounded-lg">
                            <i data-lucide="car" class="w-6 h-6 text-orange-400"></i>
                        </div>
                        <div>
                            <h3 class="text-xl font-semibold text-white">Car Fare Management</h3>
                            <p class="text-gray-400 text-sm">Manage car fare deductions for workers. Car fare is deducted from worker pay.</p>
                        </div>
                    </div>
                    
                    <!-- Bulk Car Fare Application -->
                    <div class="mb-8">
                        <h4 class="text-lg font-semibold mb-4">Apply Car Fare to All Eligible Workers</h4>
                        <form id="bulkCarFareForm" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2">Date *</label>
                                    <input type="date" id="bulkCarFareDate" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" required>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Car Fare Amount ($) *</label>
                                    <input type="number" step="0.01" id="bulkCarFareAmount" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" required placeholder="0.00" min="0">
                                </div>
                                <div class="flex items-end">
                                    <button type="submit" class="w-full bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded">Apply to All</button>
                                </div>
                            </div>
                            <div class="bg-gray-700 p-4 rounded">
                                <p class="text-sm text-gray-300">
                                    <i data-lucide="info" class="inline w-4 h-4 mr-1"></i>
                                    This will apply the car fare amount to all workers who have car fare enabled in their profile.
                                </p>
                            </div>
                        </form>
                    </div>

                    <!-- Individual Car Fare Entry -->
                    <div class="mb-8">
                        <h4 class="text-lg font-semibold mb-4">Individual Car Fare Entry</h4>
                        <form id="individualCarFareForm" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2">Worker *</label>
                                    <select id="carFareWorker" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" required>
                                        <option value="">Select Worker</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Date *</label>
                                    <input type="date" id="individualCarFareDate" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" required>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Amount ($) *</label>
                                    <input type="number" step="0.01" id="individualCarFareAmount" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" required placeholder="0.00" min="0">
                                </div>
                                <div class="flex items-end">
                                    <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">Add Entry</button>
                                </div>
                            </div>
                        </form>
                    </div>

                    <!-- Car Fare History -->
                    <div>
                        <h4 class="text-lg font-semibold mb-4">Car Fare History</h4>
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead class="bg-gray-700">
                                    <tr>
                                        <th class="text-left p-3">Date</th>
                                        <th class="text-left p-3">Worker</th>
                                        <th class="text-left p-3">Amount</th>
                                        <th class="text-left p-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="carFareHistoryTableBody">
                                    <!-- Car fare history will be populated here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Work History Tab -->
            <div id="workHistory" class="tab-content hidden">
                <div class="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-xl border border-gray-700">
                    <div class="flex justify-between items-center mb-6">
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-purple-500/20 rounded-lg">
                                <i data-lucide="history" class="w-6 h-6 text-purple-400"></i>
                            </div>
                            <h3 class="text-xl font-semibold text-white">Work History</h3>
                        </div>
                        <div class="flex space-x-2">
                            <input type="text" id="workHistorySearch" placeholder="Search work logs..." 
                                   class="bg-gray-700 border border-gray-600 rounded px-3 py-2"
                                   onkeyup="window.WorkLog.filterWorkHistory()">
                            <select id="workHistoryWorkerFilter" class="bg-gray-700 border border-gray-600 rounded px-3 py-2" onchange="window.WorkLog.filterWorkHistory()">
                                <option value="">All Workers</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-700">
                                <tr>
                                    <th class="text-left p-3">Date</th>
                                    <th class="text-left p-3">Worker</th>
                                    <th class="text-left p-3">Hours</th>
                                    <th class="text-left p-3">Contract Job</th>
                                    <th class="text-left p-3">Contract Amt</th>
                                    <th class="text-left p-3">Units</th>
                                    <th class="text-left p-3">Unit Rate</th>
                                    <th class="text-left p-3">Daily Earnings</th>
                                    <th class="text-left p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="workHistoryTableBody">
                                <!-- Work history will be populated here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Set active tab
        this.switchTab('individual');
    }

    /**
     * Set up event listeners
     */
    handleEvents() {
        // Individual work form
        document.getElementById('individualWorkForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveIndividualWork();
        });

        // Bulk hourly form
        document.getElementById('bulkHourlyForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBulkHourlyWork();
        });

        // Bulk unit form
        document.getElementById('bulkUnitForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBulkUnitWork();
        });
    }

    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.add('hidden');
        });
        
        // Remove active class from all tab buttons and reset styles
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
            btn.classList.remove('bg-teal-600', 'text-white', 'shadow-lg');
            btn.classList.add('text-gray-400');
        });
        
        // Show selected tab content
        const tabContent = {
            'individual': 'individualEntry',
            'bulk': 'bulkEntry',
            'carfare': 'carfareEntry',
            'history': 'workHistory'
        };
        
        document.getElementById(tabContent[tabName]).classList.remove('hidden');
        
        // Style active tab
        const activeTab = document.getElementById(tabName + 'Tab');
        activeTab.classList.add('active', 'bg-teal-600', 'text-white', 'shadow-lg');
        activeTab.classList.remove('text-gray-400');
        
        // Load data for the tab
        if (tabName === 'individual') {
            this.loadWorkerDropdowns();
        } else if (tabName === 'bulk') {
            this.loadBulkWorkers();
            this.loadContractDropdowns();
        } else if (tabName === 'carfare') {
            this.loadCarFareEntries();
        } else if (tabName === 'history') {
            this.loadWorkHistory();
        }
        
        // Reinitialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    /**
     * Load worker dropdowns
     */
    loadWorkerDropdowns() {
        const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
        
        // Individual worker dropdown
        const individualWorker = document.getElementById('individualWorker');
        individualWorker.innerHTML = '<option value="">Select Worker</option>';
        
        // Work history filter dropdown
        const historyFilter = document.getElementById('workHistoryWorkerFilter');
        historyFilter.innerHTML = '<option value="">All Workers</option>';
        
        workers.forEach(worker => {
            const option1 = document.createElement('option');
            option1.value = worker.id;
            option1.textContent = worker.name;
            individualWorker.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = worker.id;
            option2.textContent = worker.name;
            historyFilter.appendChild(option2);
        });
    }

    /**
     * Load contract dropdowns
     */
    loadContractDropdowns() {
        const contracts = window.Storage.load(window.CONFIG.STORAGE.contracts, []);
        
        // Individual contract dropdown
        const individualContract = document.getElementById('individualContractJob');
        const currentOptions = Array.from(individualContract.options).map(opt => opt.value);
        
        // Bulk contract dropdown
        const bulkContract = document.getElementById('bulkContract');
        bulkContract.innerHTML = '<option value="">Select Contract</option>';
        
        contracts.forEach(contract => {
            if (!currentOptions.includes(contract.id)) {
                const option1 = document.createElement('option');
                option1.value = contract.id;
                option1.textContent = `${contract.name} ($${contract.rate}/${contract.unit})`;
                option1.dataset.rate = contract.rate;
                option1.dataset.unit = contract.unit;
                individualContract.appendChild(option1);
            }
            
            const option2 = document.createElement('option');
            option2.value = contract.id;
            option2.textContent = `${contract.name} ($${contract.rate}/${contract.unit})`;
            option2.dataset.rate = contract.rate;
            option2.dataset.unit = contract.unit;
            bulkContract.appendChild(option2);
        });
    }

    /**
     * Update worker info display
     */
    updateWorkerInfo(type) {
        const workerId = document.getElementById(`${type}Worker`).value;
        const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
        const worker = workers.find(w => w.id === workerId);
        
        if (!worker) {
            document.getElementById(`${type}WorkerInfo`).classList.add('hidden');
            return;
        }
        
        const infoDiv = document.getElementById(`${type}WorkerInfo`);
        infoDiv.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                    <span class="text-gray-400">Pay Type:</span>
                    <div class="font-semibold">${worker.payType}</div>
                </div>
                ${worker.hourlyRate ? `
                <div>
                    <span class="text-gray-400">Hourly Rate:</span>
                    <div class="font-semibold">$${worker.hourlyRate}</div>
                </div>
                ` : ''}
                <div>
                    <span class="text-gray-400">Car Fare:</span>
                    <div class="font-semibold">${worker.carFare ? 'Yes' : 'No'}</div>
                </div>
            </div>
        `;
        infoDiv.classList.remove('hidden');
        
        // Show/hide sections based on pay type
        const hourlySection = document.getElementById(`${type}HourlySection`);
        const contractSection = document.getElementById(`${type}ContractSection`);
        
        if (worker.payType === 'hourly' || worker.payType === 'both') {
            hourlySection.classList.remove('hidden');
            document.getElementById(`${type}HourlyRate`).value = worker.hourlyRate || 0;
        } else {
            hourlySection.classList.add('hidden');
        }
        
        if (worker.payType === 'contract' || worker.payType === 'both') {
            contractSection.classList.remove('hidden');
            this.loadWorkerTaskDescriptions(worker, type);
        } else {
            contractSection.classList.add('hidden');
        }
    }

    /**
     * Load worker task descriptions
     */
    loadWorkerTaskDescriptions(worker, type) {
        const contractJob = document.getElementById(`${type}ContractJob`);
        
        // Clear existing ad-hoc options
        const existingOptions = Array.from(contractJob.options);
        existingOptions.forEach(option => {
            if (option.dataset.type === 'adhoc') {
                option.remove();
            }
        });
        
        // Add worker's task descriptions
        if (worker.taskDescriptions && worker.taskDescriptions.length > 0) {
            worker.taskDescriptions.forEach(task => {
                const option = document.createElement('option');
                option.value = `adhoc_${task}`;
                option.textContent = `${task} (Ad-hoc)`;
                option.dataset.type = 'adhoc';
                contractJob.appendChild(option);
            });
        }
    }

    /**
     * Update contract info
     */
    updateContractInfo(type) {
        const contractSelect = document.getElementById(`${type}ContractJob`);
        const selectedOption = contractSelect.options[contractSelect.selectedIndex];
        
        if (selectedOption && selectedOption.dataset.rate) {
            document.getElementById(`${type}UnitRate`).value = selectedOption.dataset.rate;
        } else {
            document.getElementById(`${type}UnitRate`).value = '';
        }
        
        this.calculateEarnings(type);
    }

    /**
     * Calculate earnings
     */
    calculateEarnings(type) {
        const hours = parseFloat(document.getElementById(`${type}Hours`).value) || 0;
        const hourlyRate = parseFloat(document.getElementById(`${type}HourlyRate`).value) || 0;
        const contractAmount = parseFloat(document.getElementById(`${type}ContractAmount`).value) || 0;
        const units = parseFloat(document.getElementById(`${type}Units`).value) || 0;
        const unitRate = parseFloat(document.getElementById(`${type}UnitRate`).value) || 0;
        
        const hourlyEarnings = hours * hourlyRate;
        const unitEarnings = units * unitRate;
        const contractEarnings = contractAmount || unitEarnings;
        const totalEarnings = hourlyEarnings + contractEarnings;
        
        document.getElementById(`${type}HourlyEarnings`).textContent = `$${hourlyEarnings.toFixed(2)}`;
        document.getElementById(`${type}ContractEarnings`).textContent = `$${contractEarnings.toFixed(2)}`;
        document.getElementById(`${type}TotalEarnings`).textContent = `$${totalEarnings.toFixed(2)}`;
    }

    /**
     * Save individual work entry
     */
    saveIndividualWork() {
        const workLogs = window.Storage.load(window.CONFIG.STORAGE.workLogs, []);
        const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
        
        const workerId = document.getElementById('individualWorker').value;
        const worker = workers.find(w => w.id === workerId);
        
        const workLog = {
            id: Date.now().toString(),
            workerId: workerId,
            workerName: worker.name,
            date: document.getElementById('individualDate').value,
            hours: parseFloat(document.getElementById('individualHours').value) || null,
            contractJob: this.getContractJobName('individual'),
            contractAmount: parseFloat(document.getElementById('individualContractAmount').value) || null,
            units: parseFloat(document.getElementById('individualUnits').value) || null,
            unitRate: parseFloat(document.getElementById('individualUnitRate').value) || null,
            dailyEarnings: parseFloat(document.getElementById('individualTotalEarnings').textContent.replace('$', ''))
        };
        
        workLogs.push(workLog);
        window.Storage.save(window.CONFIG.STORAGE.workLogs, workLogs);
        
        // Reset form
        document.getElementById('individualWorkForm').reset();
        document.getElementById('individualWorkerInfo').classList.add('hidden');
        document.getElementById('individualHourlySection').classList.add('hidden');
        document.getElementById('individualContractSection').classList.add('hidden');
        
        window.PayrollApp.refreshData();
        window.UI.showToast('Work entry logged successfully!');
    }

    /**
     * Get contract job name
     */
    getContractJobName(type) {
        const contractSelect = document.getElementById(`${type}ContractJob`);
        const selectedOption = contractSelect.options[contractSelect.selectedIndex];
        
        if (!selectedOption || !selectedOption.value) return null;
        
        if (selectedOption.value.startsWith('adhoc_')) {
            return selectedOption.value.replace('adhoc_', '');
        } else {
            const contracts = window.Storage.load(window.CONFIG.STORAGE.contracts, []);
            const contract = contracts.find(c => c.id === selectedOption.value);
            return contract ? contract.name : null;
        }
    }

    /**
     * Load bulk workers
     */
    loadBulkWorkers() {
        const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
        
        // Bulk hourly workers
        const bulkHourlyDiv = document.getElementById('bulkHourlyWorkers');
        bulkHourlyDiv.innerHTML = '';
        
        // Bulk unit workers
        const bulkUnitDiv = document.getElementById('bulkUnitWorkers');
        bulkUnitDiv.innerHTML = '';
        
        workers.forEach(worker => {
            if (worker.payType === 'hourly' || worker.payType === 'both') {
                const workerRow = document.createElement('div');
                workerRow.className = 'flex items-center space-x-3 p-3 bg-gray-600/50 hover:bg-gray-600 rounded-lg border border-gray-500/30 hover:border-teal-500/30 transition-all duration-200';
                workerRow.innerHTML = `
                    <input type="checkbox" id="bulkHourly_${worker.id}" value="${worker.id}" 
                           class="flex-shrink-0 w-4 h-4 text-teal-600 bg-gray-700 border-gray-600 rounded focus:ring-teal-500 focus:ring-2" 
                           onchange="window.WorkLog.toggleWorkerHourInput('${worker.id}')">
                    <label for="bulkHourly_${worker.id}" class="flex-1 text-sm font-medium text-white cursor-pointer">
                        ${worker.name} 
                        <span class="text-teal-400 font-semibold">($${worker.hourlyRate}/hr)</span>
                    </label>
                    <div class="flex items-center space-x-2">
                        <input type="number" 
                               step="0.5" 
                               min="0" 
                               id="hours_${worker.id}" 
                               class="w-20 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-sm text-center text-white focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200" 
                               placeholder="0" 
                               disabled
                               title="Override hours for this worker">
                        <span class="text-xs text-gray-400 font-medium">hrs</span>
                    </div>
                `;
                bulkHourlyDiv.appendChild(workerRow);
            }
            
            if (worker.payType === 'contract' || worker.payType === 'both') {
                const workerRow = document.createElement('div');
                workerRow.className = 'flex items-center space-x-3 p-3 bg-gray-600/50 hover:bg-gray-600 rounded-lg border border-gray-500/30 hover:border-teal-500/30 transition-all duration-200';
                workerRow.innerHTML = `
                    <input type="checkbox" id="bulkUnit_${worker.id}" value="${worker.id}" 
                           class="flex-shrink-0 w-4 h-4 text-teal-600 bg-gray-700 border-gray-600 rounded focus:ring-teal-500 focus:ring-2" 
                           onchange="window.WorkLog.toggleWorkerUnitInput('${worker.id}')">
                    <label for="bulkUnit_${worker.id}" class="flex-1 text-sm font-medium text-white cursor-pointer">${worker.name}</label>
                    <div class="flex items-center space-x-2">
                        <input type="number" 
                               step="0.1" 
                               min="0" 
                               id="units_${worker.id}" 
                               class="w-20 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-sm text-center text-white focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200" 
                               placeholder="0" 
                               disabled
                               onchange="window.WorkLog.updateBulkSummary()">
                        <span class="text-xs text-gray-400 font-medium" id="unitLabel_${worker.id}">units</span>
                        <span class="text-xs text-teal-400 font-semibold" id="earnings_${worker.id}">$0.00</span>
                    </div>
                `;
                bulkUnitDiv.appendChild(workerRow);
            }
        });
        
        this.updateBulkSummary();
    }

    /**
     * Switch bulk entry type
     */
    switchBulkType() {
        const type = document.getElementById('bulkEntryType').value;
        
        if (type === 'hourly') {
            document.getElementById('bulkHourlyEntry').classList.remove('hidden');
            document.getElementById('bulkUnitEntry').classList.add('hidden');
        } else {
            document.getElementById('bulkHourlyEntry').classList.add('hidden');
            document.getElementById('bulkUnitEntry').classList.remove('hidden');
        }
    }

    /**
     * Update bulk contract info display
     */
    updateBulkContractInfo() {
        const contractSelect = document.getElementById('bulkContract');
        const selectedOption = contractSelect.options[contractSelect.selectedIndex];
        const infoDiv = document.getElementById('bulkContractInfo');
        
        if (selectedOption && selectedOption.value) {
            const rate = selectedOption.dataset.rate;
            const unit = selectedOption.dataset.unit;
            
            document.getElementById('bulkContractRate').textContent = `$${parseFloat(rate).toFixed(2)}`;
            document.getElementById('bulkContractUnit').textContent = unit;
            
            // Update unit labels for all workers
            const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
            workers.forEach(worker => {
                const unitLabel = document.getElementById(`unitLabel_${worker.id}`);
                if (unitLabel) {
                    unitLabel.textContent = unit;
                }
            });
            
            infoDiv.classList.remove('hidden');
            this.updateBulkSummary();
        } else {
            infoDiv.classList.add('hidden');
        }
    }

    /**
     * Toggle all hourly workers
     */
    toggleAllHourlyWorkers(selectAll) {
        const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
        const bulkHours = document.getElementById('bulkHours').value;
        
        workers.forEach(worker => {
            if (worker.payType === 'hourly' || worker.payType === 'both') {
                const checkbox = document.getElementById(`bulkHourly_${worker.id}`);
                const hoursInput = document.getElementById(`hours_${worker.id}`);
                
                if (checkbox) {
                    checkbox.checked = selectAll;
                    
                    if (selectAll) {
                        hoursInput.disabled = false;
                        if (bulkHours && !hoursInput.value) {
                            hoursInput.value = bulkHours;
                        }
                    } else {
                        hoursInput.disabled = true;
                        hoursInput.value = '';
                    }
                }
            }
        });
        
        // Reinitialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    /**
     * Toggle all unit workers
     */
    toggleAllUnitWorkers(selectAll) {
        const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
        
        workers.forEach(worker => {
            if (worker.payType === 'contract' || worker.payType === 'both') {
                const checkbox = document.getElementById(`bulkUnit_${worker.id}`);
                const unitsInput = document.getElementById(`units_${worker.id}`);
                
                if (checkbox) {
                    checkbox.checked = selectAll;
                    
                    if (selectAll) {
                        unitsInput.disabled = false;
                    } else {
                        unitsInput.disabled = true;
                        unitsInput.value = '';
                    }
                }
            }
        });
        
        this.updateBulkSummary();
        
        // Reinitialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    /**
     * Toggle worker hour input field for bulk hourly entry
     */
    toggleWorkerHourInput(workerId) {
        const checkbox = document.getElementById(`bulkHourly_${workerId}`);
        const hoursInput = document.getElementById(`hours_${workerId}`);
        
        if (checkbox.checked) {
            hoursInput.disabled = false;
            // Set default hours from the main bulk hours input
            const bulkHours = document.getElementById('bulkHours').value;
            if (bulkHours && !hoursInput.value) {
                hoursInput.value = bulkHours;
            }
            hoursInput.focus();
        } else {
            hoursInput.disabled = true;
            hoursInput.value = '';
        }
    }

    /**
     * Toggle worker unit input field
     */
    toggleWorkerUnitInput(workerId) {
        const checkbox = document.getElementById(`bulkUnit_${workerId}`);
        const unitsInput = document.getElementById(`units_${workerId}`);
        
        if (checkbox.checked) {
            unitsInput.disabled = false;
            unitsInput.focus();
        } else {
            unitsInput.disabled = true;
            unitsInput.value = '';
        }
        
        this.updateBulkSummary();
    }

    /**
     * Update bulk summary calculations
     */
    updateBulkSummary() {
        const contractSelect = document.getElementById('bulkContract');
        const selectedOption = contractSelect.options[contractSelect.selectedIndex];
        
        if (!selectedOption || !selectedOption.value) {
            document.getElementById('bulkSelectedCount').textContent = '0';
            document.getElementById('bulkTotalUnits').textContent = '0';
            document.getElementById('bulkTotalEarnings').textContent = '$0.00';
            return;
        }
        
        const rate = parseFloat(selectedOption.dataset.rate) || 0;
        let selectedCount = 0;
        let totalUnits = 0;
        let totalEarnings = 0;
        
        const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
        workers.forEach(worker => {
            const checkbox = document.getElementById(`bulkUnit_${worker.id}`);
            const unitsInput = document.getElementById(`units_${worker.id}`);
            const earningsSpan = document.getElementById(`earnings_${worker.id}`);
            
            if (checkbox && checkbox.checked) {
                selectedCount++;
                const units = parseFloat(unitsInput.value) || 0;
                const workerEarnings = units * rate;
                
                totalUnits += units;
                totalEarnings += workerEarnings;
                
                if (earningsSpan) {
                    earningsSpan.textContent = `$${workerEarnings.toFixed(2)}`;
                }
            } else if (earningsSpan) {
                earningsSpan.textContent = '$0.00';
            }
        });
        
        document.getElementById('bulkSelectedCount').textContent = selectedCount;
        document.getElementById('bulkTotalUnits').textContent = totalUnits.toFixed(1);
        document.getElementById('bulkTotalEarnings').textContent = `$${totalEarnings.toFixed(2)}`;
    }

    /**
     * Save bulk hourly work
     */
    saveBulkHourlyWork() {
        const workLogs = window.Storage.load(window.CONFIG.STORAGE.workLogs, []);
        const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
        
        const date = document.getElementById('bulkHourlyDate').value;
        const defaultHours = parseFloat(document.getElementById('bulkHours').value);
        
        const selectedWorkers = Array.from(document.querySelectorAll('#bulkHourlyWorkers input:checked'))
            .map(checkbox => checkbox.value);
        
        if (selectedWorkers.length === 0) {
            window.UI.showToast('Please select at least one worker', 'error');
            return;
        }
        
        selectedWorkers.forEach(workerId => {
            const worker = workers.find(w => w.id === workerId);
            
            // Use individual hours if specified, otherwise use default bulk hours
            const hoursInput = document.getElementById(`hours_${workerId}`);
            const workerHours = hoursInput && hoursInput.value ? parseFloat(hoursInput.value) : defaultHours;
            
            const hourlyEarnings = workerHours * worker.hourlyRate;
            
            const workLog = {
                id: Date.now().toString() + '_' + workerId,
                workerId: workerId,
                workerName: worker.name,
                date: date,
                hours: workerHours,
                contractJob: null,
                contractAmount: null,
                units: null,
                unitRate: null,
                dailyEarnings: hourlyEarnings
            };
            
            workLogs.push(workLog);
        });
        
        window.Storage.save(window.CONFIG.STORAGE.workLogs, workLogs);
        
        // Reset form
        document.getElementById('bulkHourlyForm').reset();
        document.querySelectorAll('#bulkHourlyWorkers input').forEach(cb => {
            cb.checked = false;
            // Reset individual hour inputs
            const workerId = cb.value;
            const hoursInput = document.getElementById(`hours_${workerId}`);
            if (hoursInput) {
                hoursInput.disabled = true;
                hoursInput.value = '';
            }
        });
        
        window.PayrollApp.refreshData();
        window.UI.showToast(`Bulk hourly entries logged for ${selectedWorkers.length} workers!`);
    }

    /**
     * Save bulk unit work
     */
    saveBulkUnitWork() {
        const workLogs = window.Storage.load(window.CONFIG.STORAGE.workLogs, []);
        const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
        const contracts = window.Storage.load(window.CONFIG.STORAGE.contracts, []);
        
        const date = document.getElementById('bulkUnitDate').value;
        const contractId = document.getElementById('bulkContract').value;
        
        const contract = contracts.find(c => c.id === contractId);
        
        if (!contract) {
            window.UI.showToast('Please select a contract', 'error');
            return;
        }
        
        // Get selected workers with their individual unit amounts
        const selectedWorkers = [];
        workers.forEach(worker => {
            const checkbox = document.getElementById(`bulkUnit_${worker.id}`);
            const unitsInput = document.getElementById(`units_${worker.id}`);
            
            if (checkbox && checkbox.checked) {
                const units = parseFloat(unitsInput.value) || 0;
                if (units > 0) {
                    selectedWorkers.push({
                        workerId: worker.id,
                        worker: worker,
                        units: units
                    });
                }
            }
        });
        
        if (selectedWorkers.length === 0) {
            window.UI.showToast('Please select at least one worker with units > 0', 'error');
            return;
        }
        
        selectedWorkers.forEach(({ workerId, worker, units }) => {
            const contractEarnings = units * contract.rate;
            
            const workLog = {
                id: Date.now().toString() + '_' + workerId,
                workerId: workerId,
                workerName: worker.name,
                date: date,
                hours: null,
                contractJob: contract.name,
                contractAmount: null,
                units: units,
                unitRate: contract.rate,
                dailyEarnings: contractEarnings
            };
            
            workLogs.push(workLog);
        });
        
        window.Storage.save(window.CONFIG.STORAGE.workLogs, workLogs);
        
        // Reset form
        document.getElementById('bulkUnitForm').reset();
        document.getElementById('bulkContractInfo').classList.add('hidden');
        
        // Reset all checkboxes and unit inputs
        workers.forEach(worker => {
            const checkbox = document.getElementById(`bulkUnit_${worker.id}`);
            const unitsInput = document.getElementById(`units_${worker.id}`);
            const earningsSpan = document.getElementById(`earnings_${worker.id}`);
            
            if (checkbox) checkbox.checked = false;
            if (unitsInput) {
                unitsInput.value = '';
                unitsInput.disabled = true;
            }
            if (earningsSpan) earningsSpan.textContent = '$0.00';
        });
        
        this.updateBulkSummary();
        
        window.PayrollApp.refreshData();
        window.UI.showToast(`Bulk unit entries logged for ${selectedWorkers.length} workers!`);
    }

    /**
     * Load work history
     */
    loadWorkHistory() {
        const workLogs = window.Storage.load(window.CONFIG.STORAGE.workLogs, []);
        const tbody = document.getElementById('workHistoryTableBody');
        
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (workLogs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="p-8 text-center text-gray-400">
                        No work logs found. <a href="#" onclick="window.WorkLog.switchTab('individual')" class="text-teal-400 hover:text-teal-300">Log your first work entry</a>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Sort by date (newest first)
        workLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        workLogs.forEach(log => {
            const row = document.createElement('tr');
            row.className = 'border-t border-gray-600';
            
            row.innerHTML = `
                <td class="p-3">${log.date}</td>
                <td class="p-3">${log.workerName}</td>
                <td class="p-3">${log.hours || '-'}</td>
                <td class="p-3">${log.contractJob || '-'}</td>
                <td class="p-3">${log.contractAmount ? '$' + log.contractAmount.toFixed(2) : '-'}</td>
                <td class="p-3">${log.units || '-'}</td>
                <td class="p-3">${log.unitRate ? '$' + log.unitRate.toFixed(2) : '-'}</td>
                <td class="p-3 font-semibold">$${log.dailyEarnings.toFixed(2)}</td>
                <td class="p-3">
                    <div class="flex space-x-2">
                        <button onclick="window.WorkLog.editWorkLog('${log.id}')" class="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs">Edit</button>
                        <button onclick="window.WorkLog.deleteWorkLog('${log.id}')" class="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs">Delete</button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    /**
     * Filter work history
     */
    filterWorkHistory() {
        const searchTerm = document.getElementById('workHistorySearch')?.value.toLowerCase() || '';
        const workerFilter = document.getElementById('workHistoryWorkerFilter')?.value || '';
        const rows = document.querySelectorAll('#workHistoryTableBody tr');
        
        rows.forEach(row => {
            if (row.cells.length < 5) return; // Skip empty state row
            
            const workerName = row.cells[1]?.textContent.toLowerCase() || '';
            const contractJob = row.cells[3]?.textContent.toLowerCase() || '';
            const date = row.cells[0]?.textContent.toLowerCase() || '';
            
            const matchesSearch = workerName.includes(searchTerm) || 
                                contractJob.includes(searchTerm) || 
                                date.includes(searchTerm);
            
            const matchesWorker = !workerFilter || row.cells[1]?.textContent === document.querySelector(`#workHistoryWorkerFilter option[value="${workerFilter}"]`)?.textContent;
            
            if (matchesSearch && matchesWorker) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    /**
     * Delete work log
     */
    async deleteWorkLog(logId) {
        const confirmed = await window.UI.showConfirmation(
            'Are you sure you want to delete this work log entry?',
            'Delete Work Log'
        );

        if (confirmed) {
            let workLogs = window.Storage.load(window.CONFIG.STORAGE.workLogs, []);
            workLogs = workLogs.filter(log => log.id !== logId);
            
            window.Storage.save(window.CONFIG.STORAGE.workLogs, workLogs);
            
            this.loadWorkHistory();
            window.PayrollApp.refreshData();
            window.UI.showToast('Work log deleted successfully!');
        }
    }

    /**
     * Load work logs (for initialization)
     */
    loadWorkLogs() {
        this.loadWorkerDropdowns();
        this.loadContractDropdowns();
    }

    /**
     * Refresh worklog data
     */
    refresh() {
        if (this.currentTab === 'history') {
            this.loadWorkHistory();
        }
        this.loadWorkerDropdowns();
        this.loadContractDropdowns();
        this.loadBulkWorkers();
    }

    /**
     * Load car fare entries
     */
    loadCarFareEntries() {
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('bulkCarFareDate').value = today;
        document.getElementById('individualCarFareDate').value = today;
        
        // Load workers for individual car fare
        this.loadCarFareWorkers();
        
        // Load car fare history
        this.loadCarFareHistory();
        
        // Setup event listeners
        this.setupCarFareEventListeners();
    }

    /**
     * Load workers for car fare dropdown
     */
    loadCarFareWorkers() {
        const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
        const dropdown = document.getElementById('carFareWorker');
        
        dropdown.innerHTML = '<option value="">Select Worker</option>';
        
        workers.forEach(worker => {
            const option = document.createElement('option');
            option.value = worker.id;
            option.textContent = `${worker.name}${worker.carFare ? ' (Car Fare Enabled)' : ''}`;
            option.dataset.carFareAmount = worker.carFareAmount || '';
            dropdown.appendChild(option);
        });
        
        // Auto-fill amount when worker is selected
        dropdown.addEventListener('change', () => {
            const selectedOption = dropdown.options[dropdown.selectedIndex];
            const carFareAmount = selectedOption.dataset.carFareAmount;
            if (carFareAmount) {
                document.getElementById('individualCarFareAmount').value = carFareAmount;
            }
        });
    }

    /**
     * Setup car fare event listeners
     */
    setupCarFareEventListeners() {
        // Bulk car fare form
        const bulkForm = document.getElementById('bulkCarFareForm');
        if (bulkForm) {
            bulkForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.applyBulkCarFare();
            });
        }

        // Individual car fare form
        const individualForm = document.getElementById('individualCarFareForm');
        if (individualForm) {
            individualForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addIndividualCarFare();
            });
        }
    }

    /**
     * Apply bulk car fare to all eligible workers
     */
    applyBulkCarFare() {
        const date = document.getElementById('bulkCarFareDate').value;
        const amount = parseFloat(document.getElementById('bulkCarFareAmount').value);
        
        if (!date || !amount || amount <= 0) {
            window.UI.showToast('Please enter valid date and amount', 'error');
            return;
        }

        const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
        const carFareEntries = window.Storage.load(window.CONFIG.STORAGE.carFareEntries, []);
        
        // Find workers with car fare enabled
        const eligibleWorkers = workers.filter(worker => worker.carFare);
        
        if (eligibleWorkers.length === 0) {
            window.UI.showToast('No workers have car fare enabled', 'warning');
            return;
        }

        // Add car fare entries for all eligible workers
        let addedCount = 0;
        eligibleWorkers.forEach(worker => {
            // Check if entry already exists for this worker and date
            const existingEntry = carFareEntries.find(entry => 
                entry.workerId === worker.id && entry.date === date
            );
            
            if (!existingEntry) {
                const carFareEntry = {
                    id: Date.now().toString() + '_' + worker.id,
                    workerId: worker.id,
                    workerName: worker.name,
                    date: date,
                    amount: amount,
                    type: 'bulk'
                };
                carFareEntries.push(carFareEntry);
                addedCount++;
            }
        });

        if (addedCount > 0) {
            window.Storage.save(window.CONFIG.STORAGE.carFareEntries, carFareEntries);
            this.loadCarFareHistory();
            window.PayrollApp.refreshData();
            window.UI.showToast(`Car fare applied to ${addedCount} workers!`, 'success');
            
            // Reset form
            document.getElementById('bulkCarFareForm').reset();
            document.getElementById('bulkCarFareDate').value = new Date().toISOString().split('T')[0];
        } else {
            window.UI.showToast('Car fare entries already exist for all eligible workers on this date', 'warning');
        }
    }

    /**
     * Add individual car fare entry
     */
    addIndividualCarFare() {
        const workerId = document.getElementById('carFareWorker').value;
        const date = document.getElementById('individualCarFareDate').value;
        const amount = parseFloat(document.getElementById('individualCarFareAmount').value);
        
        if (!workerId || !date || !amount || amount <= 0) {
            window.UI.showToast('Please fill all fields with valid values', 'error');
            return;
        }

        const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
        const carFareEntries = window.Storage.load(window.CONFIG.STORAGE.carFareEntries, []);
        const worker = workers.find(w => w.id === workerId);
        
        if (!worker) {
            window.UI.showToast('Worker not found', 'error');
            return;
        }

        // Check if entry already exists
        const existingEntry = carFareEntries.find(entry => 
            entry.workerId === workerId && entry.date === date
        );
        
        if (existingEntry) {
            window.UI.showToast('Car fare entry already exists for this worker on this date', 'warning');
            return;
        }

        const carFareEntry = {
            id: Date.now().toString(),
            workerId: workerId,
            workerName: worker.name,
            date: date,
            amount: amount,
            type: 'individual'
        };

        carFareEntries.push(carFareEntry);
        window.Storage.save(window.CONFIG.STORAGE.carFareEntries, carFareEntries);
        
        this.loadCarFareHistory();
        window.PayrollApp.refreshData();
        window.UI.showToast('Car fare entry added successfully!', 'success');
        
        // Reset form
        document.getElementById('individualCarFareForm').reset();
        document.getElementById('individualCarFareDate').value = new Date().toISOString().split('T')[0];
    }

    /**
     * Load car fare history
     */
    loadCarFareHistory() {
        const carFareEntries = window.Storage.load(window.CONFIG.STORAGE.carFareEntries, []);
        const tbody = document.getElementById('carFareHistoryTableBody');
        
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (carFareEntries.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="p-8 text-center text-gray-400">
                        No car fare entries found.
                    </td>
                </tr>
            `;
            return;
        }

        // Sort by date (newest first)
        carFareEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        carFareEntries.forEach(entry => {
            const row = document.createElement('tr');
            row.className = 'border-t border-gray-600';
            
            row.innerHTML = `
                <td class="p-3">${entry.date}</td>
                <td class="p-3">${entry.workerName}</td>
                <td class="p-3 font-semibold">$${entry.amount.toFixed(2)}</td>
                <td class="p-3">
                    <button onclick="window.WorkLog.deleteCarFareEntry('${entry.id}')" class="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs">Delete</button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    /**
     * Delete car fare entry
     */
    async deleteCarFareEntry(entryId) {
        const confirmed = await window.UI.showConfirmation(
            'Are you sure you want to delete this car fare entry?',
            'Delete Car Fare Entry'
        );

        if (confirmed) {
            let carFareEntries = window.Storage.load(window.CONFIG.STORAGE.carFareEntries, []);
            carFareEntries = carFareEntries.filter(entry => entry.id !== entryId);
            
            window.Storage.save(window.CONFIG.STORAGE.carFareEntries, carFareEntries);
            this.loadCarFareHistory();
            window.PayrollApp.refreshData();
            window.UI.showToast('Car fare entry deleted successfully!');
        }
    }

    /**
     * Edit work log
     */
    editWorkLog(logId) {
        const workLogs = window.Storage.load(window.CONFIG.STORAGE.workLogs, []);
        const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
        const log = workLogs.find(l => l.id === logId);
        
        if (!log) {
            window.UI.showToast('Work log not found', 'error');
            return;
        }
        
        const worker = workers.find(w => w.id === log.workerId);
        if (!worker) {
            window.UI.showToast('Worker not found', 'error');
            return;
        }
        
        // Create edit modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Edit Work Log</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <form id="editWorkLogForm" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Worker</label>
                            <input type="text" value="${worker.name}" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" readonly>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Date</label>
                            <input type="date" id="editDate" value="${log.date}" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" required>
                        </div>
                    </div>
                    
                    ${worker.payType === 'hourly' || worker.payType === 'both' ? `
                    <div class="bg-gray-700 p-4 rounded">
                        <h4 class="font-semibold mb-2">Hourly Work</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">Hours Worked</label>
                                <input type="number" step="0.5" id="editHours" value="${log.hours || ''}" class="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2" onchange="window.WorkLog.calculateEditEarnings()">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-2">Hourly Rate</label>
                                <input type="number" step="0.01" id="editHourlyRate" value="${worker.hourlyRate || ''}" class="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2" readonly>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${worker.payType === 'contract' || worker.payType === 'both' ? `
                    <div class="bg-gray-700 p-4 rounded">
                        <h4 class="font-semibold mb-2">Contract Work</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">Contract Job</label>
                                <input type="text" id="editContractJob" value="${log.contractJob || ''}" class="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-2">Contract Amount ($)</label>
                                <input type="number" step="0.01" id="editContractAmount" value="${log.contractAmount || ''}" class="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2" onchange="window.WorkLog.calculateEditEarnings()">
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">Units Completed</label>
                                <input type="number" step="0.1" id="editUnits" value="${log.units || ''}" class="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2" onchange="window.WorkLog.calculateEditEarnings()">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-2">Unit Rate ($)</label>
                                <input type="number" step="0.01" id="editUnitRate" value="${log.unitRate || ''}" class="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2" onchange="window.WorkLog.calculateEditEarnings()">
                            </div>
                        </div>
                    </div>
                    ` : ''}
                    
                    <!-- Earnings Summary -->
                    <div class="bg-gray-700 p-4 rounded">
                        <h4 class="font-semibold mb-2">Daily Earnings Summary</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span class="text-gray-400">Hourly Earnings:</span>
                                <div id="editHourlyEarnings" class="font-semibold">$0.00</div>
                            </div>
                            <div>
                                <span class="text-gray-400">Contract Earnings:</span>
                                <div id="editContractEarnings" class="font-semibold">$0.00</div>
                            </div>
                            <div>
                                <span class="text-gray-400">Total Daily Earnings:</span>
                                <div id="editTotalEarnings" class="font-semibold text-teal-400">$0.00</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-2">
                        <button type="button" onclick="this.closest('.fixed').remove()" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">Cancel</button>
                        <button type="submit" class="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded">Update Work Log</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
        // Calculate initial earnings
        this.calculateEditEarnings();
        
        // Handle form submission
        document.getElementById('editWorkLogForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEditedWorkLog(logId);
            modal.remove();
        });
    }

    /**
     * Calculate earnings for edit form
     */
    calculateEditEarnings() {
        const hours = parseFloat(document.getElementById('editHours')?.value) || 0;
        const hourlyRate = parseFloat(document.getElementById('editHourlyRate')?.value) || 0;
        const contractAmount = parseFloat(document.getElementById('editContractAmount')?.value) || 0;
        const units = parseFloat(document.getElementById('editUnits')?.value) || 0;
        const unitRate = parseFloat(document.getElementById('editUnitRate')?.value) || 0;
        
        const hourlyEarnings = hours * hourlyRate;
        const unitEarnings = units * unitRate;
        const contractEarnings = contractAmount || unitEarnings;
        const totalEarnings = hourlyEarnings + contractEarnings;
        
        const hourlyEarningsEl = document.getElementById('editHourlyEarnings');
        const contractEarningsEl = document.getElementById('editContractEarnings');
        const totalEarningsEl = document.getElementById('editTotalEarnings');
        
        if (hourlyEarningsEl) hourlyEarningsEl.textContent = `$${hourlyEarnings.toFixed(2)}`;
        if (contractEarningsEl) contractEarningsEl.textContent = `$${contractEarnings.toFixed(2)}`;
        if (totalEarningsEl) totalEarningsEl.textContent = `$${totalEarnings.toFixed(2)}`;
    }

    /**
     * Save edited work log
     */
    saveEditedWorkLog(logId) {
        const workLogs = window.Storage.load(window.CONFIG.STORAGE.workLogs, []);
        const logIndex = workLogs.findIndex(log => log.id === logId);
        
        if (logIndex === -1) {
            window.UI.showToast('Work log not found', 'error');
            return;
        }
        
        // Update the work log
        const updatedLog = {
            ...workLogs[logIndex],
            date: document.getElementById('editDate').value,
            hours: parseFloat(document.getElementById('editHours')?.value) || null,
            contractJob: document.getElementById('editContractJob')?.value || null,
            contractAmount: parseFloat(document.getElementById('editContractAmount')?.value) || null,
            units: parseFloat(document.getElementById('editUnits')?.value) || null,
            unitRate: parseFloat(document.getElementById('editUnitRate')?.value) || null,
            dailyEarnings: parseFloat(document.getElementById('editTotalEarnings')?.textContent.replace('$', '')) || 0
        };
        
        workLogs[logIndex] = updatedLog;
        window.Storage.save(window.CONFIG.STORAGE.workLogs, workLogs);
        
        // Refresh the work history
        this.loadWorkHistory();
        window.PayrollApp.refreshData();
        window.UI.showToast('Work log updated successfully!');
    }
}

window.WorkLog = new WorkLog(); 