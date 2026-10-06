# iOS App Store setup

The iOS app is the same Nuxt code wrapped in [Capacitor](https://capacitorjs.com).
It's built in the cloud by [Codemagic](https://codemagic.io), so no local Xcode is needed.

## How it fits together

| Piece | What it is |
|---|---|
| `APP_TARGET=ios` | Build flag in `nuxt.config.ts`. Produces a client-only bundle with no AdSense, Buy Me a Coffee or Google Analytics |
| `capacitor.config.ts` | App ID (`uk.co.footballdle.app`), name, and where the web build lives |
| `ios/` | The native Xcode project. Committed to git. `ios/App/App/public` is generated, so it's ignored |
| `codemagic.yaml` | Cloud build: install → build web → sync → sign → upload to TestFlight |
| `app/utils/appStore.ts` | Product, entitlement and leaderboard IDs |
| `app/stores/purchases.ts` | RevenueCat purchases (Pro, tips, restore) |
| `ios/App/App/GameCenterPlugin.swift` | Our own Game Center bridge (no maintained Capacitor 8 plugin exists) |

The website build (`yarn build` / `yarn generate`) is unchanged.

### Commands

```bash
yarn dev          # normal web dev, which is where 90% of the work happens
yarn build:app    # app bundle into .output/public
yarn cap:sync     # build:app + copy into the iOS project
```

---

## Your setup checklist

Do these in order. Steps 1–6 get a build onto your phone.

### 1. Apple Developer Program (£79 / $99 a year)

- Enrol at https://developer.apple.com/programs/enroll/ with your Apple ID.
- **Individual** is fine. Your own name shows as the seller on the App Store.
  **Organisation** shows a company name but needs a D-U-N-S number and takes longer.
- Approval can take from a few hours to a couple of days.

### 2. Register the Bundle ID

[developer.apple.com/account](https://developer.apple.com/account) → **Certificates, IDs & Profiles** → **Identifiers** → **+**

- Type: **App IDs** → **App**
- Description: `Footballdle`
- Bundle ID: **Explicit**, `uk.co.footballdle.app` (must match `capacitor.config.ts` exactly)
- Capabilities: tick **Game Center**. In-App Purchase is on by default.

### 3. Create the app in App Store Connect

[appstoreconnect.apple.com](https://appstoreconnect.apple.com) → **Apps** → **+** → **New App**

- Platform: iOS
- Name: `Footballdle`. App Store names are unique, so if it's taken try something like `Footballdle: Football Wordle`
- Primary language: English (UK)
- Bundle ID: pick `uk.co.footballdle.app`
- SKU: anything, e.g. `footballdle-ios`

Then go to **App Information** and copy the numeric **Apple ID** (e.g. `6741234567`).
Put it in `codemagic.yaml` in place of `APP_STORE_APPLE_ID: 0000000000`.

### 4. App Store Connect API key (lets Codemagic sign and upload)

App Store Connect → **Users and Access** → **Integrations** → **App Store Connect API** → **Team Keys** → **+**

- Name: `Codemagic`, Access: **App Manager**
- Download the `.p8` file. **You can only download it once.** Keep it somewhere safe and never commit it.
- Note the **Issuer ID** (top of the page) and the **Key ID**.

### 5. Codemagic

1. Sign up at https://codemagic.io with your GitHub account and add the `footballdle` repo.
2. **Team settings → Integrations → Developer Portal → Connect**
   - Name it exactly **`Footballdle ASC`** (that's what `codemagic.yaml` refers to)
   - Paste the Issuer ID and Key ID, and upload the `.p8`
3. **Team settings → codemagic.yaml settings → Code signing identities**
   - **iOS certificates** → generate an **Apple Distribution** certificate using the key above
   - **iOS provisioning profiles** → fetch the **App Store** profile for `uk.co.footballdle.app`
     (create it first under Certificates, IDs & Profiles → Profiles if it isn't listed)

The free tier gives you a monthly allowance of Mac build minutes. Builds only run when you
start them manually, so pushes don't eat your minutes.

### 6. First build → your phone

1. Codemagic → your app → **Start new build** → branch `feature/ios-app` (or `main` once merged) → workflow **iOS → TestFlight**.
2. Takes about 10–20 minutes. Afterwards App Store Connect processes the build for another 5–30 minutes.
3. App Store Connect → your app → **TestFlight** → **Internal Testing** → create a group and add yourself.
4. Install the **TestFlight** app on your iPhone and install Footballdle from there.

If the build fails, the log is in Codemagic. Paste it to Claude and get roasted accordingly.

### 7. App icon

The project has Capacitor's placeholder icon. You need a **1024×1024 PNG with no transparency
and no rounded corners** (Apple adds the rounding). The 512px Android icon is too small.
Drop it in the repo and it gets wired in.

### 8. Money stuff (needed before in-app purchases work)

App Store Connect → **Business** (Agreements, Tax, and Banking):

- Accept the **Paid Apps Agreement**
- Add bank details and complete the tax forms (UK residents still fill in the US W-8BEN)
- Apply for the **App Store Small Business Program**, which cuts Apple's cut from 30% to 15%: https://developer.apple.com/app-store/small-business-program/

IAP products won't load in the app until the agreement is **Active**.

### 9. In-app purchases (App Store Connect)

App Store Connect → your app → **Monetization → In-App Purchases** → **+**. IDs must match `app/utils/appStore.ts` exactly.

| Type | Reference name | Product ID | Suggested price |
|---|---|---|---|
| Non-Consumable | Footballdle Pro (unlimited hints) | `footballdle_pro` | £4.99 |
| Consumable | 1 Hint | `footballdle_hint_1` | £0.49 |
| Consumable | 5 Hints | `footballdle_hints_5` | £1.49 |
| Consumable | 15 Hints | `footballdle_hints_15` | £2.99 |
| Consumable | Small Tip | `footballdle_tip_small` | £0.99 |
| Consumable | Medium Tip | `footballdle_tip_medium` | £2.99 |
| Consumable | Large Tip | `footballdle_tip_large` | £4.99 |

For each one, add an English (UK) display name and description, plus a **review screenshot**
(a screenshot of the Settings screen showing the buttons, taken from TestFlight).
The first purchases get submitted for review **together with the first app version**.

### 10. RevenueCat

https://www.revenuecat.com. It's free until the app makes real money.

1. Create a project → add an **App Store** app with bundle ID `uk.co.footballdle.app`.
2. Give it an **In-App Purchase key**: App Store Connect → Users and Access → Integrations →
   **In-App Purchase** → generate, then upload the `.p8` to RevenueCat with its Key ID and Issuer ID.
3. **Product catalog → Products** → import or add all seven product IDs above.
4. **Entitlements** → create one called exactly **`pro`** → attach `footballdle_pro` only (not the tips).
5. **API keys** → copy the **Apple public key** (starts `appl_`) → put it in `codemagic.yaml` as `REVENUECAT_APPLE_KEY`.

TestFlight builds use Apple's sandbox automatically, so test purchases are free.

### 11. Game Center leaderboards

App Store Connect → your app → **Services → Game Center** (make sure Game Center is enabled on the app
version too). Create four **Classic** leaderboards with score format **Integer**, sorted **high to low**:

| Leaderboard ID | Display name |
|---|---|
| `footballdle.daily.best_streak` | Longest Daily Streak |
| `footballdle.scout.best_streak` | Longest Scout Report Streak |
| `footballdle.spotball.best_streak` | Longest Spot the Baller Streak |
| `footballdle.total_wins` | Total Wins |

The app signs players in to Game Center on launch and submits their best streaks and total wins
automatically, including history from before Game Center existed. The trophy icon in the header opens the boards.

If you created the provisioning profile **before** ticking Game Center on the Bundle ID, regenerate it
(and re-fetch it in Codemagic), or the build will fail on entitlements.

---

## "Do I need a database?"

**No.** Not for the current plan:

- **Leaderboards**: Game Center is Apple's service. Apple hosts the scores, handles player
  accounts and draws the leaderboard UI. No server needed.
- **Purchases**: RevenueCat (hosted) plus Apple. Purchases are tied to the player's Apple ID,
  so "Restore purchases" works across devices without accounts.
- **Game state / streaks**: stays on-device in `localStorage`, same as the website.

You'd only need a database (e.g. Supabase) to share leaderboards across iOS, Android and web,
or to have Footballdle accounts of your own. That's a later problem.

---

## Before submitting for review

- [ ] Real app icon (step 7)
- [ ] Screenshots: 6.9" iPhone (1320×2868) at minimum. They can be taken from TestFlight on a big iPhone, or from a simulator via a Codemagic build
- [ ] Description, keywords, support URL (`https://footballdle.co.uk`), privacy policy URL (`https://footballdle.co.uk/privacy-policy`)
- [ ] Update the privacy policy page to cover the app (Game Center, purchases)
- [ ] App Privacy questionnaire in App Store Connect. The app has no analytics or ads, so it's mostly "Data Not Collected", plus purchase history once IAP is in
- [ ] Age rating questionnaire (should come out 4+)
- [ ] Native features in (Game Center, IAP). Apple rejects apps that are "just a website" (guideline 4.2)
