# The varied formats (facts, quiz, themes, montage and so on): picks what each video shows,
# never repeating something in used.json, and writes .tiktok/fplan.json with each video's
# app screens to capture and its scenes for render.html.
#   python3 formats.py plan facts=8 quiz=6 ...   choose the batch (quiz=3+6 numbers them from 07)
#   python3 formats.py capture <video id>         capture that video's screens
import json, os, sys, random, datetime, subprocess, re
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..', '..')
WORK = os.path.join(ROOT, '.tiktok')
base = json.load(open(os.path.join(HERE, 'base.json')))
APP = 'http://127.0.0.1:4273'
FPLAN = os.environ.get('FPLAN') or os.path.join(WORK, 'fplan.json')
TAGS = '#football #premierleague #footballquiz #footballdle'
sys.path.insert(0, HERE)
import capture as CP  # the per-step app captures for each mode

_data = None
def data():
	global _data
	if _data is None: _data = json.load(open(os.path.join(WORK, 'data.json')))
	return _data

def who(mode, x):
	return f"who:{mode}:{(x.get('word') or x.get('name', '')).lower()}" if mode in ('daily', 'scout') else None

# The best-known past puzzles of a mode not used before (in used.json or earlier in this plan)
def fresh(mode, n, used):
	key = 'pop' if mode in ('daily', 'scout') else 'fame'
	out = []
	for x in sorted(data()[mode], key=lambda x: -x[key]):
		if x['key'] in used or who(mode, x) in used: continue
		out.append(x); used.add(x['key'])
		if who(mode, x): used.add(who(mode, x))
		if len(out) == n: break
	return out

def keys(mode, x):
	return [k for k in (x['key'], who(mode, x)) if k]

def daily_shots(x, words, win=True):
	_, ds, fake = CP.day(x['puzzle'])
	shots = []
	for n in range(len(words) + 1):
		over = n == len(words) and (win or len(words) >= 6)
		s = dict(CP.STORE); s['footballdle-game'] = {'date': ds, 'guesses': words[:n], 'gameOver': over, 'isWin': over and win, 'purchasedHints': 0}
		shots.append({'name': str(n), 'url': APP + '/play/daily?start=play', 'storage': s, 'wait': 2200})
	return {'fakeDate': fake, 'shots': shots}

def scout_shots(x, guesses):
	_, ds, fake = CP.day(x['puzzle'])
	shots = []
	for n in range(len(guesses) + 1):
		over = n == len(guesses) and guesses[-1] == x['guesses'][-1]
		s = dict(CP.STORE); s['footballdle-scout'] = {'date': ds, 'guesses': guesses[:n], 'gameOver': over, 'isWin': over, 'purchasedHints': 0}
		shots.append({'name': str(n), 'url': APP + '/play/scout-report?start=play', 'storage': s, 'wait': 2200})
	return {'fakeDate': fake, 'shots': shots}

def spot_first(x):
	_, ds, fake = CP.day(x['puzzle'])
	s = {k: v for k, v in CP.STORE.items() if k != 'footballdle-spot'}
	return {'fakeDate': fake, 'shots': [{'name': 'spot', 'url': APP + '/play/spot-the-baller?start=play', 'storage': s, 'wait': 1500, 'steps': [{'wait': 1200, 'name': '0'}]}]}

HOOKS = {
	'daily': ['Can you get this footballer in 6 guesses?', 'Guess the Premier League player', 'How quickly can you get this one?'],
	'scout': ['Can you name him from the scout\'s brief?', 'Scout Report: who are we signing?', 'Work out the player from the clues'],
	'spot': ['Can you name all 3 before the clock runs out?', 'Who\'s this player? 3 rounds, go'],
	'grid': ['Can you fill this grid?', 'Pause the video and try this grid'],
}

# Accent colours, so a batch doesn't all look the same (always the brand's own two)
GREEN, AMBER = {}, {'glow': '245,182,56', 'green': '#f5b638', 'amber': '#2fe08a'}
PALETTES = [GREEN] * 5  # always the app's own Floodlights green, like the first batches
# Themes for the themes videos only (paid ones show because base storage has Pro); every
# other video stays in Floodlights so it looks like the app people will download
THEMES = ['floodlights', 'retro', 'chalk', 'night', 'golden', 'ocean', 'berry', 'crimson', 'sunday', 'programme', 'pastel', 'tangerine', 'lemon', 'lilac', 'light', 'greyscale']

