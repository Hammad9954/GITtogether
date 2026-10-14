import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StarRating from '../components/StarRating';

describe('StarRating Component', () => {
  it('renders 5 stars by default', () => {
    const { container } = render(<StarRating value={3} />);
    const stars = container.querySelectorAll('svg');
    expect(stars.length).toBe(5);
  });

  it('triggers onChange when clicked in editable mode', () => {
    const handleChange = vi.fn();
    const { container } = render(<StarRating value={0} onChange={handleChange} editable={true} />);
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(5);

    fireEvent.click(buttons[3]); // click 4th star (value 4)
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it('does not trigger onChange when not editable', () => {
    const handleChange = vi.fn();
    const { container } = render(<StarRating value={3} onChange={handleChange} editable={false} />);
    const buttons = container.querySelectorAll('button');

    fireEvent.click(buttons[2]);
    expect(handleChange).not.toHaveBeenCalled();
  });
});
