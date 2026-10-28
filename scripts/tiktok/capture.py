# Captures the app screens for one video, or all of a batch (scripts/tiktok).
#   python3 capture.py [video id]
import json, subprocess, sys, os, datetime
# Screens come from the app build (.output/public) served on APP, with a fake clock set to
# the puzzle's day and saved progress put in place for each step. Stats in base.json make
# the screens look like a regular player's.
HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.join(HERE, '..', '..', '.tiktok')
base = json.load(open(os.path.join(HERE, 'base.json')))
CSS = base['css']
STORE = base['storage']
APP = 'http://127.0.0.1:4273'

def day(p):
    d = datetime.date(2026, 1, 1) + datetime.timedelta(days=p - 1)
    return d, d.strftime('%d/%m/%Y'), d.isoformat() + 'T10:24:00Z'

def run(cfg):
    path = os.path.join(WORK, 'cfg.json'); json.dump(cfg, open(path, 'w'))
    subprocess.run(['node', os.path.join(HERE, 'shoot.mjs'), path], check=True, capture_output=True)

def daily(x):
    _, ds, fake = day(x['puzzle'])
    words = x['guesses'] + [x['word']]
    shots = []
    for n in range(len(words) + 1):
        s = dict(STORE); s['footballdle-game'] = {'date': ds, 'guesses': words[:n], 'gameOver': n == len(words), 'isWin': n == len(words), 'purchasedHints': 0}
        shots.append({'name': str(n), 'url': APP + '/play/daily?start=play', 'storage': s, 'wait': 2200})
    return {'fakeDate': fake, 'shots': shots}

def scout(x):
    _, ds, fake = day(x['puzzle'])
    shots = []
    for n in range(len(x['guesses']) + 1):
        s = dict(STORE); s['footballdle-scout'] = {'date': ds, 'guesses': x['guesses'][:n], 'gameOver': n == len(x['guesses']), 'isWin': n == len(x['guesses']), 'purchasedHints': 0}
        s.pop('footballdle-spot', None)
        shots.append({'name': str(n), 'url': APP + '/play/scout-report?start=play', 'storage': s, 'wait': 2200})
    return {'fakeDate': fake, 'shots': shots}

def tap(name):
    return "(() => { const want = %s.toLowerCase(); const b = [...document.querySelectorAll('button')].find(b => b.textContent.trim().toLowerCase().includes(want)); b?.click(); return !!b })()" % json.dumps(name)

def spot(x):
    _, ds, fake = day(x['puzzle'])
    s = {k: v for k, v in STORE.items() if k != 'footballdle-spot'}
    steps = [{'wait': 1200, 'name': '0'}]
    for i, r in enumerate(x['rounds']):
        steps += [{'js': tap(r['name']), 'wait': 600, 'name': f'{i*2+1}'}]
        if i < len(x['rounds']) - 1: steps += [{'wait': 900, 'js': "document.querySelector('.reveal-skip')?.click()"}, {'wait': 1000, 'name': f'{i*2+2}'}]
    return {'fakeDate': fake, 'shots': [{'name': 'spot', 'url': APP + '/play/spot-the-baller?start=play', 'storage': s, 'wait': 1500, 'steps': steps}]}

def grid(x, fake='2026-10-20T10:24:00Z'):
    shots = []
    for n, filled in enumerate([0, 3, 6, 9]):
        sq = [{'player': x['squares'][i]['raw'] if i < filled else None, 'wrong': 0, 'hinted': False, 'hintLetter': None} for i in range(9)]
        s = dict(STORE); s['footballdle-grid'] = {'v': 1, 'weekIndex': -1, 'week': [], 'practice': {'deal': {'clubs': x['clubs'], 'rows': x['rowIds']}, 'squares': sq, 'done': filled == 9, 'recorded': True}, 'recentPractice': []}
        shots.append({'name': str(n), 'url': APP + '/play/grid', 'storage': s, 'wait': 1800, 'js': "document.querySelector('.practice-btn')?.click()"})
    return {'fakeDate': fake, 'shots': shots}

MAKERS = {'daily': daily, 'scout': scout, 'spot': spot, 'grid': grid}

def capture(mode, idx, item):
    out = os.path.join(WORK, 'frames', f'{mode}-{idx:02d}')
    cfg = {'width': 390, 'height': 844, 'scale': 2, 'outDir': out, 'css': CSS, **MAKERS[mode](item)}
    run(cfg)
    return out

if __name__ == '__main__':
    plan = json.load(open(os.path.join(WORK, 'plan.json')))
    only = sys.argv[1] if len(sys.argv) > 1 else None
    for v in plan:
        if only and not v['id'].startswith(only): continue
        capture(v['mode'], v['n'], v['item']); print('captured', v['id'], flush=True)
