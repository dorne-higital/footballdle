# Review checklists

Use the lists that fit the product. They make sure nothing gets missed; they aren't a script to read out. Only report what you actually found.

## Every product
- **First 5 seconds:** what is this, who is it for, what do I do first?
- **Hierarchy:** is the one main action the most prominent thing on the screen?
- **Copy:**
  - Plain words, named the way players think. "Hints", not "consumables".
  - Buttons say exactly what happens.
  - Errors say how to fix them.
- **Consistency:** one spacing scale, one type scale, and components that behave the same everywhere.
- **States:**
  - empty, loading, error, offline, success
  - first run and returning
  - long text, zero, huge numbers, no hints left
- **Trust:** no dark patterns; prices and what you get are clear before buying; restore purchases is easy to find.
- **Speed you can feel:** no layout jumps, instant feedback on tap, skeletons rather than spinners where content has a known shape.

## Accessibility
- Contrast is at least 4.5:1 for body text and 3:1 for large text and UI parts. Check it in every theme, including greyscale and high contrast.
- Nothing relies on colour alone: right, close and wrong also differ by mark or shape.
- Tap targets are at least 44 × 44pt, with enough space between them.
- Dynamic Type and large text don't clip or overlap; layouts wrap.
- VoiceOver:
  - every control has a name;
  - boards read in a sensible order;
  - live results are announced.
- Reduced motion is respected; nothing flashes.
- Keyboard on the website: visible focus, logical order, Enter and Escape behave.

## Mobile app (iOS first)
- Onboarding gets someone to their first guess fast. Teach by doing, not by slides.
- Tab bar: few tabs, labelled, the current one obvious. Back behaves like iOS.
- Gestures: swipe back works, and nothing important is hidden behind a gesture.
- Permissions (notifications, Game Center): asked at the moment they make sense, with the value explained first.
- Notifications: useful, timely, easy to turn off. Never nagging.
- Safe areas, the notch and Dynamic Island, the home indicator; smallest supported phone (iPhone SE) and the largest.
- Haptics: they support actions and are never noise.
- Retention loops: streaks, a daily reason to return, shareable results. Are they visible without being pushy?
- Purchases: the value is clear, the price is correct in local currency, and there's a path back if someone isn't ready.

## Website
- **Homepage:** within one screen, it says what the site is and offers to play.
- **Landing pages** for search: each matches the intent of the search that brings people there. Coordinate with the `seo` skill.
- **Desktop and phone:** both layouts are first-class. No horizontal scroll, and no dead space on wide screens.
- **Conversion journeys:**
  - web player to daily habit;
  - iPhone visitor to App Store (footballdle.co.uk/app).
- **Trust signals:** a clear About page, privacy and cookie choices, no surprise third-party widgets.
- **Content structure:** one H1 per page; headings that describe the content.

## Dashboards, stats and data screens
- **Information density:** the most useful number comes first, then the detail.
- **Charts:** drawn to scale, labelled, and readable in every theme.
- **Discoverability:** features can be found without a tutorial; settings are grouped the way players think.
- **Activation:** what has to happen before someone gets value, and how short can that path be?

## Before and after
When proposing a change:
- Show the current state (a screenshot or a faithful recreation).
- Show the proposal at the same size and in the same theme.
- Name the exact changes (spacing, size, colour token, copy).
- Say what will be measured to know it worked.
