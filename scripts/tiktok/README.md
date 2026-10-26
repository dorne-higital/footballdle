# Short-video kit

Makes vertical videos (TikTok, Instagram Reels, YouTube Shorts) of the real iPhone app playing past puzzles: a hook, the app in a phone frame, an "answer in 3, 2, 1" countdown, the reveal and an end card ("Free on the App Store, search Footballdle").

```
yarn tiktok                  # 14 Daily, 10 Scout Report, 10 Spot the Baller, 10 Grid
yarn tiktok 6 4 4 4          # your own numbers, in that order
NO_BUILD=1 yarn tiktok       # skip the app build and use the last one in .output
```

Videos land one at a time in `~/Desktop/Footballdle TikToks/batch-<date>/<mode>/`, modes taking turns, about 30 to 50 seconds each. When it's done, open `plan.html` in that folder: posting order and times (1 to 4 a day), text and hashtags to copy, and a Posted tick box.

**After a batch, commit `scripts/tiktok/used.json`.** It lists every puzzle already turned into a video, so the next batch picks new ones.

## What it uses

- **Daily, Scout Report, Spot the Baller:** finished days only, never today or later. The answers are already public on the website's solution pages.
- **The Grid:** practice grids, never a weekly Grid, with a different player in each square.
- The app build in `.output/public` (made by the script unless `NO_BUILD=1`), Google Chrome (headless), and macOS's built-in `avconvert`.
- Work files go in `.tiktok/` (git-ignored). Ports 4273, 4290, 9341 and 9342.

## The pieces

| File | Job |
|---|---|
| `run.sh` | Runs everything, one video at a time |
| `extract.ts` | Every usable past puzzle, with wrong guesses that get warmer |
| `plan.py` | Picks the batch: best-known players first, nothing in `used.json` |
| `capture.py`, `shoot.mjs`, `base.json` | Screenshots of the app at each step, on the puzzle's day |
| `render.html`, `make-videos.mjs` | Animates the screens and records the MP4 |
| `posting-plan.py`, `posting-plan.html` | The posting plan page |

The videos are silent on purpose: add a trending sound in TikTok when posting.
