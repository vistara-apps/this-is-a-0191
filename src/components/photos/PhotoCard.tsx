import React from 'react';
import { AlertTriangle, Copy, CheckCircle, Tag } from 'lucide-react';
import { Photo } from '../../types';

interface PhotoCardProps {
  photo: Photo;
  variant?: 'preview' | 'withTag' | 'flagged';
  onSelect?: (photo: Photo) => void;
  isSelected?: boolean;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ 
  photo, 
  variant = 'preview',
  onSelect,
  isSelected = false
}) => {
  const getDamageTypeColor = (type: Photo['damageType']) => {
    const colors = {
      water: 'bg-blue-100 text-blue-800',
      fire: 'bg-red-100 text-red-800',
      structural: 'bg-yellow-100 text-yellow-800',
      electrical: 'bg-purple-100 text-purple-800',
      wind: 'bg-green-100 text-green-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type];
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div 
      className={`bg-surface rounded-lg shadow-card overflow-hidden transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-accent' : ''
      } ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={() => onSelect && onSelect(photo)}
    >
      {/* Image */}
      <div className="relative aspect-video bg-gray-100">
        <img 
          src={photo.url} 
          alt={photo.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Flags overlay */}
        <div className="absolute top-2 right-2 flex space-x-1">
          {photo.isDuplicate && (
            <div className="bg-orange-500 text-white p-1 rounded-full">
              <Copy className="w-4 h-4" />
            </div>
          )}
          {photo.qualityScore < 70 && (
            <div className="bg-red-500 text-white p-1 rounded-full">
              <AlertTriangle className="w-4 h-4" />
            </div>
          )}
          {photo.qualityScore >= 90 && (
            <div className="bg-green-500 text-white p-1 rounded-full">
              <CheckCircle className="w-4 h-4" />
            </div>
          )}
        </div>

        {isSelected && (
          <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-accent" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* File info */}
        <div>
          <h3 className="font-medium text-text-primary truncate">{photo.name}</h3>
          <p className="text-sm text-text-secondary">
            {(photo.size / 1024 / 1024).toFixed(1)} MB • Quality: 
            <span className={`ml-1 font-medium ${getQualityColor(photo.qualityScore)}`}>
              {photo.qualityScore}%
            </span>
          </p>
        </div>

        {/* Damage type */}
        {variant !== 'preview' && (
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDamageTypeColor(photo.damageType)}`}>
              {photo.damageType.charAt(0).toUpperCase() + photo.damageType.slice(1)} Damage
            </span>
            {photo.locationTag && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                {photo.locationTag}
              </span>
            )}
          </div>
        )}

        {/* AI Tags */}
        {variant === 'withTag' && photo.aiTags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center text-sm text-text-secondary">
              <Tag className="w-4 h-4 mr-1" />
              AI Tags:
            </div>
            <div className="flex flex-wrap gap-1">
              {photo.aiTags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                >
                  {tag}
                </span>
              ))}
              {photo.aiTags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  +{photo.aiTags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Flags */}
        {variant === 'flagged' && (photo.isDuplicate || photo.qualityScore < 70) && (
          <div className="space-y-1">
            {photo.isDuplicate && (
              <div className="flex items-center text-sm text-orange-600">
                <Copy className="w-4 h-4 mr-2" />
                Potential duplicate
              </div>
            )}
            {photo.qualityScore < 70 && (
              <div className="flex items-center text-sm text-red-600">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Low quality image
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};