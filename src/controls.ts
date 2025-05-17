// Game controls configuration

/**
 * Game control key bindings
 */
export const Controls = {
  // Movement controls
  MOVE_UP: "ArrowUp",
  MOVE_DOWN: "ArrowDown",
  MOVE_LEFT: "ArrowLeft",
  MOVE_RIGHT: "ArrowRight",

  // Ball controls
  TAKE_BALL: " ", // Space bar
  HIDE_BALL: "h",
  SHOW_BALL: "s",
  THROW_BALL: "t",

  // Player visibility controls
  CLOSE_EYES: "c",
  OPEN_EYES: "o",
}

/**
 * Check if a key is a movement key
 * @param key The key to check
 * @returns Boolean indicating whether the key is a movement key
 */
export function isMovementKey(key: string): boolean {
  return [
    Controls.MOVE_UP,
    Controls.MOVE_DOWN,
    Controls.MOVE_LEFT,
    Controls.MOVE_RIGHT,
  ].includes(key)
}

/**
 * Get movement direction from keys
 * @param keysPressed Set of currently pressed keys
 * @returns Vector representing movement direction
 */
export function getMovementDirection(keysPressed: Set<string>): {
  x: number
  y: number
} {
  const direction = { x: 0, y: 0 }

  if (keysPressed.has(Controls.MOVE_UP)) direction.y -= 1
  if (keysPressed.has(Controls.MOVE_DOWN)) direction.y += 1
  if (keysPressed.has(Controls.MOVE_LEFT)) direction.x -= 1
  if (keysPressed.has(Controls.MOVE_RIGHT)) direction.x += 1

  // Normalize for diagonal movement
  if (direction.x !== 0 && direction.y !== 0) {
    const magnitude = Math.sqrt(
      direction.x * direction.x + direction.y * direction.y
    )
    direction.x /= magnitude
    direction.y /= magnitude
  }

  return direction
}

/**
 * User-friendly control instructions to display
 */
export const ControlInstructions = [
  "Move: Arrow Keys",
  "Take Ball: Space",
  "Hide Ball: H",
  "Show Ball: S",
  "Throw Ball: T (then click to aim)",
  "Close Eyes: C",
  "Open Eyes: O",
]
