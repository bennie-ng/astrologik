/**
 * Primitive color palette — the raw scales of the design system.
 *
 * Components never import these directly; they consume semantic tokens
 * from `tokens.ts`.
 *
 * Direction: "sơn mài" — Vietnamese lacquerware. Deep crimson lacquer,
 * antique gold leaf, celadon jade, indigo dye (chàm) and porcelain/ink
 * neutrals. Rich and desaturated rather than bright: gold is a precious
 * accent, crimson is deep, surfaces feel like porcelain and lacquer.
 */

export const palette = {
  /** Sơn — deep lacquer crimson. Brand accent, used with restraint. */
  son: {
    50: '#FAF1F0',
    100: '#F3DEDC',
    200: '#E5BCB9',
    300: '#D08F90',
    400: '#B25B60',
    500: '#953C46',
    600: '#7D2D3B',
    700: '#64222F',
    800: '#4C1A25',
    900: '#38131C',
  },

  /** Hoàng kim — antique gold leaf. The precious metal of the UI. */
  gold: {
    50: '#FAF6EA',
    100: '#F2EAD0',
    200: '#E3D5A3',
    300: '#CFB96F',
    400: '#B99B47',
    500: '#A17F2E',
    600: '#856722',
    700: '#67501B',
    800: '#4C3B15',
    900: '#352910',
  },

  /** Ngọc — celadon jade. Auspicious (hoàng đạo) signals. */
  jade: {
    50: '#F0F7F2',
    100: '#DCEDE1',
    200: '#B8D9C3',
    300: '#8ABD9D',
    400: '#5C9C77',
    500: '#3D7E5B',
    600: '#2E6549',
    700: '#25503B',
    800: '#1D3D2E',
    900: '#152C22',
  },

  /** Chàm — indigo dye. Saturday accent, informational. */
  bien: {
    50: '#F1F3F9',
    100: '#E0E4F1',
    200: '#BFC7E1',
    300: '#95A2CB',
    400: '#6C7DB3',
    500: '#4F6096',
    600: '#3F4C79',
    700: '#323C5F',
    800: '#262E48',
    900: '#1B2133',
  },

  /** Mực — porcelain-to-lacquer neutrals. Text, surfaces, borders. */
  ink: {
    0: '#FFFFFF',
    50: '#F6F3EC',
    100: '#EDE8DD',
    200: '#DDD5C6',
    300: '#C2B8A5',
    400: '#988D7C',
    500: '#6F6557',
    600: '#544A40',
    700: '#3E3630',
    800: '#2B2422',
    850: '#231D1D',
    900: '#1C1718',
    950: '#141011',
  },
} as const;
