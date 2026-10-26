#!/bin/zsh
# Makes a batch of short videos (TikTok, Reels, Shorts) of the real app playing past
# puzzles, one at a time into ~/Desktop/Footballdle TikToks/batch-<date>/<mode>/.
#
#   yarn tiktok                   14 Daily, 10 Scout Report, 10 Spot the Baller, 10 Grid
#   yarn tiktok 6 4 4 4           your own numbers, in that order
#   NO_BUILD=1 yarn tiktok ...    reuse the last app build in .output (quicker)
#
# Never uses today's puzzles, and never one used in an earlier batch (used.json, commit it
# after a batch so the next one picks new puzzles). Needs Google Chrome; macOS's own
# avconvert fixes each video's length so TikTok reads it properly.
set -u
HERE=${0:a:h}
ROOT=${HERE:h:h}
WORK=$ROOT/.tiktok
# A new folder each run, so a second batch on the same day can't overwrite the first
DEST="$HOME/Desktop/Footballdle TikToks/batch-$(date +%Y-%m-%d)"
n=2; while [[ -e "$DEST" ]]; do DEST="$HOME/Desktop/Footballdle TikToks/batch-$(date +%Y-%m-%d)-$n"; n=$((n + 1)); done
cd $ROOT

mkdir -p $WORK/raw "$DEST"
if [[ -z ${NO_BUILD:-} ]]; then
	echo "Building the app…"
	APP_TARGET=ios npx nuxt generate >$WORK/build.log 2>&1 || { echo "App build failed, see .tiktok/build.log"; exit 1 }
fi

echo "Choosing puzzles…"
node_modules/.bin/vite-node $HERE/extract.ts $WORK/data.json || exit 1
python3 $HERE/plan.py ${1:-14} ${2:-10} ${3:-10} ${4:-10} || exit 1

# The app on 4273, the video page and screens on 4290 (both stopped at the end)
cp $HERE/render.html $WORK/render.html
python3 $HERE/serve.py $ROOT/.output/public 4273 >/dev/null 2>&1 & APP_PID=$!
python3 -m http.server 4290 --bind 127.0.0.1 --directory $WORK >/dev/null 2>&1 & WEB_PID=$!
trap 'kill $APP_PID $WEB_PID 2>/dev/null' EXIT
sleep 2

rm -rf $WORK/frames $WORK/captions.json
IDS=($(python3 -c "import json; print(' '.join(v['id'] for v in json.load(open('$WORK/plan.json'))))"))
made=0
for id in $IDS; do
	mode=${id%-*}
	python3 $HERE/capture.py $id >/dev/null || { echo "  couldn't capture $id, skipped"; continue }
	node $HERE/make-videos.mjs $WORK/raw $id >/dev/null || { echo "  couldn't record $id, skipped"; continue }
	mkdir -p "$DEST/$mode"
	avconvert --preset PresetHighestQuality --source $WORK/raw/$mode/$id.mp4 --output "$DEST/$mode/$id.mp4" --replace >/dev/null 2>&1 \
		&& { made=$((made + 1)); echo "  ready: $mode/$id.mp4 ($made of ${#IDS})" }
done

python3 $HERE/posting-plan.py "$DEST" >/dev/null
# Remember what this batch used, so the next one picks different puzzles
python3 - <<EOF
import json, os
used = set(json.load(open('$HERE/used.json')))
caps = {c['id'] for c in json.load(open('$WORK/captions.json'))}
plan = json.load(open('$WORK/plan.json'))
done = [v for v in plan if v['id'] in caps and os.path.exists(os.path.join("$DEST", v['mode'], v['id'] + '.mp4'))]
used |= {v['item']['key'] for v in done}
used |= {f"who:{v['mode']}:{(v['item'].get('word') or v['item']['name']).lower()}" for v in done if v['mode'] in ('daily', 'scout')}
json.dump(sorted(used), open('$HERE/used.json', 'w'), indent='\t')
EOF
echo "Done: $made videos in $DEST"
echo "Open plan.html in that folder for the posting plan, then commit scripts/tiktok/used.json."
