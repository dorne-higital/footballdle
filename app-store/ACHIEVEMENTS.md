# Game Center achievements

Generated from `app/utils/achievements.ts`. Every Achievement ID must exist in App Store Connect with these points; badge images are `app-store/achievements/<id>.jpg` (1024×1024).

The `fd_challenge_*` IDs are kept for The Grid (Game Center IDs can't be renamed), so Challenge wins from 1.1 still count towards them. Grid Week has a recurring leaderboard, `footballdle.grid.week` (ID `5`, created 13 Oct 2026): every 7 days from Sat 17 Oct 2026 01:00 BST (midnight GMT), best score, 0–4,500, high to low. It goes for review with the next app version.

50 achievements, 960 / 1000 points. Tiers: bronze 5, silver 15, gold 25, emerald 35.

| Achievement ID | Title | Points | Hidden | Pre-earned description | Earned description | Status |
|---|---|---|---|---|---|---|
| `fd_daily_first_win` | Off the Mark | 5 | no | Win your first Daily. | You won your first Daily. | exists - check points |
| `fd_daily_wins_10` | Into Double Figures | 15 | no | Win 10 Dailies. | You won 10 Dailies. | exists - check points |
| `fd_daily_wins_50` | Half Century | 25 | no | Win 50 Dailies. | You won 50 Dailies. | exists - check points |
| `fd_daily_wins_100` | Centurion | 35 | no | Win 100 Dailies. | You won 100 Dailies. | exists - check points |
| `fd_daily_streak_3` | Hat-Trick | 5 | no | Win the Daily 3 days in a row. | You won the Daily 3 days in a row. | exists - check points |
| `fd_daily_streak_7` | Week In, Week Out | 15 | no | Win the Daily 7 days in a row. | You won the Daily 7 days in a row. | exists - check points |
| `fd_daily_streak_30` | Player of the Month | 25 | no | Win the Daily 30 days in a row. | You won the Daily 30 days in a row. | exists - check points |
| `fd_daily_streak_100` | Club Legend | 35 | no | Win the Daily 100 days in a row. | You won the Daily 100 days in a row. | exists - check points |
| `fd_daily_one_guess` | Worldie | 25 | yes | Solve the Daily with your first guess. | You solved the Daily with your first guess. | exists - check points |
| `fd_daily_two_guess` | Clinical Finish | 15 | no | Solve the Daily in two guesses. | You solved the Daily in two guesses. | exists - check points |
| `fd_daily_last_gasp` | Last-Minute Winner | 5 | no | Solve the Daily with your sixth and final guess. | You solved the Daily with your final guess. | exists - check points |
| `fd_daily_wins_25` | Quarter Century | 15 | no | Win 25 Dailies. | You won 25 Dailies. | NEW - create |
| `fd_daily_wins_250` | Record Breaker | 35 | no | Win 250 Dailies. | You won 250 Dailies. | NEW - create |
| `fd_daily_streak_14` | Fortnight of Form | 15 | no | Win the Daily 14 days in a row. | You won the Daily 14 days in a row. | NEW - create |
| `fd_daily_streak_50` | Unbeatable | 25 | no | Win the Daily 50 days in a row. | You won the Daily 50 days in a row. | NEW - create |
| `fd_daily_three_guess` | Top Bins | 5 | no | Solve the Daily in three guesses. | You solved the Daily in three guesses. | NEW - create |
| `fd_daily_played_50` | Matchday Regular | 15 | no | Play 50 Dailies, win or lose. | You played 50 Dailies. | NEW - create |
| `fd_scout_first_win` | Scouting Mission | 5 | no | Win your first Scout Report. | You won your first Scout Report. | exists - check points |
| `fd_scout_wins_25` | Chief Scout | 15 | no | Win 25 Scout Reports. | You won 25 Scout Reports. | exists - check points |
| `fd_scout_streak_7` | Eye for Talent | 15 | no | Win the Scout Report 7 days in a row. | You won the Scout Report 7 days in a row. | exists - check points |
| `fd_scout_two_guess` | Spotted Early | 15 | no | Solve the Scout Report in two guesses. | You solved the Scout Report in two guesses. | exists - check points |
| `fd_scout_wins_10` | Talent Spotter | 15 | no | Win 10 Scout Reports. | You won 10 Scout Reports. | NEW - create |
| `fd_scout_wins_50` | Head of Recruitment | 25 | no | Win 50 Scout Reports. | You won 50 Scout Reports. | NEW - create |
| `fd_scout_wins_100` | Director of Football | 35 | no | Win 100 Scout Reports. | You won 100 Scout Reports. | NEW - create |
| `fd_scout_streak_3` | Scout's Honour | 5 | no | Win the Scout Report 3 days in a row. | You won the Scout Report 3 days in a row. | NEW - create |
| `fd_scout_streak_30` | Transfer Guru | 25 | no | Win the Scout Report 30 days in a row. | You won the Scout Report 30 days in a row. | NEW - create |
| `fd_scout_one_guess` | Love at First Sight | 25 | yes | Solve the Scout Report with your first guess. | You solved the Scout Report with your first guess. | NEW - create |
| `fd_spot_first_win` | Spotted | 5 | no | Win your first Spot the Baller. | You won your first Spot the Baller. | exists - check points |
| `fd_spot_perfect` | Perfect 10 | 25 | no | Get all 10 rounds right in Spot the Baller. | You got all 10 rounds right in Spot the Baller. | exists - check points |
| `fd_spot_streak_7` | Sharp Eyes | 15 | no | Win Spot the Baller 7 days in a row. | You won Spot the Baller 7 days in a row. | exists - check points |
| `fd_spot_wins_10` | Keen Eye | 15 | no | Win 10 Spot the Ballers. | You won 10 Spot the Ballers. | NEW - create |
| `fd_spot_wins_50` | Eagle Eye | 25 | no | Win 50 Spot the Ballers. | You won 50 Spot the Ballers. | NEW - create |
| `fd_spot_streak_3` | Spot On | 5 | no | Win Spot the Baller 3 days in a row. | You won Spot the Baller 3 days in a row. | NEW - create |
| `fd_spot_streak_30` | Never Misses | 25 | no | Win Spot the Baller 30 days in a row. | You won Spot the Baller 30 days in a row. | NEW - create |
| `fd_spot_perfect_5` | Perfectionist | 35 | no | Get all 10 rounds right in Spot the Baller five times. | You got a perfect 10 in Spot the Baller five times. | NEW - create |
| `fd_challenge_first_win` | On the Grid | 5 | no | Fill 5 squares in a grid. | You filled 5 squares in a grid. | exists - rename, new text + badge |
| `fd_challenge_quickfire` | Full House | 25 | no | Score a perfect 900 on a grid. | You scored a perfect 900 on a grid. | exists - rename, new text + badge |
| `fd_challenge_wins_25` | Grid Regular | 15 | no | Fill 5 or more squares in 25 grids. | You filled 5 or more squares in 25 grids. | exists - rename, new text + badge |
| `fd_challenge_wins_10` | Grid Habit | 15 | no | Fill 5 or more squares in 10 grids. | You filled 5 or more squares in 10 grids. | NEW - create |
| `fd_challenge_wins_100` | Grid Master | 35 | no | Fill 5 or more squares in 100 grids. | You filled 5 or more squares in 100 grids. | NEW - create |
| `fd_challenge_speed_10` | Perfect Week | 25 | yes | Score the full 4,500 in a Grid Week. | You scored the full 4,500 in a Grid Week. | NEW - create |
| `fd_challenge_played_50` | Grid Addict | 15 | no | Finish 50 grids. | You finished 50 grids. | NEW - create |
| `fd_all_treble` | The Treble | 25 | no | Win the Daily, Scout Report and Spot the Baller on the same day. | You won all three daily modes on the same day. | exists - check points |
| `fd_all_games_100` | Season Ticket Holder | 15 | no | Play 100 games across every mode. | You played 100 games across every mode. | exists - check points |
| `fd_all_wins_250` | Hall of Famer | 35 | no | Win 250 games across every mode. | You won 250 games across every mode. | exists - check points |
| `fd_hint_first` | Tactical Review | 5 | no | Use a hint in the Daily. | You used a hint in the Daily. | exists - check points |
| `fd_matchday_streak_7` | Turned Up | 15 | no | Finish a game 7 days in a row (your Matchday streak). | You kept a 7-day Matchday streak. | NEW - create |
| `fd_matchday_streak_30` | Ever-Present | 25 | no | Finish a game 30 days in a row. | You kept a 30-day Matchday streak. | NEW - create |
| `fd_matchday_streak_100` | Testimonial Year | 35 | no | Finish a game 100 days in a row. | You kept a 100-day Matchday streak. | NEW - create |
| `fd_all_games_500` | Season Ticket Renewed | 25 | no | Play 500 games across every mode. | You played 500 games across every mode. | NEW - create |

## Player Cards (1.1)

| ID | Title | Points | Before earned | After earned |
|---|---|---|---|---|
| `fd_cards_first` | Debut Card | 5 | Win a Daily to collect your first Player Card. | You collected your first Player Card. |
| `fd_cards_25` | Swapsies | 5 | Collect 25 Player Cards. | You collected 25 Player Cards. |
| `fd_cards_60` | Sticker Book | 5 | Collect 60 Player Cards. | You collected 60 Player Cards. |
| `fd_cards_foil_10` | Shiny Collection | 5 | Collect 10 shiny cards (won in two guesses or fewer). | You collected 10 shiny cards. |
| `fd_cards_set_1` | Full Squad | 5 | Complete a club's set of cards. | You completed a club's set. |
| `fd_cards_set_5` | Five Clubs Deep | 5 | Complete 5 club sets. | You completed 5 club sets. |
| `fd_cards_all_season` | Got, Got, Need… Got! | 5 | Complete all 20 club sets in a season. | You completed every club set in a season. |

Total with these: 57 achievements, 995 of the 1,000-point limit.
