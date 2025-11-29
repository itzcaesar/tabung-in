import { describe, it, expect } from 'vitest';
import {
  cn,
  formatCurrency,
  formatDate,
  formatPercent,
  calculatePercentage,
} from '@/lib/utils';

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('merges tailwind classes correctly', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });
});

describe('formatCurrency', () => {
  it('formats IDR correctly', () => {
    const result = formatCurrency(1234567);
    expect(result).toContain('Rp');
    expect(result).toContain('1.234.567');
  });

  it('handles zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('Rp');
    expect(result).toContain('0');
  });

  it('handles negative numbers', () => {
    const result = formatCurrency(-500000);
    expect(result).toContain('Rp');
    expect(result).toContain('500.000');
  });
});

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2024-03-15');
    const formatted = formatDate(date);
    expect(formatted).toContain('Mar');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2024');
  });

  it('handles string dates', () => {
    const formatted = formatDate('2024-06-01');
    expect(formatted).toContain('Jun');
  });
});

describe('formatPercent', () => {
  it('formats percentage correctly', () => {
    expect(formatPercent(0.5)).toBe('50%');
    expect(formatPercent(0.333)).toBe('33%');
    expect(formatPercent(1)).toBe('100%');
  });
});

describe('calculatePercentage', () => {
  it('calculates percentage correctly', () => {
    expect(calculatePercentage(50, 100)).toBe(50);
    expect(calculatePercentage(25, 100)).toBe(25);
  });

  it('handles division by zero', () => {
    expect(calculatePercentage(50, 0)).toBe(0);
  });

  it('caps at 100%', () => {
    expect(calculatePercentage(150, 100)).toBe(100);
  });
});
