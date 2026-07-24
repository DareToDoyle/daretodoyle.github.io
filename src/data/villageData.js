export const TILE_SIZE = 16
export const MAP_WIDTH = 80
export const MAP_HEIGHT = 56
export const WORLD_WIDTH = MAP_WIDTH * TILE_SIZE
export const WORLD_HEIGHT = MAP_HEIGHT * TILE_SIZE

export const TILE = {
  GRASS: 0,
  GRASS_SPECKLE: 1,
  GRASS_TUFT: 2,
  GRASS_STONE: 3,
  GRASS_LIGHT: 4,
  GRASS_WORN: 5,
  PATH: 6,
  PATH_STONE: 7,
  PATH_CRACK: 8,
  PATH_EDGE: 9,
  PLAZA: 10,
  PLAZA_ALT: 11,
  GARDEN: 12,
  FOREST: 13,
  FOREST_ALT: 14,
  FOREST_DARK: 15,
  WATER: 16,
  SOLID: 17,
}

export const PLAYER_SPAWN = {
  x: 39 * TILE_SIZE + TILE_SIZE / 2,
  y: 31 * TILE_SIZE + TILE_SIZE / 2,
}

function hash(x, y, seed = 0) {
  let value = x * 374761393 + y * 668265263 + seed * 1442695041
  value = (value ^ (value >> 13)) * 1274126177
  return ((value ^ (value >> 16)) >>> 0) / 4294967295
}

function leftForestEdge(y) {
  return 7 + Math.floor(hash(13, y, 2) * 4) + (y > 35 ? 1 : 0)
}

function rightForestEdge(y) {
  return 72 - Math.floor(hash(29, y, 4) * 4) - (y < 18 ? 1 : 0)
}

function topForestEdge(x) {
  return 6 + Math.floor(hash(x, 19, 6) * 4) + (x < 25 ? 1 : 0)
}

function bottomForestEdge(x) {
  return 49 - Math.floor(hash(x, 41, 8) * 4) - (x > 52 ? 1 : 0)
}

function isForestTile(x, y) {
  return (
    x < leftForestEdge(y) ||
    x > rightForestEdge(y) ||
    y < topForestEdge(x) ||
    y > bottomForestEdge(x)
  )
}

function paintRect(data, x1, y1, x2, y2, tile) {
  for (let y = Math.max(0, y1); y <= Math.min(MAP_HEIGHT - 1, y2); y += 1) {
    for (let x = Math.max(0, x1); x <= Math.min(MAP_WIDTH - 1, x2); x += 1) {
      data[y][x] = typeof tile === 'function' ? tile(x, y) : tile
    }
  }
}

function grassVariant(x, y) {
  const value = hash(x, y, 11)
  if (value > 0.95) return TILE.GRASS_WORN
  if (value > 0.88) return TILE.GRASS_STONE
  if (value > 0.76) return TILE.GRASS_TUFT
  if (value > 0.61) return TILE.GRASS_SPECKLE
  if (value < 0.08) return TILE.GRASS_LIGHT
  return TILE.GRASS
}

function pathVariant(x, y) {
  const value = hash(x, y, 23)
  if (value > 0.87) return TILE.PATH_CRACK
  if (value > 0.69) return TILE.PATH_STONE
  if (value < 0.12) return TILE.PATH_EDGE
  return TILE.PATH
}

export function createGroundData() {
  const data = Array.from({ length: MAP_HEIGHT }, (_, y) =>
    Array.from({ length: MAP_WIDTH }, (_, x) => grassVariant(x, y)),
  )

  for (let y = 0; y < MAP_HEIGHT; y += 1) {
    for (let x = 0; x < MAP_WIDTH; x += 1) {
      if (!isForestTile(x, y)) continue
      const density = hash(x, y, 31)
      data[y][x] = density > 0.7
        ? TILE.FOREST_DARK
        : density > 0.38
          ? TILE.FOREST_ALT
          : TILE.FOREST
    }
  }

  // Hand-placed wide routes; procedural variation only changes their surface.
  paintRect(data, 36, 17, 41, 47, pathVariant)
  paintRect(data, 19, 27, 60, 32, pathVariant)
  paintRect(data, 17, 17, 21, 29, pathVariant)
  paintRect(data, 21, 39, 38, 43, pathVariant)
  paintRect(data, 57, 15, 63, 30, pathVariant)
  paintRect(data, 58, 29, 63, 40, pathVariant)
  paintRect(data, 41, 43, 47, 49, pathVariant)
  paintRect(data, 31, 24, 38, 28, pathVariant)
  paintRect(data, 47, 31, 59, 35, pathVariant)

  // A softly irregular civic clearing.
  for (let y = 24; y <= 36; y += 1) {
    for (let x = 32; x <= 47; x += 1) {
      const dx = (x - 39.5) / 8
      const dy = (y - 30) / 6
      if (dx * dx + dy * dy <= 1) {
        data[y][x] = hash(x, y, 37) > 0.78 ? TILE.PLAZA_ALT : TILE.PLAZA
      }
    }
  }

  paintRect(data, 12, 19, 17, 24, TILE.GARDEN)
  paintRect(data, 17, 43, 25, 47, TILE.GARDEN)
  paintRect(data, 63, 18, 68, 23, TILE.GARDEN)
  paintRect(data, 51, 41, 56, 45, TILE.GARDEN)

  // Tiny pond in a north-eastern side clearing.
  paintRect(data, 49, 11, 53, 13, TILE.WATER)
  data[11][49] = TILE.GRASS
  data[13][53] = TILE.GRASS

  return data
}

