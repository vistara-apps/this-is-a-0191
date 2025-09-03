import React, { useState, useCallback, useMemo } from 'react';
import { Photo } from '../../types';
import { PhotoCard } from './PhotoCard';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoSelect?: (photo: Photo) => void;
  selectedPhotos?: Photo[];
  showFilters?: boolean;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  onPhotoSelect,
  selectedPhotos = [],
  showFilters = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [damageTypeFilter, setDamageTypeFilter] = useState<string>('all');
  const [qualityFilter, setQualityFilter] = useState<string>('all');
  const [duplicateFilter, setDuplicateFilter] = useState<string>('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setDamageTypeFilter('all');
    setQualityFilter('all');
    setDuplicateFilter('all');
  }, []);

  const filteredPhotos = useMemo(() => {
    return photos.filter(photo => {
      // Apply search filter
      if (searchTerm && !photo.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !photo.aiTags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) &&
          !photo.damageType.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !(photo.locationTag && photo.locationTag.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }
      
      // Apply damage type filter
      if (damageTypeFilter !== 'all' && photo.damageType !== damageTypeFilter) {
        return false;
      }
      
      // Apply quality filter
      if (qualityFilter === 'high' && photo.qualityScore < 80) {
        return false;
      } else if (qualityFilter === 'medium' && (photo.qualityScore < 60 || photo.qualityScore >= 80)) {
        return false;
      } else if (qualityFilter === 'low' && photo.qualityScore >= 60) {
        return false;
      }
      
      // Apply duplicate filter
      if (duplicateFilter === 'duplicates' && !photo.isDuplicate) {
        return false;
      } else if (duplicateFilter === 'unique' && photo.isDuplicate) {
        return false;
      }
      
      return true;
    });
  }, [photos, searchTerm, damageTypeFilter, qualityFilter, duplicateFilter]);

  const isPhotoSelected = useCallback((photo: Photo) => {
    return selectedPhotos.some(p => p.id === photo.id);
  }, [selectedPhotos]);

  return (
    <div className="space-y-4">
      {showFilters && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="relative">
              <Search className="w-5 h-5 text-text-secondary absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search photos..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-64"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  showFilterPanel || damageTypeFilter !== 'all' || qualityFilter !== 'all' || duplicateFilter !== 'all'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-gray-100 text-text-primary hover:bg-gray-200'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5 mr-2" />
                Filters
                {(damageTypeFilter !== 'all' || qualityFilter !== 'all' || duplicateFilter !== 'all') && (
                  <span className="ml-2 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {(damageTypeFilter !== 'all' ? 1 : 0) + 
                     (qualityFilter !== 'all' ? 1 : 0) + 
                     (duplicateFilter !== 'all' ? 1 : 0)}
                  </span>
                )}
              </button>
              
              {(searchTerm || damageTypeFilter !== 'all' || qualityFilter !== 'all' || duplicateFilter !== 'all') && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center px-3 py-2 text-text-secondary hover:text-text-primary"
                >
                  <X className="w-5 h-5 mr-1" />
                  Clear
                </button>
              )}
            </div>
          </div>
          
          {showFilterPanel && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Damage Type
                </label>
                <select
                  value={damageTypeFilter}
                  onChange={(e) => setDamageTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="water">Water Damage</option>
                  <option value="fire">Fire Damage</option>
                  <option value="structural">Structural Damage</option>
                  <option value="electrical">Electrical Damage</option>
                  <option value="wind">Wind Damage</option>
                  <option value="other">Other Damage</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Image Quality
                </label>
                <select
                  value={qualityFilter}
                  onChange={(e) => setQualityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Qualities</option>
                  <option value="high">High Quality (80%+)</option>
                  <option value="medium">Medium Quality (60-79%)</option>
                  <option value="low">Low Quality (&lt;60%)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Duplicates
                </label>
                <select
                  value={duplicateFilter}
                  onChange={(e) => setDuplicateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">Show All</option>
                  <option value="unique">Unique Only</option>
                  <option value="duplicates">Duplicates Only</option>
                </select>
              </div>
            </div>
          )}
        </>
      )}
      
      {filteredPhotos.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No Photos Found</h3>
          <p className="text-text-secondary mb-4">
            No photos match your current filters.
          </p>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-gray-100 text-text-primary rounded-md hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPhotos.map(photo => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onClick={onPhotoSelect ? () => onPhotoSelect(photo) : undefined}
              isSelected={isPhotoSelected(photo)}
            />
          ))}
        </div>
      )}
      
      <div className="text-sm text-text-secondary">
        Showing {filteredPhotos.length} of {photos.length} photos
      </div>
    </div>
  );
};

