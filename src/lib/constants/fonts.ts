/**
 * Available Google Fonts for CenterStage presentations
 * These fonts should be preloaded in the presentation frontend
 */
export const AVAILABLE_FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Raleway',
  'Ubuntu',
  'Nunito',
  'Playfair Display',
  'Merriweather',
  'PT Sans',
  'Oswald',
  'Source Sans Pro',
  'Bebas Neue',
] as const;

export type FontFamily = (typeof AVAILABLE_FONTS)[number];

/**
 * Default font family
 */
export const DEFAULT_FONT_FAMILY: FontFamily = 'Inter';
