export const PLAYER_RADIUS = 0.34

export function isPositionBlocked(position, colliders, bounds) {
  const safeRadiusX = bounds.radiusX - PLAYER_RADIUS
  const safeRadiusZ = bounds.radiusZ - PLAYER_RADIUS
  const ellipseDistance =
    ((position.x * position.x) / (safeRadiusX * safeRadiusX)) +
    ((position.z * position.z) / (safeRadiusZ * safeRadiusZ))

  if (
    position.x < bounds.minX + PLAYER_RADIUS ||
    position.x > bounds.maxX - PLAYER_RADIUS ||
    position.z < bounds.minZ + PLAYER_RADIUS ||
    position.z > bounds.maxZ - PLAYER_RADIUS ||
    ellipseDistance > 1
  ) {
    return true
  }

  return colliders.some((collider) => {
    if (collider.type === 'box') {
      const nearestX = Math.max(
        collider.x - collider.halfX,
        Math.min(position.x, collider.x + collider.halfX),
      )
      const nearestZ = Math.max(
        collider.z - collider.halfZ,
        Math.min(position.z, collider.z + collider.halfZ),
      )
      const dx = position.x - nearestX
      const dz = position.z - nearestZ
      return dx * dx + dz * dz < PLAYER_RADIUS * PLAYER_RADIUS
    }

    const dx = position.x - collider.x
    const dz = position.z - collider.z
    const minimumDistance = collider.radius + PLAYER_RADIUS
    return dx * dx + dz * dz < minimumDistance * minimumDistance
  })
}

// Movement is split into short swept steps, then resolved per axis when a
// diagonal step hits something. This prevents tunnelling and gives wall sliding.
export function moveWithCollisions(position, displacement, colliders, bounds, scratch) {
  const distance = Math.hypot(displacement.x, displacement.z)
  const steps = Math.max(1, Math.ceil(distance / (PLAYER_RADIUS * 0.32)))
  const stepX = displacement.x / steps
  const stepZ = displacement.z / steps
  let blockedX = false
  let blockedZ = false

  for (let index = 0; index < steps; index += 1) {
    scratch.set(position.x + stepX, position.y, position.z + stepZ)
    if (!isPositionBlocked(scratch, colliders, bounds)) {
      position.x = scratch.x
      position.z = scratch.z
      continue
    }

    scratch.set(position.x + stepX, position.y, position.z)
    if (!isPositionBlocked(scratch, colliders, bounds)) {
      position.x = scratch.x
    } else {
      blockedX = true
    }

    scratch.set(position.x, position.y, position.z + stepZ)
    if (!isPositionBlocked(scratch, colliders, bounds)) {
      position.z = scratch.z
    } else {
      blockedZ = true
    }
  }

  return { blockedX, blockedZ }
}
