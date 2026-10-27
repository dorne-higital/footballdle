# Writes plan.html into the batch folder: every finished video in posting order, with
# text and hashtags to copy and a videos-a-day setting.
#   python3 posting-plan.py <batch folder>
import json, datetime, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.join(HERE, '..', '..', '.tiktok')
caps = json.load(open(os.path.join(WORK, 'captions.json')))
DEST = sys.argv[1]
# Only videos that are actually in the Desktop folder
caps = sorted([c for c in caps if os.path.exists(os.path.join(DEST, c['file']))], key=lambda c: c['id'])
MODE_TAGS = {'daily': '#footballwordle #guesstheplayer', 'scout': '#scouting #fantasyfootball', 'spot': '#guessthefootballer #quiztime', 'grid': '#footballgrid #pausethevideo'}
# Notes from the varied formats (e.g. a quiz's answer to pin)
import glob
notes = {v['id']: v.get('note', '') for f in sorted(glob.glob(os.path.join(WORK, 'fplan*.json'))) for v in json.load(open(f)) if v.get('note')}
modes = list(dict.fromkeys(c['mode'] for c in caps))
left = {m: [c for c in caps if c['mode'] == m] for m in modes}
start = datetime.date.today() + datetime.timedelta(days=1)
# Never the same kind twice in a row; the kind with the most left goes next
order, d, last = [], start, None
while any(left.values()):
	pool = [k for k in modes if left[k] and k != last] or [k for k in modes if left[k]]
	m = max(pool, key=lambda k: len(left[k]))
	order.append((d, left[m].pop(0))); last = m; d += datetime.timedelta(days=1)
NAMES = {'daily': 'Daily', 'scout': 'Scout Report', 'spot': 'Spot the Baller', 'grid': 'The Grid', 'facts': 'Facts', 'quiz': 'Quiz', 'cards': 'Player Cards',
	'themes': 'Themes', 'montage': 'Montage', 'streaks': 'Streaks', 'worst': 'Worst guesses', 'speedrun': 'Speedrun', 'full': 'Full screen', 'code': 'Free hints code'}
TEXTS = {
	'daily': ['Did you get it before the last row? 👀', 'Be honest, how many guesses did it take you?', 'Comment your guess before the reveal 👇', 'Easy or impossible? 🤔', 'Who got this one in 3?'],
	'scout': ['Did you get him? 🕵️', 'Who would you have signed?', 'How many guesses did you need?'],
	'spot': ['How many did you get out of 3? Comment your score 👇', 'Three out of three or nothing 😤', 'Be honest, how many did you know?'],
	'grid': ['How many squares could you fill? 👇', 'Pause it and try before the answers', 'Which square stumped you?'],
}
CTA = ['A new player every day on Footballdle.', 'Search Footballdle on the App Store to play daily.', 'New one tomorrow on Footballdle.']
rows = []
for day, c in order:
	if c['mode'] not in TEXTS:
		# The varied formats carry their own caption: text, then hashtags
		cut = c['caption'].find(' #')
		text, tags = (c['caption'][:cut], c['caption'][cut + 1:]) if cut > 0 else (c['caption'], '#football #footballdle')
		rows.append({'date': day.strftime('%a %-d %b'), 'mode': c['mode'], 'modeName': NAMES.get(c['mode'], c['mode'].title()), 'file': c['file'], 'seconds': c['seconds'], 'hook': c['hook'], 'text': text, 'tags': tags, 'note': notes.get(c['id'], '')})
		continue
	n = int(c['id'].split('-')[1])
	brief = c['caption'].split(' Did you get him')[0] + ' ' if c['mode'] == 'scout' else ''
	text = brief + TEXTS[c['mode']][n % len(TEXTS[c['mode']])] + ' ' + CTA[n % len(CTA)]
	tags = '#football #premierleague #footballquiz #footballdle ' + MODE_TAGS[c['mode']]
	rows.append({'date': day.strftime('%a %-d %b'), 'mode': c['mode'], 'modeName': NAMES[c['mode']], 'file': c['file'], 'seconds': c['seconds'], 'hook': c['hook'], 'text': text, 'tags': tags})
tpl = open(os.path.join(HERE, 'posting-plan.html')).read()
page = tpl.replace('__START__', start.isoformat()).replace('__FOLDER__', os.path.basename(DEST.rstrip('/')))
open(os.path.join(DEST, 'plan.html'), 'w').write('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n' + page.replace('__ROWS__', json.dumps(rows, ensure_ascii=False)).replace('__COUNT__', str(len(rows))).replace('__LAST__', order[-1][0].strftime('%-d %B')))
print(len(rows), 'videos, last post', order[-1][0])