export function createCollisionData() {
  return Array.from({ length: MAP_HEIGHT }, (_, y) =>
    Array.from({ length: MAP_WIDTH }, (_, x) => (
      isForestTile(x, y) ? TILE.SOLID : -1
    )),
  )
}

export function createForestTreePositions() {
  const positions = []
  const add = (x, y, seed) => {
    positions.push({
      x: Math.round(x * TILE_SIZE + (hash(x, y, seed) - 0.5) * 10),
      y: Math.round(y * TILE_SIZE + (hash(y, x, seed + 1) - 0.5) * 8),
      variant: Math.floor(hash(x + 7, y + 9, seed + 3) * 4),
    })
  }

  // Dense outer layers extend visually beyond the hard collision edge.
  ;[1, 3, 5].forEach((y, row) => {
    for (let x = 0; x < MAP_WIDTH; x += 2) add(x + (row % 2), y, row + 40)
  })
  ;[51, 53, 55].forEach((y, row) => {
    for (let x = 0; x < MAP_WIDTH; x += 2) add(x + ((row + 1) % 2), y, row + 50)
  })
  ;[1, 3, 5].forEach((x, column) => {
    for (let y = 8; y < 50; y += 2) add(x, y + (column % 2), column + 60)
  })
  ;[74, 76, 78].forEach((x, column) => {
    for (let y = 8; y < 50; y += 2) add(x, y + ((column + 1) % 2), column + 70)
  })

  // Irregular inner tree line conceals where forest collision begins.
  for (let x = 6; x < MAP_WIDTH - 6; x += 2) {
    add(x, topForestEdge(x) - 0.2, 81)
    add(x, bottomForestEdge(x) + 1.1, 83)
  }
  for (let y = 9; y < MAP_HEIGHT - 8; y += 2) {
    add(leftForestEdge(y) - 0.3, y, 85)
    add(rightForestEdge(y) + 1.1, y, 87)
  }

  return positions
}

// Each entry is [tileX, tileY, variant?]. Small scenery remains non-collidable.
export const decorationData = {
  bushes: [
    [11, 12, 0], [14, 13, 1], [23, 11, 2], [30, 14, 1], [45, 12, 0],
    [55, 11, 2], [68, 13, 1], [11, 29, 2], [69, 29, 0], [12, 42, 1],
    [28, 46, 2], [54, 48, 0], [67, 43, 2], [31, 36, 1], [49, 37, 0],
  ],
  flowers: [
    [13, 20], [15, 21], [16, 23], [14, 24], [64, 19], [66, 20], [67, 22],
    [18, 44], [20, 46], [23, 44], [24, 46], [52, 42], [54, 44], [16, 12],
  ],
  weeds: [
    [26, 15], [29, 19], [12, 34], [26, 35], [50, 19], [68, 35], [57, 46],
  ],
  stones: [
    [14, 16], [27, 12], [33, 19], [47, 17], [68, 26], [29, 43], [65, 46],
  ],
  mushrooms: [[10, 17], [25, 10], [48, 10], [70, 19], [13, 46], [58, 48]],
  benches: [[30, 27, 0], [48, 31, 1], [29, 34, 0], [49, 25, 1], [24, 36, 0]],
  lamps: [[31, 25], [48, 28], [33, 36], [52, 34], [25, 29], [57, 27]],
  mailboxes: [[24, 39], [58, 38], [22, 17], [64, 15]],
  fences: [
    [12, 18, 6], [63, 17, 6], [16, 42, 10], [50, 40, 7],
  ],
  props: [
    ['tripod', 15, 16], ['photo-board', 13, 15], ['planter', 23, 18],
    ['antenna', 66, 13], ['monitor', 66, 16], ['cable', 64, 17],
    ['notice-board', 15, 38], ['planter', 26, 40], ['bin', 25, 43],
    ['terminal', 66, 36], ['server', 67, 39], ['crate', 56, 39],
    ['workbench', 51, 47], ['monitor', 54, 47], ['server', 48, 48],
    ['prototype', 55, 46], ['crate', 38, 48], ['barrel', 39, 46],
    ['stump', 12, 27], ['log', 66, 31], ['picnic', 57, 21],
    ['reeds', 49, 13], ['reeds', 53, 12], ['bicycle', 26, 37],
  ],
}

export const solidRocks = [[11, 25], [69, 24], [29, 10], [67, 47], [13, 39]]
