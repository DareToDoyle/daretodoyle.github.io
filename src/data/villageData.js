export const TILE_SIZE = 16
export const MAP_WIDTH = 112
export const MAP_HEIGHT = 80
export const WORLD_WIDTH = MAP_WIDTH * TILE_SIZE
export const WORLD_HEIGHT = MAP_HEIGHT * TILE_SIZE
export const TILE = {
  GRASS: 0,
  GRASS_ALT: 1,
  PATH: 2,
  PLAZA: 3,
  GARDEN: 4,
  FOREST: 5,
  FOREST_ALT: 6,
  SOLID: 7,
}

export const PLAYER_SPAWN = {
  x: 56 * TILE_SIZE + TILE_SIZE / 2,
  y: 44 * TILE_SIZE + TILE_SIZE / 2,
}

function hash(x, y) {
  let value = x * 374761393 + y * 668265263
  value = (value ^ (value >> 13)) * 1274126177
  return ((value ^ (value >> 16)) >>> 0) / 4294967295
}

function leftForestEdge(y) {
  return 12 + Math.floor(hash(17, y) * 4)
}

function rightForestEdge(y) {
  return 99 - Math.floor(hash(31, y) * 4)
}

function topForestEdge(x) {
  return 11 + Math.floor(hash(x, 23) * 4)
}

function bottomForestEdge(x) {
  return 68 - Math.floor(hash(x, 47) * 4)
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
      data[y][x] = tile
    }
  }
}

export function createGroundData() {
  const data = Array.from({ length: MAP_HEIGHT }, (_, y) =>
    Array.from({ length: MAP_WIDTH }, (_, x) => (
      hash(x, y) > 0.78 ? TILE.GRASS_ALT : TILE.GRASS
    )),
  )

  for (let y = 0; y < MAP_HEIGHT; y += 1) {
    for (let x = 0; x < MAP_WIDTH; x += 1) {
      if (isForestTile(x, y)) {
        data[y][x] = hash(x, y) > 0.56 ? TILE.FOREST_ALT : TILE.FOREST
      }
    }
  }

  // Broad, flat ground routes. Their overlap creates natural village junctions.
  paintRect(data, 27, 27, 31, 40, TILE.PATH)
  paintRect(data, 29, 38, 84, 42, TILE.PATH)
  paintRect(data, 80, 28, 84, 40, TILE.PATH)
  paintRect(data, 29, 40, 33, 59, TILE.PATH)
  paintRect(data, 76, 40, 80, 60, TILE.PATH)
  paintRect(data, 53, 22, 57, 66, TILE.PATH)

  // Softly rounded central plaza.
  for (let y = 35; y <= 45; y += 1) {
    for (let x = 50; x <= 62; x += 1) {
      const dx = (x - 56) / 6.5
      const dy = (y - 40) / 5.5
      if (dx * dx + dy * dy <= 1) data[y][x] = TILE.PLAZA
    }
  }

  paintRect(data, 18, 45, 25, 50, TILE.GARDEN)
  paintRect(data, 87, 45, 94, 50, TILE.GARDEN)
  paintRect(data, 37, 18, 43, 22, TILE.GARDEN)
  paintRect(data, 68, 63, 74, 67, TILE.GARDEN)

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
  const horizontalRows = [2, 5, 8, 72, 75, 78]
  const verticalColumns = [2, 5, 8, 103, 106, 109]

  horizontalRows.forEach((y, rowIndex) => {
    for (let x = 1 + (rowIndex % 2); x < MAP_WIDTH; x += 2) {
      positions.push({
        x: x * TILE_SIZE + (hash(x, y) - 0.5) * 10,
        y: y * TILE_SIZE + (hash(y, x) - 0.5) * 8,
        variant: hash(x + 4, y + 9) > 0.5 ? 1 : 0,
      })
    }
  })

  verticalColumns.forEach((x, columnIndex) => {
    for (let y = 13 + (columnIndex % 2); y < 69; y += 2) {
      positions.push({
        x: x * TILE_SIZE + (hash(y, x) - 0.5) * 8,
        y: y * TILE_SIZE + (hash(x + 2, y + 7) - 0.5) * 10,
        variant: hash(x + 11, y + 3) > 0.48 ? 1 : 0,
      })
    }
  })

  for (let x = 1; x < MAP_WIDTH; x += 2) {
    const top = topForestEdge(x)
    const bottom = bottomForestEdge(x)
    positions.push({
      x: x * TILE_SIZE + (hash(x, top) - 0.5) * 9,
      y: (top - 0.5) * TILE_SIZE + (hash(top, x) - 0.5) * 7,
      variant: hash(x + 13, top) > 0.5 ? 1 : 0,
    })
    positions.push({
      x: x * TILE_SIZE + (hash(x, bottom) - 0.5) * 9,
      y: (bottom + 0.5) * TILE_SIZE + (hash(bottom, x) - 0.5) * 7,
      variant: hash(x + 19, bottom) > 0.5 ? 1 : 0,
    })
  }

  for (let y = 13; y < 69; y += 2) {
    const left = leftForestEdge(y)
    const right = rightForestEdge(y)
    positions.push({
      x: (left - 0.5) * TILE_SIZE + (hash(y, left) - 0.5) * 7,
      y: y * TILE_SIZE + (hash(left, y) - 0.5) * 9,
      variant: hash(left + 5, y) > 0.5 ? 1 : 0,
    })
    positions.push({
      x: (right + 0.5) * TILE_SIZE + (hash(y, right) - 0.5) * 7,
      y: y * TILE_SIZE + (hash(right, y) - 0.5) * 9,
      variant: hash(right + 7, y) > 0.5 ? 1 : 0,
    })
  }

  return positions
}

export const decorationData = {
  bushes: [
    [18, 18], [20, 19], [23, 17], [41, 28], [43, 29], [68, 27], [71, 29],
    [88, 17], [91, 19], [22, 62], [24, 64], [42, 64], [69, 19], [90, 63],
  ],
  flowers: [
    [19, 46], [21, 47], [23, 49], [88, 47], [90, 46], [92, 49],
    [38, 19], [40, 21], [42, 19], [69, 64], [71, 66], [73, 64],
  ],
  stones: [
    [17, 34], [20, 55], [39, 52], [46, 24], [66, 54], [72, 18], [92, 34], [95, 58],
  ],
  benches: [
    [45, 34, 0], [67, 46, 1], [44, 47, 0], [65, 32, 1],
  ],
  lamps: [
    [47, 36], [65, 36], [47, 44], [65, 44], [35, 40], [76, 40],
  ],
  mailboxes: [
    [34, 56], [75, 57], [32, 24], [79, 25],
  ],
  fences: [
    [18, 44, 8, 'horizontal'],
    [87, 44, 8, 'horizontal'],
    [36, 17, 7, 'horizontal'],
    [67, 62, 8, 'horizontal'],
  ],
}

export const solidRocks = [
  [18, 28], [94, 27], [21, 65], [91, 64], [43, 16], [70, 66],
]
