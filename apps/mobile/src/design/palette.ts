/**
 * Primitive color palette — the raw scales of the design system.
 *
 * Components never import these directly; they consume semantic tokens
 * from `tokens.ts`. Scales are named after traditional Vietnamese
 * materials: son (vermilion lacquer), hoàng kim (gold), ngọc (jade),
 * mực (ink) and biển (sea indigo).
 */

export const palette = {
  /** Sơn — vermilion red. Brand + festive accent (Tết red). */
  son: {
    50: '#FDF3F1',
    100: '#FBE3DF',
    200: '#F7C5BD',
    300: '#EF998C',
    400: '#E56A58',
    500: '#D64533',
    600: '#B93425',
    700: '#97281D',
    800: '#7A211A',
    900: '#5C1813',
  },

  /** Hoàng kim — gold. Lunar dates, festive highlights. */
  gold: {
    50: '#FDF8EC',
    100: '#FAEFD3',
    200: '#F4DCA4',
    300: '#EBC46F',
    400: '#E0A93F',
    500: '#C98D1B',
    600: '#A67114',
    700: '#815610',
    800: '#5F3F0E',
    900: '#422B0A',
  },

  /** Ngọc — jade green. Auspicious (hoàng đạo) signals. */
  jade: {
    50: '#EFFAF4',
    100: '#D7F2E4',
    200: '#A9E3C6',
    300: '#6FCCA2',
    400: '#3BAF7E',
    500: '#1F9161',
    600: '#15754E',
    700: '#115C3F',
    800: '#0E4732',
    900: '#0A3325',
  },

  /** Biển — sea indigo. Saturday accent, informational. */
  bien: {
    50: '#F0F3FD',
    100: '#DFE6FA',
    200: '#BCC9F2',
    300: '#8FA3E7',
    400: '#5B72E3',
    500: '#4056C9',
    600: '#3346A8',
    700: '#283784',
    800: '#1F2A64',
    900: '#161E47',
  },

  /** Mực — warm ink neutrals. Text, surfaces, borders. */
  ink: {
    0: '#FFFFFF',
    50: '#FAF7F2',
    100: '#F3EEE6',
    200: '#E7DFD3',
    300: '#D3C8B8',
    400: '#A99E8D',
    500: '#837968',
    600: '#615849',
    700: '#4A4238',
    800: '#322C24',
    850: '#2A241C',
    900: '#201B15',
    950: '#16120D',
  },
} as const;
