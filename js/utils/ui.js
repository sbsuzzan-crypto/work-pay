/**
 * UI Utility Module
 * Handles common UI operations like toasts, modals, navigation, and form validation
 */

class UIManager {
    constructor() {
        this.activeModals = new Set();
        this.toastQueue = [];
        this.currentSection = 'dashboard';
        this.debounceTimers = new Map();
    }

    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - Toast type (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds
     */
    showToast(message, type = 'success', duration = null) {
        const toastDuration = duration || window.CONFIG?.UI?.toastDuration || 3000;
        
        const toast = document.createElement('div');
        toast.className = `toast bg-${this.getToastColor(type)}-600 text-white px-4 py-2 rounded shadow-lg`;
        toast.textContent = message;
        
        // Add icon based on type
        const icon = this.getToastIcon(type);
        if (icon) {
            toast.innerHTML = `<i data-lucide="${icon}" class="inline w-4 h-4 mr-2"></i>${message}`;
        }
        
        const container = document.getElementById('toastContainer');
        if (container) {
            container.appendChild(toast);
            
            // Initialize Lucide icons for the new toast
            if (window.lucide) {
                window.lucide.createIcons();
            }
            
            // Trigger show animation
            setTimeout(() => {
                toast.classList.add('show');
            }, 10);
            
            // Auto remove after duration
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.classList.remove('show');
                    setTimeout(() => toast.remove(), 300);
                }
            }, toastDuration);
            
