// Pothole Reporting Service
import { PotholeDetection } from '@/types';
import { GPSCoordinates, LocationData, gpsService } from './gpsService';

export interface PotholeReport {
  id: string;
  timestamp: string;
  detection: PotholeDetection;
  location: LocationData;
  reportType: 'automatic' | 'manual';
  status: 'pending' | 'submitted' | 'failed';
  metadata: {
    deviceInfo: string;
    appVersion: string;
    modelUsed: string;
  };
}

class ReportingService {
  private reports: PotholeReport[] = [];
  private reportQueue: PotholeReport[] = [];

  /**
   * Create a pothole report from detection data
   */
  async createReport(
    detection: PotholeDetection,
    reportType: 'automatic' | 'manual' = 'automatic'
  ): Promise<PotholeReport> {
    try {
      // Get current GPS position
      const coordinates = await gpsService.getCurrentPosition();
      
      // Get location data with reverse geocoding
      const location = await gpsService.reverseGeocode(coordinates);
      
      const report: PotholeReport = {
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        detection,
        location,
        reportType,
        status: 'pending',
        metadata: {
          deviceInfo: navigator.userAgent,
          appVersion: '1.0.0',
          modelUsed: detection.detectionAlgorithm || 'YOLOv8'
        }
      };

      this.reports.push(report);
      console.log('[Reporting] Created report:', report.id);
      
      return report;
    } catch (error) {
      console.error('[Reporting] Failed to create report:', error);
      throw error;
    }
  }

  /**
   * Save report to text file (local storage)
   */
  async saveReportToFile(report: PotholeReport): Promise<boolean> {
    try {
      const reportText = this.formatReportAsText(report);
      
      // Save to localStorage with timestamp
      const storageKey = `pothole_report_${report.id}`;
      localStorage.setItem(storageKey, reportText);
      
      // Update report status
      report.status = 'submitted';
      
      console.log('[Reporting] Report saved to local storage:', report.id);
      return true;
    } catch (error) {
      console.error('[Reporting] Failed to save report:', error);
      report.status = 'failed';
      return false;
    }
  }

  /**
   * Download report as text file
   */
  downloadReport(report: PotholeReport): void {
    const reportText = this.formatReportAsText(report);
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `pothole_report_${report.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    console.log('[Reporting] Report downloaded:', report.id);
  }

  /**
   * Download all reports as a single file
   */
  downloadAllReports(): void {
    if (this.reports.length === 0) {
      console.warn('[Reporting] No reports to download');
      return;
    }

    const allReportsText = this.reports
      .map(report => this.formatReportAsText(report))
      .join('\n\n' + '='.repeat(80) + '\n\n');
    
    const blob = new Blob([allReportsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `all_pothole_reports_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    console.log('[Reporting] All reports downloaded');
  }

  /**
   * Format report as readable text
   */
  private formatReportAsText(report: PotholeReport): string {
    return `
POTHOLE DETECTION REPORT
========================

Report ID: ${report.id}
Timestamp: ${report.timestamp}
Report Type: ${report.reportType.toUpperCase()}
Status: ${report.status.toUpperCase()}

DETECTION DETAILS
-----------------
Detection ID: ${report.detection.id}
Time in Video: ${report.detection.timeInVideo?.toFixed(2) || 'N/A'}s
Confidence: ${(report.detection.confidence * 100).toFixed(1)}%
Severity: ${report.detection.severity.toUpperCase()}
Size: ${report.detection.size?.toUpperCase() || 'Unknown'}
Algorithm: ${report.detection.detectionAlgorithm || 'Unknown'}

POTHOLE CHARACTERISTICS
-----------------------
Estimated Depth: ${report.detection.depthEstimate || 'N/A'} cm
Surface Damage: ${report.detection.surfaceDamageEstimate || 'N/A'}%
Distance from Vehicle: ${report.detection.distance || 'N/A'} meters

${report.detection.boundingBox ? `
BOUNDING BOX
------------
X: ${report.detection.boundingBox.x}
Y: ${report.detection.boundingBox.y}
Width: ${report.detection.boundingBox.width}
Height: ${report.detection.boundingBox.height}
` : ''}

LOCATION INFORMATION
--------------------
Latitude: ${report.location.coordinates.latitude}
Longitude: ${report.location.coordinates.longitude}
Accuracy: ${report.location.coordinates.accuracy || 'N/A'} meters
Address: ${report.location.address || 'Address not available'}
Road Name: ${report.location.roadName || 'Unknown road'}
City: ${report.location.city || 'Unknown city'}
State: ${report.location.state || 'Unknown state'}
Country: ${report.location.country || 'Unknown country'}

TECHNICAL METADATA
------------------
Device: ${report.metadata.deviceInfo}
App Version: ${report.metadata.appVersion}
Model Used: ${report.metadata.modelUsed}

Generated by ROADSENSE AI - Pothole Detection System
Generated at: ${new Date().toISOString()}
`;
  }

  /**
   * Get all reports
   */
  getAllReports(): PotholeReport[] {
    return [...this.reports];
  }

  /**
   * Get reports by status
   */
  getReportsByStatus(status: 'pending' | 'submitted' | 'failed'): PotholeReport[] {
    return this.reports.filter(report => report.status === status);
  }

  /**
   * Clear all reports
   */
  clearAllReports(): void {
    this.reports = [];
    this.reportQueue = [];
    
    // Clear from localStorage
    Object.keys(localStorage)
      .filter(key => key.startsWith('pothole_report_'))
      .forEach(key => localStorage.removeItem(key));
    
    console.log('[Reporting] All reports cleared');
  }

  /**
   * Load reports from localStorage
   */
  loadReportsFromStorage(): void {
    const reportKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('pothole_report_'));
    
    console.log(`[Reporting] Loading ${reportKeys.length} reports from storage`);
    
    // Note: This is a simplified version
    // In a real implementation, you'd parse the text back to report objects
  }

  /**
   * Get report statistics
   */
  getReportStatistics() {
    const total = this.reports.length;
    const bySeverity = {
      high: this.reports.filter(r => r.detection.severity === 'high').length,
      medium: this.reports.filter(r => r.detection.severity === 'medium').length,
      low: this.reports.filter(r => r.detection.severity === 'low').length
    };
    const byStatus = {
      pending: this.getReportsByStatus('pending').length,
      submitted: this.getReportsByStatus('submitted').length,
      failed: this.getReportsByStatus('failed').length
    };

    return {
      total,
      bySeverity,
      byStatus
    };
  }
}

export const reportingService = new ReportingService();