def store(theme=None, **extra):
	s = dict(base['storage']); s['footballdle-pro'] = '1'
	if theme and theme not in ('floodlights', 'light'): s['footballdle-app-theme'] = theme
	s['footballdle-app-appearance'] = 'light' if theme == 'light' else 'dark'
	s.update(extra)
	return s

def shot(name, path, storage, wait=2200, js=None, steps=None):
	x = {'name': name, 'url': APP + path, 'storage': storage, 'wait': wait}
	if js: x['js'] = js
	if steps: x['steps'] = steps
	return x

SCROLL_FACT = "document.querySelector('.fact-card')?.scrollIntoView({block: 'center'})"

# The number a fact is about (not a year or season), for the giant number on its card
def big_number(text):
	for m in re.finditer(r'(\d[\d,.]*)(-1)?', text):
		v = m.group(0).rstrip('.,')
		if re.fullmatch(r'(19|20)\d\d', v) or re.match(r'(19|20)\d\d/', text[m.start():]): continue
		if text[m.end():m.end() + 1] == '/' or text[m.start() - 1:m.start()] == '/': continue
		return v
	return None

# Hand-picked where the first number isn't the one the fact is about (facts.json index)
BIG = {1: None, 14: '4', 15: '2:56', 16: '4:33', 27: '4', 29: '5', 30: '5', 31: '9-0', 32: '11', 33: '4', 37: '7', 39: '7', 41: '7', 42: None, 43: None}

def facts(n, used, rng):
	all_facts = json.load(open(os.path.join(ROOT, 'app', 'data', 'facts.json')))
	free = [i for i in range(len(all_facts)) if f'fact:{i}' not in used]
	rng.shuffle(free)
	titles = ['4 Premier League facts you didn\'t know', 'Premier League facts to win the pub quiz', '4 facts that sound made up (they aren\'t)',
		'Did you know these Premier League facts?', 'Premier League records that might never be broken', '4 facts every football fan should know']
	out = []
	for k in range(n):
		pick = free[k * 4:k * 4 + 4]
		if len(pick) < 4: break
		theme = 'floodlights'
		scenes = [{'card': {'kicker': 'DID YOU KNOW?', 'title': titles[k % len(titles)], 'sub': 'How many did you know?'}, 'hold': 2.4}]
		scenes += [{'card': {'kicker': f'FACT {j + 1} OF 4', 'title': all_facts[i], 'size': 64, 'big': BIG[i] if i in BIG else big_number(all_facts[i])}, 'hold': 4.6} for j, i in enumerate(pick)]
		scenes += [{'frame': 0, 'hold': 2.6, 'hook': 'A new fact on the home screen every day'}]
		out.append({'id': f'facts-{k + 1:02d}', 'mode': 'facts', 'keys': [f'fact:{i}' for i in pick],
			'job': {'hook': titles[k % len(titles)], 'kicker': 'FOOTBALLDLE · FACTS', 'palette': PALETTES[k % len(PALETTES)], 'scenes': scenes},
			'caption': f'Which one did you not know? 🤯 Got a better fact? Comment it 👇 Search Footballdle on the App Store. {TAGS} #footballfacts #didyouknow',
			'cfg': {'fakeDate': '2026-10-%02dT10:24:00Z' % (10 + k), 'shots': [shot('0', '/', store(theme), 2500, SCROLL_FACT)]}})
	return out

