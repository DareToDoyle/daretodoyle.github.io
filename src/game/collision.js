const PLAYER_RADIUS = 0.28

export function isPositionBlocked(position, colliders, bounds) {
  if (
    position.x < bounds.minX + PLAYER_RADIUS ||
    position.x > bounds.maxX - PLAYER_RADIUS ||
    position.z < bounds.minZ + PLAYER_RADIUS ||
    position.z > bounds.maxZ - PLAYER_RADIUS
  ) {
    return true
  }

  return colliders.some((collider) => {
    if (collider.type === 'box') {
      return (
        Math.abs(position.x - collider.x) < collider.halfX + PLAYER_RADIUS &&
        Math.abs(position.z - collider.z) < collider.halfZ + PLAYER_RADIUS
      )
    }

    const x = position.x - collider.x
    const z = position.z - collider.z
    const minimumDistance = collider.radius + PLAYER_RADIUS
    return x * x + z * z < minimumDistance * minimumDistance
  })
}
