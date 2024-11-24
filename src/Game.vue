<template>
	<Transition>
		<div class="message-modal" v-if="message">
			<div class="message-content">
				<span @click="closeMessage" class="close-button">
					<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800px" height="800px" viewBox="0 0 32 32" version="1.1">
						<g id="icomoon-ignore">
						</g>
						<path d="M6.576 6.576c-5.205 5.205-5.205 13.643 0 18.849s13.643 5.205 18.849-0c5.206-5.206 5.206-13.643 0-18.849s-13.643-5.205-18.849 0zM24.67 24.67c-4.781 4.781-12.56 4.781-17.341 0s-4.781-12.56 0-17.341c4.781-4.781 12.56-4.781 17.341 0s4.78 12.56-0 17.341z" fill="#000000">

						</path>
						<path d="M10.722 9.969l-0.754 0.754 5.278 5.278-5.253 5.253 0.754 0.754 5.253-5.253 5.253 5.253 0.754-0.754-5.253-5.253 5.278-5.278-0.754-0.754-5.278 5.278z" fill="#000000">

						</path>
					</svg>
				</span>

				<h3>{{ message }}</h3>

				<pre v-if="grid">{{ grid }}</pre>

				<!-- Share Button Section -->
				<div v-if="success && grid">
					<button @click="shareResults">Share Results</button>
				</div>
			</div>
		</div>
	</Transition>

	<header class="nav">
		<span 
			class="info-button"
			@click="openInfoModal"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 64 64" stroke-width="3" stroke="#000000" fill="none">
				<line x1="32.06" y1="17.55" x2="32.06" y2="16.88" stroke-linecap="round"/>
				<line x1="32.06" y1="45.3" x2="32.06" y2="24.87" stroke-linecap="round"/>
				<circle cx="32" cy="32" r="24.25" stroke-linecap="round"/>
			</svg>
		</span>
		<h2>Footballdle 24/25</h2>

		<span 
			class="stat-button"
			@click="openStatsModal"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 512 512">
				<title>ionicons-v5-i</title>
				<line x1="368" y1="128" x2="448" y2="128" style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/>
				<line x1="64" y1="128" x2="304" y2="128" style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/>
				<line x1="368" y1="384" x2="448" y2="384" style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/>
				<line x1="64" y1="384" x2="304" y2="384" style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/>
				<line x1="208" y1="256" x2="448" y2="256" style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/>
				<line x1="64" y1="256" x2="144" y2="256" style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/>
				<circle cx="336" cy="128" r="32" style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/>
				<circle cx="176" cy="256" r="32" style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/>
				<circle cx="336" cy="384" r="32" style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/>
			</svg>
		</span>
	</header>

	<div id="board">
		<div
			v-for="(row, index) in board"
			:class="[
				'row',
				shakeRowIndex === index && 'shake',
				success && currentRowIndex === index && 'jump'
			]"
		>
			<div
				v-for="(tile, index) in row"
				:class="[
					'tile', 
					tile.letter && 'filled', 
					tile.state && 'revealed'
				]"
			>
				<div 
					class="front" 
					:style="{ transitionDelay: `${index * 300}ms` }"
				>
					{{ tile.letter }}
				</div>

				<div
					:class="['back', tile.state]"
					:style="{
						transitionDelay: `${index * 300}ms`,
						animationDelay: `${index * 100}ms`
					}"
				>
					{{ tile.letter }}
				</div>
			</div>
		</div>
	</div>

	<Keyboard @key="onKey" :letter-states="letterStates" />

	<!-- Stats Modal -->
	<div 
		v-if="statsModalVisible" 
		class="stats-modal"
	>
		<div class="modal-content">
			<h3>Game Statistics</h3>
			<p>Games Played: {{ stats.gamesPlayed }}</p>
			<p>Games Won: {{ stats.gamesWon }}</p>
			<p>Win Rate: {{ winRate }}%</p>


			<h3>Settings</h3>
			<label>
			<input 
				type="checkbox" 
				v-model="darkTheme"
				@change="toggleTheme"
			/>
			Enable Dark Theme
			</label>

			<span 
				@click="closeStatsModal"
				class="close-button"
			>
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800px" height="800px" viewBox="0 0 32 32" version="1.1">
					<g id="icomoon-ignore">
					</g>
					<path d="M6.576 6.576c-5.205 5.205-5.205 13.643 0 18.849s13.643 5.205 18.849-0c5.206-5.206 5.206-13.643 0-18.849s-13.643-5.205-18.849 0zM24.67 24.67c-4.781 4.781-12.56 4.781-17.341 0s-4.781-12.56 0-17.341c4.781-4.781 12.56-4.781 17.341 0s4.78 12.56-0 17.341z" fill="#000000">

					</path>
					<path d="M10.722 9.969l-0.754 0.754 5.278 5.278-5.253 5.253 0.754 0.754 5.253-5.253 5.253 5.253 0.754-0.754-5.253-5.253 5.278-5.278-0.754-0.754-5.278 5.278z" fill="#000000">

					</path>
				</svg>
			</span>

			<button @click="resetStats">Reset Stats</button>
		</div>
	</div>

	<!-- Info Modal -->

	<div 
		v-if="infoModalVisible" 
		class="info-modal"
	>
		<div class="info-content">
			<h3>How to play</h3>
			<p>Guess the Footballer in 6 tries.</p>
			<p>Each guess must be a valid Premierleague footballer from the 24/25 season (name being 6 letters long)</p>
			<p>The game is played once per day, and resets at midnight UK time</p>
			<p>The colour of the tile will change to show how close you are to the player</p>

			<h4>Examples</h4>

			<div class="row">
				<span class="correct">M</span>
				<span class="">A</span>
				<span class="">I</span>
				<span class="">N</span>
				<span class="">O</span>
				<span class="">O</span>
			</div>
			<p><b>M</b> is in the name, and in the right spot</p>

			<div class="row">
				<span class="">E</span>
				<span class="">L</span>
				<span class="">A</span>
				<span class="present">N</span>
				<span class="">G</span>
				<span class="">A</span>
			</div>
			<p><b>N</b> is in the name, but in the wrong spot</p>

			<div class="row">
				<span class="">G</span>
				<span class="">O</span>
				<span class="">R</span>
				<span class="absent">D</span>
				<span class="">A</span>
				<span class="">N</span>
			</div>
			<p><b>D</b> is not in the players name</p>

			<span 
				@click="closeInfoModal"
				class="close-button"
			>
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800px" height="800px" viewBox="0 0 32 32" version="1.1">
					<g id="icomoon-ignore">
					</g>
					<path d="M6.576 6.576c-5.205 5.205-5.205 13.643 0 18.849s13.643 5.205 18.849-0c5.206-5.206 5.206-13.643 0-18.849s-13.643-5.205-18.849 0zM24.67 24.67c-4.781 4.781-12.56 4.781-17.341 0s-4.781-12.56 0-17.341c4.781-4.781 12.56-4.781 17.341 0s4.78 12.56-0 17.341z" fill="#000000">

					</path>
					<path d="M10.722 9.969l-0.754 0.754 5.278 5.278-5.253 5.253 0.754 0.754 5.253-5.253 5.253 5.253 0.754-0.754-5.253-5.253 5.278-5.278-0.754-0.754-5.278 5.278z" fill="#000000">

					</path>
				</svg>
			</span>
		</div>
	</div>
