// Records the MP4 for one video (or all) from its captured app screens (.tiktok/frames/<id>)
// via render.html in headless Chrome. run.sh then fixes each file's length with avconvert.
//   node make-videos.mjs <raw output dir> [video id]
import { spawn } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const HERE = new URL('.', import.meta.url).pathname
const K = join(HERE, '../../.tiktok')
const OUT = process.argv[2]
const only = process.argv[3]
const plan = JSON.parse(readFileSync(join(K, 'plan.json'), 'utf8'))
// .tiktok is served here, with render.html copied in by run.sh
const ORIGIN = 'http://127.0.0.1:4290'
const sleep = ms => new Promise(r => setTimeout(r, ms))

const HOOKS = {
	daily: ['Can you get this footballer in 4 guesses?', 'Guess the Premier League player', 'Name this player before the 4th row', 'How quickly can you get this one?'],
	scout: ['Can you name him from the scout\'s brief?', 'Scout Report: who are we signing?', 'Work out the player from the clues', 'Can you crack this Scout Report?'],
	spot: ['Can you name all 3 before the clock runs out?', 'Who\'s this player? 3 rounds, go', 'Spot the Baller: how many can you get?'],
	grid: ['Can you fill this grid?', 'Name a player for every square', 'Pause the video and try this grid'],
}
const KICKER = { daily: 'FOOTBALLDLE · DAILY', scout: 'FOOTBALLDLE · SCOUT REPORT', spot: 'FOOTBALLDLE · SPOT THE BALLER', grid: 'FOOTBALLDLE · THE GRID' }
const TAGS = '#football #premierleague #footballquiz #guesstheplayer #footballtiktok #footballdle'
const CAPTION = {
	daily: x => `Did you get it before the last row? 👀 A new player every day on Footballdle. ${TAGS} #wordle`,
	scout: x => `${x.brief} Did you get him? 🕵️ ${TAGS}`,
	spot: x => `How many did you get out of 3? Comment your score 👇 ${TAGS}`,
	grid: x => `How many squares could you fill? Name your answers in the comments 👇 ${TAGS}`,
}

function job(v, frames) {
	const hook = HOOKS[v.mode][v.n % HOOKS[v.mode].length]
	const x = v.item
	const base = { frames, hook, kicker: KICKER[v.mode] }
	if (v.mode === 'daily') return { ...base, scenes: [
		{ frame: 0, hold: 1.6 }, { frame: 1, hold: 1.3 }, { frame: 2, hold: 1.3 }, { frame: 3, hold: 3.2, countdown: true },
		{ frame: 4, hold: 2.6, reveal: x.name }] }
	if (v.mode === 'scout') return { ...base, scenes: [
		{ frame: 0, hold: 2.6 }, { frame: 1, hold: 1.6 }, { frame: 2, hold: 1.6 }, { frame: 3, hold: 3.2, countdown: true },
		{ frame: 4, hold: 2.6, reveal: x.name }] }
	if (v.mode === 'spot') return { ...base, revealLabel: 'IT\'S', scenes: x.rounds.flatMap((r, i) => [
		{ frame: i * 2, hold: 3, ring: true, hook: i === 0 ? hook : `Round ${i + 1}` }, { frame: i * 2 + 1, hold: 1.5, reveal: r.name }]) }
	return { ...base, revealLabel: 'FULL GRID', countdownText: 'ANSWERS IN', scenes: [
		{ frame: 0, hold: 4.5, countdown: true }, { frame: 1, hold: 1.5 }, { frame: 2, hold: 1.5 }, { frame: 3, hold: 2.6, reveal: 'Did you get them all?' }] }
}

const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
	'--headless=new', '--hide-scrollbars', '--remote-debugging-port=9342', `--user-data-dir=/tmp/footballdle-video-${process.pid}`,
	'--autoplay-policy=no-user-gesture-required', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', 'about:blank',
], { stdio: 'ignore' })
let target
for (let i = 0; i < 50 && !target; i++) { await sleep(200); try { target = (await (await fetch('http://127.0.0.1:9342/json')).json()).find(t => t.type === 'page') } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise(r => ws.addEventListener('open', r))
let id = 0; const pending = new Map()
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) } })
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
await send('Emulation.setDeviceMetricsOverride', { width: 1080, height: 1920, deviceScaleFactor: 1, mobile: false })
await send('Page.navigate', { url: ORIGIN + '/render.html' })
await sleep(2500)

const captions = []
for (const v of plan) {
	if (only && !v.id.startsWith(only)) continue
	const dir = join(K, 'frames', v.id)
	if (!existsSync(dir)) { console.log('no frames for', v.id); continue }
	const n = readdirSync(dir).filter(f => f.endsWith('.png')).length
	const frames = Array.from({ length: n }, (_, i) => `${ORIGIN}/frames/${v.id}/${i}.png`)
	const j = job(v, frames)
	const res = await send('Runtime.evaluate', { expression: `makeVideo(${JSON.stringify(j)})`, awaitPromise: true, returnByValue: true })
	const val = res.result?.result?.value
	if (!val) { console.log('failed', v.id, JSON.stringify(res.result).slice(0, 300)); continue }
	mkdirSync(join(OUT, v.mode), { recursive: true })
	const file = join(OUT, v.mode, `${v.id}.mp4`)
	writeFileSync(file, Buffer.from(val.data, 'base64'))
	captions.push({ id: v.id, mode: v.mode, file: `${v.mode}/${v.id}.mp4`, seconds: Math.round(val.seconds), hook: j.hook, caption: CAPTION[v.mode](v.item) })
	console.log('made', v.id, val.type, Math.round(val.data.length * 0.75 / 1024) + 'KB', Math.round(val.seconds) + 's')
}
// Merge into captions.json, so videos made one at a time all end up in the plan
const capPath = join(K, 'captions.json')
const all = existsSync(capPath) ? JSON.parse(readFileSync(capPath, 'utf8')) : []
const merged = [...all.filter(c => !captions.some(n => n.id === c.id)), ...captions]
writeFileSync(capPath, JSON.stringify(merged, null, '\t'))
ws.close(); chrome.kill()
