// Visual effects utilities for Blackout Ball

import * as PIXI from "pixi.js"
import { Position } from "./logic"

// Emoji definitions
export const EMOJIS = {
  BALL: "🏐",
  EYES: "👀",
  BOOM: "💥",
  STAR: "⭐",
  HIDDEN: "🙈",
}

/**
 * Creates a glow effect around a sprite/text
 * @param g The PIXI.Graphics instance to draw on
 * @param color The color of the glow
 * @param radius The radius of the glow
 * @param intensity The intensity of the glow (0-1)
 */
export function drawGlowEffect(
  g: PIXI.Graphics,
  color: number,
  radius: number,
  intensity: number = 0.5
): void {
  g.clear()

  // Create multi-layer glow effect
  for (let i = 0; i < 3; i++) {
    const alpha = intensity * (1 - i * 0.3)
    const size = radius * (1 + i * 0.5)

    g.beginFill(color, alpha)
    g.drawCircle(0, 0, size)
    g.endFill()
  }
}

/**
 * Creates a hit animation effect
 * @param app The PIXI Application
 * @param position The position to create the effect
 * @param color The color of the effect
 * @param onComplete Optional callback when animation completes
 */
export function createHitEffect(
  app: PIXI.Application,
  position: Position,
  color: number = 0xffcc00,
  onComplete?: () => void
): PIXI.Container {
  const container = new PIXI.Container()
  container.position.set(position.x, position.y)

  // Add graphic elements
  const graphics = new PIXI.Graphics()
  const text = new PIXI.Text(EMOJIS.BOOM, {
    fontSize: 40,
  })
  text.anchor.set(0.5)

  container.addChild(graphics, text)
  app.stage.addChild(container)

  // Animation variables
  let elapsed = 0
  const duration = 500 // ms

  // Animation function
  const animate = () => {
    elapsed += app.ticker.deltaMS
    const progress = Math.min(elapsed / duration, 1)

    // Scale animation
    const scale = Math.sin(progress * Math.PI) * 1.5
    container.scale.set(scale)

    // Glow animation
    drawGlowEffect(graphics, color, 30, 1 - progress)

    // Remove when done
    if (progress >= 1) {
      app.ticker.remove(animate)
      app.stage.removeChild(container)
      if (onComplete) onComplete()
    }
  }

  app.ticker.add(animate)

  return container
}

/**
 * Creates a trail effect behind a moving object
 * @param position The current position
 * @param lastPosition The previous position
 * @param color The color of the trail
 */
export function createTrail(
  app: PIXI.Application,
  position: Position,
  lastPosition: Position,
  color: number = 0xffcc00
): void {
  // Only create trail if there's movement
  if (
    lastPosition &&
    (Math.abs(position.x - lastPosition.x) > 2 ||
      Math.abs(position.y - lastPosition.y) > 2)
  ) {
    const dot = new PIXI.Graphics()
    dot.beginFill(color, 0.5)
    dot.drawCircle(0, 0, 3)
    dot.endFill()
    dot.position.set(position.x, position.y)

    app.stage.addChild(dot)

    // Fade and remove
    let alpha = 0.5
    const fadeOut = () => {
      alpha -= 0.05
      dot.alpha = alpha

      if (alpha <= 0) {
        app.ticker.remove(fadeOut)
        app.stage.removeChild(dot)
      }
    }

    app.ticker.add(fadeOut)
  }
}
