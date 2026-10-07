<template>
	<Transition name="loader">
		<div
			v-if="visible"
			class="app-loader"
			aria-hidden="true"
		>
			<!-- Same mark, size and position as the native splash (Splash.imageset, aspect-fill),
			     so the hand-over from launch screen to web view is seamless -->
			<svg
				class="mark"
				viewBox="0 0 1024 1024"
			>
				<defs>
					<linearGradient
						id="loader-line"
						x1="0"
						x2="1"
					>
						<stop
							offset="0"
							stop-color="#2FE08A"
							stop-opacity="0"
						/>
						<stop
							offset=".3"
							stop-color="#2FE08A"
							stop-opacity=".22"
						/>
						<stop
							offset=".7"
							stop-color="#2FE08A"
							stop-opacity=".22"
						/>
						<stop
							offset="1"
							stop-color="#2FE08A"
							stop-opacity="0"
						/>
					</linearGradient>
					<filter
						id="loader-glow"
						x="-30%"
						y="-30%"
						width="160%"
						height="160%"
					>
						<feGaussianBlur stdDeviation="40" />
					</filter>
				</defs>
				<circle
					class="ring-base"
					cx="512"
					cy="512"
					r="330"
				/>
				<circle
					class="ring-draw"
					cx="512"
					cy="512"
					r="330"
					transform="rotate(-90 512 512)"
				/>
				<rect
					class="halfway"
					x="0"
					y="506"
					width="1024"
					height="12"
					fill="url(#loader-line)"
				/>
				<circle
					cx="512"
					cy="512"
					r="16"
					fill="#2FE08A"
					fill-opacity="0.22"
				/>
				<g
					class="glow"
					filter="url(#loader-glow)"
					fill="#2FE08A"
				>
					<rect
						x="350"
						y="236"
						width="128"
						height="552"
					/>
					<rect
						x="350"
						y="236"
						width="380"
						height="122"
					/>
					<rect
						x="350"
						y="452"
						width="316"
						height="114"
					/>
				</g>
				<g fill="#F2FBF5">
					<rect
						x="350"
						y="236"
						width="128"
						height="552"
						rx="16"
					/>
					<rect
						x="350"
						y="236"
						width="380"
						height="122"
						rx="16"
					/>
					<rect
						x="350"
						y="452"
						width="316"
						height="114"
						rx="16"
					/>
				</g>
			</svg>
			<p class="wordmark">Footballdle</p>
		</div>
	</Transition>
</template>

<script setup lang="ts">
	import { onMounted, ref } from 'vue'
	import { SplashScreen } from '@capacitor/splash-screen'

	// iOS app intro: takes over from the native splash, plays a short floodlight
	// animation while the first screen settles, then fades away
	// Long enough for the ring to draw, short enough not to feel like a wait. With
	// Reduce Motion there's no animation to watch, so it goes as soon as it can.
	const MIN_SHOW_MS = 800
	const visible = ref(true)

	onMounted(() => {
		const shownAt = performance.now()
		// The web view now looks identical to the launch screen, so drop the native one
		requestAnimationFrame(() => SplashScreen.hide({ fadeOutDuration: 0 }).catch(() => {}))
		const finish = () => {
			const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
			const wait = reduced ? 0 : Math.max(0, MIN_SHOW_MS - (performance.now() - shownAt))
			setTimeout(() => (visible.value = false), wait)
		}
		if (document.readyState === 'complete') finish()
		else window.addEventListener('load', finish, { once: true })
	})
</script>

<style scoped lang="scss">
	.app-loader {
		align-items: center;
		background:
			radial-gradient(ellipse 60% 40% at 50% 45%, rgb(47 224 138 / 14%) 0%, rgb(47 224 138 / 0%) 70%),
			#07130d;
		display: flex;
		inset: 0;
		justify-content: center;
		position: fixed;
		z-index: 10000;
	}

	// Splash image is 2732² with a 1400px mark, scaled to fill the screen height
	.mark {
		height: calc(100dvh * 1400 / 2732);
		width: calc(100dvh * 1400 / 2732);
	}

	.ring-base {
		fill: none;
		stroke: #2fe08a;
		stroke-opacity: 0.22;
		stroke-width: 12;
	}

	.ring-draw {
		animation: draw 0.7s cubic-bezier(0.65, 0, 0.35, 1) 0.05s forwards;
		fill: none;
		stroke: #2fe08a;
		stroke-dasharray: 2074;
		stroke-dashoffset: 2074;
		stroke-linecap: round;
		stroke-width: 12;
	}

	.halfway {
		animation: sweep 0.55s ease-out 0.2s both;
		transform-box: fill-box;
		transform-origin: center;
	}

	.glow {
		animation: glow 1.4s ease-in-out infinite alternate;
		opacity: 0.35;
	}

	.wordmark {
		animation: rise 0.4s ease-out 0.25s both;
		bottom: calc(env(safe-area-inset-bottom) + 12vh);
		color: #eaf5ee;
		font-family: var(--font-display);
		font-size: 1.4rem;
		letter-spacing: 0.04em;
		margin: 0;
		opacity: 0.85;
		position: absolute;
	}

	.loader-leave-active {
		transition:
			opacity 0.3s ease,
			transform 0.3s ease;
	}

	.loader-leave-to {
		opacity: 0;
		transform: scale(1.04);
	}

	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}

	@keyframes sweep {
		from {
			opacity: 0;
			transform: scaleX(0.2);
		}

		to {
			opacity: 1;
			transform: scaleX(1);
		}
	}

	@keyframes glow {
		from {
			opacity: 0.3;
		}

		to {
			opacity: 0.6;
		}
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(8px);
		}

		to {
			opacity: 0.85;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ring-draw,
		.halfway,
		.glow,
		.wordmark {
			animation: none;
		}

		.ring-draw {
			stroke-dashoffset: 0;
		}

		.loader-leave-active {
			transition: opacity 0.2s ease;
		}

		.loader-leave-to {
			transform: none;
		}
	}
</style>
