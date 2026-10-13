import { z } from 'zod';

export const skinThemeModes = ['SYSTEM', 'LIGHT', 'DARK'] as const;
export const skinStatuses = ['draft', 'published', 'archived'] as const;
export const skinShapes = ['HEXAGON', 'CIRCLE', 'PILL'] as const;

export const BUILT_IN_ICON_IDS = [
  'midnight', 'mono-grey', 'grape-haze', 'grape-deep', 'lagoon',
  'legacy-citrus', 'legacy-ocean', 'legacy-night',
  'paper-light', 'paper-dark', 'citrus-pop', 'ocean-pop', 'royal', 'rose',
  'mint', 'sand', 'slate', 'snow', 'carbon', 'cobalt', 'sunset', 'forest',
  'lavender', 'peach', 'system-auto', 'dynamic-glow',
] as const;

const argbLong = z.number().int().min(0).max(4294967295);

export const skinItemSchema = z.object({
  id: z.string().max(64).optional(),
  name: z.string().min(3).max(32),
  author: z.string().max(32).nullable().optional(),
  description: z.string().max(200).nullable().optional(),
  themeMode: z.enum(skinThemeModes),
  dynamicColor: z.boolean(),
  primary: argbLong.nullable().optional(),
  secondary: argbLong.nullable().optional(),
  gradient: z.boolean().default(true),
  iconPresetId: z.string().max(64),
  iconAdaptTheme: z.boolean().default(true),
  iconFollowDynamic: z.boolean().default(true),
  iconShape: z.enum(skinShapes).default('HEXAGON'),
  featured: z.boolean().default(false),
  status: z.enum(skinStatuses).default('draft'),
});

export type SkinItemForm = z.infer<typeof skinItemSchema>;

export interface SkinItem extends SkinItemForm {
  id: string;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
}

export function validateSkinIcon(iconPresetId: string): string | null {
  if (iconPresetId === 'custom') return null;
  if ((BUILT_IN_ICON_IDS as readonly string[]).includes(iconPresetId)) return null;
  return 'Unknown icon';
}
