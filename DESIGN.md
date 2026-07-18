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

Five scales named after traditional Vietnamese materials. Each runs 50 (lightest)
to 900 (darkest).

| Scale | Inspiration | Base (500) | Role |
|---|---|---|---|
| `son` | Sơn mài — vermilion lacquer | `#D64533` | Brand & festive accent (Tết red) |
| `gold` | Hoàng kim — gilded wood | `#C98D1B` | Lunar dates, festive highlights |
| `jade` | Ngọc — jade | `#1F9161` | Auspicious (hoàng đạo) signals |
| `bien` | Biển — sea indigo | `#4056C9` | Saturday, informational |
| `ink` | Mực — warm ink | `#837968` | Text, surfaces, borders (warm neutral, 0–950) |

Rules:

- **Primitives are private.** Only `tokens.ts` may import `palette.ts`.
- Warm neutrals (`ink`) instead of pure gray keep the app feeling like paper
  and lacquer rather than an office tool.

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
| `text.lunar` | `gold.700` | `gold.300` | Lunar-calendar figures |
| `accent.solid` | `son.600` | `son.500` | Filled buttons, active tab |
| `accent.gradient` | `son.500→800` | `son.600→900` | Day-detail hero |
| `state.good` | `jade.600` | `jade.300` | Hoàng đạo dot/badge |
| `state.bad` | `ink.400` | `ink.500` | Hắc đạo (muted, never alarming) |
| `weekend.sunday` | `son.600` | `son.300` | Sunday column |
| `weekend.saturday` | `bien.600` | `bien.300` | Saturday column |
| `border.subtle` / `strong` / `ring` | `ink.100/200`, `son.600` | `ink.850/700`, `son.400` | Card borders, focus/today ring |

Semantics worth keeping:

- **Red = festive, not error.** Errors use `state.danger`, applied sparingly.
- **Gold marks the lunar layer** everywhere (dates, tiết khí, mùng 1/rằm) so
  the two calendars are visually separable at a glance.
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

System font stack, single family; hierarchy comes from size/weight only:

| Token | Size / weight | Used for |
|---|---|---|
| `display` | 44–72 / 800 | Hero day number |
| `titleXL` | 26 / 800 | Screen titles ("Tháng 7") |
| `title` | 20 / 700 | Converter result |
| `headline` | 16 / 700 | Card titles, can chi values |
| `body` | 15 / 400 | Copy |
| `label` | 13 / 600 | Pills, tabs, badges |
| `caption` | 12 / 500 | Secondary metadata |
| `micro` | 11 / 600 upper, +0.6 tracking | Column headers, field labels |

## 5. Interface patterns

- **Large-title header** on each screen; the app bar is a whisper
  (micro-caps wordmark + theme toggle), not a heavy branded band.
- **Floating pill tab bar** with the active tab as a filled accent pill.
- **Month grid**: solar number dominant, lunar number small beneath; today =
  accent ring + wash; mùng 1/rằm = gold wash; hoàng đạo = jade dot;
  holidays tint the solar number accent red.
- **Content max-width 560px** so the same layout works phone → desktop web.
