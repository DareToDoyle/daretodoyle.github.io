export const WORLD_BOUNDS = {
  minX: -8.65,
  maxX: 8.65,
  minZ: -7.75,
  maxZ: 7.75,
}

export const PLAYER_SPAWN = [0, 0, 1.65]

export const trees = [
  [-7.65, -6.55, 0.9],
  [-7.85, -1.55, 1.1],
  [-7.75, 6.45, 0.82],
  [-3.55, -6.8, 0.78],
  [3.45, -6.85, 1.02],
  [7.65, -6.4, 0.86],
  [7.85, -0.15, 1.08],
  [7.6, 6.35, 0.92],
  [-3.55, 7.15, 0.72],
  [3.6, 7.05, 0.76],
]

export const rocks = [
  [-7.25, 1.1, 0.52],
  [-2.9, -6.25, 0.38],
  [7.15, 1.85, 0.48],
  [2.75, 7.15, 0.34],
  [-7.05, 6.75, 0.32],
]

export const benches = [
  [-2.7, 2.8, Math.PI / 4],
  [2.7, -2.8, Math.PI / 4],
]

export const lamps = [
  [-2.45, -2.45],
  [2.45, -2.45],
  [-2.45, 2.45],
  [2.45, 2.45],
]

export const sceneryColliders = [
  { type: 'circle', x: 0, z: -1.35, radius: 1.15 },
  ...trees.map(([x, z, scale]) => ({
    type: 'circle',
    x,
    z,
    radius: 0.48 * scale + 0.22,
  })),
  ...rocks.map(([x, z, scale]) => ({
    type: 'circle',
    x,
    z,
    radius: 0.55 * scale + 0.18,
  })),
  ...benches.map(([x, z]) => ({
    type: 'box',
    x,
    z,
    halfX: 0.9,
    halfZ: 0.42,
  })),
]
