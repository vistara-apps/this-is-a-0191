import React from 'react';
import { Photo } from '../../types';
import { CheckCircle, AlertTriangle, Tag, MapPin } from 'lucide-react';

interface PhotoCardProps {
  photo: Photo;
  onClick?: () => void;
  isSelected?: boolean;
  variant?: 'preview' | 'withTag' | 'flagged';
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onClick,
  isSelected = false,
  variant = 'withTag'
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div 
      className={`group relative border rounded-lg overflow-hidden transition-all ${
        isSelected 
          ? 'border-primary ring-2 ring-primary/20' 
          : 'border-gray-200 hover:border-primary/50'
      } ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Image */}
      <div className="aspect-video bg-gray-100 relative">
        <img 
          src={photo.url} 
          alt={photo.name}
          className="w-full h-full object-cover"
        />
        
        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
            <CheckCircle className="w-5 h-5" />
          </div>
        )}
        
        {/* Flags */}
        <div className="absolute top-2 left-2 flex space-x-1">
          {photo.isDuplicate && (
            <div className="bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 text-xs font-medium">
              Duplicate
            </div>
          )}
          {photo.qualityScore < 70 && (
            <div className="bg-red-100 text-red-700 rounded-full px-2 py-0.5 text-xs font-medium">
              Low Quality
            </div>
          )}
        </div>
        
        {/* Damage Type Badge */}
        {variant === 'withTag' && (
          <div className="absolute bottom-2 left-2 bg-black/70 text-white rounded-full px-2 py-0.5 text-xs font-medium">
            {photo.damageType.charAt(0).toUpperCase() + photo.damageType.slice(1)} Damage
          </div>
        )}
        
        {/* Quality Score */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white rounded-full px-2 py-0.5 text-xs font-medium">
          {photo.qualityScore}% Quality
        </div>
      </div>
      
      {/* Info */}
      <div className="p-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-text-primary truncate" title={photo.name}>
            {photo.name.length > 20 ? photo.name.substring(0, 20) + '...' : photo.name}
          </h3>
          <span className="text-xs text-text-secondary">{formatFileSize(photo.size)}</span>
        </div>
        
        {/* Tags */}
        {photo.aiTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {photo.aiTags.slice(0, 3).map((tag, index) => (
              <div key={index} className="flex items-center bg-gray-100 text-text-secondary rounded-full px-2 py-0.5 text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </div>
            ))}
            {photo.aiTags.length > 3 && (
              <div className="bg-gray-100 text-text-secondary rounded-full px-2 py-0.5 text-xs">
                +{photo.aiTags.length - 3} more
              </div>
            )}
          </div>
        )}
        
        {/* Location */}
        {photo.locationTag && (
          <div className="mt-2 flex items-center text-text-secondary text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            {photo.locationTag}
          </div>
        )}
      </div>
    </div>
  );
};

