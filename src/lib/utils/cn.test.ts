import { cn } from './cn';

describe('cn utility', () => {
  it('should merge class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('should handle conditional classes', () => {
    expect(cn('px-4', false && 'py-2', 'bg-blue-500')).toBe('px-4 bg-blue-500');
  });

  it('should merge Tailwind classes with proper precedence', () => {
    expect(cn('bg-blue-500', 'bg-red-500')).toBe('bg-red-500');
  });

  it('should handle arrays of classes', () => {
    expect(cn(['px-4', 'py-2'], 'bg-blue-500')).toBe('px-4 py-2 bg-blue-500');
  });

  it('should handle undefined and null', () => {
    expect(cn('px-4', undefined, null, 'py-2')).toBe('px-4 py-2');
  });

  it('should deduplicate identical classes', () => {
    expect(cn('px-4', 'px-4', 'py-2')).toBe('px-4 py-2');
  });
});
