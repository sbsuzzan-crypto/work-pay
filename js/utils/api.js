/**
 * API Utility Module
 * Handles all external API calls, primarily Gemini AI integration
 */

class APIManager {
    constructor() {
        this.baseUrl = window.CONFIG?.API?.gemini?.baseUrl || '';
        this.apiKey = window.CONFIG?.API?.gemini?.apiKey || '';
        this.timeout = window.CONFIG?.API?.gemini?.timeout || 30000;
        this.requestCache = new Map();
    }

    /**
     * Make a request to Gemini API
     * @param {string} prompt - The prompt to send
     * @param {object} options - Request options
     * @returns {Promise<object>} - API response
     */
    async makeGeminiRequest(prompt, options = {}) {
        if (!this.apiKey) {
            throw new Error('Gemini API key not configured');
        }

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: options.temperature || 0.7,
                maxOutputTokens: options.maxTokens || 200,
                topP: options.topP || 0.8,
                topK: options.topK || 40
            }
        };

        // Check cache first
        const cacheKey = this.generateCacheKey(prompt, options);
        if (this.requestCache.has(cacheKey)) {
            return this.requestCache.get(cacheKey);
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            // Validate response structure
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('Invalid API response structure');
            }

            const result = {
                success: true,
                data: data.candidates[0].content.parts[0].text,
                usage: data.usageMetadata || {},
                timestamp: new Date().toISOString()
            };

            // Cache successful responses
            this.requestCache.set(cacheKey, result);
            
            // Clean cache if it gets too large
            if (this.requestCache.size > 100) {
                const firstKey = this.requestCache.keys().next().value;
                this.requestCache.delete(firstKey);
            }

            return result;

        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            
            console.error('Gemini API error:', error);
            throw new Error(`API request failed: ${error.message}`);
        }
    }

    /**
     * Generate task suggestions based on project description
     * @param {string} projectDescription - Description of the project
     * @returns {Promise<string[]>} - Array of task suggestions
     */
    async generateTaskSuggestions(projectDescription) {
        if (!projectDescription || projectDescription.trim().length < 3) {
            throw new Error('Project description is too short');
        }

        const prompt = `Based on this project description: "${projectDescription}", suggest 3-5 common task descriptions that workers might perform. Return only a JSON array of strings, no other text. Example: ["Task 1", "Task 2", "Task 3"]`;

        try {
            const response = await this.makeGeminiRequest(prompt, {
                temperature: 0.7,
                maxTokens: 200
            });

            // Parse the JSON response
            const suggestions = JSON.parse(response.data);
            
            if (!Array.isArray(suggestions)) {
                throw new Error('Invalid response format');
            }

            // Validate and clean suggestions
            const cleanSuggestions = suggestions
                .filter(suggestion => typeof suggestion === 'string' && suggestion.trim().length > 0)
                .map(suggestion => suggestion.trim())
                .slice(0, 5); // Limit to 5 suggestions

            if (cleanSuggestions.length === 0) {
                throw new Error('No valid suggestions generated');
            }

            return cleanSuggestions;

        } catch (error) {
            console.error('Error generating task suggestions:', error);
            
            // Return fallback suggestions based on common project types
            return this.getFallbackTaskSuggestions(projectDescription);
        }
    }

    /**
     * Generate payslip explanation
     * @param {object} payslipData - Payslip data to explain
     * @returns {Promise<string>} - Human-readable explanation
     */
    async generatePayslipExplanation(payslipData) {
        if (!payslipData || !payslipData.worker) {
            throw new Error('Invalid payslip data');
        }

        const payslipSummary = this.formatPayslipForAI(payslipData);
        
        const prompt = `Please explain this payslip in simple, worker-friendly language. Focus on how the pay was calculated and what each deduction means. Keep it concise and easy to understand:\n\n${payslipSummary}`;

        try {
            const response = await this.makeGeminiRequest(prompt, {
                temperature: 0.3,
                maxTokens: 300
            });

            return response.data;

        } catch (error) {
            console.error('Error generating payslip explanation:', error);
            
            // Return fallback explanation
            return this.getFallbackPayslipExplanation(payslipData);
        }
    }

    /**
     * Format payslip data for AI processing
     * @param {object} payslipData - Payslip data
     * @returns {string} - Formatted summary
     */
    formatPayslipForAI(payslipData) {
        const { worker, weekStart, weekEnd, earningsDetails, totalGrossEarnings, deductions, totalDeductions, netPay } = payslipData;

        let summary = `Worker: ${worker.name}\n`;
        summary += `Pay Period: ${weekStart} to ${weekEnd}\n`;
        summary += `Gross Earnings: $${totalGrossEarnings.toFixed(2)}\n`;
        summary += `Total Deductions: $${totalDeductions.toFixed(2)}\n`;
        summary += `Net Pay: $${netPay.toFixed(2)}\n\n`;

        if (earningsDetails.length > 0) {
            summary += `Earnings breakdown:\n`;
            earningsDetails.forEach(earning => {
                summary += `- ${earning.date}: ${earning.description} = $${earning.amount.toFixed(2)}\n`;
            });
            summary += '\n';
        }

        if (deductions.length > 0) {
            summary += `Deductions:\n`;
            deductions.forEach(deduction => {
                summary += `- ${deduction.description}: $${deduction.amount.toFixed(2)}\n`;
            });
        }

        return summary;
    }

    /**
     * Get fallback task suggestions when AI fails
     * @param {string} projectDescription - Project description
     * @returns {string[]} - Fallback suggestions
     */
    getFallbackTaskSuggestions(projectDescription) {
        const description = projectDescription.toLowerCase();
        
        // Common task suggestions based on keywords
        if (description.includes('construction') || description.includes('building')) {
            return ['Site preparation', 'Material handling', 'Equipment operation', 'Safety inspection', 'Cleanup'];
        }
        
        if (description.includes('farm') || description.includes('agriculture') || description.includes('harvest')) {
            return ['Planting', 'Harvesting', 'Equipment maintenance', 'Irrigation setup', 'Crop inspection'];
        }
        
        if (description.includes('warehouse') || description.includes('storage')) {
            return ['Inventory management', 'Loading/unloading', 'Order picking', 'Quality control', 'Equipment operation'];
        }
        
        if (description.includes('cleaning') || description.includes('maintenance')) {
            return ['General cleaning', 'Equipment maintenance', 'Supply restocking', 'Inspection', 'Repair work'];
        }
        
        // Generic fallback
        return ['General labor', 'Setup work', 'Maintenance tasks', 'Quality control', 'Cleanup'];
    }

    /**
     * Get fallback payslip explanation when AI fails
     * @param {object} payslipData - Payslip data
     * @returns {string} - Fallback explanation
     */
    getFallbackPayslipExplanation(payslipData) {
        const { totalGrossEarnings, totalDeductions, netPay } = payslipData;
        
        let explanation = `This payslip shows your earnings for the pay period. `;
        explanation += `Your total gross earnings were $${totalGrossEarnings.toFixed(2)}. `;
        
        if (totalDeductions > 0) {
            explanation += `After deductions of $${totalDeductions.toFixed(2)}, `;
        }
        
        explanation += `your net pay is $${netPay.toFixed(2)}. `;
        explanation += `This is the amount you will receive.`;
        
        return explanation;
    }

    /**
     * Generate cache key for requests
     * @param {string} prompt - Request prompt
     * @param {object} options - Request options
     * @returns {string} - Cache key
     */
    generateCacheKey(prompt, options) {
        const keyData = {
            prompt: prompt.substring(0, 100), // Limit prompt length for key
            temperature: options.temperature || 0.7,
            maxTokens: options.maxTokens || 200
        };
        
        return btoa(JSON.stringify(keyData));
    }

    /**
     * Clear request cache
     */
    clearCache() {
        this.requestCache.clear();
    }

    /**
     * Get cache statistics
     * @returns {object} - Cache stats
     */
    getCacheStats() {
        return {
            size: this.requestCache.size,
            keys: Array.from(this.requestCache.keys()).slice(0, 5) // Show first 5 keys
        };
    }

    /**
     * Test API connectivity
     * @returns {Promise<boolean>} - Connection status
     */
    async testConnection() {
        try {
            const response = await this.makeGeminiRequest('Hello', {
                maxTokens: 10
            });
            
            return response.success;
        } catch (error) {
            console.error('API connection test failed:', error);
            return false;
        }
    }

    /**
     * Set API key
     * @param {string} apiKey - New API key
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        this.clearCache(); // Clear cache when API key changes
    }

    /**
     * Get API status
     * @returns {object} - API status information
     */
    getStatus() {
        return {
            configured: !!this.apiKey,
            baseUrl: this.baseUrl,
            timeout: this.timeout,
            cacheSize: this.requestCache.size
        };
    }

    /**
     * Validate API response
     * @param {object} response - API response to validate
     * @returns {boolean} - Validation result
     */
    validateResponse(response) {
        return response && 
               response.candidates && 
               Array.isArray(response.candidates) && 
               response.candidates.length > 0 &&
               response.candidates[0].content &&
               response.candidates[0].content.parts &&
               Array.isArray(response.candidates[0].content.parts) &&
               response.candidates[0].content.parts.length > 0;
    }

    /**
     * Handle API errors
     * @param {Error} error - Error object
     * @returns {string} - User-friendly error message
     */
    handleError(error) {
        if (error.message.includes('timeout')) {
            return 'Request timed out. Please try again.';
        }
        
        if (error.message.includes('401')) {
            return 'Invalid API key. Please check your configuration.';
        }
        
        if (error.message.includes('403')) {
            return 'API access forbidden. Please check your permissions.';
        }
        
        if (error.message.includes('429')) {
            return 'Too many requests. Please wait a moment and try again.';
        }
        
        if (error.message.includes('500')) {
            return 'Server error. Please try again later.';
        }
        
        return 'An error occurred. Please try again.';
    }
}

// Create global API manager instance
window.API = new APIManager();

// Convenience functions for backward compatibility
window.generateTaskSuggestions = (description) => window.API.generateTaskSuggestions(description);
window.generatePayslipExplanation = (payslipData) => window.API.generatePayslipExplanation(payslipData); 