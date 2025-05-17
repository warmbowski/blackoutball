// Helper functions for the Blackout Ball game

import { Position } from "./logic"

/**
 * Calculate distance between two positions
 */
export function calculateDistance(pos1: Position, pos2: Position): number {
  const dx = pos2.x - pos1.x
  const dy = pos2.y - pos1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Normalize a vector to have a magnitude of 1
 */
export function normalizeVector(vector: Position): Position {
  const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y)
  if (magnitude === 0) return { x: 0, y: 0 }

  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude,
  }
}

/**
 * Format time in milliseconds to MM:SS format
 */
export function formatTime(timeInMs: number): string {
  const totalSeconds = Math.floor(timeInMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

/**
 * Check if point is within field boundaries
 */
export function isWithinBounds(
  position: Position,
  width: number,
  height: number
): boolean {
  return (
    position.x >= 0 &&
    position.x <= width &&
    position.y >= 0 &&
    position.y <= height
  )
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start * (1 - t) + end * t
}
