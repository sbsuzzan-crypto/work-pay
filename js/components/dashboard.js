/**
 * Dashboard Component
 * Handles dashboard functionality and statistics
 */

class Dashboard {
    constructor() {
        this.initialized = false;
    }

    /**
     * Initialize dashboard component
     */
    init() {
        if (this.initialized) return;
        
        this.render();
        this.handleEvents();
        this.loadDashboardData();
        
        this.initialized = true;
    }

    /**
     * Render dashboard content
     */
    render() {
        const content = document.getElementById('dashboard');
        if (!content) return;

        content.innerHTML = `
            <div class="dashboard-container">
                <!-- Header Section -->
                <div class="dashboard-header">
                    <h1 class="text-3xl font-bold text-white mb-2">
                        <i data-lucide="bar-chart-3" class="inline-block mr-3"></i>
                        Dashboard
                    </h1>
                    <p class="text-gray-400">Overview of your payroll management system</p>
                </div>

                <!-- Quick Stats Cards -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i data-lucide="users" class="w-8 h-8"></i>
                        </div>
                        <div class="stat-content">
                            <h3 class="stat-title">Total Workers</h3>
                            <p class="stat-value" id="totalWorkers">0</p>
                            <p class="stat-change" id="workersChange">+0 this month</p>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">
                            <i data-lucide="clock" class="w-8 h-8"></i>
                        </div>
                        <div class="stat-content">
                            <h3 class="stat-title">Hours This Week</h3>
                            <p class="stat-value" id="weeklyHours">0</p>
                            <p class="stat-change" id="hoursChange">+0 from last week</p>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">
                            <i data-lucide="dollar-sign" class="w-8 h-8"></i>
                        </div>
                        <div class="stat-content">
                            <h3 class="stat-title">Weekly Earnings</h3>
                            <p class="stat-value" id="weeklyEarnings">$0</p>
                            <p class="stat-change" id="earningsChange">+$0 from last week</p>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">
                            <i data-lucide="trending-up" class="w-8 h-8"></i>
                        </div>
                        <div class="stat-content">
                            <h3 class="stat-title">Active Contracts</h3>
                            <p class="stat-value" id="activeContracts">0</p>
                            <p class="stat-change" id="contractsChange">+0 this month</p>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions">
                    <h2 class="section-title">
                        <i data-lucide="zap" class="inline-block mr-2"></i>
                        Quick Actions
                    </h2>
                    <div class="action-grid">
                        <button onclick="window.UI.showSection('workers')" class="action-btn">
                            <i data-lucide="user-plus" class="w-6 h-6"></i>
                            <span>Add Worker</span>
                        </button>
                        <button onclick="window.UI.showSection('worklog')" class="action-btn">
                            <i data-lucide="clock" class="w-6 h-6"></i>
                            <span>Log Work</span>
                        </button>
                        <button onclick="window.UI.showSection('payroll')" class="action-btn">
                            <i data-lucide="file-text" class="w-6 h-6"></i>
                            <span>Generate Payslip</span>
                        </button>
                        <button onclick="window.UI.showSection('reports')" class="action-btn">
                            <i data-lucide="bar-chart" class="w-6 h-6"></i>
                            <span>View Reports</span>
                        </button>
                    </div>
                </div>

                <!-- Analytics Section -->
                <div class="analytics-section">
                    <h2 class="section-title">
                        <i data-lucide="trending-up" class="inline-block mr-2"></i>
                        Analytics & Insights
                    </h2>
                    
                    <div class="analytics-grid">
                        <!-- Top Performers -->
                        <div class="analytics-card">
                            <h3 class="analytics-title">Top Performers This Week</h3>
                            <div id="topPerformers" class="performers-list">
                                <div class="performer-item">
                                    <span class="performer-name">No data available</span>
                                    <span class="performer-hours">0 hrs</span>
                                </div>
                            </div>
                        </div>

                        <!-- Recent Activity -->
                        <div class="analytics-card">
                            <h3 class="analytics-title">Recent Activity</h3>
                            <div id="recentActivity" class="activity-list">
                                <div class="activity-item">
                                    <i data-lucide="info" class="activity-icon"></i>
                                    <span class="activity-text">No recent activity</span>
                                    <span class="activity-time">-</span>
                                </div>
                            </div>
                        </div>

                        <!-- Earnings Trend -->
                        <div class="analytics-card">
                            <h3 class="analytics-title">Earnings Trend (Last 7 Days)</h3>
                            <div id="earningsTrend" class="trend-chart">
                                <div class="trend-bars">
                                    <div class="trend-bar" style="height: 20%"></div>
                                    <div class="trend-bar" style="height: 40%"></div>
                                    <div class="trend-bar" style="height: 60%"></div>
                                    <div class="trend-bar" style="height: 30%"></div>
                                    <div class="trend-bar" style="height: 80%"></div>
                                    <div class="trend-bar" style="height: 50%"></div>
                                    <div class="trend-bar" style="height: 70%"></div>
                                </div>
                                <div class="trend-labels">
                                    <span>Mon</span>
                                    <span>Tue</span>
                                    <span>Wed</span>
                                    <span>Thu</span>
                                    <span>Fri</span>
                                    <span>Sat</span>
                                    <span>Sun</span>
                                </div>
                            </div>
                        </div>

                        <!-- System Health -->
                        <div class="analytics-card">
                            <h3 class="analytics-title">System Health</h3>
                            <div class="health-metrics">
                                <div class="health-item">
                                    <span class="health-label">Data Storage</span>
                                    <div class="health-bar">
                                        <div class="health-fill" id="storageUsage" style="width: 25%"></div>
                                    </div>
                                    <span class="health-value" id="storageValue">25%</span>
                                </div>
                                <div class="health-item">
                                    <span class="health-label">Performance</span>
                                    <div class="health-bar">
                                        <div class="health-fill" style="width: 95%; background: #10b981"></div>
                                    </div>
                                    <span class="health-value">Excellent</span>
                                </div>
                                <div class="health-item">
                                    <span class="health-label">Last Backup</span>
                                    <span class="health-value" id="lastBackup">Never</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Getting Started Checklist -->
                <div class="checklist-section">
                    <h2 class="section-title">
                        <i data-lucide="check-square" class="inline-block mr-2"></i>
                        Getting Started
                    </h2>
                    <div class="checklist">
                        <div class="checklist-item" id="checklist-worker">
                            <i data-lucide="square" class="checklist-icon"></i>
                            <span class="checklist-text">Add your first worker</span>
                            <button onclick="window.UI.showSection('workers')" class="checklist-action">Add Worker</button>
                        </div>
                        <div class="checklist-item" id="checklist-contract">
                            <i data-lucide="square" class="checklist-icon"></i>
                            <span class="checklist-text">Create a contract template</span>
                            <button onclick="window.UI.showSection('contracts')" class="checklist-action">Add Contract</button>
                        </div>
                        <div class="checklist-item" id="checklist-worklog">
                            <i data-lucide="square" class="checklist-icon"></i>
                            <span class="checklist-text">Log your first work entry</span>
                            <button onclick="window.UI.showSection('worklog')" class="checklist-action">Log Work</button>
                        </div>
                        <div class="checklist-item" id="checklist-payroll">
                            <i data-lucide="square" class="checklist-icon"></i>
                            <span class="checklist-text">Generate your first payslip</span>
                            <button onclick="window.UI.showSection('payroll')" class="checklist-action">Generate Payslip</button>
                        </div>
                    </div>
                </div>

                <!-- Tips Section -->
                <div class="tips-section">
                    <h2 class="section-title">
                        <i data-lucide="lightbulb" class="inline-block mr-2"></i>
                        Tips & Shortcuts
                    </h2>
                    <div class="tips-grid">
                        <div class="tip-card interactive-element" onclick="window.UI.showKeyboardShortcutsHelp()">
                            <i data-lucide="keyboard" class="tip-icon"></i>
                            <h3 class="tip-title">Keyboard Navigation</h3>
                            <ul class="tip-list">
                                <li><kbd>Ctrl+D</kbd> - Dashboard</li>
                                <li><kbd>Ctrl+W</kbd> - Workers</li>
                                <li><kbd>Ctrl+L</kbd> - Work Log</li>
                                <li><kbd>Ctrl+P</kbd> - Payroll</li>
                                <li><kbd>?</kbd> - Show all shortcuts</li>
                            </ul>
                            <div class="mt-2 text-xs text-teal-400">Click to see all shortcuts</div>
                        </div>
                        
                        <div class="tip-card">
                            <i data-lucide="zap" class="tip-icon"></i>
                            <h3 class="tip-title">Quick Actions</h3>
                            <ul class="tip-list">
                                <li><kbd>Ctrl+N</kbd> - Add new worker</li>
                                <li><kbd>Ctrl+B</kbd> - Backup data</li>
                                <li><kbd>Ctrl+/</kbd> - Focus search</li>
                                <li><kbd>Esc</kbd> - Close modals</li>
                                <li>Double-click sidebar toggle to auto-hide</li>
                            </ul>
                        </div>
                        
                        <div class="tip-card">
                            <i data-lucide="shield-check" class="tip-icon"></i>
                            <h3 class="tip-title">Data Safety</h3>
                            <ul class="tip-list">
                                <li>Data is stored locally in your browser</li>
                                <li>Regular backups are created automatically</li>
                                <li>Export your data regularly for safety</li>
                                <li>Clear browser data will remove all information</li>
                                <li>Use Settings > Export for manual backups</li>
                            </ul>
                        </div>
                        
                        <div class="tip-card">
                            <i data-lucide="smartphone" class="tip-icon"></i>
                            <h3 class="tip-title">Mobile Features</h3>
                            <ul class="tip-list">
                                <li>Swipe-friendly navigation on mobile</li>
                                <li>Touch-optimized buttons and inputs</li>
                                <li>Bottom navigation for quick access</li>
                                <li>Responsive design adapts to screen size</li>
                                <li>Works offline once loaded</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    /**
     * Set up event listeners
     */
    handleEvents() {
        // Add any dashboard-specific event listeners here
    }

    /**
     * Load and display dashboard data
     */
    loadDashboardData() {
        const workers = window.Storage.load(window.CONFIG.STORAGE.workers, []);
        const workLogs = window.Storage.load(window.CONFIG.STORAGE.workLogs, []);
        const contracts = window.Storage.load(window.CONFIG.STORAGE.contracts, []);
        const advances = window.Storage.load(window.CONFIG.STORAGE.advances, []);
        const settings = window.Storage.load(window.CONFIG.STORAGE.settings, {});

        // Update basic stats
        this.updateBasicStats(workers, workLogs, contracts);
        
        // Update analytics
        this.updateTopPerformers(workers, workLogs);
        this.updateRecentActivity(workLogs, advances);
        this.updateEarningsTrend(workLogs);
        this.updateSystemHealth();
        
        // Update checklist
        this.updateChecklist(workers, contracts, workLogs);
    }

    /**
     * Update basic statistics with real-time data
     */
    updateBasicStats(workers, workLogs, contracts) {
        // Total workers
        const totalWorkersEl = document.getElementById('totalWorkers');
        if (totalWorkersEl) {
            totalWorkersEl.textContent = workers.length;
        }

        // Calculate this week's data
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // End of current week (Saturday)
        endOfWeek.setHours(23, 59, 59, 999);
        
        const thisWeekLogs = workLogs.filter(log => {
            const logDate = new Date(log.date);
            return logDate >= startOfWeek && logDate <= endOfWeek;
        });
        
        // Hours this week
        const weeklyHours = thisWeekLogs.reduce((sum, log) => sum + (parseFloat(log.hours) || 0), 0);
        const weeklyHoursEl = document.getElementById('weeklyHours');
        if (weeklyHoursEl) {
            weeklyHoursEl.textContent = weeklyHours.toFixed(1);
        }

        // Weekly earnings - use dailyEarnings from work logs
        const weeklyEarnings = thisWeekLogs.reduce((sum, log) => sum + (parseFloat(log.dailyEarnings) || 0), 0);
        const weeklyEarningsEl = document.getElementById('weeklyEarnings');
        if (weeklyEarningsEl) {
            weeklyEarningsEl.textContent = `$${weeklyEarnings.toFixed(2)}`;
        }

        // Active contracts - count all contracts (they don't have status field)
        const activeContracts = contracts.length;
        const activeContractsEl = document.getElementById('activeContracts');
        if (activeContractsEl) {
            activeContractsEl.textContent = activeContracts;
        }

        // Update change indicators with previous week comparison
        this.updateChangeIndicators(workers, workLogs, thisWeekLogs, weeklyHours, weeklyEarnings);
    }

    /**
     * Update change indicators comparing to previous week
     */
    updateChangeIndicators(workers, workLogs, thisWeekLogs, weeklyHours, weeklyEarnings) {
        // Calculate previous week's data
        const now = new Date();
        const startOfLastWeek = new Date(now);
        startOfLastWeek.setDate(now.getDate() - now.getDay() - 7); // Start of last week
        startOfLastWeek.setHours(0, 0, 0, 0);
        
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6); // End of last week
        endOfLastWeek.setHours(23, 59, 59, 999);
        
        const lastWeekLogs = workLogs.filter(log => {
            const logDate = new Date(log.date);
            return logDate >= startOfLastWeek && logDate <= endOfLastWeek;
        });
        
        const lastWeekHours = lastWeekLogs.reduce((sum, log) => sum + (parseFloat(log.hours) || 0), 0);
        const lastWeekEarnings = lastWeekLogs.reduce((sum, log) => sum + (parseFloat(log.dailyEarnings) || 0), 0);
        
        // Update hours change
        const hoursChange = weeklyHours - lastWeekHours;
        const hoursChangeEl = document.getElementById('hoursChange');
        if (hoursChangeEl) {
            const sign = hoursChange >= 0 ? '+' : '';
            hoursChangeEl.textContent = `${sign}${hoursChange.toFixed(1)} from last week`;
            hoursChangeEl.className = hoursChange >= 0 ? 'stat-change text-green-400' : 'stat-change text-red-400';
        }
        
        // Update earnings change
        const earningsChange = weeklyEarnings - lastWeekEarnings;
        const earningsChangeEl = document.getElementById('earningsChange');
        if (earningsChangeEl) {
            const sign = earningsChange >= 0 ? '+' : '';
            earningsChangeEl.textContent = `${sign}$${earningsChange.toFixed(2)} from last week`;
            earningsChangeEl.className = earningsChange >= 0 ? 'stat-change text-green-400' : 'stat-change text-red-400';
        }
        
        // Workers change (this month vs last month)
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const workersThisMonth = workers.filter(worker => {
            // Assuming workers have a createdDate or similar field
            // For now, we'll just show total workers
            return true;
        }).length;
        
        const workersChangeEl = document.getElementById('workersChange');
        if (workersChangeEl) {
            workersChangeEl.textContent = `${workers.length} total workers`;
        }
        
        // Contracts change
        const contractsChangeEl = document.getElementById('contractsChange');
        if (contractsChangeEl) {
            contractsChangeEl.textContent = `${contracts.length} total contracts`;
        }
    }

    /**
     * Update top performers with real-time data
     */
    updateTopPerformers(workers, workLogs) {
        const performersList = document.getElementById('topPerformers');
        if (!performersList) return;

        // Get this week's work logs
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        const thisWeekLogs = workLogs.filter(log => {
            const logDate = new Date(log.date);
            return logDate >= startOfWeek && logDate <= endOfWeek;
        });

        // Calculate hours and earnings per worker
        const workerStats = {};
        thisWeekLogs.forEach(log => {
            if (!workerStats[log.workerId]) {
                workerStats[log.workerId] = {
                    hours: 0,
                    earnings: 0,
                    name: log.workerName
                };
            }
            workerStats[log.workerId].hours += parseFloat(log.hours) || 0;
            workerStats[log.workerId].earnings += parseFloat(log.dailyEarnings) || 0;
        });

        // Sort workers by earnings (primary) and hours (secondary)
        const sortedWorkers = Object.entries(workerStats)
            .sort(([, a], [, b]) => {
                if (b.earnings !== a.earnings) {
                    return b.earnings - a.earnings;
                }
                return b.hours - a.hours;
            })
            .slice(0, 5);

        if (sortedWorkers.length === 0) {
            performersList.innerHTML = `
                <div class="performer-item">
                    <span class="performer-name">No data available</span>
                    <span class="performer-hours">0 hrs</span>
                </div>
            `;
            return;
        }

        performersList.innerHTML = sortedWorkers.map(([workerId, stats]) => `
            <div class="performer-item">
                <span class="performer-name">${stats.name}</span>
                <span class="performer-hours">${stats.hours.toFixed(1)} hrs</span>
                <span class="performer-earnings">$${stats.earnings.toFixed(2)}</span>
            </div>
        `).join('');
    }

    /**
     * Update recent activity
     */
    updateRecentActivity(workLogs, advances) {
        const activityList = document.getElementById('recentActivity');
        if (!activityList) return;

        // Combine and sort activities
        const activities = [
            ...workLogs.map(log => ({
                type: 'work',
                date: new Date(log.date),
                text: `Work logged: ${log.hours} hours`,
                icon: 'clock'
            })),
            ...advances.map(advance => ({
                type: 'advance',
                date: new Date(advance.date),
                text: `Advance payment: ${window.UI.formatCurrency(advance.amount)}`,
                icon: 'dollar-sign'
            }))
        ].sort((a, b) => b.date - a.date).slice(0, 5);

        if (activities.length === 0) {
            activityList.innerHTML = `
                <div class="activity-item">
                    <i data-lucide="info" class="activity-icon"></i>
                    <span class="activity-text">No recent activity</span>
                    <span class="activity-time">-</span>
                </div>
            `;
            return;
        }

        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <i data-lucide="${activity.icon}" class="activity-icon"></i>
                <span class="activity-text">${activity.text}</span>
                <span class="activity-time">${this.formatRelativeTime(activity.date)}</span>
            </div>
        `).join('');

        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    /**
     * Update earnings trend with real-time data
     */
    updateEarningsTrend(workLogs) {
        const trendBars = document.querySelectorAll('.trend-bar');
        if (!trendBars.length) return;

        // Get last 7 days
        const days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i)); // Last 7 days including today
            date.setHours(0, 0, 0, 0);
            return date;
        });

        // Calculate earnings per day
        const dailyEarnings = days.map(date => {
            const dayLogs = workLogs.filter(log => {
                const logDate = new Date(log.date);
                logDate.setHours(0, 0, 0, 0);
                return logDate.getTime() === date.getTime();
            });
            return dayLogs.reduce((sum, log) => sum + (parseFloat(log.dailyEarnings) || 0), 0);
        });

        // Find max earnings for scaling
        const maxEarnings = Math.max(...dailyEarnings, 1);

        // Update bars
        trendBars.forEach((bar, index) => {
            const percentage = Math.max((dailyEarnings[index] / maxEarnings) * 100, 5); // Minimum 5% height
            bar.style.height = `${percentage}%`;
            bar.title = `${days[index].toLocaleDateString()}: $${dailyEarnings[index].toFixed(2)}`;
        });

        // Update trend labels with actual dates
        const trendLabels = document.querySelector('.trend-labels');
        if (trendLabels) {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            trendLabels.innerHTML = days.map(date => 
                `<span>${dayNames[date.getDay()]}</span>`
            ).join('');
        }
    }

    /**
     * Update system health metrics
     */
    updateSystemHealth() {
        // Calculate storage usage
        const storageUsed = JSON.stringify(localStorage).length;
        const storageLimit = 5 * 1024 * 1024; // 5MB typical limit
        const storagePercentage = (storageUsed / storageLimit) * 100;
        
        const storageUsageEl = document.getElementById('storageUsage');
        const storageValueEl = document.getElementById('storageValue');
        if (storageUsageEl && storageValueEl) {
            storageUsageEl.style.width = `${Math.min(storagePercentage, 100)}%`;
            storageValueEl.textContent = `${storagePercentage.toFixed(1)}%`;
        }
        
        // Update last backup time
        const lastBackupEl = document.getElementById('lastBackup');
        if (lastBackupEl) {
            const lastBackup = window.Storage.load('lastBackup', null);
            lastBackupEl.textContent = lastBackup ? this.formatRelativeTime(new Date(lastBackup)) : 'Never';
        }
    }

    /**
     * Update checklist progress
     */
    updateChecklist(workers, contracts, workLogs) {
        const checklistItems = {
            'checklist-worker': workers.length > 0,
            'checklist-contract': contracts.length > 0,
            'checklist-worklog': workLogs.length > 0,
            'checklist-payroll': false // This will be updated when payroll is implemented
        };

        Object.entries(checklistItems).forEach(([id, completed]) => {
            const item = document.getElementById(id);
            if (item) {
                const icon = item.querySelector('.checklist-icon');
                if (icon) {
                    icon.setAttribute('data-lucide', completed ? 'check-square' : 'square');
                }
                if (window.lucide) {
                    window.lucide.createIcons();
                }
            }
        });
    }

    /**
     * Format relative time
     */
    formatRelativeTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffDays > 0) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    }

    /**
     * Refresh dashboard data - called when data changes
     */
    refresh() {
        this.loadDashboardData();
    }
}

// Create global dashboard instance
window.Dashboard = new Dashboard(); 