            // Allow manual close on click
            toast.addEventListener('click', () => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            });
        }
    }

    /**
     * Get toast color based on type
     * @param {string} type - Toast type
     * @returns {string} - Color name
     */
    getToastColor(type) {
        const colors = {
            success: 'green',
            error: 'red',
            warning: 'yellow',
            info: 'blue'
        };
        return colors[type] || 'gray';
    }

    /**
     * Get toast icon based on type
     * @param {string} type - Toast type
     * @returns {string} - Icon name
     */
    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-triangle',
            info: 'info'
        };
        return icons[type];
    }

    /**
     * Show loading overlay
     */
    showLoading(message = 'Loading...') {
        const existingOverlay = document.getElementById('loadingOverlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        overlay.innerHTML = `
            <div class="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl flex flex-col items-center min-w-[200px]">
                <div class="loading-spinner mb-4"></div>
                <span class="text-lg font-semibold text-gray-800 dark:text-white">${message}</span>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.remove();
        }
    }

    /**
     * Show button loading state
     */
    setButtonLoading(buttonElement, loading = true, originalText = '') {
        if (loading) {
            buttonElement.disabled = true;
            buttonElement.dataset.originalText = buttonElement.textContent;
            buttonElement.innerHTML = `
                <div class="loading-spinner mr-2"></div>
                Loading...
            `;
        } else {
            buttonElement.disabled = false;
            buttonElement.textContent = originalText || buttonElement.dataset.originalText || 'Submit';
        }
    }

    /**
     * Show skeleton loading for lists
     */
    showSkeletonLoading(containerId, count = 3) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const skeletonHTML = Array.from({ length: count }, () => `
            <div class="animate-pulse p-4 border-b border-gray-200 dark:border-gray-600">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div class="flex-1">
                        <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                        <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
            </div>
        `).join('');

        container.innerHTML = skeletonHTML;
    }

    /**
     * Show confirmation dialog
     * @param {string} message - Confirmation message
     * @param {string} title - Dialog title
     * @returns {Promise<boolean>} - User's choice
     */
    showConfirmation(message, title = 'Confirm Action') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
                    <h3 class="text-xl font-semibold mb-4 text-white">${title}</h3>
                    <p class="text-gray-300 mb-6">${message}</p>
                    <div class="flex justify-end space-x-2">
                        <button id="cancelBtn" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white">Cancel</button>
                        <button id="confirmBtn" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white">Confirm</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const cancelBtn = modal.querySelector('#cancelBtn');
            const confirmBtn = modal.querySelector('#confirmBtn');
            
            const cleanup = () => {
                modal.remove();
            };
            
            cancelBtn.addEventListener('click', () => {
                cleanup();
                resolve(false);
            });
            
            confirmBtn.addEventListener('click', () => {
                cleanup();
                resolve(true);
            });
            
            // Close on escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    cleanup();
                    resolve(false);
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
        });
    }

    /**
     * Show section and update navigation
     * @param {string} sectionName - Section to show
     */
    showSection(sectionName) {
        // Show loading state
        const loadingEl = this.showLoading('Loading section...');
        
        // Hide all sections with fade out
        document.querySelectorAll('.section').forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
        });
        
        setTimeout(() => {
            // Hide all sections
            document.querySelectorAll('.section').forEach(section => {
                section.classList.add('hidden');
            });
            
            // Show selected section
            const targetSection = document.getElementById(sectionName);
            if (targetSection) {
                targetSection.classList.remove('hidden');
                
                // Trigger fade in animation
                requestAnimationFrame(() => {
                    targetSection.style.opacity = '1';
                    targetSection.style.transform = 'translateY(0)';
                    targetSection.classList.add('animate-fade-in-up');
                });
            }
            
            // Update navigation
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('sidebar-active');
            });
            
            const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`);
            if (activeNavItem) {
                activeNavItem.classList.add('sidebar-active');
            }
            
            // Update mobile navigation
            this.updateMobileNavigation(sectionName);
            
            // Update current section
            this.currentSection = sectionName;
            
            // Hide loading
            this.hideLoading();
            
            // Trigger section-specific initialization
            setTimeout(() => {
                this.initializeSection(sectionName);
            }, 100);
        }, 150);
    }

    /**
     * Update mobile navigation states
     * @param {string} sectionName - Active section name
     */
    updateMobileNavigation(sectionName) {
        // Update mobile bottom navigation
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeMobileNavItem = document.querySelector(`.mobile-nav-item[data-section="${sectionName}"]`);
        if (activeMobileNavItem) {
            activeMobileNavItem.classList.add('active');
        }
        
        // Update mobile top menu title
        const mobileTopTitle = document.getElementById('mobileTopTitle');
        if (mobileTopTitle) {
            const sectionTitles = {
                dashboard: 'Dashboard',
                workers: 'Workers',
                contracts: 'Contracts',
                worklog: 'Log Work',
                advances: 'Advances',
                payroll: 'Payroll',
                reports: 'Reports',
                settings: 'Settings'
            };
            mobileTopTitle.textContent = sectionTitles[sectionName] || 'Payroll Manager';
        }
        
        // Close expandable menu if open
        this.closeMobileExpandableMenu();
    }

    /**
     * Initialize section-specific functionality
     * @param {string} sectionName - Section name
     */
    initializeSection(sectionName) {
        // Call section-specific initialization functions
        const initFunctions = {
            dashboard: () => window.Dashboard?.init(),
            workers: () => window.Workers?.init(),
            contracts: () => window.Contracts?.init(),
            worklog: () => window.WorkLog?.init(),
            advances: () => window.Advances?.init(),
            payroll: () => window.Payroll?.init(),
            reports: () => window.Reports?.init(),
            settings: () => window.Settings?.init()
        };
        
        const initFunction = initFunctions[sectionName];
        if (initFunction) {
            try {
                initFunction();
            } catch (error) {
                console.error(`Error initializing section ${sectionName}:`, error);
            }
        }
    }

    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @param {string} key - Unique key for the debounce timer
     * @returns {Function} - Debounced function
     */
    debounce(func, delay, key = 'default') {
        return (...args) => {
            if (this.debounceTimers.has(key)) {
                clearTimeout(this.debounceTimers.get(key));
            }
            
            const timer = setTimeout(() => {
                func.apply(this, args);
                this.debounceTimers.delete(key);
            }, delay);
            
            this.debounceTimers.set(key, timer);
        };
    }

    /**
     * Validate form data
     * @param {HTMLFormElement} form - Form element
     * @param {object} rules - Validation rules
     * @returns {object} - Validation result
     */
    validateForm(form, rules) {
        const errors = {};
        const formData = new FormData(form);
        
        Object.entries(rules).forEach(([fieldName, fieldRules]) => {
            const value = formData.get(fieldName) || '';
            const fieldErrors = [];
            
            // Required validation
            if (fieldRules.required && !value.trim()) {
                fieldErrors.push(window.CONFIG?.ERRORS?.required || 'This field is required');
            }
            
            // Length validations
            if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
                fieldErrors.push(
                    (window.CONFIG?.ERRORS?.minLength || 'Minimum length is {min} characters')
                        .replace('{min}', fieldRules.minLength)
                );
            }
            
            if (value && fieldRules.maxLength && value.length > fieldRules.maxLength) {
                fieldErrors.push(
                    (window.CONFIG?.ERRORS?.maxLength || 'Maximum length is {max} characters')
                        .replace('{max}', fieldRules.maxLength)
                );
            }
            
            // Numeric validations
            if (value && fieldRules.min !== undefined) {
                const numValue = parseFloat(value);
                if (!isNaN(numValue) && numValue < fieldRules.min) {
                    fieldErrors.push(
                        (window.CONFIG?.ERRORS?.min || 'Minimum value is {min}')
                            .replace('{min}', fieldRules.min)
                    );
                }
            }
            
            if (value && fieldRules.max !== undefined) {
                const numValue = parseFloat(value);
                if (!isNaN(numValue) && numValue > fieldRules.max) {
                    fieldErrors.push(
                        (window.CONFIG?.ERRORS?.max || 'Maximum value is {max}')
                            .replace('{max}', fieldRules.max)
                    );
                }
            }
            
            if (fieldErrors.length > 0) {
                errors[fieldName] = fieldErrors;
            }
        });
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    /**
     * Display form validation errors
     * @param {HTMLFormElement} form - Form element
     * @param {object} errors - Validation errors
     */
    displayFormErrors(form, errors) {
        // Clear existing errors
        form.querySelectorAll('.error-message').forEach(el => el.remove());
        form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        
        // Display new errors
        Object.entries(errors).forEach(([fieldName, fieldErrors]) => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.classList.add('error');
                
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message text-red-400 text-sm mt-1';
                errorDiv.textContent = fieldErrors[0]; // Show first error
                
                field.parentNode.appendChild(errorDiv);
            }
        });
    }

    /**
     * Create and show modal
     * @param {string} content - Modal content HTML
     * @param {object} options - Modal options
     * @returns {HTMLElement} - Modal element
     */
    createModal(content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        const modalContent = document.createElement('div');
        modalContent.className = `modal-content bg-gray-800 p-6 rounded-lg ${options.size || 'max-w-md'} w-full mx-4 max-h-screen overflow-y-auto`;
        modalContent.innerHTML = content;
        
        modal.appendChild(modalContent);
        
        // Add close functionality
        if (options.closable !== false) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
            
            // Close on escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    this.closeModal(modal);
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
        }
        
        document.body.appendChild(modal);
        this.activeModals.add(modal);
        
        // Trigger show animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        return modal;
    }

    /**
     * Close modal
     * @param {HTMLElement} modal - Modal element
     */
    closeModal(modal) {
        if (modal && modal.parentNode) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                this.activeModals.delete(modal);
            }, 300);
        }
    }

    /**
     * Close all modals
     */
    closeAllModals() {
        this.activeModals.forEach(modal => {
            this.closeModal(modal);
        });
    }

    /**
     * Format currency value
     * @param {number} value - Numeric value
     * @param {string} currency - Currency code
     * @returns {string} - Formatted currency string
     */
    formatCurrency(value, currency = 'USD') {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency
            }).format(value);
        } catch (error) {
            return `$${value.toFixed(2)}`;
        }
    }

    /**
     * Format date value
     * @param {string|Date} date - Date value
     * @param {string} format - Format type
     * @returns {string} - Formatted date string
     */
    formatDate(date, format = 'display') {
        try {
            const dateObj = new Date(date);
            const formats = window.CONFIG?.DATES || {};
            
            switch (format) {
                case 'display':
                    return dateObj.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                case 'input':
                    return dateObj.toISOString().split('T')[0];
                case 'export':
                    return dateObj.toISOString();
                default:
                    return dateObj.toLocaleDateString();
            }
        } catch (error) {
            return date.toString();
        }
    }

    /**
     * Animate element
     * @param {HTMLElement} element - Element to animate
     * @param {string} animation - Animation class
     * @param {number} duration - Animation duration
     */
    animate(element, animation, duration = 300) {
        element.classList.add(animation);
        setTimeout(() => {
            element.classList.remove(animation);
        }, duration);
    }

    /**
     * Scroll to element
     * @param {HTMLElement|string} target - Target element or selector
     * @param {object} options - Scroll options
     */
    scrollTo(target, options = {}) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (element) {
            element.scrollIntoView({
                behavior: options.smooth !== false ? 'smooth' : 'auto',
                block: options.block || 'start',
                inline: options.inline || 'nearest'
            });
        }
    }

    /**
     * Get current section
     * @returns {string} - Current section name
     */
    getCurrentSection() {
        return this.currentSection;
    }

    /**
     * Check if mobile device
     * @returns {boolean} - Is mobile device
     */
    isMobile() {
        return window.innerWidth <= 768;
    }

    /**
     * Initialize UI manager
     */
    init() {
        try {
            this.setupTheme();
            this.setupEventListeners();
            this.setupKeyboardShortcuts();
            this.initializeMobileNavigation();
            console.log('UI Manager initialized');
        } catch (error) {
            console.error('UI Manager initialization failed:', error);
            // Continue with basic functionality even if some features fail
        }
    }

    /**
     * Initialize mobile navigation
     */
    initializeMobileNavigation() {
        try {
            // Force mobile navigation visibility check on load
            this.handleResize();
            
            // Ensure mobile navigation is properly styled
            const mobileBottomNav = document.getElementById('mobileBottomNav');
            const mobileTopMenu = document.getElementById('mobileTopMenu');
            
            if (window.innerWidth <= 768) {
                if (mobileBottomNav) {
                    mobileBottomNav.style.display = 'block';
                    mobileBottomNav.style.position = 'fixed';
                    mobileBottomNav.style.bottom = '0';
                    mobileBottomNav.style.left = '0';
                    mobileBottomNav.style.right = '0';
                    mobileBottomNav.style.zIndex = '1000';
                }
                // Hide mobile top menu on mobile
                if (mobileTopMenu) {
                    mobileTopMenu.style.display = 'none';
                }
            }
            
            console.log('Mobile navigation initialized');
        } catch (error) {
            console.warn('Mobile navigation initialization failed:', error);
        }
    }

    /**
     * Setup theme functionality
     */
    setupTheme() {
        try {
            // Set default theme if none exists
            const savedTheme = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-theme', savedTheme);
            
            // Setup theme toggle if it exists
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', this.toggleTheme.bind(this));
            }
        } catch (error) {
            console.warn('Theme setup failed:', error);
        }
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        try {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            this.showToast(`Switched to ${newTheme} theme`, 'info');
        } catch (error) {
            console.warn('Theme toggle failed:', error);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        try {
            // Navigation event listeners
            document.querySelectorAll('.nav-item, .mobile-nav-item, .mobile-expandable-item, .mobile-collapsible-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const section = item.getAttribute('data-section');
                    if (section) {
                        this.showSection(section);
                        // Close mobile collapsible menu if open
                        this.closeMobileCollapsibleMenu();
                    }
                });
            });

            // Mobile menu toggle
            const mobileMenuToggle = document.getElementById('mobileMenuToggle');
            if (mobileMenuToggle) {
                mobileMenuToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
            }

            // Mobile collapsible menu toggle
            const mobileMenuToggleBtn = document.getElementById('mobileMenuToggleBtn');
            if (mobileMenuToggleBtn) {
                mobileMenuToggleBtn.addEventListener('click', this.toggleMobileCollapsibleMenu.bind(this));
            }

            // Close mobile collapsible menu
            const closeMobileMenu = document.getElementById('closeMobileMenu');
            if (closeMobileMenu) {
                closeMobileMenu.addEventListener('click', this.closeMobileCollapsibleMenu.bind(this));
            }

            // Close mobile collapsible menu on overlay click
            const mobileCollapsibleOverlay = document.querySelector('.mobile-collapsible-overlay');
            if (mobileCollapsibleOverlay) {
                mobileCollapsibleOverlay.addEventListener('click', this.closeMobileCollapsibleMenu.bind(this));
            }

            // Sidebar toggle
            const sidebarToggle = document.getElementById('sidebarToggle');
            if (sidebarToggle) {
                sidebarToggle.addEventListener('click', this.toggleSidebar.bind(this));
            }

            // FAB menu toggle
            const fabMain = document.getElementById('fabMain');
            if (fabMain) {
                fabMain.addEventListener('click', this.toggleFabMenu.bind(this));
            }

            // Close mobile menu on overlay click
            const mobileOverlay = document.getElementById('mobileOverlay');
            if (mobileOverlay) {
                mobileOverlay.addEventListener('click', this.closeMobileMenu.bind(this));
            }

            // Window resize handler
            window.addEventListener('resize', this.handleResize.bind(this));

            // Initialize sidebar state
            this.initializeSidebarState();

            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();
        } catch (error) {
            console.warn('Event listeners setup failed:', error);
        }
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        try {
            const expandableMenu = document.getElementById('mobileExpandableMenu');
            if (expandableMenu) {
                expandableMenu.classList.toggle('expanded');
            }
        } catch (error) {
            console.warn('Mobile menu toggle failed:', error);
        }
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        try {
            const expandableMenu = document.getElementById('mobileExpandableMenu');
            if (expandableMenu) {
                expandableMenu.classList.remove('expanded');
            }
        } catch (error) {
            console.warn('Mobile menu close failed:', error);
        }
    }

    /**
     * Close mobile expandable menu
     */
    closeMobileExpandableMenu() {
        this.closeMobileMenu();
    }

    /**
     * Toggle mobile collapsible menu
     */
    toggleMobileCollapsibleMenu() {
        const menu = document.getElementById('mobileCollapsibleMenu');
        const toggleBtn = document.getElementById('mobileMenuToggleBtn');
        
        if (menu && toggleBtn) {
            const isOpen = menu.classList.contains('show');
            
            if (isOpen) {
                this.closeMobileCollapsibleMenu();
            } else {
                this.openMobileCollapsibleMenu();
            }
        }
    }

    /**
     * Open mobile collapsible menu
     */
    openMobileCollapsibleMenu() {
        const menu = document.getElementById('mobileCollapsibleMenu');
        const toggleBtn = document.getElementById('mobileMenuToggleBtn');
        
        if (menu && toggleBtn) {
            menu.style.display = 'block';
            // Force reflow
            menu.offsetHeight;
            menu.classList.add('show');
            toggleBtn.classList.add('active');
            
            // Initialize icons in the menu
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }
    }

    /**
     * Close mobile collapsible menu
     */
    closeMobileCollapsibleMenu() {
        const menu = document.getElementById('mobileCollapsibleMenu');
        const toggleBtn = document.getElementById('mobileMenuToggleBtn');
        
        if (menu && toggleBtn) {
            menu.classList.remove('show');
            toggleBtn.classList.remove('active');
            
            // Hide menu after animation
            setTimeout(() => {
                if (!menu.classList.contains('show')) {
                    menu.style.display = 'none';
                }
            }, 300);
        }
    }

    /**
     * Toggle sidebar
     */
    toggleSidebar() {
        try {
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.getElementById('mainContent');
            
            if (sidebar && mainContent) {
                const isCollapsed = sidebar.classList.contains('collapsed');
                
                // Add transition class for smooth animation
                sidebar.classList.add('transitioning');
                mainContent.classList.add('transitioning');
                
                // Toggle collapsed state
                sidebar.classList.toggle('collapsed');
                mainContent.classList.toggle('sidebar-collapsed');
                
                // Update toggle button icon
                const toggleIcon = sidebar.querySelector('.sidebar-toggle i');
                if (toggleIcon) {
                    if (isCollapsed) {
                        toggleIcon.style.transform = 'rotate(0deg)';
                    } else {
                        toggleIcon.style.transform = 'rotate(180deg)';
                    }
                }
                
                // Save sidebar state to localStorage
                localStorage.setItem('sidebarCollapsed', !isCollapsed);
                
                // Remove transition class after animation
                setTimeout(() => {
                    sidebar.classList.remove('transitioning');
                    mainContent.classList.remove('transitioning');
                }, 300);
                
                // Trigger resize event for any charts or responsive components
                setTimeout(() => {
                    window.dispatchEvent(new Event('resize'));
                }, 350);
                
                // Show toast notification
                this.showToast(
                    isCollapsed ? 'Sidebar expanded' : 'Sidebar collapsed', 
                    'info', 
                    1500
                );
            }
        } catch (error) {
            console.warn('Sidebar toggle failed:', error);
        }
    }

    /**
     * Toggle FAB menu
     */
    toggleFabMenu() {
        try {
            const fabMenu = document.getElementById('fabMenu');
            if (fabMenu) {
                fabMenu.classList.toggle('hidden');
            }
        } catch (error) {
            console.warn('FAB menu toggle failed:', error);
        }
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        try {
            document.addEventListener('keydown', (e) => {
                // Don't trigger shortcuts when typing in inputs
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                    return;
                }

                // Handle keyboard shortcuts
                if (e.ctrlKey || e.metaKey) {
                    switch (e.key.toLowerCase()) {
                        case 'd':
                            e.preventDefault();
                            this.showSection('dashboard');
                            this.showToast('Navigated to Dashboard', 'info', 1000);
                            break;
                        case 'w':
                            e.preventDefault();
                            this.showSection('workers');
                            this.showToast('Navigated to Workers', 'info', 1000);
                            break;
                        case 'l':
                            e.preventDefault();
                            this.showSection('worklog');
                            this.showToast('Navigated to Work Log', 'info', 1000);
                            break;
                        case 'p':
                            e.preventDefault();
                            this.showSection('payroll');
                            this.showToast('Navigated to Payroll', 'info', 1000);
                            break;
                        case 'r':
                            e.preventDefault();
                            this.showSection('reports');
                            this.showToast('Navigated to Reports', 'info', 1000);
                            break;
                        case 's':
                            e.preventDefault();
                            this.showSection('settings');
                            this.showToast('Navigated to Settings', 'info', 1000);
                            break;
                        case 'n':
                            e.preventDefault();
                            if (window.Workers && window.Workers.openWorkerModal) {
                                this.showSection('workers');
                                setTimeout(() => window.Workers.openWorkerModal(), 100);
                                this.showToast('Opening Add Worker modal', 'info', 1000);
                            }
                            break;
                        case 'b':
                            e.preventDefault();
                            if (window.Settings && window.Settings.exportData) {
                                window.Settings.exportData();
                                this.showToast('Exporting backup...', 'info', 1000);
                            }
                            break;
                        case '/':
                            e.preventDefault();
                            this.focusSearch();
                            break;
                    }
                } else {
                    switch (e.key) {
                        case 'Escape':
                            // Close any open modals
                            const modals = document.querySelectorAll('.modal-overlay, .modal');
                            modals.forEach(modal => {
                                if (modal && modal.remove) {
                                    modal.remove();
                                }
                            });
                            
                            // Clear any active search
                            this.clearSearch();
                            break;
                        case '?':
                            e.preventDefault();
                            this.showKeyboardShortcutsHelp();
                            break;
                        case 'Tab':
                            // Enhanced tab navigation
                            if (e.shiftKey) {
                                // Shift+Tab - previous element
                                this.handleTabNavigation(e, 'previous');
                            } else {
                                // Tab - next element
                                this.handleTabNavigation(e, 'next');
                            }
                            break;
                    }
                }
            });
        } catch (error) {
            console.warn('Keyboard shortcuts setup failed:', error);
        }
    }

    /**
     * Show keyboard shortcuts help modal
     */
    showKeyboardShortcutsHelp() {
        const modal = this.createModal(`
            <div class="text-center">
                <h2 class="text-2xl font-bold mb-4 text-teal-400">
                    <i data-lucide="keyboard" class="inline-block mr-2"></i>
                    Keyboard Shortcuts
                </h2>
                <div class="text-left space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 class="font-semibold mb-2 text-white">Navigation</h3>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-300">Dashboard</span>
                                    <kbd class="bg-gray-700 px-2 py-1 rounded">Ctrl+D</kbd>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-300">Workers</span>
                                    <kbd class="bg-gray-700 px-2 py-1 rounded">Ctrl+W</kbd>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-300">Work Log</span>
                                    <kbd class="bg-gray-700 px-2 py-1 rounded">Ctrl+L</kbd>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-300">Payroll</span>
                                    <kbd class="bg-gray-700 px-2 py-1 rounded">Ctrl+P</kbd>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-300">Reports</span>
                                    <kbd class="bg-gray-700 px-2 py-1 rounded">Ctrl+R</kbd>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-300">Settings</span>
                                    <kbd class="bg-gray-700 px-2 py-1 rounded">Ctrl+S</kbd>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 class="font-semibold mb-2 text-white">Actions</h3>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-300">Add Worker</span>
                                    <kbd class="bg-gray-700 px-2 py-1 rounded">Ctrl+N</kbd>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-300">Backup Data</span>
                                    <kbd class="bg-gray-700 px-2 py-1 rounded">Ctrl+B</kbd>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-300">Search</span>
                                    <kbd class="bg-gray-700 px-2 py-1 rounded">Ctrl+/</kbd>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-300">Close Modal</span>
                                    <kbd class="bg-gray-700 px-2 py-1 rounded">Esc</kbd>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-300">Show Help</span>
                                    <kbd class="bg-gray-700 px-2 py-1 rounded">?</kbd>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button onclick="window.UI.closeModal(this.closest('.modal-overlay'))" 
                        class="w-full bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded mt-6">
                    Got it!
                </button>
            </div>
        `, { size: 'max-w-2xl' });

        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    /**
     * Focus search input
     */
    focusSearch() {
        try {
            const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="search"], input[placeholder*="Search"]');
            if (searchInputs.length > 0) {
                searchInputs[0].focus();
                this.showToast('Search focused', 'info', 1000);
            }
        } catch (error) {
            console.warn('Focus search failed:', error);
        }
    }

    /**
     * Clear search inputs
     */
    clearSearch() {
        try {
            const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="search"], input[placeholder*="Search"]');
            searchInputs.forEach(input => {
                if (input.value) {
                    input.value = '';
                    // Trigger change event
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
        } catch (error) {
            console.warn('Clear search failed:', error);
        }
    }

    /**
     * Handle enhanced tab navigation
     */
    handleTabNavigation(e, direction) {
        try {
            const focusableElements = document.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            
            const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
            
            if (currentIndex !== -1) {
                let nextIndex;
                if (direction === 'next') {
                    nextIndex = (currentIndex + 1) % focusableElements.length;
                } else {
                    nextIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
                }
                
                focusableElements[nextIndex].focus();
                e.preventDefault();
            }
        } catch (error) {
            console.warn('Tab navigation failed:', error);
        }
    }

    /**
     * Initialize sidebar state from localStorage
     */
    initializeSidebarState() {
        try {
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.getElementById('mainContent');
            const savedState = localStorage.getItem('sidebarCollapsed');
            
            if (savedState === 'true' && sidebar && mainContent) {
                sidebar.classList.add('collapsed');
                mainContent.classList.add('sidebar-collapsed');
                
                // Update toggle button icon
                const toggleIcon = sidebar.querySelector('.sidebar-toggle i');
                if (toggleIcon) {
                    toggleIcon.style.transform = 'rotate(180deg)';
                }
            }
        } catch (error) {
            console.warn('Failed to initialize sidebar state:', error);
        }
    }

    /**
     * Handle window resize for responsive behavior
     */
    handleResize() {
        try {
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.getElementById('mainContent');
            const mobileBottomNav = document.getElementById('mobileBottomNav');
            const mobileTopMenu = document.getElementById('mobileTopMenu');
            const isMobile = window.innerWidth <= 768;
            
            if (isMobile) {
                // On mobile, always hide desktop sidebar and show mobile navigation
                if (sidebar) {
                    sidebar.style.display = 'none';
                }
                if (mainContent) {
                    mainContent.style.marginLeft = '0';
                    mainContent.style.paddingBottom = '100px'; // Space for bottom nav
                    mainContent.style.paddingTop = '0'; // No top menu
                }
                if (mobileBottomNav) {
                    mobileBottomNav.style.display = 'block';
                }
                if (mobileTopMenu) {
                    mobileTopMenu.style.display = 'none';
                }
            } else {
                // On desktop, restore sidebar and hide mobile navigation
                if (sidebar) {
                    sidebar.style.display = 'block';
                    const isCollapsed = sidebar.classList.contains('collapsed');
                    if (mainContent) {
                        mainContent.style.marginLeft = isCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-expanded)';
                        mainContent.style.paddingBottom = '0';
                        mainContent.style.paddingTop = '0';
                    }
                }
                if (mobileBottomNav) {
                    mobileBottomNav.style.display = 'none';
                }
                if (mobileTopMenu) {
                    mobileTopMenu.style.display = 'none';
                }
            }
        } catch (error) {
            console.warn('Resize handler failed:', error);
        }
    }
}

// Create global UI manager instance
window.UI = new UIManager();

// Convenience functions for backward compatibility
window.showToast = (message, type, duration) => window.UI.showToast(message, type, duration);
window.showSection = (sectionName) => window.UI.showSection(sectionName);
window.showConfirmation = (message, title) => window.UI.showConfirmation(message, title); 