# The current four, full screen (no phone frame), zooming in on the action
def fullscreen(n, used, rng):
	out = []
	modes = ['daily', 'scout', 'spot', 'grid'][:n]
	for k, mode in enumerate(modes):
		if mode == 'grid':
			x = next(g for g in sorted(data()['grid'], key=lambda g: -g['fame']) if g['key'] not in used); used.add(x['key'])
		else:
			got = fresh(mode, 1, used)
			if not got: continue
			x = got[0]
		zoom = {'s': 1.12, 'x': 0.5, 'y': 0.3}
		if mode == 'daily':
			cfg = CP.daily(x); scenes = [{'frame': 0, 'hold': 1.6}, {'frame': 1, 'hold': 1.3, 'zoom': zoom}, {'frame': 2, 'hold': 1.3, 'zoom': zoom}, {'frame': 3, 'hold': 3.2, 'countdown': True, 'zoom': zoom}, {'frame': 4, 'hold': 2.8, 'reveal': x['name']}]
		elif mode == 'scout':
			cfg = CP.scout(x); scenes = [{'frame': 0, 'hold': 2.8, 'zoom': {'s': 1.3, 'x': 0.5, 'y': 0.25}}, {'frame': 1, 'hold': 1.6}, {'frame': 2, 'hold': 1.6}, {'frame': 3, 'hold': 3.2, 'countdown': True}, {'frame': 4, 'hold': 2.8, 'reveal': x['name']}]
		elif mode == 'spot':
			cfg = CP.spot(x); scenes = [sc for i, r in enumerate(x['rounds']) for sc in ({'frame': i * 2, 'hold': 3, 'ring': True, 'hook': HOOKS['spot'][0] if i == 0 else f'Round {i + 1}', 'zoom': {'s': 1.2, 'x': 0.5, 'y': 0.35}}, {'frame': i * 2 + 1, 'hold': 1.5, 'reveal': r['name']})]
		else:
			cfg = CP.grid(x); scenes = [{'frame': 0, 'hold': 4.5, 'countdown': True, 'zoom': {'s': 1.15, 'x': 0.5, 'y': 0.4}}, {'frame': 1, 'hold': 1.5}, {'frame': 2, 'hold': 1.5}, {'frame': 3, 'hold': 2.8, 'reveal': 'Did you get them all?'}]
		job = {'full': True, 'hook': HOOKS[mode][k % len(HOOKS[mode])], 'kicker': 'FOOTBALLDLE', 'palette': PALETTES[(k + 1) % len(PALETTES)], 'scenes': scenes}
		if mode == 'spot': job['revealLabel'] = 'IT\'S'
		if mode == 'grid': job.update(revealLabel='FULL GRID', countdownText='ANSWERS IN')
		cap = {'daily': 'Did you get it before the reveal? 👀', 'scout': f"{x.get('brief', '')} Did you get him? 🕵️", 'spot': 'How many out of 3? Comment your score 👇', 'grid': 'How many squares could you fill? 👇'}[mode]
		out.append({'id': f'full-{mode}', 'mode': 'full', 'keys': keys(mode, x) if mode != 'grid' else [x['key']], 'job': job, 'cfg': cfg,
			'caption': f'{cap} Search Footballdle on the App Store. {TAGS} #guesstheplayer'})
	return out

# Comment-to-answer: the clues, a countdown, no reveal (the answer goes in a pinned comment)
def quiz(n, used, rng):
	out = []
	plan = (['daily', 'scout', 'spot'] * n)[:n]
	for k, mode in enumerate(plan):
		got = fresh(mode, 1, used)
		if not got: continue
		x = got[0]
		end = {'card': {'kicker': 'COMMENT YOUR ANSWER', 'title': 'Answer in the pinned comment', 'sub': 'No googling'}, 'hold': 2.2}
		if mode == 'daily':
			cfg = daily_shots(x, x['guesses'], win=False); cfg['shots'] = cfg['shots'][:4]
			scenes = [{'frame': 1, 'hold': 1.4}, {'frame': 2, 'hold': 1.4}, {'frame': 3, 'hold': 5, 'ring': True, 'hook': 'Who is it? Comment below'}, end]
			answer = x['name']
		elif mode == 'scout':
			cfg = scout_shots(x, x['guesses'][:2])
			scenes = [{'frame': 0, 'hold': 2.6}, {'frame': 1, 'hold': 1.4}, {'frame': 2, 'hold': 5, 'ring': True, 'hook': 'Who are we signing? Comment below'}, end]
			answer = x['name']
		else:
			cfg = spot_first(x)
			scenes = [{'frame': 0, 'hold': 6, 'ring': True, 'hook': 'Who\'s this? A, B, C or D?'}, end]
			answer = x['rounds'][0]['name']
		out.append({'id': f'quiz-{k + 1:02d}', 'mode': 'quiz', 'keys': keys(mode, x), 'note': f'Pin this answer: {answer}',
			'job': {'hook': ['Only real fans get this one', 'Name him, no googling', 'Who is it?'][k % 3], 'kicker': 'FOOTBALLDLE · QUIZ', 'full': k % 2 == 1, 'palette': PALETTES[(k + 2) % len(PALETTES)], 'scenes': scenes},
			'cfg': cfg, 'caption': f'Who is it? Comment your answer 👇 Answer pinned. Search Footballdle on the App Store. {TAGS} #guesstheplayer #commentyouranswer'})
	return out

