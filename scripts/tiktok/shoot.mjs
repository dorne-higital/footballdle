// Screenshots of the app in headless Chrome (scripts/tiktok). Usage: node shoot.mjs <config.json>
// config: { width, height, scale, outDir, fakeDate?, css?, shots: [{ name, url, storage?, wait?, click?, js? }] }
import { spawn } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const cfg = JSON.parse(readFileSync(process.argv[2], 'utf8'))
mkdirSync(cfg.outDir, { recursive: true })
const profile = `/tmp/footballdle-shoot-${process.pid}`
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
	'--headless=new', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-port=9341',
	`--user-data-dir=${profile}`, 'about:blank',
], { stdio: 'ignore' })
const sleep = ms => new Promise(r => setTimeout(r, ms))
let target
for (let i = 0; i < 50 && !target; i++) {
	await sleep(200)
	try { target = (await (await fetch('http://127.0.0.1:9341/json')).json()).find(t => t.type === 'page') } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise(r => ws.addEventListener('open', r))
let id = 0
const pending = new Map()
ws.addEventListener('message', e => {
	const msg = JSON.parse(e.data)
	if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id) }
})
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
await send('Page.enable')
await send('Network.enable')
await send('Emulation.setDeviceMetricsOverride', { width: cfg.width, height: cfg.height, deviceScaleFactor: cfg.scale, mobile: true })
await send('Emulation.setTouchEmulationEnabled', { enabled: true })
if (cfg.userAgent) await send('Emulation.setUserAgentOverride', { userAgent: cfg.userAgent })
const origin = new URL(cfg.shots[0].url).origin
// Pin the page clock to a fixed day so screenshots don't show, or spoil, a real puzzle
if (cfg.fakeDate) {
	await send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => {
		const RealDate = Date
		const offset = new RealDate(${JSON.stringify(cfg.fakeDate)}).getTime() - RealDate.now()
		class FakeDate extends RealDate {
			constructor(...args) { args.length ? super(...args) : super(RealDate.now() + offset) }
			static now() { return RealDate.now() + offset }
		}
		window.Date = FakeDate
	})()` })
}
if (cfg.css) {
	await send('Page.addScriptToEvaluateOnNewDocument', { source: `document.addEventListener('DOMContentLoaded', () => {
		const style = document.createElement('style'); style.textContent = ${JSON.stringify(cfg.css)}; document.head.appendChild(style)
	})` })
}
for (const shot of cfg.shots) {
	await send('Page.navigate', { url: origin + '/__blank' })
	await sleep(400)
	const storage = JSON.stringify(shot.storage || {})
	await send('Runtime.evaluate', { expression: `localStorage.clear(); Object.entries(${storage}).forEach(([k, v]) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)))` })
	await send('Page.navigate', { url: shot.url })
	await sleep(shot.wait ?? 2500)
	for (const sel of shot.click || []) {
		await send('Runtime.evaluate', { expression: `document.querySelector(${JSON.stringify(sel)})?.click()` })
		await sleep(900)
	}
	if (shot.js) { await send('Runtime.evaluate', { expression: shot.js, awaitPromise: true }); await sleep(900) }
	if (shot.evalUrl) {
		const res = await send('Runtime.evaluate', { expression: 'JSON.stringify([location.href, navigator.userAgent.slice(0,40), !!document.querySelector(".get-app"), !!window.__NUXT__, document.documentElement.className])', returnByValue: true })
		console.log(shot.name, 'ended on', res.result.result.value)
		continue
	}
	if (cfg.probe) {
		const res = await send("Runtime.evaluate", { expression: cfg.probe, returnByValue: true, awaitPromise: true })
		console.log(shot.name, JSON.stringify(res.result.result?.value ?? res.result))
		continue
	}
	// steps: several screenshots in one page load, e.g. tap an answer then capture the reveal
	if (shot.steps) {
		for (const step of shot.steps) {
			if (step.js) await send('Runtime.evaluate', { expression: step.js, awaitPromise: true })
			if (step.wait) await sleep(step.wait)
			if (step.name) {
				const { result } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
				writeFileSync(`${cfg.outDir}/${step.name}.png`, Buffer.from(result.data, 'base64'))
			}
		}
		console.log('shot', shot.name)
		continue
	}
	const { result } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
	writeFileSync(`${cfg.outDir}/${shot.name}.png`, Buffer.from(result.data, 'base64'))
	console.log('shot', shot.name)
}
ws.close()
chrome.kill()
