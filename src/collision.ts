// Collision detection utilities for Blackout Ball game

import { Position } from "./logic"

/**
 * Check if two circles collide
 * @param pos1 First position
 * @param pos2 Second position
 * @param radius1 First circle radius
 * @param radius2 Second circle radius
 * @returns Boolean indicating whether circles intersect
 */
export function circlesCollide(
  pos1: Position,
  pos2: Position,
  radius1: number,
  radius2: number
): boolean {
  const dx = pos2.x - pos1.x
  const dy = pos2.y - pos1.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance < radius1 + radius2
}

/**
 * Check if a point is inside a circle
 * @param point The point to check
 * @param center The center of the circle
 * @param radius The radius of the circle
 * @returns Boolean indicating whether the point is in the circle
 */
export function pointInCircle(
  point: Position,
  center: Position,
  radius: number
): boolean {
  const dx = point.x - center.x
  const dy = point.y - center.y
  return dx * dx + dy * dy <= radius * radius
}

/**
 * Calculate the bounce direction when hitting a boundary
 * @param velocity Current velocity vector
 * @param normal Normal vector of the boundary (normalized)
 * @returns New velocity vector after bounce
 */
export function calculateBounce(
  velocity: Position,
  normal: Position
): Position {
  // Calculate dot product
  const dot = velocity.x * normal.x + velocity.y * normal.y

  // Calculate reflection
  return {
    x: velocity.x - 2 * dot * normal.x,
    y: velocity.y - 2 * dot * normal.y,
  }
}

/**
 * Check if a moving circle will collide with a stationary circle
 * @param movingPos Position of moving circle
 * @param stationaryPos Position of stationary circle
 * @param velocity Velocity of moving circle
 * @param movingRadius Radius of moving circle
 * @param stationaryRadius Radius of stationary circle
 * @param timeStep Time step to check ahead (in ms)
 * @returns Boolean indicating whether circles will collide within the time step
 */
export function predictCircleCollision(
  movingPos: Position,
  stationaryPos: Position,
  velocity: Position,
  movingRadius: number,
  stationaryRadius: number,
  timeStep: number
): boolean {
  // Calculate future position
  const futurePos = {
    x: movingPos.x + velocity.x * timeStep,
    y: movingPos.y + velocity.y * timeStep,
  }

  // Check if future position collides with stationary circle
  return circlesCollide(
    futurePos,
    stationaryPos,
    movingRadius,
    stationaryRadius
  )
}