# Six stone-cold guesses, then the answer
def worst(n, used, rng):
	out = []
	cands = [x for x in fresh('daily', n * 2, used) if len(x.get('cold', [])) == 6]
	lines = [('My worst Footballdle ever', ['Wrong', 'It gets worse', 'Still nothing', 'Come on', 'Last chance']),
		('Me thinking I know ball', ['Confident start', 'Hmm', 'Surely this one', 'Nope', 'Please']),
		('Rate this run out of 10', ['Bold opener', 'Wrong', 'Very wrong', 'Somehow worse', 'Final guess']),
		('How did I not get this', ['Easy one, I thought', 'Ah', 'Right then', 'What is happening', 'Last go'])]
	for k, x in enumerate(cands[:n]):
		hook, steps = lines[k % len(lines)]
		cfg = daily_shots(x, x['cold'], win=False)
		scenes = [{'frame': 0, 'hold': 1.4}] + [{'frame': i + 1, 'hold': 1.0, 'hook': steps[i]} for i in range(5)] + [{'frame': 6, 'hold': 1.4, 'hook': '0 for 6'}, {'frame': 6, 'hold': 2.6, 'reveal': x['name']}]
		out.append({'id': f'worst-{k + 1:02d}', 'mode': 'worst', 'keys': keys('daily', x),
			'job': {'hook': hook, 'kicker': 'FOOTBALLDLE · WORST GUESSES', 'full': k % 2 == 0, 'palette': PALETTES[4 if k % 2 else 0], 'scenes': scenes},
			'cfg': cfg, 'caption': f'Could you do worse? 💀 Show us your worst 👇 Search Footballdle on the App Store. {TAGS} #footballfail #guesstheplayer'})
	# release the extra picks so other formats can use them
	for x in cands[n:]:
		for kk in keys('daily', x): used.discard(kk)
	return out

# Daily, Scout Report and Spot the Baller against a running clock
def speedrun(n, used, rng):
	out = []
	for k in range(n):
		d, s, p = fresh('daily', 1, used), fresh('scout', 1, used), fresh('spot', 1, used)
		if not (d and s and p): break
		d, s, p = d[0], s[0], p[0]
		dc = daily_shots(d, [d['guesses'][2], d['word']])
		sc = scout_shots(s, [s['guesses'][2], s['guesses'][3]])
		pc = CP.spot(p)
		shots = [dict(x, name=f'd{x["name"]}') for x in dc['shots']] + [dict(x, name=f's{x["name"]}') for x in sc['shots']]
		spot_shot = pc['shots'][0]; spot_shot['steps'] = [dict(st, name=f'p{st["name"]}') if 'name' in st else st for st in spot_shot['steps']]
		# Each mode needs its own day's clock, so these are three capture runs
		cfg = {'multi': [{'fakeDate': dc['fakeDate'], 'shots': shots[:3]}, {'fakeDate': sc['fakeDate'], 'shots': shots[3:]}, {'fakeDate': pc['fakeDate'], 'shots': [spot_shot]}]}
		intro = 2.0
		scenes = [{'card': {'kicker': 'SPEEDRUN', 'title': 'All three daily games. Go.', 'sub': 'Daily · Scout Report · Spot the Baller'}, 'hold': intro},
			{'frame': 'd0', 'hold': 0.9, 'kicker': 'DAILY'}, {'frame': 'd1', 'hold': 0.9, 'kicker': 'DAILY'}, {'frame': 'd2', 'hold': 1.3, 'kicker': 'DAILY', 'reveal': d['name']},
			{'frame': 's0', 'hold': 1.6, 'kicker': 'SCOUT REPORT'}, {'frame': 's1', 'hold': 0.9, 'kicker': 'SCOUT REPORT'}, {'frame': 's2', 'hold': 1.3, 'kicker': 'SCOUT REPORT', 'reveal': s['name']}]
		for i, r in enumerate(p['rounds']):
			scenes += [{'frame': f'p{i * 2}', 'hold': 1.1, 'kicker': 'SPOT THE BALLER', 'hook': f'Round {i + 1}'}, {'frame': f'p{i * 2 + 1}', 'hold': 0.9, 'reveal': r['name']}]
		pace = [1.0, 1.15, 0.9][k % 3]
		for x in scenes[1:]: x['hold'] = round(x['hold'] * pace, 2)
		stop = sum(x['hold'] for x in scenes)
		scenes += [{'card': {'kicker': 'BEAT THAT?', 'title': f'{stop - intro:.2f} seconds', 'sub': 'Comment your time\nThree new puzzles every day'}, 'hold': 2.6}]
		out.append({'id': f'speedrun-{k + 1:02d}', 'mode': 'speedrun', 'keys': keys('daily', d) + keys('scout', s) + keys('spot', p),
			'job': {'hook': 'Speedrun', 'kicker': 'FOOTBALLDLE · SPEEDRUN', 'revealLabel': 'GOT IT', 'timer': True, 'timerStart': intro, 'timerStop': stop, 'full': k == 1, 'palette': PALETTES[(k + 1) % len(PALETTES)], 'scenes': scenes},
			'cfg': cfg, 'caption': f'Can you beat it? Comment your time ⚡ Three new puzzles every day. Search Footballdle on the App Store. {TAGS} #speedrun'})
	return out

