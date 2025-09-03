import React, { useState } from 'react';
import { PhotoCard } from './PhotoCard';
import { Photo } from '../../types';
import { Filter, Grid, List } from 'lucide-react';

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
  showFilters = true
}) => {
  const [filter, setFilter] = useState<'all' | 'flagged' | 'duplicates' | 'lowQuality'>('all');
  const [damageFilter, setDamageFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredPhotos = photos.filter(photo => {
    if (filter === 'flagged' && !photo.isDuplicate && photo.qualityScore >= 70) return false;
    if (filter === 'duplicates' && !photo.isDuplicate) return false;
    if (filter === 'lowQuality' && photo.qualityScore >= 70) return false;
    if (damageFilter !== 'all' && photo.damageType !== damageFilter) return false;
    return true;
  });

  const damageTypes = ['all', 'water', 'fire', 'structural', 'electrical', 'wind', 'other'];

  const isSelected = (photo: Photo) => selectedPhotos.some(p => p.id === photo.id);

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className="bg-surface rounded-lg p-4 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-text-secondary" />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Photos ({photos.length})</option>
                <option value="flagged">Flagged ({photos.filter(p => p.isDuplicate || p.qualityScore < 70).length})</option>
                <option value="duplicates">Duplicates ({photos.filter(p => p.isDuplicate).length})</option>
                <option value="lowQuality">Low Quality ({photos.filter(p => p.qualityScore < 70).length})</option>
              </select>
              
              <select 
                value={damageFilter} 
                onChange={(e) => setDamageFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {damageTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Damage Types' : `${type.charAt(0).toUpperCase() + type.slice(1)} Damage`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-100'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-100'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-text-secondary">
        Showing {filteredPhotos.length} of {photos.length} photos
      </div>

      {/* Photo Grid */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
          : "space-y-4"
      }>
        {filteredPhotos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            variant="withTag"
            onSelect={onPhotoSelect}
            isSelected={isSelected(photo)}
          />
        ))}
      </div>

      {filteredPhotos.length === 0 && (
        <div className="text-center py-12">
          <div className="text-text-secondary text-lg">No photos match the current filters</div>
          <button 
            onClick={() => {
              setFilter('all');
              setDamageFilter('all');
            }}
            className="mt-2 text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};