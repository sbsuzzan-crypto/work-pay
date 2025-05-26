/**
 * Modals Component
 * Handles modal dialogs and forms
 */

class Modals {
    constructor() {
        this.initialized = false;
        this.currentWorker = null;
        this.currentContract = null;
        this.currentAdvance = null;
    }

    init() {
        if (this.initialized) return;
        console.log('Initializing Modals component...');
        this.setupModalContainer();
        this.initialized = true;
        console.log('Modals component initialized successfully');
    }

    setupModalContainer() {
        const container = document.getElementById('modalsContainer');
        if (!container) return;

        container.innerHTML = `
            <!-- Worker Modal -->
            <div id="workerModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
                <div class="bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold" id="workerModalTitle">Add Worker</h3>
                        <button onclick="window.Modals.closeWorkerModal()" class="text-gray-400 hover:text-white">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <form id="workerForm" class="space-y-4">
                        <input type="hidden" id="workerId">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">Worker Name *</label>
                                <input type="text" id="workerName" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-2">Contact</label>
                                <input type="text" id="workerContact" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-2">Pay Type *</label>
                            <select id="workerPayType" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" required onchange="window.Modals.togglePayTypeFields()">
                                <option value="">Select Pay Type</option>
                                <option value="hourly">Hourly</option>
                                <option value="contract">Contract (Unit-Based)</option>
                                <option value="both">Both (Hourly & Unit-Based)</option>
                            </select>
                        </div>
                        
                        <div id="hourlyRateField" class="hidden">
                            <label class="block text-sm font-medium mb-2">Hourly Rate ($)</label>
                            <input type="number" step="0.01" id="workerHourlyRate" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
                        </div>
                        
                        <div id="taskDescriptionsField" class="hidden">
                            <label class="block text-sm font-medium mb-2">Common Ad-hoc Contract Task Descriptions</label>
                            <div class="space-y-2">
                                <div class="flex">
                                    <input type="text" id="newTaskDescription" class="flex-1 bg-gray-700 border border-gray-600 rounded-l px-3 py-2" placeholder="Enter task description">
                                    <button type="button" onclick="window.Modals.addTaskDescription()" class="bg-teal-600 hover:bg-teal-700 px-3 py-2 rounded-r">Add</button>
                                </div>
                                <button type="button" onclick="window.Modals.suggestTaskDescriptions()" class="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-sm flex items-center">
                                    <i data-lucide="sparkles" class="mr-1 w-4 h-4"></i>
                                    Suggest Task Descriptions
                                </button>
                                <div id="taskDescriptionsList" class="space-y-1">
                                    <!-- Task descriptions will be listed here -->
                                </div>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">Car Fare (Deduction)</label>
                                <div class="space-y-2">
                                    <select id="workerCarFareEnabled" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" onchange="window.Modals.toggleCarFareAmount()">
                                        <option value="false">No Car Fare</option>
                                        <option value="true">Apply Car Fare</option>
                                    </select>
                                    <div id="carFareAmountField" class="hidden">
                                        <input type="number" step="0.01" id="workerCarFareAmount" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" placeholder="0.00" min="0">
                                        <small class="text-gray-400">Daily car fare amount (deducted from pay)</small>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-2">Weekly Rent Amount ($)</label>
                                <input type="number" step="0.01" id="workerWeeklyRent" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" placeholder="0.00">
                            </div>
                        </div>
                        
                        <div class="flex justify-end space-x-2">
                            <button type="button" onclick="window.Modals.closeWorkerModal()" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">Cancel</button>
                            <button type="submit" class="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded">Save Worker</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Contract Modal -->
            <div id="contractModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
                <div class="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold" id="contractModalTitle">Add Unit Contract</h3>
                        <button onclick="window.Modals.closeContractModal()" class="text-gray-400 hover:text-white">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <form id="contractForm" class="space-y-4">
                        <input type="hidden" id="contractId">
                        <div>
                            <label class="block text-sm font-medium mb-2">Contract Name/Task *</label>
                            <input type="text" id="contractName" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Rate per Unit ($) *</label>
                            <input type="number" step="0.01" id="contractRate" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Unit Name *</label>
                            <input type="text" id="contractUnit" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" required placeholder="e.g., Bin, Tray, Kg">
                        </div>
                        <div class="flex justify-end space-x-2">
                            <button type="button" onclick="window.Modals.closeContractModal()" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">Cancel</button>
                            <button type="submit" class="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded">Save Contract</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Advance Modal -->
            <div id="advanceModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
                <div class="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold" id="advanceModalTitle">Log Advance</h3>
                        <button onclick="window.Modals.closeAdvanceModal()" class="text-gray-400 hover:text-white">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <form id="advanceForm" class="space-y-4">
                        <input type="hidden" id="advanceId">
                        <div>
                            <label class="block text-sm font-medium mb-2">Worker *</label>
                            <select id="advanceWorker" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" required>
                                <option value="">Select Worker</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Date *</label>
                            <input type="date" id="advanceDate" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Amount ($) *</label>
                            <input type="number" step="0.01" id="advanceAmount" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Notes</label>
                            <textarea id="advanceNotes" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" rows="3"></textarea>
                        </div>
                        <div class="flex justify-end space-x-2">
                            <button type="button" onclick="window.Modals.closeAdvanceModal()" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">Cancel</button>
                            <button type="submit" class="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded">Save Advance</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Worker Profile Modal -->
            <div id="workerProfileModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
                <div class="bg-gray-800 p-6 rounded-lg max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold" id="workerProfileName">Worker Profile</h3>
                        <button onclick="window.Modals.closeWorkerProfileModal()" class="text-gray-400 hover:text-white">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <div id="workerProfileContent">
                        <!-- Worker profile content will be populated here -->
                    </div>
                </div>
            </div>

            <!-- AI Suggestion Modal -->
            <div id="aiSuggestionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
                <div class="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold">AI Task Suggestions</h3>
                        <button onclick="window.Modals.closeAISuggestionModal()" class="text-gray-400 hover:text-white">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Project Description</label>
                            <textarea id="projectDescription" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" rows="3" placeholder="Describe the project or work type..."></textarea>
                        </div>
                        <button onclick="window.Modals.generateTaskSuggestions()" class="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded flex items-center justify-center">
                            <div id="suggestionLoader" class="loading-spinner mr-2 hidden"></div>
                            <i data-lucide="sparkles" class="mr-2"></i>
                            Generate Suggestions
                        </button>
                        <div id="taskSuggestions" class="space-y-2 hidden">
                            <!-- Suggestions will be populated here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Worker form submission
        document.getElementById('workerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveWorker();
        });

        // Contract form submission
        document.getElementById('contractForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveContract();
        });

        // Advance form submission
        document.getElementById('advanceForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAdvance();
        });
    }

    // Worker Modal Methods
    openWorkerModal(workerId = null) {
        console.log('Modals.openWorkerModal called with:', workerId);
        this.currentWorker = workerId;
        const modal = document.getElementById('workerModal');
        const title = document.getElementById('workerModalTitle');
        const form = document.getElementById('workerForm');
        
        if (workerId) {
            title.textContent = 'Edit Worker';
            const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
            const worker = workers.find(w => w.id === workerId);
            if (worker) {
                document.getElementById('workerId').value = worker.id;
                document.getElementById('workerName').value = worker.name;
                document.getElementById('workerContact').value = worker.contact || '';
                document.getElementById('workerPayType').value = worker.payType;
                document.getElementById('workerHourlyRate').value = worker.hourlyRate || '';
                document.getElementById('workerCarFareEnabled').value = worker.carFare.toString();
                document.getElementById('workerCarFareAmount').value = worker.carFareAmount || '';
                document.getElementById('workerWeeklyRent').value = worker.weeklyRent || '';
                
                this.loadTaskDescriptions(worker.taskDescriptions || []);
                this.togglePayTypeFields();
                this.toggleCarFareAmount();
            }
        } else {
            title.textContent = 'Add Worker';
            form.reset();
            document.getElementById('workerId').value = '';
            this.loadTaskDescriptions([]);
            this.togglePayTypeFields();
            this.toggleCarFareAmount();
        }
        
        modal.classList.remove('hidden');
        if (window.lucide) window.lucide.createIcons();
    }

    closeWorkerModal() {
        document.getElementById('workerModal').classList.add('hidden');
        this.currentWorker = null;
    }

    togglePayTypeFields() {
        const payType = document.getElementById('workerPayType').value;
        const hourlyField = document.getElementById('hourlyRateField');
        const taskField = document.getElementById('taskDescriptionsField');
        
        if (payType === 'hourly' || payType === 'both') {
            hourlyField.classList.remove('hidden');
        } else {
            hourlyField.classList.add('hidden');
        }
        
        if (payType === 'contract' || payType === 'both') {
            taskField.classList.remove('hidden');
        } else {
            taskField.classList.add('hidden');
        }
    }

    addTaskDescription() {
        const input = document.getElementById('newTaskDescription');
        const description = input.value.trim();
        
        if (description) {
            const taskDescriptions = this.getCurrentTaskDescriptions();
            if (!taskDescriptions.includes(description)) {
                taskDescriptions.push(description);
                this.loadTaskDescriptions(taskDescriptions);
                input.value = '';
            }
        }
    }

    getCurrentTaskDescriptions() {
        const list = document.getElementById('taskDescriptionsList');
        return Array.from(list.children).map(item => item.textContent.replace('×', '').trim());
    }

    loadTaskDescriptions(descriptions) {
        const list = document.getElementById('taskDescriptionsList');
        list.innerHTML = '';
        
        descriptions.forEach(desc => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between bg-gray-700 px-2 py-1 rounded text-sm';
            item.innerHTML = `
                <span>${desc}</span>
                <button type="button" onclick="window.Modals.removeTaskDescription('${desc}')" class="text-red-400 hover:text-red-300 ml-2">×</button>
            `;
            list.appendChild(item);
        });
    }

    removeTaskDescription(description) {
        const taskDescriptions = this.getCurrentTaskDescriptions().filter(desc => desc !== description);
        this.loadTaskDescriptions(taskDescriptions);
    }

    suggestTaskDescriptions() {
        document.getElementById('aiSuggestionModal').classList.remove('hidden');
        if (window.lucide) window.lucide.createIcons();
    }

    saveWorker() {
        const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
        const workerId = document.getElementById('workerId').value;
        const payType = document.getElementById('workerPayType').value;
        
        const workerData = {
            id: workerId || Date.now().toString(),
            name: document.getElementById('workerName').value,
            contact: document.getElementById('workerContact').value,
            payType: payType,
            hourlyRate: (payType === 'hourly' || payType === 'both') ? parseFloat(document.getElementById('workerHourlyRate').value) || 0 : null,
            taskDescriptions: (payType === 'contract' || payType === 'both') ? this.getCurrentTaskDescriptions() : [],
            carFare: document.getElementById('workerCarFareEnabled').value === 'true',
            carFareAmount: document.getElementById('workerCarFareAmount').value ? parseFloat(document.getElementById('workerCarFareAmount').value) : null,
            weeklyRent: parseFloat(document.getElementById('workerWeeklyRent').value) || 0
        };
        
        if (workerId) {
            const index = workers.findIndex(w => w.id === workerId);
            workers[index] = workerData;
        } else {
            workers.push(workerData);
        }
        
        window.Storage.save(window.CONFIG.STORAGE.workers, workers);
        window.Workers?.loadWorkers();
        this.closeWorkerModal();
        window.PayrollApp.refreshData();
        window.UI.showToast(`Worker ${workerId ? 'updated' : 'added'} successfully!`);
    }

    // Contract Modal Methods
    openContractModal(contractId = null) {
        this.currentContract = contractId;
        const modal = document.getElementById('contractModal');
        const title = document.getElementById('contractModalTitle');
        const form = document.getElementById('contractForm');
        
        if (contractId) {
            title.textContent = 'Edit Unit Contract';
            const contracts = window.Storage.load(window.CONFIG.STORAGE.contracts, []);
            const contract = contracts.find(c => c.id === contractId);
            if (contract) {
                document.getElementById('contractId').value = contract.id;
                document.getElementById('contractName').value = contract.name;
                document.getElementById('contractRate').value = contract.rate;
                document.getElementById('contractUnit').value = contract.unit;
            }
        } else {
            title.textContent = 'Add Unit Contract';
            form.reset();
            document.getElementById('contractId').value = '';
        }
        
        modal.classList.remove('hidden');
        if (window.lucide) window.lucide.createIcons();
    }

    closeContractModal() {
        document.getElementById('contractModal').classList.add('hidden');
        this.currentContract = null;
    }

    saveContract() {
        const contracts = window.Storage.load(window.CONFIG.STORAGE.contracts, []);
        const contractId = document.getElementById('contractId').value;
        
        const contractData = {
            id: contractId || Date.now().toString(),
            name: document.getElementById('contractName').value,
            rate: parseFloat(document.getElementById('contractRate').value),
            unit: document.getElementById('contractUnit').value
        };
        
        if (contractId) {
            const index = contracts.findIndex(c => c.id === contractId);
            contracts[index] = contractData;
        } else {
            contracts.push(contractData);
        }
        
        window.Storage.save(window.CONFIG.STORAGE.contracts, contracts);
        window.Contracts?.loadContracts();
        this.closeContractModal();
        window.PayrollApp.refreshData();
        window.UI.showToast(`Contract ${contractId ? 'updated' : 'added'} successfully!`);
    }

    // Advance Modal Methods
    openAdvanceModal(advanceId = null) {
        this.currentAdvance = advanceId;
        const modal = document.getElementById('advanceModal');
        const title = document.getElementById('advanceModalTitle');
        const form = document.getElementById('advanceForm');
        
        // Update worker dropdown
        this.updateWorkerDropdown('advanceWorker');
        
        if (advanceId) {
            title.textContent = 'Edit Advance';
            const advances = window.Storage.load(window.CONFIG.STORAGE.advances, []);
            const advance = advances.find(a => a.id === advanceId);
            if (advance) {
                document.getElementById('advanceId').value = advance.id;
                document.getElementById('advanceWorker').value = advance.workerId;
                document.getElementById('advanceDate').value = advance.date;
                document.getElementById('advanceAmount').value = advance.amount;
                document.getElementById('advanceNotes').value = advance.notes || '';
            }
        } else {
            title.textContent = 'Log Advance';
            form.reset();
            document.getElementById('advanceId').value = '';
            document.getElementById('advanceDate').value = new Date().toISOString().split('T')[0];
        }
        
        modal.classList.remove('hidden');
        if (window.lucide) window.lucide.createIcons();
    }

    closeAdvanceModal() {
        document.getElementById('advanceModal').classList.add('hidden');
        this.currentAdvance = null;
    }

    saveAdvance() {
        const advances = window.Storage.load(window.CONFIG.STORAGE.advances, []);
        const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
        const advanceId = document.getElementById('advanceId').value;
        const workerId = document.getElementById('advanceWorker').value;
        const worker = workers.find(w => w.id === workerId);
        
        const advanceData = {
            id: advanceId || Date.now().toString(),
            workerId: workerId,
            workerName: worker.name,
            date: document.getElementById('advanceDate').value,
            amount: parseFloat(document.getElementById('advanceAmount').value),
            notes: document.getElementById('advanceNotes').value
        };
        
        if (advanceId) {
            const index = advances.findIndex(a => a.id === advanceId);
            advances[index] = advanceData;
        } else {
            advances.push(advanceData);
        }
        
        window.Storage.save(window.CONFIG.STORAGE.advances, advances);
        window.Advances?.loadAdvances();
        this.closeAdvanceModal();
        window.PayrollApp.refreshData();
        window.UI.showToast(`Advance ${advanceId ? 'updated' : 'logged'} successfully!`);
    }

    // Worker Profile Modal
    viewWorkerProfile(workerId) {
        const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
        const workLogs = window.Storage.load(window.CONFIG.STORAGE.workLogs, []);
        const worker = workers.find(w => w.id === workerId);
        
        if (!worker) return;
        
        const workerLogs = workLogs.filter(log => log.workerId === workerId);
        
        document.getElementById('workerProfileName').textContent = `${worker.name} - Profile`;
        
        const content = document.getElementById('workerProfileContent');
        content.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div class="bg-gray-700 p-4 rounded">
                    <h4 class="font-semibold mb-2">Worker Details</h4>
                    <p><strong>Name:</strong> ${worker.name}</p>
                    <p><strong>Contact:</strong> ${worker.contact || 'N/A'}</p>
                    <p><strong>Pay Type:</strong> ${worker.payType}</p>
                    ${worker.hourlyRate ? `<p><strong>Hourly Rate:</strong> $${worker.hourlyRate}</p>` : ''}
                    <p><strong>Car Fare:</strong> ${worker.carFare ? 'Yes' : 'No'}</p>
                    <p><strong>Weekly Rent:</strong> $${worker.weeklyRent}</p>
                </div>
                <div class="bg-gray-700 p-4 rounded">
                    <h4 class="font-semibold mb-2">Work Summary</h4>
                    <p><strong>Total Work Entries:</strong> ${workerLogs.length}</p>
                    <p><strong>Total Hours:</strong> ${workerLogs.reduce((sum, log) => sum + (log.hours || 0), 0)}</p>
                    <p><strong>Total Earnings:</strong> $${workerLogs.reduce((sum, log) => sum + (log.dailyEarnings || 0), 0).toFixed(2)}</p>
                </div>
            </div>
            
            <div class="bg-gray-700 p-4 rounded">
                <h4 class="font-semibold mb-4">Work Log History</h4>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-600">
                                <th class="text-left p-2">Date</th>
                                <th class="text-left p-2">Hours</th>
                                <th class="text-left p-2">Contract Job</th>
                                <th class="text-left p-2">Contract Amt</th>
                                <th class="text-left p-2">Units</th>
                                <th class="text-left p-2">Unit Rate</th>
                                <th class="text-left p-2">Daily Earnings</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${workerLogs.map(log => `
                                <tr class="border-b border-gray-600">
                                    <td class="p-2">${log.date}</td>
                                    <td class="p-2">${log.hours || '-'}</td>
                                    <td class="p-2">${log.contractJob || '-'}</td>
                                    <td class="p-2">${log.contractAmount ? '$' + log.contractAmount : '-'}</td>
                                    <td class="p-2">${log.units || '-'}</td>
                                    <td class="p-2">${log.unitRate ? '$' + log.unitRate : '-'}</td>
                                    <td class="p-2">$${(log.dailyEarnings || 0).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        document.getElementById('workerProfileModal').classList.remove('hidden');
        if (window.lucide) window.lucide.createIcons();
    }

    closeWorkerProfileModal() {
        document.getElementById('workerProfileModal').classList.add('hidden');
    }

    // AI Suggestion Modal Methods
    closeAISuggestionModal() {
        document.getElementById('aiSuggestionModal').classList.add('hidden');
        document.getElementById('projectDescription').value = '';
        document.getElementById('taskSuggestions').classList.add('hidden');
    }

    async generateTaskSuggestions() {
        const projectDesc = document.getElementById('projectDescription').value.trim();
        if (!projectDesc) {
            window.UI.showToast('Please enter a project description', 'error');
            return;
        }
        
        const loader = document.getElementById('suggestionLoader');
        loader.classList.remove('hidden');
        
        try {
            const suggestions = await window.API.generateTaskSuggestions(projectDesc);
            this.displayTaskSuggestions(suggestions);
        } catch (error) {
            console.error('Error generating suggestions:', error);
            window.UI.showToast('Failed to generate suggestions. Please try again.', 'error');
        } finally {
            loader.classList.add('hidden');
        }
    }

    displayTaskSuggestions(suggestions) {
        const container = document.getElementById('taskSuggestions');
        container.innerHTML = '';
        
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between bg-gray-700 px-3 py-2 rounded';
            item.innerHTML = `
                <span class="text-sm">${suggestion}</span>
                <button onclick="window.Modals.addSuggestedTask('${suggestion}')" class="bg-teal-600 hover:bg-teal-700 px-2 py-1 rounded text-xs">Add</button>
            `;
            container.appendChild(item);
        });
        
        container.classList.remove('hidden');
    }

    addSuggestedTask(task) {
        const taskDescriptions = this.getCurrentTaskDescriptions();
        if (!taskDescriptions.includes(task)) {
            taskDescriptions.push(task);
            this.loadTaskDescriptions(taskDescriptions);
        }
        this.closeAISuggestionModal();
    }

    // Utility Methods
    updateWorkerDropdown(dropdownId) {
        const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
        const dropdown = document.getElementById(dropdownId);
        const currentValue = dropdown.value;
        
        dropdown.innerHTML = '<option value="">Select Worker</option>';
        
        workers.forEach(worker => {
            const option = document.createElement('option');
            option.value = worker.id;
            option.textContent = worker.name;
            dropdown.appendChild(option);
        });
        
        dropdown.value = currentValue;
    }

    toggleCarFareAmount() {
        const enabled = document.getElementById('workerCarFareEnabled').value === 'true';
        const amountField = document.getElementById('carFareAmountField');
        
        if (enabled) {
            amountField.classList.remove('hidden');
        } else {
            amountField.classList.add('hidden');
        }
    }
}

// Create global modals instance
window.Modals = new Modals(); 