def tap_text(text):
	return "(() => { const e = [...document.querySelectorAll('button,a,[role=button]')].find(b => b.textContent.trim().includes(%s)); e?.click(); return !!e })()" % json.dumps(text)

def uk(d):
	return d.strftime('%d/%m/%Y')

# A past Daily part-played (two guesses, no answer shown), and other no-spoiler screens
def mid_daily(x, theme, name='daily'):
	_, ds, _ = CP.day(x['puzzle'])
	return shot(name, '/play/daily?start=play', store(theme, **{'footballdle-game': {'date': ds, 'guesses': x['guesses'][:2], 'gameOver': False, 'isWin': False, 'purchasedHints': 0}}))

def grid_part(g, theme, name='grid', filled=4):
	sq = [{'player': g['squares'][i]['raw'] if i < filled else None, 'wrong': 0, 'hinted': False, 'hintLetter': None} for i in range(9)]
	st = store(theme, **{'footballdle-grid': {'v': 1, 'weekIndex': -1, 'week': [], 'practice': {'deal': {'clubs': g['clubs'], 'rows': g['rowIds']}, 'squares': sq, 'done': False, 'recorded': True}, 'recentPractice': []}})
	return shot(name, '/play/grid', st, 1800, "document.querySelector('.practice-btn')?.click()")

# Player Cards: a collection built from the season's real past days (never today)
CARDS_DAY = datetime.date(2026, 10, 26)
def cards_store(theme, foil_every=3, full_set='Manchester City'):
	cd = json.load(open(os.path.join(ROOT, 'app', 'data', 'cards.json')))['seasons']
	label, season = next((k, v) for k, v in cd.items() if v['startPuzzle'] <= 299 <= v['endPuzzle'])
	owned, played = {}, {}
	for p in range(season['startPuzzle'], (CARDS_DAY - datetime.date(2026, 1, 1)).days + 2):
		cid = season['days'][p - season['startPuzzle']]
		ds = uk(datetime.date(2026, 1, 1) + datetime.timedelta(days=p - 1))
		g = 2 if p % foil_every == 0 else 3 + p % 3
		owned[ds] = {'id': cid, 'season': label, 'puzzle': p, 'guesses': g, 'foil': g <= 2}
		played[ds] = True
	for cid in season['clubs'][full_set]['members']:
		if not any(c['id'] == cid for c in owned.values()):
			owned[f'replay:{cid}'] = {'id': cid, 'season': label, 'puzzle': 0, 'guesses': 3, 'foil': False, 'replay': True}
	sets = {f'{label}|{full_set}': {'completedOn': '24/10/2026', 'hints': season['clubs'][full_set]['hints']}}
	return store(theme, **{'footballdle-cards': {'v': 1, 'cards': owned, 'sets': sets, 'played': played}, 'footballdle-trusted-date': uk(CARDS_DAY)})

