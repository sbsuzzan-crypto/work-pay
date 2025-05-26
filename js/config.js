/**
 * Configuration file for Worker Payroll Manager
 * Contains global constants, API endpoints, and application settings
 */

// Application Configuration
const APP_CONFIG = {
    name: 'Worker Payroll Manager',
    version: '1.0.0',
    author: 'Payroll Management System',
    description: 'Comprehensive offline payroll management application'
};

// API Configuration
const API_CONFIG = {
    gemini: {
        apiKey: "", // To be set by execution environment
        baseUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        model: "gemini-2.0-flash",
        timeout: 30000 // 30 seconds
    }
};

// Local Storage Keys
const STORAGE_KEYS = {
    workers: 'payroll_workers',
    contracts: 'payroll_contracts',
    workLogs: 'payroll_work_logs',
    advances: 'payroll_advances',
    carFareEntries: 'payroll_car_fare_entries',
    payslips: 'payroll_payslips',
    settings: 'payroll_settings',
    hasVisited: 'payroll_has_visited'
};

// Default Settings
const DEFAULT_SETTINGS = {
    companyName: 'Your Company Name',
    pdfPrimaryColor: '#0d9488',
    pdfAccentColor: '#14b8a6',
    currency: 'USD',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h'
};

// UI Constants
const UI_CONSTANTS = {
    toastDuration: 3000,
    animationDuration: 300,
    debounceDelay: 500,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    supportedFileTypes: ['.json'],
    maxTableRows: 1000
};

// Validation Rules
const VALIDATION_RULES = {
    worker: {
        name: {
            required: true,
            minLength: 2,
            maxLength: 100
        },
        contact: {
            required: false,
            maxLength: 50
        },
        hourlyRate: {
            min: 0,
            max: 1000
        },
        weeklyRent: {
            min: 0,
            max: 10000
        }
    },
    contract: {
        name: {
            required: true,
            minLength: 2,
            maxLength: 100
        },
        rate: {
            required: true,
            min: 0,
            max: 10000
        },
        unit: {
            required: true,
            minLength: 1,
            maxLength: 50
        }
    },
    advance: {
        amount: {
            required: true,
            min: 0.01,
            max: 100000
        },
        notes: {
            maxLength: 500
        }
    },
    workLog: {
        hours: {
            min: 0,
            max: 24
        },
        units: {
            min: 0,
            max: 10000
        },
        contractAmount: {
            min: 0,
            max: 100000
        },
        carFare: {
            min: 0,
            max: 1000
        }
    }
};

// Error Messages
const ERROR_MESSAGES = {
    required: 'This field is required',
    minLength: 'Minimum length is {min} characters',
    maxLength: 'Maximum length is {max} characters',
    min: 'Minimum value is {min}',
    max: 'Maximum value is {max}',
    invalidEmail: 'Please enter a valid email address',
    invalidDate: 'Please enter a valid date',
    invalidNumber: 'Please enter a valid number',
    fileSize: 'File size must be less than {size}MB',
    fileType: 'Only {types} files are supported',
    networkError: 'Network error. Please check your connection.',
    apiError: 'API error. Please try again later.',
    storageError: 'Storage error. Please check available space.',
    duplicateEntry: 'This entry already exists',
    notFound: 'Item not found',
    unauthorized: 'Unauthorized access',
    forbidden: 'Access forbidden',
    serverError: 'Server error. Please try again later.'
};

// Success Messages
const SUCCESS_MESSAGES = {
    saved: 'Data saved successfully',
    updated: 'Data updated successfully',
    deleted: 'Data deleted successfully',
    exported: 'Data exported successfully',
    imported: 'Data imported successfully',
    backup: 'Backup created successfully',
    restore: 'Data restored successfully',
    emailSent: 'Email sent successfully',
    pdfGenerated: 'PDF generated successfully'
};

// Date and Time Formats
const DATE_FORMATS = {
    display: 'MMM DD, YYYY',
    input: 'YYYY-MM-DD',
    export: 'YYYY-MM-DD HH:mm:ss',
    filename: 'YYYY-MM-DD_HH-mm-ss'
};

// Export/Import Configuration
const EXPORT_CONFIG = {
    csv: {
        delimiter: ',',
        quote: '"',
        escape: '"',
        header: true
    },
    json: {
        indent: 2,
        includeMetadata: true
    },
    pdf: {
        format: 'a4',
        orientation: 'portrait',
        margin: 20,
        fontSize: {
            title: 20,
            subtitle: 16,
            body: 12,
            small: 10
        }
    }
};

// Feature Flags
const FEATURE_FLAGS = {
    aiSuggestions: true,
    bulkOperations: true,
    advancedReports: true,
    dataExport: true,
    dataImport: true,
    emailIntegration: false,
    multiCurrency: false,
    multiLanguage: false,
    darkMode: true,
    notifications: true
};

// Performance Configuration
const PERFORMANCE_CONFIG = {
    virtualScrolling: {
        enabled: true,
        itemHeight: 50,
        bufferSize: 10
    },
    pagination: {
        defaultPageSize: 50,
        pageSizes: [25, 50, 100, 200]
    },
    search: {
        debounceDelay: 300,
        minSearchLength: 2
    },
    cache: {
        enabled: true,
        maxSize: 100,
        ttl: 300000 // 5 minutes
    }
};

// Security Configuration
const SECURITY_CONFIG = {
    dataEncryption: false, // For future implementation
    sessionTimeout: 3600000, // 1 hour
    maxLoginAttempts: 5,
    passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false
    }
};

// Accessibility Configuration
const A11Y_CONFIG = {
    highContrast: false,
    fontSize: 'normal', // small, normal, large
    reducedMotion: false,
    screenReader: true,
    keyboardNavigation: true
};

// Development Configuration
const DEV_CONFIG = {
    debug: false,
    logging: {
        level: 'info', // debug, info, warn, error
        console: true,
        storage: false
    },
    mockData: false,
    apiMocking: false
};

// Export configuration object
window.CONFIG = {
    APP: APP_CONFIG,
    API: API_CONFIG,
    STORAGE: STORAGE_KEYS,
    DEFAULTS: DEFAULT_SETTINGS,
    UI: UI_CONSTANTS,
    VALIDATION: VALIDATION_RULES,
    ERRORS: ERROR_MESSAGES,
    SUCCESS: SUCCESS_MESSAGES,
    DATES: DATE_FORMATS,
    EXPORT: EXPORT_CONFIG,
    FEATURES: FEATURE_FLAGS,
    PERFORMANCE: PERFORMANCE_CONFIG,
    SECURITY: SECURITY_CONFIG,
    A11Y: A11Y_CONFIG,
    DEV: DEV_CONFIG
}; 