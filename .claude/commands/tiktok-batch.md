---
description: Make a new batch of Footballdle short videos (TikTok/Reels/Shorts) from past puzzles
argument-hint: "[daily scout spot grid] e.g. 14 10 10 10"
---

Make a new batch of short videos with the kit in `scripts/tiktok` (read its README.md first).

1. Make sure the repo is on an up-to-date `main` (`git pull`), so the videos show the latest app. Don't touch uncommitted work; ask if there is any.
2. Run `yarn tiktok $ARGUMENTS` in the background (default counts if no arguments). It builds the app, then saves videos one at a time to `~/Desktop/Footballdle TikToks/batch-<date>/`. Watch its output with a Monitor and tell Dan as each mode's first video lands, so he can start posting before the batch finishes.
3. Never run anything else that drives headless Chrome on ports 9341/9342 while it runs.
4. When it finishes, check one video per mode by looking at its captured frames in `.tiktok/frames/<id>/`, not by playing the videos in Chrome while anything is running.
5. Tell Dan where `plan.html` is (in the batch folder), and commit `scripts/tiktok/used.json` on a branch so the next batch picks new puzzles. Dan pushes.

Rules: past puzzles only (the kit enforces it), never today's answers, and never post Daily answers for today anywhere.