def cards(n, used, rng):
	out = []
	looks = [('floodlights', False), ('floodlights', True), ('floodlights', False), ('floodlights', True)]
	sets = ['Manchester City', 'Manchester City', 'Manchester City', 'Manchester City']
	hooks = ['Win the Daily, collect the player', 'Collecting the whole Premier League', 'Get it in 2 guesses for a foil card', 'My Player Cards collection so far']
	for k in range(n):
		theme, fullscreen_ = looks[k % len(looks)]
		st = cards_store(theme)
		shots = [shot('0', '/', st, 2500), shot('1', '/cards', st, 2500), shot('2', '/cards/mci', st, 2500), shot('3', '/cards/bha', st, 2500)]
		order = [[0, 1, 2, 3], [1, 2, 3, 0], [1, 3, 2, 0], [0, 1, 3, 2]][k % 4]
		words = {0: 'Win today\'s Daily, win the card', 1: 'Collect every player in the league', 2: 'Finish a club\'s set for free hints', 3: 'Win in 2 guesses and it\'s a foil'}
		scenes = [{'frame': i, 'hold': 2.8, 'hook': words[i], 'zoom': {'s': 1.25, 'x': 0.5, 'y': 0.35} if fullscreen_ and i else None} for i in order]
		scenes = [{k2: v for k2, v in sc.items() if v is not None} for sc in scenes]
		out.append({'id': f'cards-{k + 1:02d}', 'mode': 'cards', 'keys': [],
			'job': {'hook': hooks[k % len(hooks)], 'kicker': 'FOOTBALLDLE · PLAYER CARDS', 'full': fullscreen_, 'palette': PALETTES[[0, 1, 3, 2][k % 4]], 'scenes': [{'card': {'kicker': 'PLAYER CARDS', 'title': hooks[k % len(hooks)]}, 'hold': 2.0}] + scenes},
			'cfg': {'fakeDate': CARDS_DAY.isoformat() + 'T18:00:00Z', 'shots': shots},
			'caption': f'Which club set would you finish first? 🃏 Win the Daily to collect the card. Search Footballdle on the App Store. {TAGS} #footballcards'})
	return out

# One screen, lots of themes
THEME_NAMES = {'floodlights': 'Floodlights', 'light': 'Light', 'pastel': 'Pastel', 'greyscale': 'Greyscale', 'retro': 'Retro 90s', 'chalk': 'Tactics Chalkboard', 'sunday': 'Sunday League', 'night': 'Night Match', 'golden': 'Golden Boot', 'programme': 'Classic Programme', 'ocean': 'Ocean', 'berry': 'Berry', 'crimson': 'Crimson', 'tangerine': 'Tangerine', 'lemon': 'Lemon', 'lilac': 'Lilac'}
def themes(n, used, rng):
	out = []
	d = sorted(data()['daily'], key=lambda x: -x['pop'])
	g = sorted(data()['grid'], key=lambda x: -x['fame'])
	sets = [['floodlights', 'retro', 'golden', 'ocean', 'berry', 'lemon', 'chalk'], ['night', 'pastel', 'crimson', 'programme', 'tangerine', 'greyscale', 'lilac'],
		['chalk', 'sunday', 'ocean', 'golden', 'light', 'berry', 'retro'], ['lilac', 'crimson', 'floodlights', 'lemon', 'night', 'programme', 'pastel']]
	screens = ['home', 'daily', 'grid', 'home']
	hooks = ['Same game, different kit', 'Which one are you picking?', 'Rate these themes 1 to 10', 'Pick a theme to match your club']
	for k in range(n):
		ts = sets[k % len(sets)]
		x = d[(k * 5) % len(d)]
		shots = []
		for i, t in enumerate(ts):
			if screens[k % 4] == 'home': shots.append(shot(str(i), '/', store(t), 2400))
			elif screens[k % 4] == 'daily': shots.append(mid_daily(x, t, str(i)))
			else: shots.append(grid_part(g[k], t, str(i)))
		_, _, fake = CP.day(x['puzzle'])
		scenes = [{'frame': i, 'hold': 1.5, 'hook': THEME_NAMES[t], 'kicker': 'THEME ' + str(i + 1) + ' OF ' + str(len(ts))} for i, t in enumerate(ts)]
		scenes.append({'card': {'kicker': '16 THEMES', 'title': 'Which one\'s yours?', 'sub': 'Comment your pick'}, 'hold': 2.2})
		out.append({'id': f'themes-{k + 1:02d}', 'mode': 'themes', 'keys': [],
			'job': {'hook': hooks[k % len(hooks)], 'kicker': 'FOOTBALLDLE · THEMES', 'full': k % 2 == 1, 'palette': PALETTES[k % len(PALETTES)], 'scenes': [{'card': {'kicker': 'FOOTBALLDLE', 'title': hooks[k % len(hooks)]}, 'hold': 1.6}] + scenes},
			'cfg': {'fakeDate': fake if screens[k % 4] == 'daily' else '2026-10-2%dT10:24:00Z' % (k + 1), 'shots': shots},
			'caption': f'Which one\'s yours? 🎨 Comment your pick. Search Footballdle on the App Store. {TAGS} #aesthetic #iphoneapps'})
	return out

