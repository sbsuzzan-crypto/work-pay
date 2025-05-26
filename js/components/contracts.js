/**
 * Contracts Component
 * Handles contract management functionality
 */

class Contracts {
    constructor() {
        this.initialized = false;
    }

    /**
     * Initialize contracts component
     */
    init() {
        if (this.initialized) return;
        
        this.render();
        this.handleEvents();
        this.loadContracts();
        
        this.initialized = true;
    }

    /**
     * Render contracts section content
     */
    render() {
        const contractsSection = document.getElementById('contracts');
        if (!contractsSection) return;

        contractsSection.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-3xl font-bold">Unit Contracts</h2>
                <button onclick="window.Contracts.openContractModal()" class="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded flex items-center">
                    <i data-lucide="plus" class="mr-2"></i>
                    Add Contract
                </button>
            </div>

            <!-- Search -->
            <div class="mb-6">
                <input type="text" id="contractSearch" placeholder="Search contracts..." 
                       class="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2"
                       onkeyup="window.Contracts.filterContracts()">
            </div>

            <!-- Contracts Table -->
            <div class="bg-gray-800 rounded-lg overflow-hidden">
                <table class="w-full">
                    <thead class="bg-gray-700">
                        <tr>
                            <th class="text-left p-4">Contract Name/Task</th>
                            <th class="text-left p-4">Rate per Unit</th>
                            <th class="text-left p-4">Unit Name</th>
                            <th class="text-left p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="contractsTableBody">
                        <!-- Contracts will be populated here -->
                    </tbody>
                </table>
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
     * Load and display contracts
     */
    loadContracts() {
        const contracts = window.Storage.load(window.CONFIG.STORAGE.contracts, []);
        const tbody = document.getElementById('contractsTableBody');
        
        if (!tbody) return;

        tbody.innerHTML = '';
        
        if (contracts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="p-8 text-center text-gray-400">
                        No contracts found. <a href="#" onclick="window.Contracts.openContractModal()" class="text-teal-400 hover:text-teal-300">Add your first contract</a>
                    </td>
                </tr>
            `;
            return;
        }
        
        contracts.forEach(contract => {
            const row = document.createElement('tr');
            row.className = 'border-t border-gray-600';
            
            row.innerHTML = `
                <td class="p-4">${contract.name}</td>
                <td class="p-4">$${contract.rate.toFixed(2)}</td>
                <td class="p-4">${contract.unit}</td>
                <td class="p-4">
                    <div class="flex space-x-2">
                        <button onclick="window.Contracts.openContractModal('${contract.id}')" class="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-sm">Edit</button>
                        <button onclick="window.Contracts.deleteContract('${contract.id}')" class="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-sm">Delete</button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    /**
     * Open contract modal for add/edit
     */
    openContractModal(contractId = null) {
        window.Modals.openContractModal(contractId);
    }

    /**
     * Delete contract
     */
    async deleteContract(contractId) {
        const confirmed = await window.UI.showConfirmation(
            'Are you sure you want to delete this contract?',
            'Delete Contract'
        );

        if (confirmed) {
            let contracts = window.Storage.load(window.CONFIG.STORAGE.contracts, []);
            contracts = contracts.filter(c => c.id !== contractId);
            
            window.Storage.save(window.CONFIG.STORAGE.contracts, contracts);
            
            this.loadContracts();
            window.PayrollApp.refreshData();
            window.UI.showToast('Contract deleted successfully!');
        }
    }

    /**
     * Filter contracts based on search
     */
    filterContracts() {
        const searchTerm = document.getElementById('contractSearch')?.value.toLowerCase() || '';
        const rows = document.querySelectorAll('#contractsTableBody tr');
        
        rows.forEach(row => {
            const name = row.cells[0]?.textContent.toLowerCase() || '';
            const unit = row.cells[2]?.textContent.toLowerCase() || '';
            
            if (name.includes(searchTerm) || unit.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    /**
     * Refresh contracts data
     */
    refresh() {
        this.loadContracts();
    }
}

window.Contracts = new Contracts(); 