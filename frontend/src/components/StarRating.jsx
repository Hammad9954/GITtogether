import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({ value = 5, onChange, editable = false, size = 'md' }) => {
  const [hoverValue, setHoverValue] = useState(0);

  const starSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hoverValue || value) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={!editable}
            aria-label={`${star} star`}
            onClick={() => editable && onChange && onChange(star)}
            onMouseEnter={() => editable && setHoverValue(star)}
            onMouseLeave={() => editable && setHoverValue(0)}
            className={`transition-all duration-150 p-0.5 rounded ${
              editable ? 'hover:scale-110 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#B7FF5A]' : 'cursor-default'
            }`}
          >
            <Star
              className={`${starSize} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-[#1B211B] text-[#282F28]'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
