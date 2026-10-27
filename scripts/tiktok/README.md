# Short-video kit

Makes vertical videos (TikTok, Instagram Reels, YouTube Shorts) of the real iPhone app playing past puzzles: a hook, the app in a phone frame, an "answer in 3, 2, 1" countdown, the reveal and an end card ("Free on the App Store, search Footballdle").

```
yarn tiktok                  # 14 Daily, 10 Scout Report, 10 Spot the Baller, 10 Grid
yarn tiktok 6 4 4 4          # your own numbers, in that order
NO_BUILD=1 yarn tiktok       # skip the app build and use the last one in .output
```

Videos land one at a time in one flat folder, `~/Desktop/Footballdle TikToks/batch-<date>/`, named by kind (`daily-03.mp4`), modes taking turns, 13 to 16 seconds each. When it's done, open `plan.html` in that folder: posting order and times (1 to 4 a day), text and hashtags to copy, and a Posted tick box.

## Other formats

```
zsh scripts/tiktok/formats.sh facts=8 quiz=6 montage=4 cards=4 themes=4 streaks=3 worst=4 speedrun=3 full=4
DEST=<batch folder> NO_BUILD=1 zsh scripts/tiktok/formats.sh quiz=3   # add to an existing folder
```

| Format | What it is |
|---|---|
| `facts` | Four Premier League facts (app/data/facts.json) with a giant number each, ~25s |
| `quiz` | The clues and a countdown, no reveal: the answer goes in a pinned comment (the plan shows it) |
| `montage` | A quick tour: Matchday, each game, Player Cards, trophies, themes |
| `cards` | A Player Cards collection from the season's real past days, with a finished set |
| `themes` | One screen in seven themes |
| `streaks` | Stats and the trophy cabinet of someone on a long streak |
| `worst` | Six stone-cold Daily guesses, then the answer |
| `speedrun` | Daily, Scout Report and Spot the Baller against a running clock |
| `full` | The original four, full screen with zoom-ins |

Each video varies its accent colours, theme and phone-or-full-screen look. `formats.py` picks and describes them (`.tiktok/fplan.json`); facts and puzzles go in `used.json` like the others.

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
| `formats.sh`, `formats.py` | The other formats |
| `extract.ts` | Every usable past puzzle, with wrong guesses that get warmer |
| `plan.py` | Picks the batch: best-known players first, nothing in `used.json` |
| `capture.py`, `shoot.mjs`, `base.json` | Screenshots of the app at each step, on the puzzle's day |
| `render.html`, `make-videos.mjs` | Animates the screens and records the MP4 |
| `posting-plan.py`, `posting-plan.html` | The posting plan page |

The videos are silent on purpose: add a trending sound in TikTok when posting.
