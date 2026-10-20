# Theme Library (version 1.2)

Sixteen themes in Settings → Theme. Four are free, six are sold one at a time, and six plain colours come as one pack. Pro unlocks all of them.

Mock-ups: https://claude.ai/artifact/YE8nbPCWDmhPNJMxy11pCc

## The themes

| Tier | Themes | Price | Product ID |
|---|---|---|---|
| Free | Floodlights, Light, Pastel, Greyscale | Free | none |
| Paid | Retro 90s | £0.99 | `theme_retro` |
| Paid | Tactics Chalkboard | £0.99 | `theme_chalk` |
| Paid | Sunday League | £0.99 | `theme_sunday` |
| Paid | Night Match | £0.99 | `theme_night` |
| Paid | Golden Boot | £0.99 | `theme_golden` |
| Paid | Classic Programme | £0.99 | `theme_programme` |
| Colour Pack | Ocean, Berry, Crimson, Tangerine, Lemon, Lilac | £2.99 for all six | `theme_colours` |

- **Product type:** all seven products are non-consumables, bought once and kept.
- **Restore Purchases** brings them back.
- **Pro** unlocks every theme in code. There's no RevenueCat entitlement for themes; the app reads the purchase history (`allPurchasedProductIdentifiers`).
- **Paid themes are app-only.** On the website you can try them on, but they don't stay.
- **Greyscale is free on purpose.** It's the option for people who can't tell the colours apart: right, close and wrong differ by shade.
- **Paid themes bring their own heading font** (Bungee, Permanent Marker, Abril Fatface, Alfa Slab One) and a texture behind every screen. Colour Pack themes are colours only.
- **Match iPhone** is a switch above the themes. It flips between Floodlights and Light, and picking any other theme turns it off.

## How it works

| File | What it holds |
|---|---|
| `app/utils/themes.ts` | Every theme: its colours, heading font, corner radius, texture, tier and product. `themeVariables()` maps a theme onto the app's existing CSS variables. |
| `app/stores/appearance.ts` | The chosen theme and the one being tried on. Sets the variables on `<html>`, switches `app-light` and the status bar, and falls back to Floodlights or Light if a purchase is refunded. |
| `app/stores/purchases.ts` | `ownedThemes` (cached as `footballdle-owned-themes`), `ownsThemeProduct()`, `themeProduct()`, `buyTheme()`. Theme products load with the rest. |
| `app/components/shared/ThemeLibrary.vue` | The Settings section: Match iPhone switch, theme cards with mini previews, and the try-on bar with buy buttons. |
| `assets/_app-shell.scss` | New tokens: `--on-primary`, `--on-absent` and `--theme-pattern` (the texture layer behind every screen). |
| `nuxt.config.ts` | The four heading fonts, bundled so the app works offline. |

- **Floodlights and Light** stay in the stylesheet as before, so nobody who ignores the library sees any change.
- **Every other theme** is applied as inline CSS variables on `<html>`. These beat the stylesheet without any specificity fights.
- **Saved choice:** `footballdle-app-theme` holds the theme id. The existing `footballdle-app-appearance` still holds dark, light or system.
- **Trying on:** tapping a locked theme applies it until you pick something else, tap "Back to …", or leave Settings. Buying while trying it on keeps it.
- **Button text:** anything on a `--primary-color` fill now uses `--on-primary`, because some themes have a dark main colour (Lemon's black buttons, Programme's red).

## Tests

- **`tests/themes.test.ts`:** 16 unique themes, with the right products.
  - Text contrast: 7:1 for body text, 3.5:1 for secondary text, 3:1 for tile letters and buttons.
  - Right, close and wrong can be told apart.
  - Every theme sets the same variables.
- **`tests/appearance-store.test.ts`:**
  - Free themes switch on and persist.
  - Trying on locked themes, and buying while trying.
  - The Colour Pack and Pro unlocks.
  - A refund falls back to Floodlights.
  - Paid themes stay app-only.

## App Store Connect and RevenueCat

- **App Store Connect:** 7 non-consumables, set up as in the table above. Each needs:
  - An English (UK) display name and description.
  - A review screenshot of Settings → Theme.
  - A price: £0.99, or £2.99 for the pack.
- **When to submit:** they're in the draft submission with the 1.2 Game Center items, and go to review with the 1.2 build.
- **RevenueCat:** add the 7 products to the catalogue. They go in no entitlement.
- **Pro:** Pro's App Store description can mention themes once 1.1 is out of review. Don't edit it while it's in review.

## Branch and keeping up with 1.2

- **Branch:** built on `feature/themes`, then folded into `feature/the-grid` on 20 Oct 2026: Dan wants one 1.2 release with The Grid and the Theme Library together. `feature/the-grid` is the 1.2 branch and merges into main when 1.1 is approved.
- **Fewer conflicts:** almost all theme code is in new files. The shared files it touches are the theme picker in Settings, the purchases store, the appearance store, `appStore.ts`, `_app-shell.scss`, `nuxt.config.ts`, the version number, and one-line `--on-primary` swaps in a few components.
