/**
 * Payroll Component
 * Handles payslip generation and payroll management
 */

class Payroll {
    constructor() {
        this.initialized = false;
        this.currentPayslip = null;
    }

    /**
     * Initialize payroll component
     */
    init() {
        if (this.initialized) return;
        
        this.render();
        this.handleEvents();
        this.loadPayroll();
        
        this.initialized = true;
    }

    /**
     * Render payroll section content
     */
    render() {
        const payrollSection = document.getElementById('payroll');
        if (!payrollSection) return;

        payrollSection.innerHTML = `
            <h2 class="text-3xl font-bold mb-6">Payroll Management</h2>

            <!-- Payslip Generation -->
            <div class="bg-gray-800 p-6 rounded-lg mb-6">
                <h3 class="text-xl font-semibold mb-4">Generate Payslip</h3>
                <form id="payslipForm" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Worker *</label>
                            <select id="payslipWorker" class="form-select max-w-xs w-full md:w-auto rounded-lg shadow-sm bg-gray-700 border border-gray-600 px-3 py-2" required>
                                <option value="">Select Worker</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Week Start Date *</label>
                            <input type="date" id="payslipWeekStart" class="form-input max-w-xs w-full md:w-auto rounded-lg shadow-sm bg-gray-700 border border-gray-600 px-3 py-2" required onchange="window.Payroll.updateWeekEnd()">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Week End Date *</label>
                            <input type="date" id="payslipWeekEnd" class="form-input max-w-xs w-full md:w-auto rounded-lg shadow-sm bg-gray-700 border border-gray-600 px-3 py-2" required readonly>
                        </div>
                    </div>
                    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mt-4">
                        <div class="flex items-center space-x-2">
                            <input type="checkbox" id="includeAdvances" class="rounded">
                            <label for="includeAdvances" class="text-sm">Deduct advances from this period</label>
                        </div>
                        <div class="flex flex-col md:flex-row gap-2 mt-2 md:mt-0">
                            <button type="submit" class="bg-teal-600 hover:bg-teal-700 px-6 py-2 rounded-lg shadow-sm">Generate Payslip</button>
                            <button type="button" id="generateAllPayslipsBtn" class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg shadow-sm">Generate All Payslips (Individual)</button>
                            <button type="button" id="generateAllPayslipsZipBtn" class="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg shadow-sm">Generate All Payslips (ZIP)</button>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Payslip Preview -->
            <div id="payslipPreview" class="bg-gray-800 p-6 rounded-lg mb-6 hidden">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Payslip Preview</h3>
                    <div class="flex space-x-2">
                        <button onclick="window.Payroll.explainPayslip()" class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded flex items-center">
                            <i data-lucide="sparkles" class="mr-2"></i>
                            AI Explain
                        </button>
                        <button onclick="window.Payroll.downloadPayslipPDF()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded flex items-center">
                            <i data-lucide="download" class="mr-2"></i>
                            Download PDF
                        </button>
                        <button onclick="window.Payroll.savePayslip()" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">Save Payslip</button>
                    </div>
                </div>
                <div id="payslipContent">
                    <!-- Payslip content will be generated here -->
                </div>
            </div>

            <!-- AI Explanation Modal -->
            <div id="aiExplanationModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
                <div class="bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold">AI Payslip Explanation</h3>
                        <button onclick="window.Payroll.closeExplanationModal()" class="text-gray-400 hover:text-white">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <div id="aiExplanationContent" class="space-y-4">
                        <div class="flex items-center justify-center py-8">
                            <div class="loading-spinner mr-2"></div>
                            <span>Generating explanation...</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Payslip History -->
            <div class="bg-gray-800 p-6 rounded-lg">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Payslip History</h3>
                    <div class="flex space-x-2">
                        <input type="text" id="payslipHistorySearch" placeholder="Search payslips..." 
                               class="bg-gray-700 border border-gray-600 rounded px-3 py-2"
                               onkeyup="window.Payroll.filterPayslipHistory()">
                        <select id="payslipHistoryWorkerFilter" class="bg-gray-700 border border-gray-600 rounded px-3 py-2" onchange="window.Payroll.filterPayslipHistory()">
                            <option value="">All Workers</option>
                        </select>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-700">
                            <tr>
                                <th class="text-left p-3">Worker</th>
                                <th class="text-left p-3">Week Period</th>
                                <th class="text-left p-3">Gross Earnings</th>
                                <th class="text-left p-3">Deductions</th>
                                <th class="text-left p-3">Net Pay</th>
                                <th class="text-left p-3">Generated</th>
                                <th class="text-left p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="payslipHistoryTableBody">
                            <!-- Payslip history will be populated here -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Progress Modal -->
            <div id="batchPayslipProgressModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
                <div class="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center min-w-[300px]">
                    <div class="mb-4 flex items-center">
                        <div class="loading-spinner mr-3"></div>
                        <span id="batchPayslipProgressText" class="text-lg font-semibold text-gray-800">Generating payslips...</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div id="batchPayslipProgressBar" class="bg-teal-500 h-3 rounded-full transition-all" style="width:0%"></div>
                    </div>
                    <span id="batchPayslipProgressCount" class="text-sm text-gray-600"></span>
                </div>
            </div>
        `;

        // Initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Add event listeners for batch payslip generation
        setTimeout(() => {
            document.getElementById('generateAllPayslipsBtn').onclick = () => this.generateAllPayslips('individual');
            document.getElementById('generateAllPayslipsZipBtn').onclick = () => this.generateAllPayslips('zip');
        }, 100);
    }

