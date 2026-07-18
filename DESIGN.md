# Design System — Lịch Vạn Niên

Token-based design system implemented in `apps/mobile/src/design/`.
Components never hard-code colors — they consume **semantic tokens** through
`useTheme()`, which resolves to the light or dark theme (follows the system
scheme, with an in-app override toggle).

```
src/design/
  palette.ts       # primitive color scales (raw hex — never imported by components)
  tokens.ts        # semantic tokens: light & dark themes, spacing, radii, type scale
  ThemeContext.tsx # ThemeProvider + useTheme()
  index.ts         # public API
```

## 1. Primitive palette

**Direction: sơn mài (Vietnamese lacquerware) — premium Asian.** Deep crimson
lacquer instead of bright vermilion, antique gold leaf instead of orange gold,
celadon jade, chàm indigo, and porcelain-to-lacquer neutrals. Everything is
rich and desaturated rather than bright; gold behaves like a precious metal —
small doses, high impact.

Five scales, each running 50 (lightest) to 900 (darkest):

| Scale | Inspiration | Base (500) | Role |
|---|---|---|---|
| `son` | Sơn mài — deep lacquer crimson | `#953C46` | Brand accent, used with restraint |
| `gold` | Hoàng kim — antique gold leaf | `#A17F2E` | Lunar layer, wordmark, gilded details |
| `jade` | Ngọc — celadon jade | `#3D7E5B` | Auspicious (hoàng đạo) signals |
| `bien` | Chàm — indigo dye | `#4F6096` | Saturday, informational |
| `ink` | Mực — porcelain → lacquer | `#6F6557` | Text, surfaces, borders (0–950) |

Rules:

- **Primitives are private.** Only `tokens.ts` may import `palette.ts`.
- Light theme sits on porcelain ivory (`ink.50 #F6F3EC`), dark theme on
  lacquer black (`ink.950 #141011`) — never pure white or pure gray.

## 2. Semantic tokens

Each token exists in light and dark. Highlights (light → dark):

| Token | Light | Dark | Used for |
|---|---|---|---|
| `bg.canvas` | `ink.50` | `ink.950` | App background |
| `bg.surface` | `ink.0` | `ink.900` | Cards, tab bar |
| `bg.elevated` | `ink.100` | `ink.850` | Chips, inputs |
| `bg.accentSoft` | `son.50` | `#3A211B` | Today cell, selected wash |
| `bg.goldSoft` | `gold.100` | `#3A2E14` | Mùng 1 / rằm cells, holiday card |
| `text.primary` | `ink.900` | `ink.100` | Headings, dates |
| `text.secondary` | `ink.600` | `ink.400` | Body copy |
| `text.tertiary` | `ink.400` | `ink.500` | Captions, lunar day numbers |
| `text.accent` | `son.600` | `son.300` | Links, holidays, active states |
| `text.lunar` | `gold.600` | `gold.300` | Lunar figures, wordmark |
| `text.onAccent` | `#FBF7EE` (ivory) | `#F6EDD9` | Text on filled accent — never pure white |
| `accent.solid` | `son.600` | `son.500` | Filled buttons, active tab |
| `accent.gradient` | `son.600→900` | `son.700→#230C12` | Day-detail hero |
| `hero.text` / `soft` / `badge` | gilded ivory / `#D8BD90` / `gold.200` | `#F2E7CE` / `#CBAE7E` / `gold.300` | Type on the hero gradient |
| `state.good` | `jade.600` | `jade.300` | Hoàng đạo dot/badge |
| `state.bad` | `ink.400` | `ink.500` | Hắc đạo (muted, never alarming) |
| `weekend.sunday` | `son.600` | `son.300` | Sunday column |
| `weekend.saturday` | `bien.600` | `bien.300` | Saturday column |
| `border.subtle` / `strong` / `ring` | `ink.100/200`, `son.600` | `ink.850/700`, `son.400` | Card borders, focus/today ring |

Semantics worth keeping:

- **Crimson = brand, not error.** Errors use `state.danger`, applied sparingly.
- **Gold marks the lunar layer** everywhere (dates, tiết khí, mùng 1/rằm,
  wordmark) so the two calendars are visually separable at a glance — and gold
  stays scarce so it keeps its value.
- **Text on crimson is gilded ivory, never pure white** — the warm cast is
  what makes the fills read as lacquer instead of "alert red".
- **Jade = auspicious only.** Hắc đạo is muted neutral, not "bad red" — the
  calendar informs, it doesn't scold.
- Dark mode is not inverted light mode: accents shift ~2 steps lighter
  (`son.600 → son.300`) to hold WCAG AA contrast on dark surfaces.

## 3. Layout & shape

- **Spacing** — 4pt scale: `xs 4 · sm 8 · md 12 · lg 16 · xl 24 · xxl 32`.
- **Radius** — `sm 10 · md 14 · lg 20 · xl 28 · full` (pill). Cards use `lg`,
  hero uses `xl`, buttons/badges use `full`.
- **Elevation** — two shadows only: `card` (subtle, ambient) and `floating`
  (tab bar, hero). Both defined per-theme.

## 4. Typography

Brand typeface: **[Be Vietnam Pro](https://fonts.google.com/specimen/Be+Vietnam+Pro)**
— a Google Font designed in Vietnam with first-class diacritic support. Loaded
via `@expo-google-fonts/be-vietnam-pro` in `App.tsx` (weights 400–800).

Custom fonts on native ignore `fontWeight`, so weight is always expressed by
picking a weight-specific family through the `font` tokens
(`font.regular … font.extrabold`) — components never write `fontWeight` or a
raw family name.

| Token | Size / family | Used for |
|---|---|---|
| `display` | 44–72 / `font.extrabold` | Hero day number |
| `titleXL` | 26 / `font.extrabold` | Screen titles ("Tháng 7") |
| `title` | 20 / `font.bold` | Converter result |
| `headline` | 16 / `font.bold` | Card titles, can chi values |
| `body` | 15 / `font.regular` | Copy |
| `label` | 13 / `font.semibold` | Pills, tabs, badges |
| `caption` | 12 / `font.medium` | Secondary metadata |
| `micro` | 11 / `font.semibold` upper, +0.6 tracking | Column headers, field labels |

## 5. Interface patterns

- **Large-title header** on each screen; the app bar is a whisper
  (micro-caps wordmark + theme toggle), not a heavy branded band.
- **Floating pill tab bar** with the active tab as a filled accent pill.
- **Month grid**: solar number dominant, lunar number small beneath; today =
  accent ring + wash; mùng 1/rằm = gold wash; hoàng đạo = jade dot;
  holidays tint the solar number accent red.
- **Content max-width 560px** so the same layout works phone → desktop web.
