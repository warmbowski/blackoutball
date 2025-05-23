import type { PlayerId, RuneClient } from "rune-sdk"

// Define player and ball positions as 2D coordinates
export interface Position {
  x: number
  y: number
}

// Define player state
export interface Player {
  position: Position
  visible: boolean
  score: number
  hasBall: boolean
}

// Define ball state
export interface Ball {
  position: Position
  visible: boolean
  velocity: Position
  moving: boolean
}

// Define game field boundaries
export interface Field {
  width: number
  height: number
}

// Game state
export interface GameState {
  players: Record<PlayerId, Player>
  playerIds: PlayerId[]
  ball: Ball
  field: Field
  gameTime: number
  gameOver: boolean
}

// Player actions
type GameActions = {
  movePlayer: (direction: { x: number; y: number }) => void
  takeBall: () => void
  hideBall: () => void
  showBall: () => void
  throwBall: (direction: { x: number; y: number }) => void
  closeEyes: () => void
  openEyes: () => void
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

// Ball speed when thrown
const BALL_SPEED = 10
// Game duration in milliseconds (5 minutes)
const GAME_DURATION = 5 * 60 * 1000
// Player movement speed
const PLAYER_SPEED = 5
// Field dimensions
const FIELD_WIDTH = 800
const FIELD_HEIGHT = 600
// Collision detection radius for player and ball
const COLLISION_RADIUS = 30

Rune.initLogic({
  minPlayers: 2,
  maxPlayers: 4,
  setup: (allPlayerIds) => {
    // Create initial player states with random positions
    const players: Record<PlayerId, Player> = {}
    allPlayerIds.forEach((playerId) => {
      players[playerId] = {
        position: {
          x: Math.random() * (FIELD_WIDTH - 100) + 50,
          y: Math.random() * (FIELD_HEIGHT - 100) + 50,
        },
        visible: true,
        score: 0,
        hasBall: false,
      }
    })

    // Ball starts in the center of the field and is visible
    return {
      players,
      playerIds: allPlayerIds,
      ball: {
        position: { x: FIELD_WIDTH / 2, y: FIELD_HEIGHT / 2 },
        visible: true,
        velocity: { x: 0, y: 0 },
        moving: false,
      },
      field: {
        width: FIELD_WIDTH,
        height: FIELD_HEIGHT,
      },
      gameTime: GAME_DURATION,
      gameOver: false,
    }
  },

  update: ({ game }) => {
    // Update game time using standard deltaTime from Rune
    const deltaTime = Rune.gameTime()
    game.gameTime -= deltaTime

    // Check if game is over
    if (game.gameTime <= 0 && !game.gameOver) {
      game.gameOver = true

      // Find the player with the highest score
      let highestScore = -1
      let winners: PlayerId[] = []

      game.playerIds.forEach((playerId) => {
        const score = game.players[playerId].score
        if (score > highestScore) {
          highestScore = score
          winners = [playerId]
        } else if (score === highestScore) {
          winners.push(playerId)
        }
      })

      // Set game results
      const results: Record<PlayerId, "WON" | "LOST" | "TIE"> = {}
      game.playerIds.forEach((playerId) => {
        if (winners.length > 1 && winners.includes(playerId)) {
          results[playerId] = "TIE"
        } else if (winners.length === 1 && winners[0] === playerId) {
          results[playerId] = "WON"
        } else {
          results[playerId] = "LOST"
        }
      })

      Rune.gameOver({ players: results })
      return
    }

    // Update ball position if it's moving
    if (game.ball.moving) {
      game.ball.position.x += game.ball.velocity.x
      game.ball.position.y += game.ball.velocity.y

      // Check if ball hits the field boundaries
      if (
        game.ball.position.x <= 0 ||
        game.ball.position.x >= game.field.width
      ) {
        game.ball.velocity.x *= -1
      }

      if (
        game.ball.position.y <= 0 ||
        game.ball.position.y >= game.field.height
      ) {
        game.ball.velocity.y *= -1
      }

      // Check for collision with players
      game.playerIds.forEach((playerId) => {
        const player = game.players[playerId]

        // Skip players who already have the ball
        if (player.hasBall) return

        // Calculate distance between ball and player
        const dx = player.position.x - game.ball.position.x
        const dy = player.position.y - game.ball.position.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // If ball hits player, player gets hit and ball stops
        if (
          distance < COLLISION_RADIUS &&
          game.ball.moving &&
          game.ball.visible &&
          player.visible
        ) {
          // Find the player who threw the ball
          const throwingPlayerId = game.playerIds.find(
            (id) => !game.players[id].hasBall && id !== playerId
          )

          // Award point to the player who threw the ball
          if (throwingPlayerId) {
            game.players[throwingPlayerId].score += 1
          }

          // Ball stops and becomes available to pick up
          game.ball.moving = false
          game.ball.velocity = { x: 0, y: 0 }
        }
      })
    }
  },

  actions: {
    movePlayer: (direction, { game, playerId }) => {
      const player = game.players[playerId]

      // Normalize direction vector
      const magnitude = Math.sqrt(
        direction.x * direction.x + direction.y * direction.y
      )
      const normalizedX = magnitude ? direction.x / magnitude : 0
      const normalizedY = magnitude ? direction.y / magnitude : 0

      // Calculate new position
      const newX = player.position.x + normalizedX * PLAYER_SPEED
      const newY = player.position.y + normalizedY * PLAYER_SPEED

      // Keep player within field boundaries
      player.position.x = Math.max(0, Math.min(game.field.width, newX))
      player.position.y = Math.max(0, Math.min(game.field.height, newY))

      // If player has the ball, move the ball with the player
      if (player.hasBall) {
        game.ball.position = { ...player.position }
      }
    },

    takeBall: (_, { game, playerId }) => {
      const player = game.players[playerId]
      const ball = game.ball

      // Check if ball is visible and player is close enough to the ball
      const dx = player.position.x - ball.position.x
      const dy = player.position.y - ball.position.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < COLLISION_RADIUS && ball.visible && !ball.moving) {
        // First remove the ball from any player who might have it
        game.playerIds.forEach((id) => {
          game.players[id].hasBall = false
        })

        // Give ball to this player
        player.hasBall = true
      } else {
        throw Rune.invalidAction()
      }
    },

    hideBall: (_, { game, playerId }) => {
      const player = game.players[playerId]

      // Player can only hide the ball if they have it
      if (player.hasBall) {
        game.ball.visible = false
      } else {
        throw Rune.invalidAction()
      }
    },

    showBall: (_, { game, playerId }) => {
      const player = game.players[playerId]

      // Player can only show the ball if they have it
      if (player.hasBall) {
        game.ball.visible = true
      } else {
        throw Rune.invalidAction()
      }
    },

    throwBall: (direction, { game, playerId }) => {
      const player = game.players[playerId]

      // Player can only throw the ball if they have it and it's visible
      if (player.hasBall && game.ball.visible) {
        // Normalize direction vector
        const magnitude = Math.sqrt(
          direction.x * direction.x + direction.y * direction.y
        )
        const normalizedX = magnitude ? direction.x / magnitude : 0
        const normalizedY = magnitude ? direction.y / magnitude : 0

        // Set ball velocity
        game.ball.velocity.x = normalizedX * BALL_SPEED
        game.ball.velocity.y = normalizedY * BALL_SPEED

        // Ball is now moving
        game.ball.moving = true

        // Player no longer has the ball
        player.hasBall = false
      } else {
        throw Rune.invalidAction()
      }
    },

    closeEyes: (_, { game, playerId }) => {
      game.players[playerId].visible = false
    },

    openEyes: (_, { game, playerId }) => {
      game.players[playerId].visible = true
    },
  },
})
