// BlackoutBall Game App Component
import { Container, Graphics, Stage, Text, useApp } from "@pixi/react"
import * as PIXI from "pixi.js"
import { useCallback, useEffect, useRef, useState } from "react"
import { PlayerId } from "rune-sdk"

import { Controls, getMovementDirection, ControlInstructions } from "./controls"
import { formatTime } from "./gameHelpers"
import { GameState } from "./logic"
import { loadSoundEffects, playSound } from "./soundEffects"
import { EMOJIS, drawGlowEffect } from "./visualEffects"

function App() {
  // Game state and player info
  const [game, setGame] = useState<GameState>()
  const [yourPlayerId, setYourPlayerId] = useState<PlayerId | undefined>()
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set())
  const [isThrowMode, setIsThrowMode] = useState<boolean>(false)

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeysPressed((prev) => new Set(prev).add(e.key))
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed((prev) => {
        const newSet = new Set(prev)
        newSet.delete(e.key)
        return newSet
      })

      // Handle special action keys on keyup
      if (e.key === Controls.TAKE_BALL) {
        try {
          Rune.actions.takeBall()
          playSound("pickup")
        } catch (err) {
          // Ball may be out of reach or another error
          console.log("Couldn't take the ball:", err)
        }
      } else if (e.key === Controls.HIDE_BALL) {
        try {
          Rune.actions.hideBall()
          playSound("select")
        } catch (err) {
          // Can't hide ball (don't have it)
          console.log("Couldn't hide the ball:", err)
        }
      } else if (e.key === Controls.SHOW_BALL) {
        try {
          Rune.actions.showBall()
          playSound("select")
        } catch (err) {
          // Can't show ball (don't have it)
          console.log("Couldn't show the ball:", err)
        }
      } else if (e.key === Controls.THROW_BALL) {
        setIsThrowMode(true)
      } else if (e.key === Controls.CLOSE_EYES) {
        Rune.actions.closeEyes()
      } else if (e.key === Controls.OPEN_EYES) {
        Rune.actions.openEyes()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  // Process movement keys
  useEffect(() => {
    if (!game || !yourPlayerId) return

    const moveInterval = setInterval(() => {
      // Use the helper function to get movement direction
      const direction = getMovementDirection(keysPressed)

      if (direction.x !== 0 || direction.y !== 0) {
        Rune.actions.movePlayer(direction)
      }
    }, 50) // Update movement every 50ms

    return () => clearInterval(moveInterval)
  }, [game, yourPlayerId, keysPressed])

  // Initialize game and load sound effects
  useEffect(() => {
    // Load sound effects
    loadSoundEffects()

    Rune.initClient({
      onChange: ({ game, yourPlayerId, action }) => {
        setGame(game)
        setYourPlayerId(yourPlayerId)

        // Play sounds based on actions
        if (action) {
          switch (action.name) {
            case "takeBall":
              playSound("pickup")
              break
            case "throwBall":
              playSound("throw")
              break
            case "movePlayer":
              // No sound for movement to avoid spam
              break
            default:
              // Play select sound for other actions
              playSound("select")
          }
        }
      },
    })
  }, [])

  // Handle throw mode
  const handleThrow = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isThrowMode && game && yourPlayerId) {
        const player = game.players[yourPlayerId]
        const stageEl = document.getElementById("board")
        if (!stageEl) return

        const rect = stageEl.getBoundingClientRect()

        // Convert screen coordinates to game coordinates
        const targetX =
          (e.clientX - rect.left) * (game.field.width / rect.width)

        const targetY =
          (e.clientY - rect.top) * (game.field.height / rect.height)

        // Calculate direction from player to target
        const direction = {
          x: targetX - player.position.x,
          y: targetY - player.position.y,
        }

        // Throw the ball
        try {
          Rune.actions.throwBall(direction)
          playSound("throw")
          setIsThrowMode(false)
        } catch (err) {
          console.log("Couldn't throw the ball:", err)
          setIsThrowMode(false)
        }
      }
    },
    [isThrowMode, game, yourPlayerId]
  )

  if (!game) {
    // Rune only shows your game after an onChange() so no need for loading screen
    return null
  }

  const { playerIds } = game

  return (
    <>
      <div id="board" onClick={handleThrow}>
        <Stage options={{ backgroundColor: 0x000000, antialias: true }}>
          <BlackoutField yourPlayerId={yourPlayerId} game={game} />
        </Stage>
      </div>
      <div id="game-ui">
        <div className="timer">{formatTime(game.gameTime)}</div>
        <ul id="players-list">
          {playerIds.map((playerId) => {
            const player = Rune.getPlayerInfo(playerId)
            const playerState = game.players[playerId]

            return (
              <li
                key={playerId}
                className={playerId === yourPlayerId ? "current-player" : ""}
              >
                <img src={player.avatarUrl} alt={player.displayName} />
                <div className="player-info">
                  <span className="player-name">
                    {player.displayName}
                    {playerId === yourPlayerId ? " (You)" : ""}
                  </span>
                  <span className="player-score">
                    Score: {playerState.score}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
        {isThrowMode && (
          <div className="throw-mode">
            Click on the field to throw the ball!
          </div>
        )}
        <div className="controls-help">
          {ControlInstructions.map((instruction, i) => (
            <p key={i}>{instruction}</p>
          ))}
        </div>
      </div>
    </>
  )
}

type BlackoutFieldProps = {
  yourPlayerId?: PlayerId
  game: GameState
}

function BlackoutField({ yourPlayerId, game }: BlackoutFieldProps) {
  const app = useApp()
  const boardRef = useRef<HTMLElement | null>(null)

  // Make the app resize with the container
  useEffect(() => {
    boardRef.current = document.getElementById("board")
    if (boardRef.current) {
      app.resizeTo = boardRef.current
    }
  }, [app])

  // Render field background
  const renderField = useCallback(
    (g: PIXI.Graphics) => {
      g.clear()
      g.beginFill(0x000000)
      g.drawRect(0, 0, game.field.width, game.field.height)
      g.endFill()

      // Draw border of the field with slightly visible lines
      g.lineStyle(2, 0x333333)
      g.drawRect(0, 0, game.field.width, game.field.height)
    },
    [game.field.width, game.field.height]
  )

  if (!yourPlayerId) return null

  const currentPlayer = game.players[yourPlayerId]

  return (
    <Container>
      {/* Field background */}
      <Graphics draw={renderField} />

      {/* Ball */}
      {game.ball.visible && (
        <Container x={game.ball.position.x} y={game.ball.position.y}>
          <Text text={EMOJIS.BALL} anchor={0.5} scale={2} />
          {/* Glow effect for the ball */}
          <Graphics
            draw={(g) => {
              g.clear()
              // Create radial gradient for glow effect
              drawGlowEffect(g, 0xffff00, 30, 0.5)
            }}
          />
        </Container>
      )}

      {/* Players */}
      {game.playerIds.map((playerId) => {
        const player = game.players[playerId]

        // Only show visible players (or always show the current player to themselves)
        if (!player.visible && playerId !== yourPlayerId) return null

        return (
          <Container key={playerId} x={player.position.x} y={player.position.y}>
            <Text
              text={EMOJIS.EYES}
              anchor={0.5}
              scale={1.5}
              alpha={playerId === yourPlayerId ? 1 : 0.8}
            />
            {/* Add name label for players */}
            <Text
              text={Rune.getPlayerInfo(playerId).displayName}
              anchor={[0.5, 1.5]}
              style={
                new PIXI.TextStyle({
                  fontSize: 12,
                  fill: 0xffffff,
                  align: "center",
                })
              }
            />
          </Container>
        )
      })}

      {/* UI Indicators */}
      {currentPlayer.hasBall && (
        <Container x={10} y={10}>
          <Text
            text="You have the ball!"
            style={
              new PIXI.TextStyle({
                fontSize: 16,
                fill: 0xffff00,
              })
            }
          />
        </Container>
      )}
    </Container>
  )
}

export default App
