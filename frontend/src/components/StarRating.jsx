import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({ value = 5, onChange, editable = false, size = 'md' }) => {
  const [hoverValue, setHoverValue] = useState(0);

  const starSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hoverValue || value) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={!editable}
            onClick={() => editable && onChange && onChange(star)}
            onMouseEnter={() => editable && setHoverValue(star)}
            onMouseLeave={() => editable && setHoverValue(0)}
            className={`transition-transform ${
              editable ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
            }`}
          >
            <Star
              className={`${starSize} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-slate-100 text-slate-300 dark:fill-slate-800 dark:text-slate-700'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
