// Generated from Android IconCatalog — mirrors the shipped preset colors.
// Regenerate when adding presets.
export interface IconPalette { rim: string; bodyStart: string; bodyEnd: string; disc: string; }

export const ICON_PALETTES: Record<string, IconPalette> = {
  'grape-haze': { rim: '#DFBCFF', bodyStart: '#8534CE', bodyEnd: '#D5B9EE', disc: '#FFFFFF' },
  'grape-deep': { rim: '#9D8AAE', bodyStart: '#370068', bodyEnd: '#130024', disc: '#BEBEBE' },
  'lagoon': { rim: '#4CB3AE', bodyStart: '#00393F', bodyEnd: '#002925', disc: '#74DFD5' },
  'mono-grey': { rim: '#BEBEBE', bodyStart: '#444444', bodyEnd: '#232323', disc: '#FFFFFF' },
  'midnight': { rim: '#4A4A4A', bodyStart: '#000000', bodyEnd: '#3A3A42', disc: '#FFFFFF' },
  'legacy-citrus': { rim: '#FFDCC6', bodyStart: '#CC5A17', bodyEnd: '#7A3408', disc: '#FFFFFF' },
  'legacy-ocean': { rim: '#B7F1EA', bodyStart: '#0C7E78', bodyEnd: '#06403D', disc: '#FFFFFF' },
  'legacy-night': { rim: '#FFB785', bodyStart: '#100D0B', bodyEnd: '#3A2415', disc: '#FFB785' },
  'paper-light': { rim: '#CC5A17', bodyStart: '#FCF9F6', bodyEnd: '#E3D2BE', disc: '#CC5A17' },
  'paper-dark': { rim: '#FBF8FF', bodyStart: '#1B1B1F', bodyEnd: '#000000', disc: '#FBF8FF' },
  'citrus-pop': { rim: '#FFDCC6', bodyStart: '#FF6D00', bodyEnd: '#CC5A17', disc: '#FFFFFF' },
  'ocean-pop': { rim: '#00201D', bodyStart: '#00BFA5', bodyEnd: '#0C7E78', disc: '#00201D' },
  'royal': { rim: '#D8E7FF', bodyStart: '#2968C8', bodyEnd: '#001B3F', disc: '#FFFFFF' },
  'rose': { rim: '#FFD9E2', bodyStart: '#C81E5B', bodyEnd: '#7A0F36', disc: '#FFFFFF' },
  'mint': { rim: '#B7F1EA', bodyStart: '#0F5132', bodyEnd: '#07271A', disc: '#B7F1EA' },
  'sand': { rim: '#5C4A32', bodyStart: '#E8DCC8', bodyEnd: '#C2AF8E', disc: '#5C4A32' },
  'slate': { rim: '#9AA3B2', bodyStart: '#2B2F36', bodyEnd: '#121419', disc: '#EDF0F4' },
  'snow': { rim: '#1B1B1F', bodyStart: '#FFFFFF', bodyEnd: '#D7DCE4', disc: '#1B1B1F' },
  'carbon': { rim: '#3A3A42', bodyStart: '#101014', bodyEnd: '#33333E', disc: '#EDEDF2' },
  'cobalt': { rim: '#7F9CFF', bodyStart: '#1A2340', bodyEnd: '#0B1030', disc: '#FFFFFF' },
  'sunset': { rim: '#7A1E3C', bodyStart: '#FF8A3D', bodyEnd: '#C81E5B', disc: '#FFFFFF' },
  'forest': { rim: '#95D5B2', bodyStart: '#1B4332', bodyEnd: '#0A1F16', disc: '#D8F3DC' },
  'lavender': { rim: '#7B2FBE', bodyStart: '#E6DEF7', bodyEnd: '#BFA8E6', disc: '#7B2FBE' },
  'peach': { rim: '#CC5A17', bodyStart: '#FFDCC6', bodyEnd: '#F0A878', disc: '#CC5A17' },
  'crimson': { rim: '#FFD9DE', bodyStart: '#B42346', bodyEnd: '#5F1023', disc: '#FFFFFF' },
  'ember': { rim: '#FFE3C2', bodyStart: '#E8590C', bodyEnd: '#7A2E0E', disc: '#FFFFFF' },
  'arctic': { rim: '#0B3B4F', bodyStart: '#E8F4F8', bodyEnd: '#A9CBD9', disc: '#0B3B4F' },
  'dusk': { rim: '#A78BFA', bodyStart: '#2E1A5E', bodyEnd: '#100826', disc: '#EDE9FE' },
  'moss': { rim: '#A8D5BA', bodyStart: '#1E4D3B', bodyEnd: '#0A241C', disc: '#C7F0D8' },
  'amber': { rim: '#7A4A00', bodyStart: '#FFB703', bodyEnd: '#FB8500', disc: '#402E00' },
  'bubblegum': { rim: '#FFE3EE', bodyStart: '#F06292', bodyEnd: '#AD1457', disc: '#FFFFFF' },
  'tangerine': { rim: '#5D3A00', bodyStart: '#FFA726', bodyEnd: '#FB8C00', disc: '#402600' },
  'lime': { rim: '#2E4400', bodyStart: '#9BC53D', bodyEnd: '#4C6A00', disc: '#FFFFFF' },
  'teal-pop': { rim: '#00332E', bodyStart: '#2DD4BF', bodyEnd: '#0F766E', disc: '#00332E' },
  'sky': { rim: '#0C4A6E', bodyStart: '#E0F2FE', bodyEnd: '#7DD3FC', disc: '#0C4A6E' },
  'indigo-pop': { rim: '#E0E7FF', bodyStart: '#6366F1', bodyEnd: '#3730A3', disc: '#FFFFFF' },
  'violet-haze': { rim: '#4C1D95', bodyStart: '#F3E8FF', bodyEnd: '#C4B5FD', disc: '#4C1D95' },
  'mocha': { rim: '#D7CCC8', bodyStart: '#4E342E', bodyEnd: '#211512', disc: '#EFDCD2' },
  'olive': { rim: '#A8BD6E', bodyStart: '#556B2F', bodyEnd: '#2A3500', disc: '#F1F5D6' },
  'rose-gold': { rim: '#7A4A2E', bodyStart: '#F7D8C4', bodyEnd: '#E8A87C', disc: '#7A4A2E' },
  'storm': { rim: '#616161', bodyStart: '#757575', bodyEnd: '#212121', disc: '#FFFFFF' },
  'crimson-deep': { rim: '#FF8A80', bodyStart: '#7F1D1D', bodyEnd: '#2A0808', disc: '#FFD9DE' },
  'system-auto': { rim: '#DFBCFF', bodyStart: '#8534CE', bodyEnd: '#D5B9EE', disc: '#FFFFFF' },
  'dynamic-glow': { rim: '#D8E2FF', bodyStart: '#2962FF', bodyEnd: '#1B3FA8', disc: '#FFFFFF' },
};

export function paletteFor(presetId: string): IconPalette {
  return ICON_PALETTES[presetId] ?? { rim: '#DFBCFF', bodyStart: '#8534CE', bodyEnd: '#D5B9EE', disc: '#FFFFFF' };
}
