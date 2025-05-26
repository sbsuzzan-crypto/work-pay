/**
 * Storage Utility Module
 * Handles all Local Storage operations with error handling and validation
 */

class StorageManager {
    constructor() {
        this.isAvailable = this.checkStorageAvailability();
        this.cache = new Map();
    }

    /**
     * Check if localStorage is available
     * @returns {boolean}
     */
    checkStorageAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.error('localStorage is not available:', e);
            return false;
        }
    }

    /**
     * Save data to localStorage with auto-backup
     * @param {string} key - Storage key
     * @param {*} data - Data to save
     * @param {boolean} createBackup - Whether to create auto-backup
     */
    save(key, data, createBackup = true) {
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(key, serializedData);
            
            // Create auto-backup for critical data
            if (createBackup && this.isCriticalData(key)) {
                this.createAutoBackup(key, data);
            }
            
            // Update last modified timestamp
            localStorage.setItem(`${key}_lastModified`, Date.now().toString());
            
            console.log(`Data saved successfully: ${key}`);
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            
            // Handle quota exceeded error
            if (error.name === 'QuotaExceededError') {
                this.handleStorageQuotaExceeded();
            }
            
            throw error;
        }
    }

    /**
     * Check if data is critical and needs auto-backup
     */
    isCriticalData(key) {
        const criticalKeys = [
            window.CONFIG.STORAGE.workers,
            window.CONFIG.STORAGE.workLogs,
            window.CONFIG.STORAGE.advances,
            window.CONFIG.STORAGE.settings
        ];
        return criticalKeys.includes(key);
    }

    /**
     * Create auto-backup for critical data
     */
    createAutoBackup(key, data) {
        try {
            const backupKey = `autoBackup_${key}`;
            const backupData = {
                data: data,
                timestamp: Date.now(),
                checksum: this.generateChecksum(data)
            };
            
            localStorage.setItem(backupKey, JSON.stringify(backupData));
            
            // Keep only last 3 auto-backups
            this.cleanupOldBackups(key);
        } catch (error) {
            console.warn('Failed to create auto-backup:', error);
        }
    }

    /**
     * Generate simple checksum for data integrity
     */
    generateChecksum(data) {
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    /**
     * Verify data integrity using checksum
     */
    verifyDataIntegrity(data, expectedChecksum) {
        const actualChecksum = this.generateChecksum(data);
        return actualChecksum === expectedChecksum;
    }

    /**
     * Handle storage quota exceeded
     */
    handleStorageQuotaExceeded() {
        console.warn('Storage quota exceeded, attempting cleanup...');
        
        // Try to free up space by removing old backups
        this.cleanupAllOldBackups();
        
        // Show user notification
        if (window.UI) {
            window.UI.showToast(
                'Storage is full. Old backups have been cleaned up. Consider exporting your data.',
                'warning'
            );
        }
    }

    /**
     * Clean up old auto-backups for a specific key
     */
    cleanupOldBackups(key, keepCount = 3) {
        try {
            const backupKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const storageKey = localStorage.key(i);
                if (storageKey && storageKey.startsWith(`autoBackup_${key}_`)) {
                    backupKeys.push(storageKey);
                }
            }
            
            // Sort by timestamp (newest first)
            backupKeys.sort((a, b) => {
                const timestampA = parseInt(a.split('_').pop()) || 0;
                const timestampB = parseInt(b.split('_').pop()) || 0;
                return timestampB - timestampA;
            });
            
            // Remove old backups
            for (let i = keepCount; i < backupKeys.length; i++) {
                localStorage.removeItem(backupKeys[i]);
            }
        } catch (error) {
            console.warn('Failed to cleanup old backups:', error);
        }
    }

    /**
     * Clean up all old auto-backups
     */
    cleanupAllOldBackups() {
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('autoBackup_')) {
                    keysToRemove.push(key);
                }
            }
            
            // Remove oldest backups first
            keysToRemove.sort().slice(0, Math.floor(keysToRemove.length / 2)).forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            console.warn('Failed to cleanup all old backups:', error);
        }
    }

    /**
     * Load data with integrity check
     */
    loadWithIntegrityCheck(key, defaultValue = null) {
        try {
            const data = this.load(key, defaultValue);
            
            // Check if auto-backup exists and verify integrity
            const backupKey = `autoBackup_${key}`;
            const backup = this.load(backupKey, null);
            
            if (backup && backup.checksum) {
                const isDataValid = this.verifyDataIntegrity(data, backup.checksum);
                if (!isDataValid && data !== defaultValue) {
                    console.warn(`Data integrity check failed for ${key}, using backup`);
                    return backup.data;
                }
            }
            
            return data;
        } catch (error) {
            console.error('Error loading data with integrity check:', error);
            return defaultValue;
        }
    }

    /**
     * Get storage usage statistics
     */
    getStorageStats() {
        try {
            let totalSize = 0;
            const itemSizes = {};
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    const value = localStorage.getItem(key);
                    const size = new Blob([value]).size;
                    itemSizes[key] = size;
                    totalSize += size;
                }
            }
            
            // Estimate quota (5MB is common default)
            const estimatedQuota = 5 * 1024 * 1024; // 5MB
            const usagePercentage = (totalSize / estimatedQuota) * 100;
            
            return {
                totalSize,
                itemSizes,
                estimatedQuota,
                usagePercentage: Math.min(usagePercentage, 100),
                itemCount: localStorage.length
            };
        } catch (error) {
            console.error('Error getting storage stats:', error);
            return {
                totalSize: 0,
                itemSizes: {},
                estimatedQuota: 0,
                usagePercentage: 0,
                itemCount: 0
            };
        }
    }

    /**
     * Load data from localStorage
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} - Retrieved data or default value
     */
    load(key, defaultValue = null) {
        if (!this.isAvailable) {
            console.warn('Storage not available, returning default value');
            return defaultValue;
        }

        // Check cache first
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        try {
            const serializedData = localStorage.getItem(key);
            
            if (serializedData === null) {
                return defaultValue;
            }

            const data = JSON.parse(serializedData);
            
            // Update cache
            this.cache.set(key, data);
            
            this.logOperation('load', key, data);
            return data;
        } catch (error) {
            console.error(`Error loading data for key "${key}":`, error);
            return defaultValue;
        }
    }

    /**
     * Remove data from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} - Success status
     */
    remove(key) {
        if (!this.isAvailable) {
            console.error('Storage not available');
            return false;
        }

        try {
            localStorage.removeItem(key);
            this.cache.delete(key);
            
            this.logOperation('remove', key);
            return true;
        } catch (error) {
            console.error(`Error removing data for key "${key}":`, error);
            return false;
        }
    }

    /**
     * Clear all data from localStorage
     * @returns {boolean} - Success status
     */
    clear() {
        if (!this.isAvailable) {
            console.error('Storage not available');
            return false;
        }

        try {
            localStorage.clear();
            this.cache.clear();
            
            this.logOperation('clear');
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }

    /**
     * Get all keys from localStorage
     * @returns {string[]} - Array of keys
     */
    getAllKeys() {
        if (!this.isAvailable) {
            return [];
        }

        try {
            return Object.keys(localStorage);
        } catch (error) {
            console.error('Error getting all keys:', error);
            return [];
        }
    }

    /**
     * Get storage usage information
     * @returns {object} - Storage usage stats
     */
    getStorageInfo() {
        if (!this.isAvailable) {
            return { available: false };
        }

        try {
            let totalSize = 0;
            const keys = this.getAllKeys();
            
            keys.forEach(key => {
                const value = localStorage.getItem(key);
                totalSize += key.length + (value ? value.length : 0);
            });

            return {
                available: true,
                totalKeys: keys.length,
                totalSize: totalSize,
                totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
                estimatedLimit: 5120, // 5MB typical limit
                usagePercentage: Math.round((totalSize / (5 * 1024 * 1024)) * 100)
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return { available: false, error: error.message };
        }
    }

    /**
     * Export all data as JSON
     * @returns {object} - All stored data
     */
    exportAll() {
        const exportData = {
            timestamp: new Date().toISOString(),
            version: window.CONFIG?.APP?.version || '1.0.0',
            data: {}
        };

        try {
            const keys = this.getAllKeys();
            keys.forEach(key => {
                exportData.data[key] = this.load(key);
            });

            return exportData;
        } catch (error) {
            console.error('Error exporting data:', error);
            return null;
        }
    }

    /**
     * Import data from backup
     * @param {object} importData - Data to import
     * @returns {boolean} - Success status
     */
    importAll(importData) {
        if (!importData || !importData.data) {
            console.error('Invalid import data format');
            return false;
        }

        try {
            // Validate data structure
            if (!this.validateImportData(importData)) {
                console.error('Import data validation failed');
                return false;
            }

            // Clear existing data
            this.clear();

            // Import new data
            Object.entries(importData.data).forEach(([key, value]) => {
                this.save(key, value);
            });

            this.logOperation('import', null, importData);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    /**
     * Validate import data structure
     * @param {object} data - Data to validate
     * @returns {boolean} - Validation result
     */
    validateImportData(data) {
        try {
            // Check required fields
            if (!data.timestamp || !data.data) {
                return false;
            }

            // Check if data contains expected keys
            const expectedKeys = Object.values(window.CONFIG?.STORAGE || {});
            const hasValidKeys = expectedKeys.some(key => 
                data.data.hasOwnProperty(key)
            );

            return hasValidKeys;
        } catch (error) {
            console.error('Error validating import data:', error);
            return false;
        }
    }

    /**
     * Create a backup of specific keys
     * @param {string[]} keys - Keys to backup
     * @returns {object} - Backup data
     */
    createBackup(keys = null) {
        const backupKeys = keys || Object.values(window.CONFIG?.STORAGE || {});
        const backup = {
            timestamp: new Date().toISOString(),
            version: window.CONFIG?.APP?.version || '1.0.0',
            keys: backupKeys,
            data: {}
        };

        try {
            backupKeys.forEach(key => {
                const data = this.load(key);
                if (data !== null) {
                    backup.data[key] = data;
                }
            });

            return backup;
        } catch (error) {
            console.error('Error creating backup:', error);
            return null;
        }
    }

    /**
     * Restore from backup
     * @param {object} backup - Backup data
     * @param {boolean} merge - Whether to merge with existing data
     * @returns {boolean} - Success status
     */
    restoreBackup(backup, merge = false) {
        if (!backup || !backup.data) {
            console.error('Invalid backup format');
            return false;
        }

        try {
            if (!merge) {
                // Clear existing data for the keys in backup
                backup.keys?.forEach(key => this.remove(key));
            }

            // Restore data
            Object.entries(backup.data).forEach(([key, value]) => {
                this.save(key, value);
            });

            this.logOperation('restore', null, backup);
            return true;
        } catch (error) {
            console.error('Error restoring backup:', error);
            return false;
        }
    }

    /**
     * Log storage operations (if debugging is enabled)
     * @param {string} operation - Operation type
     * @param {string} key - Storage key
     * @param {any} data - Data involved
     */
    logOperation(operation, key = null, data = null) {
        if (window.CONFIG?.DEV?.logging?.console && window.CONFIG?.DEV?.debug) {
            const logData = {
                timestamp: new Date().toISOString(),
                operation,
                key,
                dataSize: data ? JSON.stringify(data).length : 0
            };
            
            console.log(`[Storage] ${operation.toUpperCase()}:`, logData);
        }
    }

    /**
     * Clean up cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     * @returns {object} - Cache stats
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Create global storage instance
window.Storage = new StorageManager();

// Convenience functions for backward compatibility
window.saveToStorage = (key, data) => window.Storage.save(key, data);
window.getFromStorage = (key, defaultValue) => window.Storage.load(key, defaultValue);
window.removeFromStorage = (key) => window.Storage.remove(key);
window.clearStorage = () => window.Storage.clear(); 