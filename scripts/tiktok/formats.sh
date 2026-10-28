#!/bin/zsh
# Makes the varied-format videos (formats.py), one at a time, flat into one batch folder.
#   zsh scripts/tiktok/formats.sh facts=8 quiz=6 ...
#   DEST=<folder> to add to an existing batch folder; NO_BUILD=1 reuses the last app build
set -u
HERE=${0:a:h}
ROOT=${HERE:h:h}
WORK=$ROOT/.tiktok
DEST=${DEST:-"$HOME/Desktop/Footballdle TikToks/batch-$(date +%Y-%m-%d)"}
cd $ROOT
mkdir -p $WORK/raw "$DEST"
if [[ -z ${NO_BUILD:-} ]]; then
	echo "Building the app…"
	APP_TARGET=ios npx nuxt generate >$WORK/build.log 2>&1 || { echo "App build failed, see .tiktok/build.log"; exit 1 }
fi
node_modules/.bin/vite-node $HERE/extract.ts $WORK/data.json >/dev/null || exit 1
python3 $HERE/formats.py plan "$@" || exit 1

cp $HERE/render.html $WORK/render.html
python3 $HERE/serve.py $ROOT/.output/public 4273 >/dev/null 2>&1 & APP_PID=$!
python3 -m http.server 4290 --bind 127.0.0.1 --directory $WORK >/dev/null 2>&1 & WEB_PID=$!
trap 'kill $APP_PID $WEB_PID 2>/dev/null' EXIT
sleep 2

IDS=($(python3 -c "import json; print(' '.join(v['id'] for v in json.load(open('$WORK/fplan.json'))))"))
made=0
for id in $IDS; do
	rm -rf $WORK/frames/$id
	python3 $HERE/formats.py capture $id || { echo "  couldn't capture $id, skipped"; continue }
	PLAN=$WORK/fplan.json node $HERE/make-videos.mjs $WORK/raw $id >/dev/null || { echo "  couldn't record $id, skipped"; continue }
	avconvert --preset PresetHighestQuality --source $WORK/raw/$id.mp4 --output "$DEST/$id.mp4" --replace >/dev/null 2>&1 || continue
	made=$((made + 1)); echo "  ready: $id.mp4 ($made of ${#IDS})"
	# Remember what it used straight away, so a stopped run still counts
	python3 - <<EOF
import json
p = '$HERE/used.json'; used = set(json.load(open(p)))
v = next(x for x in json.load(open('$WORK/fplan.json')) if x['id'] == '$id')
used |= set(v.get('keys', []))
json.dump(sorted(used), open(p, 'w'), indent='\t')
EOF
done
echo "Done: $made videos in $DEST"
