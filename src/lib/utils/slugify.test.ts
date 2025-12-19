import { slugify, isValidSlug } from './slugify';

describe('slugify', () => {
  it('should convert text to lowercase slug', () => {
    expect(slugify('America 2025')).toBe('america-2025');
  });

  it('should remove special characters', () => {
    expect(slugify('Test & Project!')).toBe('test-project');
    expect(slugify('Hello@World#2024')).toBe('helloworld2024');
  });

  it('should replace spaces with hyphens', () => {
    expect(slugify('My New Project')).toBe('my-new-project');
  });

  it('should handle multiple spaces and hyphens', () => {
    expect(slugify('Test   ---   Project')).toBe('test-project');
  });

  it('should trim leading and trailing hyphens', () => {
    expect(slugify('---test---')).toBe('test');
  });

  it('should use default when slug is empty', () => {
    expect(slugify('!!!')).toBe('project');
    expect(slugify('   ')).toBe('project');
  });

  it('should ensure uniqueness with counter', () => {
    expect(slugify('test', ['test'])).toBe('test-1');
    expect(slugify('test', ['test', 'test-1'])).toBe('test-2');
    expect(slugify('test', ['test', 'test-1', 'test-2'])).toBe('test-3');
  });

  it('should return original slug if unique', () => {
    expect(slugify('unique-slug', ['other-slug'])).toBe('unique-slug');
  });
});

describe('isValidSlug', () => {
  it('should validate correct slugs', () => {
    expect(isValidSlug('my-project')).toBe(true);
    expect(isValidSlug('project-2025')).toBe(true);
    expect(isValidSlug('test')).toBe(true);
  });

  it('should reject invalid slugs', () => {
    expect(isValidSlug('My Project')).toBe(false); // uppercase and spaces
    expect(isValidSlug('project_123')).toBe(false); // underscore
    expect(isValidSlug('project!')).toBe(false); // special character
    expect(isValidSlug('-project')).toBe(false); // leading hyphen
    expect(isValidSlug('project-')).toBe(false); // trailing hyphen
    expect(isValidSlug('')).toBe(false); // empty
  });
});