</template>

<script lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { getWordOfTheDay, allWords } from './words'
import Keyboard from './Keyboard.vue'
import { LetterState } from './types'

export default {
	components: {
		Keyboard
	},
	data() {
		return {
			answer: getWordOfTheDay(),
			board: Array.from({ length: 6 }, () =>
				Array.from({ length: 6 }, () => ({
					letter: '',
					state: LetterState.INITIAL
				}))
			),
			currentRowIndex: 0,
			message: '',
			grid: '',
			shakeRowIndex: -1,
			success: false,
			letterStates: {} as Record<string, LetterState>,
			allowInput: true,
			statsModalVisible: false,
			infoModalVisible: false,
			darkTheme: localStorage.getItem('theme') === 'dark',
			stats: {
				gamesPlayed: 0,
				gamesWon: 0,
				winsByRow: [0, 0, 0, 0, 0, 0], // Track how many times a user wins in each row (1-6)
			}
		}
	},
	computed: {
		currentRow() {
			return this.board[this.currentRowIndex]
		},
		winRate() {
			return this.stats.gamesWon === 0
			? 0
			: Math.round((this.stats.gamesWon / this.stats.gamesPlayed) * 100)
		},
		mostCommonWinRow() {
			return this.stats.winsByRow.indexOf(Math.max(...this.stats.winsByRow)) + 1
		}
	},
	methods: {
		onKeyup(e: KeyboardEvent) {
			this.onKey(e.key)
		},
		onKey(key: string) {
			if (!this.allowInput) return

			if (/^[a-zA-Z]$/.test(key)) {
				this.fillTile(key.toLowerCase())
			} else if (key === 'Backspace') {
				this.clearTile()
			} else if (key === 'Enter') {
				this.completeRow()
			}
		},
		toggleTheme() {
			const theme = this.darkTheme ? 'dark' : 'light';
			document.documentElement.setAttribute('data-theme', theme);
			localStorage.setItem('theme', theme); // Persist theme choice
		},
		fillTile(letter: string) {
			for (const tile of this.currentRow) {
				if (!tile.letter) {
					tile.letter = letter
					break
				}
			}
		},
		clearTile() {
			for (const tile of [...this.currentRow].reverse()) {
				if (tile.letter) {
					tile.letter = ''
					break
				}
			}
		},
		completeRow() {
			if (this.currentRow.every((tile) => tile.letter)) {
				const guess = this.currentRow.map((tile) => tile.letter).join('');

				if (guess.length !== 6 || (!allWords.includes(guess) && guess !== this.answer)) {
					this.shake();
					this.showMessage('Not in word list or wrong length');
					return;
				}

				const answerLetters: (string | null)[] = this.answer.split('');

				// Mark letters as correct, present, or absent
				this.currentRow.forEach((tile, i) => {
					if (answerLetters[i] === tile.letter) {
						tile.state = this.letterStates[tile.letter] = LetterState.CORRECT;
						answerLetters[i] = null;
					}
				});

				this.currentRow.forEach((tile) => {
					if (!tile.state && answerLetters.includes(tile.letter)) {
						tile.state = LetterState.PRESENT;
						answerLetters[answerLetters.indexOf(tile.letter)] = null;
						if (!this.letterStates[tile.letter]) {
							this.letterStates[tile.letter] = LetterState.PRESENT;
						}
					}
				});

				this.currentRow.forEach((tile) => {
					if (!tile.state) {
						tile.state = LetterState.ABSENT;
						if (!this.letterStates[tile.letter]) {
							this.letterStates[tile.letter] = LetterState.ABSENT;
						}
					}
				});

				this.allowInput = false;
				if (this.currentRow.every((tile) => tile.state === LetterState.CORRECT)) {
					this.stats.gamesPlayed++;
					this.stats.gamesWon++;
					this.stats.winsByRow[this.currentRowIndex]++;

					const currentUKDate = new Date().toLocaleDateString('en-GB', { timeZone: 'Europe/London' });
					localStorage.setItem('lastPlayedDate', currentUKDate);

					const gameState = {
						answer: this.answer,
						board: this.board,
						currentRowIndex: this.currentRowIndex,
						success: true,
						stats: this.stats
					};
					localStorage.setItem('gameState', JSON.stringify(gameState));
					localStorage.setItem('gameStats', JSON.stringify(this.stats));

					setTimeout(() => {
						this.grid = this.genResultGrid();
						this.showMessage(['Genius', 'Magnificent', 'Impressive', 'Splendid', 'Great', 'Phew'][this.currentRowIndex], -1);
						this.success = true;
					}, 1600);
				} else if (this.currentRowIndex < this.board.length - 1) {
					this.currentRowIndex++;
					setTimeout(() => {
						this.allowInput = true;
					}, 1600);
				} else {
					setTimeout(() => {
						this.showMessage(this.answer.toUpperCase(), -1);
					}, 1600);
				}
			} else {
				this.shake();
				this.showMessage('Not enough letters');
			}
		},
		resetStats() {
			this.stats = {
				gamesPlayed: 0,
				gamesWon: 0,
				winsByRow: [0, 0, 0, 0, 0, 0],
			};
			localStorage.removeItem('gameStats');
			localStorage.removeItem('lastPlayedDate');

			// Reset game state
			this.board = Array.from({ length: 6 }, () =>
				Array.from({ length: 6 }, () => ({
					letter: '',
					state: LetterState.INITIAL,
				}))
			);
			this.currentRowIndex = 0;
			this.success = false;
			this.allowInput = true;
			this.letterStates = {};
			this.message = '';
			this.shakeRowIndex = -1;
		},
		showMessage(msg: string, time = 100000) {
			this.message = msg
			if (time > 0) {
				setTimeout(() => {
					this.message = ''
				}, time)
			}
		},
		closeMessage() {
			this.message = ''; 
		},
		shake() {
			this.shakeRowIndex = this.currentRowIndex
			setTimeout(() => {
				this.shakeRowIndex = -1
			}, 100000)
		},
		genResultGrid() {
			return this.board
			.slice(0, this.currentRowIndex + 1)
			.map((row) => {
				return row.map((tile) => {
					const icons = {
						[LetterState.CORRECT]: '🟩',
						[LetterState.PRESENT]: '🟨',
						[LetterState.ABSENT]: '⬜',
						[LetterState.INITIAL]: null
					}
					return icons[tile.state]
				}).join('')
			})
			.join('\n')
		},
		shareResults() {
			const resultText = this.genResultGrid()

		if (navigator.canShare && navigator.canShare({ text: resultText })) {
			navigator.share({
				title: 'Foorballdle Result',
				text: resultText,
				url: window.location.href
			})
			} else {
				navigator.clipboard.writeText(resultText)
				.then(() => {
					alert('Results copied to clipboard!')
				})
				.catch((err) => {
					alert('Failed to copy results to clipboard: ' + err)
				})
			}
		},
		openStatsModal() {
			this.statsModalVisible = true
		},
		closeStatsModal() {
			this.statsModalVisible = false
		},
		openInfoModal() {
			this.infoModalVisible = true
		},
		closeInfoModal() {
			this.infoModalVisible = false
		},
	},
	mounted() {
		const theme = localStorage.getItem('theme') || 'light';
		document.documentElement.setAttribute('data-theme', theme);
		this.darkTheme = theme === 'dark';

		const storedStats = localStorage.getItem('gameStats');
		if (storedStats) {
			this.stats = JSON.parse(storedStats);
		}

		const lastPlayedDate = localStorage.getItem('lastPlayedDate');
		const currentUKDate = new Date().toLocaleDateString('en-GB', { timeZone: 'Europe/London' });

		console.log("Last played........", lastPlayedDate);
		console.log("Today........", currentUKDate);

		// Allow play if it's a new UK day
		if (lastPlayedDate === currentUKDate) {
			this.showMessage("You've already played today. Please come back tomorrow!");
			this.allowInput = false;
		} else {
			this.allowInput = true;
			// localStorage.setItem('lastPlayedDate', currentUKDate); // Update to the new day
			// Reset game state
			this.board = Array.from({ length: 6 }, () =>
				Array.from({ length: 6 }, () => ({
					letter: '',
					state: LetterState.INITIAL,
				}))
			);
			this.currentRowIndex = 0;
			this.success = false;
			this.allowInput = true;
			this.letterStates = {};
			this.message = '';
			this.shakeRowIndex = -1;
		}

		const savedGameState = localStorage.getItem('gameState');
		if (savedGameState) {
			const gameState = JSON.parse(savedGameState);

			if (gameState.success) {
				this.board = gameState.board; // Load the saved board
				this.currentRowIndex = gameState.currentRowIndex;
				this.success = gameState.success;

				this.showMessage('You won!', 100000);
				this.grid = this.genResultGrid(); // Generate the result grid
				this.allowInput = false; // Disable further input
			}
		}

		window.addEventListener('keyup', this.onKeyup);
	},

	beforeUnmount() {
		window.removeEventListener('keyup', this.onKeyup);
	},
}
</script>

