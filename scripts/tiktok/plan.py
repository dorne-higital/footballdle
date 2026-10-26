# Picks the videos for a batch from .tiktok/data.json: the best-known puzzles first, never
# one used in an earlier batch (scripts/tiktok/used.json, committed), modes interleaved
# so videos land one of each at a time.
#   python3 plan.py <daily> <scout> <spot> <grid>
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.join(HERE, '..', '..', '.tiktok')
counts = dict(zip(('daily', 'scout', 'spot', 'grid'), map(int, (sys.argv[1:5] + ['14', '10', '10', '10'])[:4])))
data = json.load(open(os.path.join(WORK, 'data.json')))
used = set(json.load(open(os.path.join(HERE, 'used.json'))))

# who:<player> stops the same player getting a second Daily or Scout video on another day
def who(mode, x):
    return f"who:{mode}:{(x.get('word') or x.get('name', '')).lower()}" if mode in ('daily', 'scout') else None

def best(items, key, n, same, mode):
    seen, out = set(), []
    for x in sorted(items, key=lambda x: -x[key]):
        if x['key'] in used or who(mode, x) in used or same(x) in seen: continue
        seen.add(same(x)); out.append(x)
        if len(out) == n: break
    return out

picked = {
    'daily': best(data['daily'], 'pop', counts['daily'], lambda x: x['word'], 'daily'),
    'scout': best(data['scout'], 'pop', counts['scout'], lambda x: x['name'], 'scout'),
    'spot': best(data['spot'], 'fame', counts['spot'], lambda x: x['key'], 'spot'),
    'grid': best(data['grid'], 'fame', counts['grid'], lambda x: tuple(x['clubs']), 'grid'),
}
plan = []
for i in range(max(len(v) for v in picked.values())):
    for mode in ('daily', 'scout', 'spot', 'grid'):
        if i < len(picked[mode]): plan.append({'id': f'{mode}-{i:02d}', 'mode': mode, 'n': i, 'item': picked[mode][i]})
json.dump(plan, open(os.path.join(WORK, 'plan.json'), 'w'))
short = [f'{m} ({len(picked[m])} of {counts[m]})' for m in counts if len(picked[m]) < counts[m]]
print(f'Batch: {len(plan)} videos' + (f'. Not enough new puzzles for: {", ".join(short)}' if short else ''))
