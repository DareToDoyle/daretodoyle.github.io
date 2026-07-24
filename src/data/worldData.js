export const WORLD_BOUNDS = {
  minX: -10.8,
  maxX: 10.8,
  minZ: -9.5,
  maxZ: 9.5,
  radiusX: 10.45,
  radiusZ: 9.15,
}

export const PLAYER_SPAWN = [0, 0, 2.35]

// [x, z, scale, rotation]. The uneven perimeter turns the edge of the island
// into a readable natural boundary without requiring a high-poly terrain mesh.
export const trees = [
  [-8.7, -6.1, 1.04, -0.25],
  [-9.3, -3.9, 0.88, 0.8],
  [-9.7, -1.2, 1.1, -0.7],
  [-9.45, 1.65, 0.92, 0.35],
  [-8.65, 6.25, 1.08, -0.45],
  [-6.85, 7.85, 0.86, 0.9],
  [-3.65, 8.55, 1.03, -0.4],
  [3.5, 8.58, 0.94, 0.3],
  [6.7, 7.85, 1.1, -0.85],
  [8.65, 6.18, 0.9, 0.7],
  [9.45, 3.35, 1.08, -0.1],
  [9.65, 0.5, 0.86, 0.45],
  [9.2, -2.35, 1.03, -0.8],
  [8.4, -6.25, 0.94, 0.2],
  [6.3, -7.78, 1.05, -0.5],
  [3.3, -8.52, 0.9, 0.85],
  [-3.15, -8.55, 1.08, -0.3],
  [-6.25, -7.85, 0.88, 0.55],
  [-7.7, 0.25, 0.72, -0.2],
  [7.75, 1.75, 0.76, 0.5],
  [-2.9, 6.95, 0.7, -0.65],
  [2.8, 6.75, 0.74, 0.2],
]

export const bushes = [
  [-7.95, -4.95, 0.9],
  [-7.45, -3.9, 0.7],
  [-6.9, -2.75, 0.82],
  [7.15, -5.3, 0.75],
  [7.75, -4.25, 0.9],
  [7.75, -3.1, 0.68],
  [-7.4, 3.15, 0.75],
  [-7.25, 5.1, 0.88],
  [7.15, 4.9, 0.82],
  [6.95, 6.1, 0.68],
  [-1.75, 7.65, 0.7],
  [1.75, 7.65, 0.72],
  [-3.25, -5.75, 0.72],
  [3.3, -5.9, 0.78],
]

export const rocks = [
  [-8.25, 2.6, 0.5],
  [-5.2, -7.15, 0.42],
  [8.05, -0.75, 0.46],
  [5.15, 7.2, 0.38],
  [-5.15, 7.1, 0.35],
  [1.9, -7.9, 0.3],
]

export const benches = [
  [-2.75, 3.2, Math.PI / 4],
  [2.9, -2.75, Math.PI / 4],
  [-3.0, -2.75, -Math.PI / 4],
]

export const lamps = [
  [-2.35, -2.2],
  [2.35, -2.2],
  [-2.35, 2.3],
  [2.35, 2.3],
  [-4.15, 0.05],
  [4.15, 0.05],
]

export const fences = [
  { x: -7.65, z: -0.8, halfX: 0.08, halfZ: 1.2 },
  { x: -7.65, z: 5.55, halfX: 0.08, halfZ: 0.9 },
  { x: 7.65, z: -4.15, halfX: 0.08, halfZ: 1.0 },
  { x: 7.55, z: 5.75, halfX: 0.08, halfZ: 0.85 },
  { x: -4.75, z: -7.55, halfX: 1.0, halfZ: 0.08 },
  { x: 4.9, z: 7.55, halfX: 0.9, halfZ: 0.08 },
]

export const gardenTiles = [
  [-4.55, 1.75],
  [-4.05, 1.75],
  [-4.55, 2.25],
  [-4.05, 2.25],
  [4.0, 1.65],
  [4.5, 1.65],
  [4.0, 2.15],
  [4.5, 2.15],
]

export const sceneryColliders = [
  { type: 'circle', x: 0, z: -1.3, radius: 1.5 },
  ...trees.map(([x, z, scale]) => ({
    type: 'circle',
    x,
    z,
    radius: 0.5 * scale,
  })),
  ...bushes.map(([x, z, scale]) => ({
    type: 'circle',
    x,
    z,
    radius: 0.34 * scale,
  })),
  ...rocks.map(([x, z, scale]) => ({
    type: 'circle',
    x,
    z,
    radius: 0.5 * scale,
  })),
  ...benches.map(([x, z]) => ({
    type: 'circle',
    x,
    z,
    radius: 0.78,
  })),
  ...lamps.map(([x, z]) => ({
    type: 'circle',
    x,
    z,
    radius: 0.16,
  })),
  ...fences.map((fence) => ({ type: 'box', ...fence })),
]
