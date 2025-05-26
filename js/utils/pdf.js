/**
 * PDF Utility Module
 * Handles PDF generation for payslips and reports
 */

class PDFManager {
    constructor() {
        this.defaultSettings = {
            primaryColor: '#14b8a6',
            accentColor: '#0d9488',
            format: 'a4',
            orientation: 'portrait',
            margin: 20
        };
    }

    /**
     * Generate payslip PDF matching the provided image style
     * @param {object} payslipData - Payslip data
     * @param {object} settings - PDF settings
     * @returns {Promise<void>}
     */
    async generatePayslipPDF(payslipData, settings = {}) {
        if (!payslipData) {
            throw new Error('Payslip data is required');
        }

        if (!window.jspdf) {
            throw new Error('jsPDF library not loaded');
        }

        const pdfSettings = { ...this.defaultSettings, ...settings };
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: pdfSettings.orientation,
            unit: 'mm',
            format: pdfSettings.format
        });

        try {
            // Set up colors
            const primaryRGB = this.hexToRgb(pdfSettings.primaryColor);
            
            // Generate PDF content matching the image style
            await this.addPayStubHeader(doc, payslipData, primaryRGB);
            this.addEmployeeInfo(doc, payslipData);
            const yPos = this.addEarningsSection(doc, payslipData, primaryRGB);
            const deductionsYPos = this.addDeductionsSection(doc, payslipData, primaryRGB, yPos);
            const netPayYPos = this.addNetPaySection(doc, payslipData, primaryRGB, deductionsYPos);
            this.addDailyWorkLogSection(doc, payslipData, primaryRGB, netPayYPos);

            // Generate filename
            const filename = this.generateFilename(payslipData);
            
            // Save the PDF
            doc.save(filename);

            return {
                success: true,
                filename: filename,
                size: doc.internal.pageSize
            };

        } catch (error) {
            console.error('Error generating PDF:', error);
            throw new Error(`PDF generation failed: ${error.message}`);
        }
    }

    /**
     * Add Pay Slip header matching the provided image style
     */
    async addPayStubHeader(doc, payslipData, primaryRGB) {
        // Set background color to white
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, 210, 297, 'F');

        // Add company logo if available (optional, left-aligned)
        const settings = window.Storage.load(window.CONFIG.STORAGE.settings, {});
        let logoPresent = false;
        if (settings.companyLogoUrl) {
            try {
                const img = new Image();
                img.src = settings.companyLogoUrl;
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });
                // Add logo to top left
                doc.addImage(img, 'PNG', 20, 10, 24, 24);
                logoPresent = true;
            } catch (error) {
                console.warn('Failed to load company logo:', error);
            }
        }

        // Centered Company Name in primary color
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
        if (logoPresent) {
            // If logo, shift company name slightly right to visually center with logo
            doc.text(payslipData.companyName || 'Company Name', 120, 22, { align: 'center' });
        } else {
            // If no logo, center company name on page
            doc.text(payslipData.companyName || 'Company Name', 105, 22, { align: 'center' });
        }

        // Centered 'PAYSLIP' below company name
        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        if (logoPresent) {
            doc.text('PAYSLIP', 120, 32, { align: 'center' });
        } else {
            doc.text('PAYSLIP', 105, 32, { align: 'center' });
        }
    }

    /**
     * Add employee details and summary in two columns below header
     */
    addEmployeeInfo(doc, payslipData) {
        let yStart = 44;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        // Left column: Employee Details
        doc.text('Employee Details', 20, yStart);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        let y = yStart + 8;
        doc.text(`Name:`, 22, y);
        doc.setFont('helvetica', 'bold');
        doc.text(payslipData.workerName || '', 40, y);
        doc.setFont('helvetica', 'normal');
        y += 7;
        doc.text(`Pay Period:`, 22, y);
        doc.setFont('helvetica', 'bold');
        doc.text(`${this.formatDate(payslipData.weekStart)} to ${this.formatDate(payslipData.weekEnd)}`, 45, y);
        doc.setFont('helvetica', 'normal');
        y += 7;
        doc.text(`Generated:`, 22, y);
        doc.setFont('helvetica', 'bold');
        doc.text(this.formatDate(payslipData.generatedDate), 45, y);

        // Right column: Summary
        let ySum = yStart;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Summary', 120, ySum);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        ySum += 8;
        doc.text('Total Hours:', 122, ySum);
        doc.setFont('helvetica', 'bold');
        doc.text((payslipData.earnings?.totalHours ?? 0).toString(), 155, ySum);
        doc.setFont('helvetica', 'normal');
        ySum += 7;
        doc.text('Total Units:', 122, ySum);
        doc.setFont('helvetica', 'bold');
        doc.text((payslipData.earnings?.totalUnits ?? 0).toString(), 155, ySum);
        doc.setFont('helvetica', 'normal');
        ySum += 7;
        doc.text('Work Days:', 122, ySum);
        doc.setFont('helvetica', 'bold');
        doc.text((payslipData.earnings?.workDays ?? 0).toString(), 155, ySum);

        return Math.max(y, ySum) + 10;
    }

    /**
     * Add earnings section with table matching the image
     */
    addEarningsSection(doc, payslipData, primaryRGB) {
        let yPos = 110;

        // Earnings title
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Earnings', 20, yPos);

        yPos += 10;

        // Create earnings table with teal header
        doc.setFillColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
        doc.rect(20, yPos, 170, 12, 'F');

        // Table headers
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('DESCRIPTION', 25, yPos + 8);
        doc.text('HOURS WORKED', 80, yPos + 8);
        doc.text('RATE', 125, yPos + 8);
        doc.text('AMOUNT', 165, yPos + 8);

        yPos += 12;

        // Earnings rows
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        // Regular Pay
        if (payslipData.earnings.hourly > 0) {
            yPos += 8;
            doc.text('REGULAR PAY', 25, yPos);
            doc.text(payslipData.earnings.totalHours.toString(), 95, yPos, { align: 'center' });
            doc.text(`$${(payslipData.earnings.hourly / payslipData.earnings.totalHours).toFixed(2)}`, 135, yPos, { align: 'center' });
            doc.text(`$${payslipData.earnings.hourly.toFixed(2)}`, 175, yPos, { align: 'right' });
        }

        // Overtime Pay (if applicable)
        if (payslipData.earnings.totalHours > 40) {
            yPos += 8;
            const overtimeHours = payslipData.earnings.totalHours - 40;
            const regularRate = payslipData.earnings.hourly / payslipData.earnings.totalHours;
            const overtimeRate = regularRate * 1.5;
            const overtimePay = overtimeHours * overtimeRate;
            
            doc.text('OVERTIME PAY', 25, yPos);
            doc.text(overtimeHours.toString(), 95, yPos, { align: 'center' });
            doc.text(`$${overtimeRate.toFixed(2)}`, 135, yPos, { align: 'center' });
            doc.text(`$${overtimePay.toFixed(2)}`, 175, yPos, { align: 'right' });
        }

        // Contract/Piece work
        if (payslipData.earnings.contract > 0) {
            yPos += 8;
            doc.text('CONTRACT WORK', 25, yPos);
            doc.text(payslipData.earnings.totalUnits.toString(), 95, yPos, { align: 'center' });
            doc.text(`$${(payslipData.earnings.contract / payslipData.earnings.totalUnits).toFixed(2)}`, 135, yPos, { align: 'center' });
            doc.text(`$${payslipData.earnings.contract.toFixed(2)}`, 175, yPos, { align: 'right' });
        }

        yPos += 15;

        // Total Earnings
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`Total Earnings: $${payslipData.earnings.total.toFixed(2)}`, 20, yPos);

        return yPos + 15;
    }

    /**
     * Add deductions section
     */
    addDeductionsSection(doc, payslipData, primaryRGB, startY) {
        let yPos = startY;

        // Only show deductions if there are any
        if (payslipData.totalDeductions <= 0) {
            return yPos;
        }

        // Deductions title
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Deductions', 20, yPos);

        yPos += 10;

        // Create deductions table with teal header
        doc.setFillColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
        doc.rect(20, yPos, 170, 12, 'F');

        // Table headers
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('DESCRIPTION', 25, yPos + 8);
        doc.text('AMOUNT', 165, yPos + 8);

        yPos += 12;

        // Deductions rows
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        // Weekly Rent (if applicable)
        if (payslipData.weeklyRentDeduction > 0) {
            yPos += 8;
            doc.text('WEEKLY RENT', 25, yPos);
            doc.text(`$${payslipData.weeklyRentDeduction.toFixed(2)}`, 175, yPos, { align: 'right' });
        }

        // Advances (if applicable)
        if (payslipData.totalAdvances > 0) {
            yPos += 8;
            doc.text('ADVANCES', 25, yPos);
            doc.text(`$${payslipData.totalAdvances.toFixed(2)}`, 175, yPos, { align: 'right' });
        }

        // Car Fare (if applicable, as deduction)
        if (payslipData.totalCarFareDeductions > 0) {
            yPos += 8;
            doc.text('CAR FARE', 25, yPos);
            doc.text(`$${payslipData.totalCarFareDeductions.toFixed(2)}`, 175, yPos, { align: 'right' });
        }

        yPos += 15;

        // Total Deductions
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`Total Deductions: $${payslipData.totalDeductions.toFixed(2)}`, 20, yPos);

        return yPos + 15;
    }

    /**
     * Add net pay section
     */
    addNetPaySection(doc, payslipData, primaryRGB, yPos) {
        yPos += 10;

        // Net Pay highlight
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(`Net Pay (Take Home): $${payslipData.netPay.toFixed(2)}`, 20, yPos);

        return yPos + 10;
    }

    /**
     * Add daily work log section with detailed breakdown
     */
    addDailyWorkLogSection(doc, payslipData, primaryRGB, startY) {
        if (!payslipData.workLogs || payslipData.workLogs.length === 0) {
            return startY;
        }

        let yPos = startY + 15;

        // Check if we need a new page
        if (yPos > 220) {
            doc.addPage();
            yPos = 20;
        }

        // Daily Work Log title
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Daily Work Log', 20, yPos);

        yPos += 10;

        // Create work log table with teal header
        doc.setFillColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
        doc.rect(20, yPos, 170, 12, 'F');

        // Table headers
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('DATE', 25, yPos + 8);
        doc.text('HOURS', 55, yPos + 8);
        doc.text('CONTRACT JOB', 75, yPos + 8);
        doc.text('UNITS', 125, yPos + 8);
        doc.text('DAILY EARNINGS', 155, yPos + 8);

        yPos += 12;

        // Work log rows
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);

        payslipData.workLogs.forEach((log, index) => {
            // Check if we need a new page
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
                
                // Re-add headers on new page
                doc.setFillColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
                doc.rect(20, yPos, 170, 12, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.text('DATE', 25, yPos + 8);
                doc.text('HOURS', 55, yPos + 8);
                doc.text('CONTRACT JOB', 75, yPos + 8);
                doc.text('UNITS', 125, yPos + 8);
                doc.text('DAILY EARNINGS', 155, yPos + 8);
                yPos += 12;
                
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
            }

            yPos += 8;

            // Alternate row background
            if (index % 2 === 1) {
                doc.setFillColor(248, 248, 248);
                doc.rect(20, yPos - 6, 170, 8, 'F');
            }

            // Date
            doc.text(this.formatDate(log.date), 25, yPos);
            
            // Hours
            doc.text(log.hours ? log.hours.toString() : '-', 55, yPos);
            
            // Contract Job (truncate if too long)
            const contractJob = log.contractJob || '-';
            const truncatedJob = contractJob.length > 15 ? contractJob.substring(0, 12) + '...' : contractJob;
            doc.text(truncatedJob, 75, yPos);
            
            // Units
            doc.text(log.units ? log.units.toString() : '-', 125, yPos);
            
            // Daily Earnings
            doc.text(`$${(log.dailyEarnings || 0).toFixed(2)}`, 175, yPos, { align: 'right' });
        });

        yPos += 15;

        // Summary row
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('TOTALS:', 25, yPos);
        
        const totalHours = payslipData.workLogs.reduce((sum, log) => sum + (parseFloat(log.hours) || 0), 0);
        const totalUnits = payslipData.workLogs.reduce((sum, log) => sum + (parseFloat(log.units) || 0), 0);
        const totalDailyEarnings = payslipData.workLogs.reduce((sum, log) => sum + (parseFloat(log.dailyEarnings) || 0), 0);
        
        doc.text(totalHours.toFixed(1), 55, yPos);
        doc.text(totalUnits.toFixed(1), 125, yPos);
        doc.text(`$${totalDailyEarnings.toFixed(2)}`, 175, yPos, { align: 'right' });

        return yPos + 10;
    }

    /**
     * Format date for display
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
    }

    /**
     * Generate filename for PDF
     * @param {object} payslipData - Payslip data
     * @returns {string} - Generated filename
     */
    generateFilename(payslipData) {
        const workerName = payslipData.workerName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
        const weekEnd = payslipData.weekEnd.replace(/[^0-9-]/g, '');
        return `payslip_${workerName}_${weekEnd}.pdf`;
    }

    /**
     * Convert hex color to RGB
     * @param {string} hex - Hex color code
     * @returns {object} - RGB values
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 20, g: 184, b: 166 }; // Default teal color
    }

    /**
     * Generate report PDF
     * @param {object} reportData - Report data
     * @param {string} reportType - Type of report
     * @param {object} settings - PDF settings
     * @returns {Promise<void>}
     */
    async generateReportPDF(reportData, reportType, settings = {}) {
        if (!window.jspdf) {
            throw new Error('jsPDF library not loaded');
        }

        const pdfSettings = { ...this.defaultSettings, ...settings };
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: pdfSettings.orientation,
            unit: 'mm',
            format: pdfSettings.format
        });

        try {
            const primaryRGB = this.hexToRgb(pdfSettings.primaryColor);

            // Add report header
            this.addReportHeader(doc, reportType, primaryRGB);

            // Add report content based on type
            switch (reportType) {
                case 'workers':
                    this.addWorkersReport(doc, reportData, primaryRGB);
                    break;
                case 'workLogs':
                    this.addWorkLogsReport(doc, reportData, primaryRGB);
                    break;
                case 'advances':
                    this.addAdvancesReport(doc, reportData, primaryRGB);
                    break;
                default:
                    throw new Error(`Unknown report type: ${reportType}`);
            }

            // Generate filename and save
            const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);

            return {
                success: true,
                filename: filename
            };

        } catch (error) {
            console.error('Error generating report PDF:', error);
            throw new Error(`Report PDF generation failed: ${error.message}`);
        }
    }

    /**
     * Add report header
     * @param {object} doc - jsPDF document
     * @param {string} reportType - Report type
     * @param {object} primaryRGB - Primary color RGB values
     */
    addReportHeader(doc, reportType, primaryRGB) {
        // Header background
        doc.setFillColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
        doc.rect(0, 0, 210, 25, 'F');

        // Report title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        const title = reportType.charAt(0).toUpperCase() + reportType.slice(1) + ' Report';
        doc.text(title, 105, 15, { align: 'center' });

        // Generation date
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35);
    }

    /**
     * Add workers report content
     * @param {object} doc - jsPDF document
     * @param {array} workers - Workers data
     * @param {object} primaryRGB - Primary color RGB values
     */
    addWorkersReport(doc, workers, primaryRGB) {
        let yPos = 50;

        // Table headers
        doc.setFillColor(240, 240, 240);
        doc.rect(20, yPos, 170, 8, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('Name', 25, yPos + 5);
        doc.text('Pay Type', 80, yPos + 5);
        doc.text('Rate', 120, yPos + 5);
        doc.text('Car Fare', 150, yPos + 5);
        doc.text('Rent', 175, yPos + 5);

        yPos += 8;
        doc.setFont('helvetica', 'normal');

        // Worker rows
        workers.forEach(worker => {
            yPos += 6;
            
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }

            doc.text(worker.name.substring(0, 20), 25, yPos);
            doc.text(worker.payType, 80, yPos);
            doc.text(worker.hourlyRate ? `$${worker.hourlyRate}` : '-', 120, yPos);
            doc.text(worker.carFare ? 'Yes' : 'No', 150, yPos);
            doc.text(`$${worker.weeklyRent || 0}`, 175, yPos);
        });
    }

    /**
     * Validate PDF generation requirements
     * @returns {object} - Validation result
     */
    validateRequirements() {
        const requirements = {
            jspdf: !!window.jspdf,
            browser: typeof window !== 'undefined',
            canvas: typeof document !== 'undefined' && !!document.createElement('canvas')
        };

        const allValid = Object.values(requirements).every(req => req);

        return {
            valid: allValid,
            requirements: requirements,
            missing: Object.entries(requirements)
                .filter(([key, value]) => !value)
                .map(([key]) => key)
        };
    }

    /**
     * Get PDF settings from storage
     * @returns {object} - PDF settings
     */
    getSettings() {
        const settings = window.Storage?.load(window.CONFIG?.STORAGE?.settings, {});
        return {
            primaryColor: settings.pdfPrimaryColor || this.defaultSettings.primaryColor,
            accentColor: settings.pdfAccentColor || this.defaultSettings.accentColor,
            companyName: settings.companyName || 'Your Company Name'
        };
    }

    /**
     * Preview PDF content (for debugging)
     * @param {object} payslipData - Payslip data
     * @returns {object} - Preview data
     */
    previewContent(payslipData) {
        return {
            header: {
                companyName: payslipData.companyName,
                title: 'Payslip'
            },
            workerInfo: {
                name: payslipData.workerName,
                period: `${this.formatDate(payslipData.weekStart)} to ${this.formatDate(payslipData.weekEnd)}`
            },
            earnings: payslipData.earningsDetails,
            deductions: payslipData.deductions,
            totals: {
                gross: payslipData.earnings.total,
                deductions: payslipData.totalDeductions,
                net: payslipData.netPay
            }
        };
    }
}

// Create global PDF manager instance
window.PDF = new PDFManager();

// Convenience functions for backward compatibility
window.generatePayslipPDF = (payslipData, settings) => window.PDF.generatePayslipPDF(payslipData, settings);
window.generateReportPDF = (reportData, reportType, settings) => window.PDF.generateReportPDF(reportData, reportType, settings); 