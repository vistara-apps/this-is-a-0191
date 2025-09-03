import React, { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';
import { useAuth } from '../context/AuthContext';
import { ClaimBatch } from '../types';
import { 
  FileText, 
  AlertTriangle, 
  Search, 
  Filter, 
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  Trash2
} from 'lucide-react';

export const Claims: React.FC = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState<ClaimBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'uploadedAt' | 'processedAt' | 'photos'>('uploadedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);

  useEffect(() => {
    const fetchClaims = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { batches, error: batchesError } = await supabaseService.getClaimBatches(user.id);
        
        if (batchesError) {
          throw batchesError;
        }
        
        // Transform data to match our types
        const transformedBatches: ClaimBatch[] = batches.map(batch => ({
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
        
        setBatches(transformedBatches);
      } catch (err) {
        console.error('Error fetching claims:', err);
        setError('Failed to load claims. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClaims();
  }, [user]);

  const handleSort = (field: 'uploadedAt' | 'processedAt' | 'photos') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredBatches = batches
    .filter(batch => {
      // Apply status filter
      if (statusFilter !== 'all' && batch.status !== statusFilter) {
        return false;
      }
      
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          batch.id.toLowerCase().includes(searchLower) ||
          batch.photos.some(photo => 
            photo.name.toLowerCase().includes(searchLower) ||
            photo.damageType.toLowerCase().includes(searchLower) ||
            (photo.locationTag && photo.locationTag.toLowerCase().includes(searchLower))
          )
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      if (sortField === 'uploadedAt') {
        return sortDirection === 'asc'
          ? a.uploadedAt.getTime() - b.uploadedAt.getTime()
          : b.uploadedAt.getTime() - a.uploadedAt.getTime();
      } else if (sortField === 'processedAt') {
        const aTime = a.processedAt ? a.processedAt.getTime() : 0;
        const bTime = b.processedAt ? b.processedAt.getTime() : 0;
        return sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
      } else if (sortField === 'photos') {
        return sortDirection === 'asc'
          ? a.photos.length - b.photos.length
          : b.photos.length - a.photos.length;
      }
      return 0;
    });

  const toggleBatchExpansion = (batchId: string) => {
    setExpandedBatchId(expandedBatchId === batchId ? null : batchId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading claims...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Claims</h3>
        <p className="text-red-700">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Claims</h1>
        <p className="text-white/80 mt-2">
          Manage and view all your claim batches
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-surface rounded-lg shadow-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 text-text-secondary absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search claims..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-text-secondary" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="uploading">Uploading</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
          
          <div>
            <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
              New Claim Batch
            </button>
          </div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-surface rounded-lg shadow-card overflow-hidden">
        {batches.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No Claims Found</h3>
            <p className="text-text-secondary mb-6">
              You haven't created any claim batches yet. Upload photos to get started.
            </p>
            <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
              Upload Photos
            </button>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="p-8 text-center">
            <Search className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No Matching Claims</h3>
            <p className="text-text-secondary">
              No claims match your current search and filters.
            </p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-gray-100 text-text-primary rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-medium text-text-secondary"></th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-text-secondary">Batch ID</th>
                  <th 
                    className="px-6 py-3 text-left text-sm font-medium text-text-secondary cursor-pointer"
                    onClick={() => handleSort('uploadedAt')}
                  >
                    <div className="flex items-center">
                      Date Uploaded
                      {sortField === 'uploadedAt' && (
                        sortDirection === 'asc' ? 
                          <ChevronUp className="w-4 h-4 ml-1" /> : 
                          <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-sm font-medium text-text-secondary cursor-pointer"
                    onClick={() => handleSort('processedAt')}
                  >
                    <div className="flex items-center">
                      Date Processed
                      {sortField === 'processedAt' && (
                        sortDirection === 'asc' ? 
                          <ChevronUp className="w-4 h-4 ml-1" /> : 
                          <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-sm font-medium text-text-secondary cursor-pointer"
                    onClick={() => handleSort('photos')}
                  >
                    <div className="flex items-center">
                      Photos
                      {sortField === 'photos' && (
                        sortDirection === 'asc' ? 
                          <ChevronUp className="w-4 h-4 ml-1" /> : 
                          <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-text-secondary">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-text-secondary">Report</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.map(batch => (
                  <React.Fragment key={batch.id}>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleBatchExpansion(batch.id)}
                          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          {expandedBatchId === batch.id ? (
                            <ChevronUp className="w-5 h-5 text-text-secondary" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-text-secondary" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-primary font-medium">
                        {batch.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-sm text-text-primary">
                        {batch.uploadedAt.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-primary">
                        {batch.processedAt ? batch.processedAt.toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-primary">
                        {batch.photos.length}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          batch.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : batch.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : batch.status === 'error'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                          {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {batch.reportUrl ? (
                          <a 
                            href={batch.reportUrl} 
                            className="text-primary hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Report
                          </a>
                        ) : (
                          <span className="text-text-secondary">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-1 text-text-secondary hover:text-primary transition-colors">
                            <Eye className="w-5 h-5" />
                          </button>
                          {batch.reportUrl && (
                            <button className="p-1 text-text-secondary hover:text-primary transition-colors">
                              <Download className="w-5 h-5" />
                            </button>
                          )}
                          <button className="p-1 text-text-secondary hover:text-red-500 transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded View */}
                    {expandedBatchId === batch.id && (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-4">
                            <h4 className="font-medium text-text-primary">Batch Details</h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm text-text-secondary">Batch ID</p>
                                <p className="text-sm font-medium text-text-primary">{batch.id}</p>
                              </div>
                              <div>
                                <p className="text-sm text-text-secondary">Uploaded</p>
                                <p className="text-sm font-medium text-text-primary">
                                  {batch.uploadedAt.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-text-secondary">Processed</p>
                                <p className="text-sm font-medium text-text-primary">
                                  {batch.processedAt ? batch.processedAt.toLocaleString() : '—'}
                                </p>
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium text-text-primary mb-2">Photos</h5>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                {batch.photos.slice(0, 12).map(photo => (
                                  <div key={photo.id} className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                                    <img 
                                      src={photo.url} 
                                      alt={photo.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                                {batch.photos.length > 12 && (
                                  <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center">
                                    <span className="text-text-secondary">+{batch.photos.length - 12} more</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                              <button className="px-3 py-1.5 text-sm bg-gray-100 text-text-primary rounded-md hover:bg-gray-200 transition-colors">
                                View All Photos
                              </button>
                              {batch.status === 'completed' && !batch.reportUrl && (
                                <button className="px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                                  Generate Report
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