# A quick tour of every part of the app, one theme per video
def montage(n, used, rng):
	out = []
	d = sorted(data()['daily'], key=lambda x: -x['pop'])
	sc = sorted(data()['scout'], key=lambda x: -x['pop'])
	sp = sorted(data()['spot'], key=lambda x: -x['fame'])
	g = sorted(data()['grid'], key=lambda x: -x['fame'])
	looks = ['floodlights'] * 4
	hooks = ['4 football games, free every day', 'Your daily football fix', 'Everything in one football app', 'The football guessing game']
	for k in range(n):
		t = looks[k % len(looks)]
		x, y, z = d[k + 10], sc[k % len(sc)], sp[k % len(sp)]
		_, yds, yfake = CP.day(y['puzzle'])
		_, _, zfake = CP.day(z['puzzle'])
		parts = [
			{'fakeDate': CP.day(x['puzzle'])[2], 'shots': [mid_daily(x, t, 'daily')]},
			{'fakeDate': '2026-10-26T10:24:00Z', 'shots': [shot('home', '/', store(t), 2500), grid_part(g[k + 5], t, 'grid'),
				shot('cards', '/cards', cards_store(t), 2500), shot('trophies', '/trophies', store(t), 2500), shot('themes', '/settings', store(t), 2200, tap_text('Themes'))]},
			{'fakeDate': yfake, 'shots': [shot('scout', '/play/scout-report?start=play', store(t, **{'footballdle-scout': {'date': yds, 'guesses': [], 'gameOver': False, 'isWin': False, 'purchasedHints': 0}}), 2200)]},
			{'fakeDate': zfake, 'shots': [{'name': 'spotrun', 'url': APP + '/play/spot-the-baller?start=play', 'storage': {kk: vv for kk, vv in store(t).items() if kk != 'footballdle-spot'}, 'wait': 1500, 'steps': [{'wait': 1200, 'name': 'spot'}]}]},
		]
		seq = [('home', 'Matchday: new puzzles every day'), ('daily', 'Guess the player in 6'), ('scout', 'Scout Report: read the brief'), ('spot', 'Spot the Baller: beat the clock'),
			('grid', 'The Grid: fill all 9'), ('cards', 'Collect Player Cards'), ('trophies', 'Win trophies'), ('themes', '16 themes')]
		scenes = [{'frame': f, 'hold': 1.7, 'hook': h} for f, h in seq]
		out.append({'id': f'montage-{k + 1:02d}', 'mode': 'montage', 'keys': [],
			'job': {'hook': hooks[k % len(hooks)], 'kicker': 'FOOTBALLDLE', 'full': k % 2 == 1, 'palette': PALETTES[(k + 2) % len(PALETTES)], 'scenes': [{'card': {'kicker': 'FREE ON IPHONE', 'title': hooks[k % len(hooks)]}, 'hold': 1.8}] + scenes},
			'cfg': {'multi': parts},
			'caption': f'Which one would you play first? ⚽ Free every day. Search Footballdle on the App Store. {TAGS} #iphonegames #footballgame'})
	return out

