# The design review artifact

A full design review is published as a Claude Artifact: an interactive, living audit that Dan explores, decides on and tracks. It is a working tool, not a static report.

Before writing it, follow the Artifact tool's own rules:
- Call `quickstart`, and load `artifact-design` if the quickstart doesn't cover it.
- For the status tracking below, load `artifact-capabilities`.

Then:
- Check the page script before every publish (`node --check` on the extracted `<script>`). One stray apostrophe in a single-quoted string blanks the whole page.
- Republish to the same file path so the URL stays the same.

## Structure
Use tabs, never one long scroll. The overview comes first, and every item can be opened on its own.

| Tab | Contents |
|---|---|
| Overview | Section A: the scores and the verdict |
| Working | Section B |
| Fix | Sections C and D, as one board grouped by priority |
| Ideas | Section E |
| Direction | Section F |
| Plan | Section G, with progress |
| Ideas inbox | Dan's own ideas, plus any added later |

### Codes
Give every item a short, stable code shown on its card: W1… (working), F1… (fix), I1… (idea), P1… (plan task). Put a one-line legend at the top: "Ask me by code, e.g. 'do F2', 'explain I4'". Codes never change once published; new items take the next number.

### A. Overall assessment
- An overall score out of 10, then a score for each of:
  - first impressions
  - visual quality
  - ease of use
  - navigation and information architecture
  - user experience
  - accessibility
  - mobile
  - conversion potential
  - brand consistency
- Each score has one or two sentences of reasoning and the evidence behind it.
- A short verdict: three or four sentences saying what matters most.
- Show the scores as a compact scorecard (bars or a grid), not a wall of text.

### B. What's working
For each strength, give:
- the element;
- why it works and what makes it effective;
- the verdict: "keep as is" or "refine" (and how).

### C and D. What to fix and change
For each item, give:
- current problem
- why it's a problem
- effect on the player
- the recommendation, specific: what changes, by how much, where in the code
- expected benefit
- priority
- effort: S, M or L
- kind: broken, preference or experiment
- evidence: measured, observed or assumed

Where it helps, show a **before and after**: the current screenshot or a faithful HTML recreation beside the proposed version. A toggle or slider works well. Cover these areas where they're relevant:
- layout and spacing, typography, colour, hierarchy
- calls to action, navigation, cards and components
- forms, content and imagery
- motion
- mobile and responsive behaviour
- loading, empty and error states

### E. Ideas
Split into **Practical** (shippable in a version or two) and **Ambitious** (bigger bets and experiments). For each idea, give:
- what it is
- who it's for
- the user benefit and the business benefit (retention, conversion, differentiation)
- effort
- the risk or open question
- for an experiment, the metric that would show it worked

Leave out anything that's only there to sound impressive.

### F. Direction
Describe the target feel in one sentence, then:
- style, palette (as swatches), typography (as live specimens) and component styling
- layout and navigation approach
- interaction and motion principles
- the mobile experience

Show examples, not adjectives. Build on the existing Floodlights identity unless there's a strong reason to change it, and say what that reason is.

### G. Plan
Group the work into Critical, High, Medium, Low and Future. Each task links to the fix or idea it delivers. Add an impact-versus-effort view (a 2×2 or a scatter) and a progress bar.

## Interactivity
- **Expandable cards:** one item open at a time, with a detail panel for the selected card, and filters by priority, kind and status.
- **Status on every fix, idea and plan task:** Proposed, Accepted, Under consideration, Rejected, In progress, Done.
  - Dan sets these on the page, and they should persist and be readable by Claude. Use the artifact's `db` capability when it's available (load `artifact-capabilities`).
  - Without it, fall back to `localStorage` for Dan's clicks. Also keep a status map in the page source that Claude updates as work ships, so the page shows the truth to anyone.
- **Checklists:** a "Done when" checklist inside each fix card.
- **Ideas inbox:** a box for Dan's own ideas (stored like statuses), which Claude reads and turns into cards.
- **Deep links:** `#F3` opens that card.

## Design of the artifact itself
- It should look like a consultancy deliverable for this brand. For Footballdle, that means:
  - a dark pitch-green ground with the Floodlights accents;
  - Archivo Black for headings, Manrope for body;
  - a light theme that works too.
- Keep it scannable: summary before detail, and state shown in form (pills, stripes, badges), not only in words.
- Use semantic colours (critical, high, medium, low) separately from the brand accent.
- No colour-only signals: priorities also carry a word or icon, matching the game's own greyscale rule.
- It must work at phone width, with no sideways scroll.
- Screenshots are evidence: label each one with the screen, device width and date taken.