<style lang="scss" scoped>
#board {
	display: grid;
	grid-template-rows: repeat(6, 1fr);
	grid-gap: 0.3125rem; // 5px
	padding: 0.625rem; // 10px
	box-sizing: border-box;
	--height: min(26.25rem, calc(var(--vh, 100vh) - 19.375rem)); // 420px, 310px
	height: var(--height);
	width: min(21.875rem, calc(var(--height) / 6 * 6)); /* 350px */
	margin: 0 auto;
  }
  
  .stats-modal,
  .info-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.7);
	display: flex;
	justify-content: flex-end;
	align-items: flex-start;
	z-index: 1000;
  }

  .modal-content,
  .info-content {
	background: white;
	padding: 1.25rem;
	border-radius: .625rem 0 0 .625rem; 
	text-align: left;
	width: 80vw;
	height: calc(100% - 2.5rem);

	.close-button {
		top: 1rem;
		right: 1rem;
		position: absolute;
	}

	.row {
		display: flex;
		flex-direction: row;

		span {
			align-items: center;
			border: 1px solid grey;
			display: flex;
			height: 1.5rem;
			justify-content: center;
			width: 1.5rem;
		}
	}
	}
  
  .stat-button,
  .close-button,
  .info-button {
	svg {
		height: 2rem;
		width: 2rem;
	}
  }

  button {
	background-color: #007bff;
	color: white;
	border: none;
	padding: 0.625rem 1.25rem; // 10px 20px
	border-radius: 0.3125rem; // 5px
	cursor: pointer;
  
	&:hover {
	  background-color: #0056b3;
	}
  }
  
  .message-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.7);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;

