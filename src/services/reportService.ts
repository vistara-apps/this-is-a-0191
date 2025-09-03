import { Photo, ClaimBatch } from '../types';
import { supabaseService } from './supabaseService';

interface ReportOptions {
  title?: string;
  includeAllPhotos?: boolean;
  includeDuplicates?: boolean;
  includeLowQuality?: boolean;
  format?: 'pdf' | 'html' | 'json';
}

class ReportService {
  async generateReport(
    photos: Photo[], 
    batchId: string,
    options: ReportOptions = {}
  ): Promise<{ reportUrl: string; error: Error | null }> {
    try {
      // Set default options
      const reportOptions = {
        title: options.title || `Claim Report ${new Date().toLocaleDateString()}`,
        includeAllPhotos: options.includeAllPhotos ?? true,
        includeDuplicates: options.includeDuplicates ?? false,
        includeLowQuality: options.includeLowQuality ?? false,
        format: options.format || 'pdf'
      };
      
      // Filter photos based on options
      let reportPhotos = [...photos];
      
      if (!reportOptions.includeDuplicates) {
        reportPhotos = reportPhotos.filter(photo => !photo.isDuplicate);
      }
      
      if (!reportOptions.includeLowQuality) {
        reportPhotos = reportPhotos.filter(photo => photo.qualityScore >= 70);
      }
      
      // In a real implementation, this would generate a PDF or HTML report
      // For now, we'll simulate the report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock report URL
      const reportUrl = `report_${Date.now()}.${reportOptions.format}`;
      
      // Update the batch with the report URL
      await supabaseService.updateClaimBatch(batchId, {
        reportUrl
      });
      
      return { reportUrl, error: null };
    } catch (error) {
      console.error('Error generating report:', error);
      return {
        reportUrl: '',
        error: error instanceof Error ? error : new Error('Unknown error during report generation')
      };
    }
  }
  
  async getReportsByUser(userId: string): Promise<{ reports: ClaimBatch[]; error: Error | null }> {
    try {
      const { batches, error } = await supabaseService.getClaimBatches(userId);
      
      if (error) {
        throw error;
      }
      
      // Filter batches to only include those with reports
      const reportsWithBatches = batches.filter(batch => batch.report_url);
      
      // Transform to our data model
      const reports = reportsWithBatches.map(batch => ({
        id: batch.id,
        userId: batch.user_id,
        uploadedAt: new Date(batch.uploaded_at),
        processedAt: batch.processed_at ? new Date(batch.processed_at) : undefined,
        status: batch.status,
        reportUrl: batch.report_url,
        photos: batch.photos.map(photo => ({
          id: photo.id,
          url: photo.url,
          name: photo.name,
          size: photo.size,
          aiTags: photo.ai_tags,
          isDuplicate: photo.is_duplicate,
          qualityScore: photo.quality_score,
          damageType: photo.damage_type,
          locationTag: photo.location_tag,
          processedAt: photo.processed_at ? new Date(photo.processed_at) : undefined
        }))
      }));
      
      return { reports, error: null };
    } catch (error) {
      console.error('Error fetching reports:', error);
      return {
        reports: [],
        error: error instanceof Error ? error : new Error('Unknown error fetching reports')
      };
    }
  }
  
  async getReport(reportId: string): Promise<{ report: ClaimBatch | null; error: Error | null }> {
    try {
      const { batch, error } = await supabaseService.getClaimBatch(reportId);
      
      if (error) {
        throw error;
      }
      
      if (!batch || !batch.report_url) {
        return { report: null, error: new Error('Report not found') };
      }
      
      // Transform to our data model
      const report = {
        id: batch.id,
        userId: batch.user_id,
        uploadedAt: new Date(batch.uploaded_at),
        processedAt: batch.processed_at ? new Date(batch.processed_at) : undefined,
        status: batch.status,
        reportUrl: batch.report_url,
        photos: batch.photos.map(photo => ({
          id: photo.id,
          url: photo.url,
          name: photo.name,
          size: photo.size,
          aiTags: photo.ai_tags,
          isDuplicate: photo.is_duplicate,
          qualityScore: photo.quality_score,
          damageType: photo.damage_type,
          locationTag: photo.location_tag,
          processedAt: photo.processed_at ? new Date(photo.processed_at) : undefined
        }))
      };
      
      return { report, error: null };
    } catch (error) {
      console.error('Error fetching report:', error);
      return {
        report: null,
        error: error instanceof Error ? error : new Error('Unknown error fetching report')
      };
    }
  }
}

export const reportService = new ReportService();

