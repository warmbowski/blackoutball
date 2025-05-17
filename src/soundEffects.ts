// Sound effects manager for the game

// Audio file imports
import selectSoundAudio from "./assets/select.wav"

// Define sound types
type SoundType = "select" | "throw" | "hit" | "pickup" | "gameOver"

// Create audio elements
const selectSound = new Audio(selectSoundAudio)

// Sound effects configuration
const soundEffects: Record<SoundType, HTMLAudioElement> = {
  select: selectSound,
  throw: new Audio(),
  hit: new Audio(),
  pickup: new Audio(),
  gameOver: new Audio(),
}

// Load additional sound effects
export function loadSoundEffects(): void {
  // For now, we'll use the same select.wav file for other sounds as placeholders
  soundEffects.throw.src = selectSoundAudio
  soundEffects.hit.src = selectSoundAudio
  soundEffects.pickup.src = selectSoundAudio
  soundEffects.gameOver.src = selectSoundAudio

  // Preload sounds
  Object.values(soundEffects).forEach((audio) => {
    audio.load()
  })
}

// Play a sound effect
export function playSound(type: SoundType): void {
  const sound = soundEffects[type]
  if (sound) {
    sound.currentTime = 0
    sound.play().catch((e) => console.log("Error playing sound:", e))
  }
}

// Set volume for all sound effects
export function setVolume(volume: number): void {
  Object.values(soundEffects).forEach((audio) => {
    audio.volume = Math.max(0, Math.min(1, volume))
  })
}

// Mute/unmute all sounds
export function setMuted(muted: boolean): void {
  Object.values(soundEffects).forEach((audio) => {
    audio.muted = muted
  })
}