.close-button {
	top: 1rem;
	right: 1rem;
	position: absolute;
}

	.message-content {
		background: white;
		padding: 1.25rem; // 20px
		position: relative;
		border-radius: 0.625rem; // 10px
		text-align: center;
		width: 80vw;

		h3 {
			padding: 0;
		}
	}
  
	&.v-leave-to {
	  opacity: 0;
	}
  }
  
  .row {
	display: grid;
	grid-template-columns: repeat(6, 1fr); /* 6 columns */
	grid-gap: 0.3125rem; // 5px
  }
  
  .tile {
	width: 100%;
	font-size: 2rem;
	line-height: 2rem;
	font-weight: bold;
	vertical-align: middle;
	text-transform: uppercase;
	user-select: none;
	position: relative;
	border: 1px solid rgb(159, 159, 159);
  
	&.filled {
	  animation: zoom 0.2s;
	}
  
	.front,
	.back {
	  box-sizing: border-box;
	  display: inline-flex;
	  justify-content: center;
	  align-items: center;
	  position: absolute;
	  top: 0;
	  left: 0;
	  width: 100%;
	  height: 100%;
	  font-family: "Inter", serif;
	  font-weight: 500;
	}
  
	.back {
	  background-color: #212121;
	  opacity: 0;
	  z-index: 1;
	  transition: opacity 0.3s ease-out;
	}
  
	&.revealed {
	  .back {
		opacity: 1;
	  }
  
	  .front {
		opacity: 0;
	  }
  
	  &.correct {
		.back {
		  background-color: #6aaa64;
		}
  
		.front {
		  color: white;
		}
	  }
  
	  &.present {
		.back {
		  background-color: #c9b458;
		}
  
		.front {
		  color: white;
		}
	  }
  
	  &.absent {
		.back {
		  background-color: #787c7e;
		}
  
		.front {
		  color: white;
		}
	  }
	}
  }
  </style>