# Streaks and the trophy cabinet of someone who never misses
TROPHIES = re.findall(r"id: '(fd_[a-z_0-9]+)'", open(os.path.join(ROOT, 'app', 'utils', 'achievements.ts')).read())
def streaks(n, used, rng):
	out = []
	runs = [(87, 'floodlights'), (150, 'floodlights'), (45, 'floodlights')]
	for k in range(n):
		days, t = runs[k % len(runs)]
		today = datetime.date(2026, 10, 26)
		last = uk(today)
		def mode_stats(played, wins, cur):
			return {'gamesPlayed': played, 'wins': wins, 'losses': played - wins, 'currentStreak': cur, 'maxStreak': cur, 'lastPlayedDate': last, 'guessDistribution': {'1': 3, '2': 14, '3': 40, '4': 31, '5': 15, '6': 6}, 'recentForm': [True] * 10}
		best = {a: 100 for a in TROPHIES}
		for a in TROPHIES[k * 7:k * 7 + 9]: best[a] = 40 + (hash(a) % 50)
		st = store(t, **{'footballdle-stats-daily': mode_stats(days + 20, days + 12, days), 'footballdle-stats-scout': mode_stats(days - 10, days - 14, days - 12),
			'footballdle-stats-spotball': mode_stats(days - 5, days - 5, days - 20), 'footballdle-play-streak': {'current': days, 'best': days, 'lastDate': last},
			'footballdle-achievement-best': best})
		shots = [shot('1', '/stats', st, 2500), shot('2', '/trophies', st, 2500), shot('3', '/trophies', st, 2500, 'window.scrollTo(0, 900); document.querySelector(\'main, .page, .trophies\')?.scrollBy?.(0, 900)')]
		hooks = [f'Day {days}. Haven\'t missed one.', f'{days} days in a row', f'What a {days}-day streak looks like']
		scenes = [{'card': {'kicker': 'MATCHDAY STREAK', 'title': hooks[k % 3], 'big': str(days)}, 'hold': 2.2},
			{'frame': 1, 'hold': 2.4, 'hook': f'{days}-day streak', 'zoom': {'s': 1.4, 'x': 0.25, 'y': 0.1}}, {'frame': 1, 'hold': 2.8, 'hook': 'The stats'}, {'frame': 2, 'hold': 2.6, 'hook': 'The trophy cabinet'}, {'frame': 3, 'hold': 2.4, 'hook': 'Nearly all of them'},
			{'card': {'kicker': 'YOUR TURN', 'title': 'What\'s your longest streak?', 'sub': 'Comment it below'}, 'hold': 2.2}]
		out.append({'id': f'streaks-{k + 1:02d}', 'mode': 'streaks', 'keys': [],
			'job': {'hook': hooks[k % 3], 'kicker': 'FOOTBALLDLE · STREAKS', 'full': True, 'palette': PALETTES[[1, 0, 2][k % 3]], 'scenes': scenes},
			'cfg': {'fakeDate': today.isoformat() + 'T19:00:00Z', 'shots': shots},
			'caption': f'What\'s your longest streak? 🔥 New puzzles every day. Search Footballdle on the App Store. {TAGS} #streak #dailychallenge'})
	return out

FORMATS = {'cards': cards, 'themes': themes, 'montage': montage, 'streaks': streaks, 'facts': facts, 'full': fullscreen, 'quiz': quiz, 'worst': worst, 'speedrun': speedrun}

def plan(args):
	used = set(json.load(open(os.path.join(HERE, 'used.json'))))
	rng = random.Random(datetime.date.today().isoformat())
	items = []
	for a in args:
		# name=n, or name=n+k to number them after k already made (worst=3+1 makes worst-02 to -04)
		name, n = a.split('=')
		n, _, off = n.partition('+')
		got = FORMATS[name](int(n), used, rng)
		for v in got:
			head, _, num = v['id'].rpartition('-')
			if num.isdigit() and off: v['id'] = f'{head}-{int(num) + int(off):02d}'
		items += got
	json.dump(items, open(FPLAN, 'w'), indent='\t', ensure_ascii=False)
	print(f'{len(items)} videos planned')

def capture(vid):
	v = next(x for x in json.load(open(FPLAN)) if x['id'] == vid)
	out = os.path.join(WORK, 'frames', vid)
	os.makedirs(out, exist_ok=True)
	if not v.get('cfg'): return
	for part in v['cfg'].get('multi', [v['cfg']]):
		cfg = {'width': 390, 'height': 844, 'scale': 2, 'outDir': out, 'css': base['css'], **part}
		path = os.path.join(WORK, 'cfg.json'); json.dump(cfg, open(path, 'w'))
		subprocess.run(['node', os.path.join(HERE, 'shoot.mjs'), path], check=True, capture_output=True)

if __name__ == '__main__':
	{'plan': lambda: plan(sys.argv[2:]), 'capture': lambda: capture(sys.argv[2])}[sys.argv[1]]()