    /**
     * Set up event listeners
     */
    handleEvents() {
        // Payslip form submission
        document.getElementById('payslipForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.generatePayslip();
        });
    }

    /**
     * Load payroll data
     */
    loadPayroll() {
        this.loadWorkerDropdowns();
        this.loadPayslipHistory();
    }

    /**
     * Load worker dropdowns
     */
    loadWorkerDropdowns() {
        const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
        
        // Payslip worker dropdown
        const payslipWorker = document.getElementById('payslipWorker');
        payslipWorker.innerHTML = '<option value="">Select Worker</option>';
        
        // History filter dropdown
        const historyFilter = document.getElementById('payslipHistoryWorkerFilter');
        historyFilter.innerHTML = '<option value="">All Workers</option>';
        
        workers.forEach(worker => {
            const option1 = document.createElement('option');
            option1.value = worker.id;
            option1.textContent = worker.name;
            payslipWorker.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = worker.id;
            option2.textContent = worker.name;
            historyFilter.appendChild(option2);
        });
    }

    /**
     * Update week end date based on week start
     */
    updateWeekEnd() {
        const weekStart = document.getElementById('payslipWeekStart').value;
        if (weekStart) {
            const startDate = new Date(weekStart);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            
            document.getElementById('payslipWeekEnd').value = endDate.toISOString().split('T')[0];
        }
    }

    /**
     * Generate payslip
     */
    generatePayslip() {
        const workerId = document.getElementById('payslipWorker').value;
        const weekStart = document.getElementById('payslipWeekStart').value;
        const weekEnd = document.getElementById('payslipWeekEnd').value;
        const includeAdvances = document.getElementById('includeAdvances').checked;
        
        const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
        const workLogs = window.Storage.load(window.CONFIG.STORAGE.workLogs, []);
        const advances = window.Storage.load(window.CONFIG.STORAGE.advances, []);
        const carFareEntries = window.Storage.load(window.CONFIG.STORAGE.carFareEntries, []);
        const settings = window.Storage.load(window.CONFIG.STORAGE.settings, {});
        
        const worker = workers.find(w => w.id === workerId);
        if (!worker) {
            window.UI.showToast('Please select a worker', 'error');
            return;
        }
        
        // Filter work logs for the week
        const weekWorkLogs = workLogs.filter(log => {
            const logDate = new Date(log.date);
            const startDate = new Date(weekStart);
            const endDate = new Date(weekEnd);
            return log.workerId === workerId && logDate >= startDate && logDate <= endDate;
        });
        
        // Filter advances for the week if including them
        const weekAdvances = includeAdvances ? advances.filter(advance => {
            const advanceDate = new Date(advance.date);
            const startDate = new Date(weekStart);
            const endDate = new Date(weekEnd);
            return advance.workerId === workerId && advanceDate >= startDate && advanceDate <= endDate;
        }) : [];
        
        // Filter car fare entries for the week
        const weekCarFareEntries = carFareEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            const startDate = new Date(weekStart);
            const endDate = new Date(weekEnd);
            return entry.workerId === workerId && entryDate >= startDate && entryDate <= endDate;
        });
        
        // Calculate earnings (without car fare)
        const earnings = this.calculateEarnings(weekWorkLogs, worker);
        earnings.workDays = weekWorkLogs.length; // Add work days count
        const totalAdvances = weekAdvances.reduce((sum, advance) => sum + parseFloat(advance.amount || 0), 0);
        const weeklyRentDeduction = worker.weeklyRent || 0;
        const totalCarFareDeductions = weekCarFareEntries.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
        const totalDeductions = totalAdvances + weeklyRentDeduction + totalCarFareDeductions;
        const netPay = earnings.total - totalDeductions;
        
        // Create payslip data
        this.currentPayslip = {
            workerId: workerId,
            workerName: worker.name,
            weekStart: weekStart,
            weekEnd: weekEnd,
            workLogs: weekWorkLogs,
            advances: weekAdvances,
            carFareEntries: weekCarFareEntries,
            earnings: earnings,
            totalAdvances: totalAdvances,
            weeklyRentDeduction: weeklyRentDeduction,
            totalCarFareDeductions: totalCarFareDeductions,
            totalDeductions: totalDeductions,
            netPay: netPay,
            generatedDate: new Date().toISOString().split('T')[0],
            companyName: settings.companyName || 'Company Name'
        };
        
        this.displayPayslipPreview();
    }

    /**
     * Calculate earnings from work logs
     */
    calculateEarnings(workLogs, worker) {
        let hourlyEarnings = 0;
        let contractEarnings = 0;
        let totalHours = 0;
        let totalUnits = 0;
        
        workLogs.forEach(log => {
            if (log.hours && worker.hourlyRate) {
                hourlyEarnings += log.hours * worker.hourlyRate;
                totalHours += log.hours;
            }
            
            if (log.contractAmount) {
                contractEarnings += log.contractAmount;
            } else if (log.units && log.unitRate) {
                contractEarnings += log.units * log.unitRate;
                totalUnits += log.units;
            }
        });
        
        return {
            hourly: hourlyEarnings,
            contract: contractEarnings,
            total: hourlyEarnings + contractEarnings,
            totalHours: totalHours,
            totalUnits: totalUnits
        };
    }

    /**
     * Display payslip preview
     */
    displayPayslipPreview() {
        const preview = document.getElementById('payslipPreview');
        const content = document.getElementById('payslipContent');
        
        if (!this.currentPayslip) return;
        
        const payslip = this.currentPayslip;
        
        content.innerHTML = `
            <div class="bg-white text-black p-8 rounded">
                <div class="text-center mb-6">
                    <h1 class="text-2xl font-bold text-teal-600">${payslip.companyName}</h1>
                    <h2 class="text-xl font-semibold">PAYSLIP</h2>
                </div>
                
                <div class="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <h3 class="font-semibold mb-2">Employee Details</h3>
                        <p><strong>Name:</strong> ${payslip.workerName}</p>
                        <p><strong>Pay Period:</strong> ${window.UI.formatDate(payslip.weekStart)} to ${window.UI.formatDate(payslip.weekEnd)}</p>
                        <p><strong>Generated:</strong> ${window.UI.formatDate(payslip.generatedDate)}</p>
                    </div>
                    <div>
                        <h3 class="font-semibold mb-2">Summary</h3>
                        <p><strong>Total Hours:</strong> ${payslip.earnings.totalHours}</p>
                        <p><strong>Total Units:</strong> ${payslip.earnings.totalUnits}</p>
                        <p><strong>Work Days:</strong> ${payslip.workLogs.length}</p>
                    </div>
                </div>
                
                <div class="mb-6">
                    <h3 class="font-semibold mb-3">Earnings Breakdown</h3>
                    <table class="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr class="bg-gray-100">
                                <th class="border border-gray-300 p-2 text-left">Description</th>
                                <th class="border border-gray-300 p-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${payslip.earnings.hourly > 0 ? `
                            <tr>
                                <td class="border border-gray-300 p-2">Hourly Earnings (${payslip.earnings.totalHours} hours)</td>
                                <td class="border border-gray-300 p-2 text-right">$${payslip.earnings.hourly.toFixed(2)}</td>
                            </tr>
                            ` : ''}
                            ${payslip.earnings.contract > 0 ? `
                            <tr>
                                <td class="border border-gray-300 p-2">Contract Earnings</td>
                                <td class="border border-gray-300 p-2 text-right">$${payslip.earnings.contract.toFixed(2)}</td>
                            </tr>
                            ` : ''}
                            <tr class="bg-gray-100 font-semibold">
                                <td class="border border-gray-300 p-2">Gross Earnings</td>
                                <td class="border border-gray-300 p-2 text-right">$${payslip.earnings.total.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="mb-6">
                    <h3 class="font-semibold mb-3">Deductions</h3>
                    <table class="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr class="bg-gray-100">
                                <th class="border border-gray-300 p-2 text-left">Description</th>
                                <th class="border border-gray-300 p-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${payslip.totalAdvances > 0 ? `
                            <tr>
                                <td class="border border-gray-300 p-2">Advances (${payslip.advances.length} entries)</td>
                                <td class="border border-gray-300 p-2 text-right">$${payslip.totalAdvances.toFixed(2)}</td>
                            </tr>
                            ` : ''}
                            ${payslip.weeklyRentDeduction > 0 ? `
                            <tr>
                                <td class="border border-gray-300 p-2">Weekly Rent</td>
                                <td class="border border-gray-300 p-2 text-right">$${payslip.weeklyRentDeduction.toFixed(2)}</td>
                            </tr>
                            ` : ''}
                            ${payslip.totalCarFareDeductions > 0 ? `
                            <tr>
                                <td class="border border-gray-300 p-2">Car Fare</td>
                                <td class="border border-gray-300 p-2 text-right">$${payslip.totalCarFareDeductions.toFixed(2)}</td>
                            </tr>
                            ` : ''}
                            <tr class="bg-gray-100 font-semibold">
                                <td class="border border-gray-300 p-2">Total Deductions</td>
                                <td class="border border-gray-300 p-2 text-right">$${payslip.totalDeductions.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="bg-teal-50 p-4 rounded">
                    <div class="flex justify-between items-center">
                        <span class="text-xl font-bold">NET PAY:</span>
                        <span class="text-2xl font-bold text-teal-600">$${payslip.netPay.toFixed(2)}</span>
                    </div>
                </div>
                
                ${payslip.workLogs.length > 0 ? `
                <div class="mt-6">
                    <h3 class="font-semibold mb-3">Daily Work Log</h3>
                    <table class="w-full border-collapse border border-gray-300 text-sm">
                        <thead>
                            <tr class="bg-gray-100">
                                <th class="border border-gray-300 p-2 text-left">Date</th>
                                <th class="border border-gray-300 p-2 text-center">Hours</th>
                                <th class="border border-gray-300 p-2 text-left">Contract Job</th>
                                <th class="border border-gray-300 p-2 text-center">Units</th>
                                <th class="border border-gray-300 p-2 text-right">Daily Earnings</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${payslip.workLogs.map(log => `
                                <tr>
                                    <td class="border border-gray-300 p-2">${window.UI.formatDate(log.date)}</td>
                                    <td class="border border-gray-300 p-2 text-center">${log.hours || '-'}</td>
                                    <td class="border border-gray-300 p-2">${log.contractJob || '-'}</td>
                                    <td class="border border-gray-300 p-2 text-center">${log.units || '-'}</td>
                                    <td class="border border-gray-300 p-2 text-right">$${(log.dailyEarnings || 0).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}
            </div>
        `;
        
        preview.classList.remove('hidden');
        
        // Reinitialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    /**
     * Save payslip to storage
     */
    savePayslip() {
        if (!this.currentPayslip) return;
        
        const payslips = window.Storage.load(window.CONFIG.STORAGE.payslips, []);
        
        const payslipData = {
            id: Date.now().toString(),
            ...this.currentPayslip,
            totalGrossEarnings: this.currentPayslip.earnings.total,
            saved: true
        };
        
        payslips.push(payslipData);
        window.Storage.save(window.CONFIG.STORAGE.payslips, payslips);
        
        this.loadPayslipHistory();
        window.PayrollApp.refreshData();
        window.UI.showToast('Payslip saved successfully!');
    }

    /**
     * Download payslip as PDF
     */
    async downloadPayslipPDF() {
        if (!this.currentPayslip) return;
        
        try {
            const settings = window.Storage.load(window.CONFIG.STORAGE.settings, {});
            await window.PDF.generatePayslipPDF(this.currentPayslip, settings);
            window.UI.showToast('Payslip PDF downloaded successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            window.UI.showToast('Error generating PDF', 'error');
        }
    }

    /**
     * Explain payslip using AI
     */
    async explainPayslip() {
        if (!this.currentPayslip) return;
        
        document.getElementById('aiExplanationModal').classList.remove('hidden');
        
        try {
            const explanation = await window.API.explainPayslip(this.currentPayslip);
            
            document.getElementById('aiExplanationContent').innerHTML = `
                <div class="prose prose-invert max-w-none">
                    <div class="whitespace-pre-wrap">${explanation}</div>
                </div>
            `;
        } catch (error) {
            console.error('Error generating explanation:', error);
            document.getElementById('aiExplanationContent').innerHTML = `
                <div class="text-red-400">
                    <p>Failed to generate explanation. Please check your AI settings and try again.</p>
                    <p class="text-sm mt-2">Error: ${error.message}</p>
                </div>
            `;
        }
        
        // Reinitialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    /**
     * Close explanation modal
     */
    closeExplanationModal() {
        document.getElementById('aiExplanationModal').classList.add('hidden');
    }

    /**
     * Load payslip history
     */
    loadPayslipHistory() {
        const payslips = window.Storage.load(window.CONFIG.STORAGE.payslips, []);
        const tbody = document.getElementById('payslipHistoryTableBody');
        
        if (!tbody) return;

        tbody.innerHTML = '';
        
        if (payslips.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="p-8 text-center text-gray-400">
                        No payslips found. Generate your first payslip above.
                    </td>
                </tr>
            `;
            return;
        }
        
        // Sort by generated date (newest first)
        payslips.sort((a, b) => new Date(b.generatedDate) - new Date(a.generatedDate));
        
        payslips.forEach(payslip => {
            const row = document.createElement('tr');
            row.className = 'border-t border-gray-600';
            
            row.innerHTML = `
                <td class="p-3">${payslip.workerName}</td>
                <td class="p-3">${window.UI.formatDate(payslip.weekStart)} - ${window.UI.formatDate(payslip.weekEnd)}</td>
                <td class="p-3 font-semibold">$${payslip.totalGrossEarnings.toFixed(2)}</td>
                <td class="p-3">$${payslip.totalDeductions.toFixed(2)}</td>
                <td class="p-3 font-semibold text-teal-400">$${payslip.netPay.toFixed(2)}</td>
                <td class="p-3">${window.UI.formatDate(payslip.generatedDate)}</td>
                <td class="p-3">
                    <div class="flex space-x-2">
                        <button onclick="window.Payroll.viewPayslip('${payslip.id}')" class="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs">View</button>
                        <button onclick="window.Payroll.downloadSavedPayslipPDF('${payslip.id}')" class="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs">PDF</button>
                        <button onclick="window.Payroll.deletePayslip('${payslip.id}')" class="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs">Delete</button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    /**
     * View saved payslip
     */
    viewPayslip(payslipId) {
        const payslips = window.Storage.load(window.CONFIG.STORAGE.payslips, []);
        const payslip = payslips.find(p => p.id === payslipId);
        
        if (payslip) {
            this.currentPayslip = payslip;
            this.displayPayslipPreview();
        }
    }

    /**
     * Download saved payslip PDF
     */
    async downloadSavedPayslipPDF(payslipId) {
        const payslips = window.Storage.load(window.CONFIG.STORAGE.payslips, []);
        const payslip = payslips.find(p => p.id === payslipId);
        
        if (payslip) {
            try {
                const settings = window.Storage.load(window.CONFIG.STORAGE.settings, {});
                await window.PDF.generatePayslipPDF(payslip, settings);
                window.UI.showToast('Payslip PDF downloaded successfully!');
            } catch (error) {
                console.error('Error generating PDF:', error);
                window.UI.showToast('Error generating PDF', 'error');
            }
        }
    }

    /**
     * Delete payslip
     */
    async deletePayslip(payslipId) {
        const confirmed = await window.UI.showConfirmation(
            'Are you sure you want to delete this payslip?',
            'Delete Payslip'
        );

        if (confirmed) {
            let payslips = window.Storage.load(window.CONFIG.STORAGE.payslips, []);
            payslips = payslips.filter(p => p.id !== payslipId);
            
            window.Storage.save(window.CONFIG.STORAGE.payslips, payslips);
            
            this.loadPayslipHistory();
            window.PayrollApp.refreshData();
            window.UI.showToast('Payslip deleted successfully!');
        }
    }

    /**
     * Filter payslip history
     */
    filterPayslipHistory() {
        const searchTerm = document.getElementById('payslipHistorySearch')?.value.toLowerCase() || '';
        const workerFilter = document.getElementById('payslipHistoryWorkerFilter')?.value || '';
        const rows = document.querySelectorAll('#payslipHistoryTableBody tr');
        
        rows.forEach(row => {
            if (row.cells.length < 6) return; // Skip empty state row
            
            const workerName = row.cells[0]?.textContent.toLowerCase() || '';
            const weekPeriod = row.cells[1]?.textContent.toLowerCase() || '';
            
            const matchesSearch = workerName.includes(searchTerm) || weekPeriod.includes(searchTerm);
            const matchesWorker = !workerFilter || 
                                row.cells[0]?.textContent === document.querySelector(`#payslipHistoryWorkerFilter option[value="${workerFilter}"]`)?.textContent;
            
            if (matchesSearch && matchesWorker) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    /**
     * Refresh payroll data
     */
    refresh() {
        this.loadWorkerDropdowns();
        this.loadPayslipHistory();
    }

    /**
     * Generate payslips for all workers for the selected week
     * @param {'individual'|'zip'} mode
     */
    async generateAllPayslips(mode = 'individual') {
        const weekStart = document.getElementById('payslipWeekStart').value;
        const weekEnd = document.getElementById('payslipWeekEnd').value;
        const includeAdvances = document.getElementById('includeAdvances').checked;
        
        if (!weekStart || !weekEnd) {
            window.UI.showToast('Please select week start and end dates', 'error');
            return;
        }
        
        const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
        const workLogs = window.Storage.load(window.CONFIG.STORAGE.workLogs, []);
        const advances = window.Storage.load(window.CONFIG.STORAGE.advances, []);
        const carFareEntries = window.Storage.load(window.CONFIG.STORAGE.carFareEntries, []);
        const settings = window.Storage.load(window.CONFIG.STORAGE.settings, {});
        
        if (workers.length === 0) {
            window.UI.showToast('No workers found', 'error');
            return;
        }

        // Show progress modal
        const showProgress = (current, total) => {
            const modal = document.getElementById('batchPayslipProgressModal');
            if (modal) {
                modal.classList.remove('hidden');
                document.getElementById('batchPayslipProgressText').textContent = `${current} of ${total}`;
                const progressBar = document.getElementById('batchPayslipProgressBar');
                if (progressBar) {
                    progressBar.style.width = `${(current / total) * 100}%`;
                }
            }
        };

        const hideProgress = () => {
            const modal = document.getElementById('batchPayslipProgressModal');
            if (modal) modal.classList.add('hidden');
        };

        if (mode === 'zip') {
            const zip = new window.JSZip();
            let count = 0;
            showProgress(0, workers.length);
            for (const worker of workers) {
                // Filter work logs, advances, and car fare entries for this worker and week
                const weekWorkLogs = workLogs.filter(log => {
                    const logDate = new Date(log.date);
                    const startDate = new Date(weekStart);
                    const endDate = new Date(weekEnd);
                    return log.workerId === worker.id && logDate >= startDate && logDate <= endDate;
                });
                const weekAdvances = includeAdvances ? advances.filter(advance => {
                    const advanceDate = new Date(advance.date);
                    const startDate = new Date(weekStart);
                    const endDate = new Date(weekEnd);
                    return advance.workerId === worker.id && advanceDate >= startDate && advanceDate <= endDate;
                }) : [];
                const weekCarFareEntries = carFareEntries.filter(entry => {
                    const entryDate = new Date(entry.date);
                    const startDate = new Date(weekStart);
                    const endDate = new Date(weekEnd);
                    return entry.workerId === worker.id && entryDate >= startDate && entryDate <= endDate;
                });
                const earnings = this.calculateEarnings(weekWorkLogs, worker);
                earnings.workDays = weekWorkLogs.length; // Add work days count
                const totalAdvances = weekAdvances.reduce((sum, advance) => sum + parseFloat(advance.amount || 0), 0);
                const weeklyRentDeduction = worker.weeklyRent || 0;
                const totalCarFareDeductions = weekCarFareEntries.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
                const totalDeductions = totalAdvances + weeklyRentDeduction + totalCarFareDeductions;
                const netPay = earnings.total - totalDeductions;
                const payslipData = {
                    workerId: worker.id,
                    workerName: worker.name,
                    weekStart,
                    weekEnd,
                    workLogs: weekWorkLogs,
                    advances: weekAdvances,
                    carFareEntries: weekCarFareEntries,
                    earnings,
                    totalAdvances,
                    weeklyRentDeduction,
                    totalCarFareDeductions,
                    totalDeductions,
                    netPay,
                    generatedDate: new Date().toISOString().split('T')[0],
                    companyName: settings.companyName || 'Company Name'
                };
                // Generate PDF as blob
                const pdfBlob = await this.generatePayslipPDFBlob(payslipData, settings);
                const filename = window.PDF.generateFilename(payslipData);
                zip.file(filename, pdfBlob);
                count++;
                showProgress(count, workers.length);
            }
            // Generate and download ZIP
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `payslips_${weekStart}_to_${weekEnd}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            hideProgress();
            window.UI.showToast(`Downloaded ${count} payslips as ZIP!`, 'success');
        } else {
            // Individual download
            let count = 0;
            showProgress(0, workers.length);
            for (const worker of workers) {
                const weekWorkLogs = workLogs.filter(log => {
                    const logDate = new Date(log.date);
                    const startDate = new Date(weekStart);
                    const endDate = new Date(weekEnd);
                    return log.workerId === worker.id && logDate >= startDate && logDate <= endDate;
                });
                const weekAdvances = includeAdvances ? advances.filter(advance => {
                    const advanceDate = new Date(advance.date);
                    const startDate = new Date(weekStart);
                    const endDate = new Date(weekEnd);
                    return advance.workerId === worker.id && advanceDate >= startDate && advanceDate <= endDate;
                }) : [];
                const weekCarFareEntries = carFareEntries.filter(entry => {
                    const entryDate = new Date(entry.date);
                    const startDate = new Date(weekStart);
                    const endDate = new Date(weekEnd);
                    return entry.workerId === worker.id && entryDate >= startDate && entryDate <= endDate;
                });
                const earnings = this.calculateEarnings(weekWorkLogs, worker);
                earnings.workDays = weekWorkLogs.length; // Add work days count
                const totalAdvances = weekAdvances.reduce((sum, advance) => sum + parseFloat(advance.amount || 0), 0);
                const weeklyRentDeduction = worker.weeklyRent || 0;
                const totalCarFareDeductions = weekCarFareEntries.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
                const totalDeductions = totalAdvances + weeklyRentDeduction + totalCarFareDeductions;
                const netPay = earnings.total - totalDeductions;
                const payslipData = {
                    workerId: worker.id,
                    workerName: worker.name,
                    weekStart,
                    weekEnd,
                    workLogs: weekWorkLogs,
                    advances: weekAdvances,
                    carFareEntries: weekCarFareEntries,
                    earnings,
                    totalAdvances,
                    weeklyRentDeduction,
                    totalCarFareDeductions,
                    totalDeductions,
                    netPay,
                    generatedDate: new Date().toISOString().split('T')[0],
                    companyName: settings.companyName || 'Company Name'
                };
                // Generate and download PDF
                await window.PDF.generatePayslipPDF(payslipData, settings);
                count++;
                showProgress(count, workers.length);
            }
            hideProgress();
            window.UI.showToast(`Downloaded ${count} individual payslips!`, 'success');
        }
    }

    /**
     * Generate payslip PDF as a Blob (for zipping)
     */
    async generatePayslipPDFBlob(payslipData, settings = {}) {
        if (!payslipData) throw new Error('Payslip data is required');
        if (!window.jspdf) throw new Error('jsPDF library not loaded');
        const pdfSettings = { ...window.PDF.defaultSettings, ...settings };
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: pdfSettings.orientation,
            unit: 'mm',
            format: pdfSettings.format
        });
        const primaryRGB = window.PDF.hexToRgb(pdfSettings.primaryColor);
        await window.PDF.addPayStubHeader(doc, payslipData, primaryRGB);
        window.PDF.addEmployeeInfo(doc, payslipData);
        const yPos = window.PDF.addEarningsSection(doc, payslipData, primaryRGB);
        const finalYPos = window.PDF.addDeductionsSection(doc, payslipData, primaryRGB, yPos);
        window.PDF.addNetPaySection(doc, payslipData, primaryRGB, finalYPos);
        return doc.output('blob');
    }
}

window.Payroll = new Payroll(); 