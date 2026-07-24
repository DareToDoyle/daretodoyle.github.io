export const PIXEL_PALETTE = {
  ink: '#151514',
  nearBlack: '#292927',
  deep: '#454542',
  dark: '#62625d',
  mid: '#85857f',
  light: '#b2b2aa',
  grass: '#c9c9c1',
  path: '#e2e2da',
  paper: '#f4f4ed',
  white: '#fbfbf7',
}

const FONT = {
  ' ': ['00000','00000','00000','00000','00000','00000','00000'],
  A: ['01110','10001','10001','11111','10001','10001','10001'],
  B: ['11110','10001','10001','11110','10001','10001','11110'],
  C: ['01111','10000','10000','10000','10000','10000','01111'],
  D: ['11110','10001','10001','10001','10001','10001','11110'],
  E: ['11111','10000','10000','11110','10000','10000','11111'],
  F: ['11111','10000','10000','11110','10000','10000','10000'],
  G: ['01111','10000','10000','10111','10001','10001','01111'],
  H: ['10001','10001','10001','11111','10001','10001','10001'],
  I: ['11111','00100','00100','00100','00100','00100','11111'],
  J: ['00111','00010','00010','00010','10010','10010','01100'],
  K: ['10001','10010','10100','11000','10100','10010','10001'],
  L: ['10000','10000','10000','10000','10000','10000','11111'],
  M: ['10001','11011','10101','10101','10001','10001','10001'],
  N: ['10001','11001','10101','10011','10001','10001','10001'],
  O: ['01110','10001','10001','10001','10001','10001','01110'],
  P: ['11110','10001','10001','11110','10000','10000','10000'],
  Q: ['01110','10001','10001','10001','10101','10010','01101'],
  R: ['11110','10001','10001','11110','10100','10010','10001'],
  S: ['01111','10000','10000','01110','00001','00001','11110'],
  T: ['11111','00100','00100','00100','00100','00100','00100'],
  U: ['10001','10001','10001','10001','10001','10001','01110'],
  V: ['10001','10001','10001','10001','10001','01010','00100'],
  W: ['10001','10001','10001','10101','10101','11011','10001'],
  X: ['10001','10001','01010','00100','01010','10001','10001'],
  Y: ['10001','10001','01010','00100','00100','00100','00100'],
  Z: ['11111','00001','00010','00100','01000','10000','11111'],
  '0': ['01110','10001','10011','10101','11001','10001','01110'],
  '1': ['00100','01100','00100','00100','00100','00100','01110'],
  '2': ['01110','10001','00001','00010','00100','01000','11111'],
  '3': ['11110','00001','00001','01110','00001','00001','11110'],
  '4': ['00010','00110','01010','10010','11111','00010','00010'],
  '5': ['11111','10000','10000','11110','00001','00001','11110'],
  '6': ['01110','10000','10000','11110','10001','10001','01110'],
  '7': ['11111','00001','00010','00100','01000','01000','01000'],
  '8': ['01110','10001','10001','01110','10001','10001','01110'],
  '9': ['01110','10001','10001','01111','00001','00001','01110'],
  '/': ['00001','00010','00010','00100','01000','01000','10000'],
  '-': ['00000','00000','00000','11111','00000','00000','00000'],
  '@': ['01110','10001','10111','10101','10111','10000','01110'],
}

const makeCanvas = (width, height) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  context.imageSmoothingEnabled = false
  return { canvas, context }
}

const addCanvasTexture = (scene, key, canvas) => {
  if (scene.textures.exists(key)) scene.textures.remove(key)
  return scene.textures.addCanvas(key, canvas)
}

export function measurePixelText(text, scale = 1) {
  const length = String(text).length
  return {
    width: Math.max(0, length * 6 * scale - scale),
    height: 7 * scale,
  }
}

export function drawPixelText(
  context,
  text,
  x,
  y,
  scale = 1,
  color = PIXEL_PALETTE.ink,
  align = 'left',
) {
  const characters = String(text).toUpperCase().split('')
  const metrics = measurePixelText(text, scale)
  const startX = align === 'center' ? Math.round(x - metrics.width / 2) : Math.round(x)
  context.fillStyle = color

  characters.forEach((character, characterIndex) => {
    const glyph = FONT[character] || FONT[' ']
    glyph.forEach((row, rowIndex) => {
      for (let column = 0; column < row.length; column += 1) {
        if (row[column] === '1') {
          context.fillRect(
            startX + characterIndex * 6 * scale + column * scale,
            Math.round(y) + rowIndex * scale,
            scale,
            scale,
          )
        }
      }
    })
  })
  return metrics.width
}

function drawGrass(context, ox, base, details) {
  context.fillStyle = base
  context.fillRect(ox, 0, 16, 16)
  details.forEach(([x, y, w, h, color]) => {
    context.fillStyle = color
    context.fillRect(ox + x, y, w, h)
  })
}

export function createTileTextures(scene) {
  const { canvas, context } = makeCanvas(16 * 18, 16)
  const p = PIXEL_PALETTE
  const grassDetails = [
    [[3,4,1,1,p.light],[11,11,1,1,p.mid]],
    [[2,12,2,1,p.dark],[9,3,1,1,p.light],[13,8,1,1,p.mid]],
    [[4,10,1,3,p.dark],[3,11,1,1,p.dark],[5,11,1,1,p.dark],[12,4,1,2,p.light]],
    [[4,5,2,2,p.mid],[5,4,2,1,p.light],[12,12,1,1,p.dark]],
    [[2,3,4,2,p.paper],[10,10,3,2,p.light]],
    [[1,7,6,3,p.light],[8,8,5,2,p.mid],[12,5,2,1,p.dark]],
  ]
  grassDetails.forEach((details, index) => {
    drawGrass(context, index * 16, index === 4 ? '#d1d1c9' : index === 5 ? '#c2c2ba' : p.grass, details)
  })

  const pathBases = [p.path, '#deded6', '#e6e6de', '#dcdcd4']
  pathBases.forEach((base, index) => {
    const ox = (6 + index) * 16
    context.fillStyle = base
    context.fillRect(ox, 0, 16, 16)
    context.fillStyle = index % 2 ? p.mid : p.light
    if (index === 0) {
      context.fillRect(ox + 3, 3, 3, 1); context.fillRect(ox + 11, 12, 2, 1)
    } else if (index === 1) {
      context.fillRect(ox + 5, 5, 3, 2); context.fillRect(ox + 12, 2, 1, 1)
    } else if (index === 2) {
      context.fillRect(ox + 4, 2, 1, 4); context.fillRect(ox + 5, 5, 4, 1); context.fillRect(ox + 8, 6, 1, 3)
    } else {
      context.fillRect(ox + 1, 1, 2, 14); context.fillStyle = p.grass; context.fillRect(ox, 4, 2, 3)
    }
  })

  ;[10, 11].forEach((tile, index) => {
    const ox = tile * 16
    context.fillStyle = index ? '#ecece5' : p.paper
    context.fillRect(ox, 0, 16, 16)
    context.fillStyle = p.light
    context.fillRect(ox, 0, 1, 16); context.fillRect(ox, 0, 16, 1)
    if (index) context.fillRect(ox + 8, 8, 4, 1)
  })

  drawGrass(context, 12 * 16, p.mid, [[2,2,2,2,p.dark],[10,9,2,3,p.light],[5,12,3,1,p.dark]])
  ;[13,14,15].forEach((tile, index) => {
    const ox = tile * 16
    context.fillStyle = ['#5d5d58','#555550','#494945'][index]
    context.fillRect(ox, 0, 16, 16)
    context.fillStyle = [p.deep,p.dark,p.nearBlack][index]
    context.fillRect(ox + 1, 2, 6, 5); context.fillRect(ox + 9, 9, 6, 5)
    context.fillStyle = [p.mid,p.mid,p.deep][index]
    context.fillRect(ox + 8, 1, 5, 3); context.fillRect(ox + 3, 11, 4, 3)
  })
  context.fillStyle = p.dark
  context.fillRect(16 * 16, 0, 16, 16)
  context.fillStyle = p.light
  context.fillRect(16 * 16 + 1, 3, 14, 1); context.fillRect(16 * 16 + 3, 10, 10, 1)
  context.fillStyle = p.nearBlack
  context.fillRect(17 * 16, 0, 16, 16)
  addCanvasTexture(scene, 'village-tiles', canvas)
}

export function createWorldGroundTexture(scene, groundData, tileSize) {
  const rows = groundData.length
  const columns = groundData[0].length
  const { canvas, context } = makeCanvas(columns * tileSize, rows * tileSize)
  const tileSource = scene.textures.get('village-tiles').getSourceImage()
  groundData.forEach((row, y) => row.forEach((tile, x) => {
    context.drawImage(
      tileSource,
      tile * tileSize, 0, tileSize, tileSize,
      x * tileSize, y * tileSize, tileSize, tileSize,
    )
  }))
  addCanvasTexture(scene, 'world-ground', canvas)
}

function drawTree(context, variant) {
  const p = PIXEL_PALETTE
  const shapes = [
    { trunk: [13,26,7,14], canopy: [[7,5,20,23],[3,11,28,14],[11,2,13,8]] },
    { trunk: [14,25,6,15], canopy: [[5,8,24,20],[1,15,32,11],[10,3,16,11]] },
    { trunk: [12,24,8,16], canopy: [[8,3,17,24],[3,10,27,17],[12,1,10,8]] },
    { trunk: [14,28,6,12], canopy: [[9,10,17,19],[5,16,25,12],[13,6,9,8]] },
  ]
  const shape = shapes[variant]
  context.fillStyle = p.ink
  context.fillRect(...shape.trunk)
  context.fillStyle = p.deep
  context.fillRect(shape.trunk[0] + 2, shape.trunk[1], 3, shape.trunk[3])
  shape.canopy.forEach(([x,y,w,h]) => {
    context.fillStyle = p.ink; context.fillRect(x - 2, y - 2, w + 4, h + 4)
    context.fillStyle = variant % 2 ? p.dark : p.deep; context.fillRect(x, y, w, h)
  })
  context.fillStyle = variant > 1 ? p.light : p.mid
  context.fillRect(10, 7 + variant, 7, 5)
  context.fillRect(5 + variant, 16, 5, 4)
  context.fillStyle = p.nearBlack
  context.fillRect(21, 15, 7, 8)
}

function drawBush(context, variant) {
  const p = PIXEL_PALETTE
  const width = [20,24,18][variant]
  context.fillStyle = p.ink
  context.fillRect(2, 7, width - 4, 8); context.fillRect(5, 3, width - 10, 13)
  context.fillStyle = variant === 1 ? p.deep : p.dark
  context.fillRect(4, 7, width - 8, 6); context.fillRect(7, 4, width - 14, 8)
  context.fillStyle = p.mid
  context.fillRect(7, 5, 5, 4); context.fillRect(width - 9, 9, 4, 3)
  context.fillStyle = p.light
  context.fillRect(8, 5, 2, 2)
}

function simpleTexture(scene, key, width, height, draw) {
  const { canvas, context } = makeCanvas(width, height)
  draw(context, PIXEL_PALETTE)
  addCanvasTexture(scene, key, canvas)
}

export function createPropTextures(scene) {
  for (let variant = 0; variant < 4; variant += 1) {
    const { canvas, context } = makeCanvas(34, 40)
    drawTree(context, variant)
    addCanvasTexture(scene, `tree-${variant}`, canvas)
  }
  for (let variant = 0; variant < 3; variant += 1) {
    const { canvas, context } = makeCanvas(24, 16)
    drawBush(context, variant)
    addCanvasTexture(scene, `bush-${variant}`, canvas)
  }
  simpleTexture(scene, 'rock', 18, 14, (c,p) => {
    c.fillStyle=p.ink;c.fillRect(2,5,14,8);c.fillRect(5,2,9,11)
    c.fillStyle=p.deep;c.fillRect(4,6,10,6);c.fillRect(6,3,7,7)
    c.fillStyle=p.mid;c.fillRect(7,4,4,3)
  })
  simpleTexture(scene, 'flower', 9, 10, (c,p) => {
    c.fillStyle=p.deep;c.fillRect(4,4,1,6)
    c.fillStyle=p.paper;c.fillRect(1,1,3,3);c.fillRect(5,1,3,3);c.fillRect(3,0,3,6)
    c.fillStyle=p.ink;c.fillRect(4,2,1,1)
  })
  simpleTexture(scene, 'weed', 9, 9, (c,p) => {
    c.fillStyle=p.dark;c.fillRect(4,3,1,6);c.fillRect(2,4,2,1);c.fillRect(5,5,2,1);c.fillRect(1,7,7,1)
  })
  simpleTexture(scene, 'stone', 8, 6, (c,p) => {
    c.fillStyle=p.deep;c.fillRect(1,2,6,4);c.fillStyle=p.mid;c.fillRect(2,1,4,2)
  })
  simpleTexture(scene, 'mushroom', 8, 9, (c,p) => {
    c.fillStyle=p.paper;c.fillRect(3,4,3,5);c.fillStyle=p.ink;c.fillRect(1,2,7,3);c.fillRect(3,0,3,1);c.fillStyle=p.mid;c.fillRect(2,1,5,2)
  })
  simpleTexture(scene, 'bench', 22, 14, (c,p) => {
    c.fillStyle=p.ink;c.fillRect(1,3,20,3);c.fillRect(3,8,16,3);c.fillRect(4,11,3,3);c.fillRect(16,11,3,3)
    c.fillStyle=p.mid;c.fillRect(3,4,16,1);c.fillRect(5,9,12,1)
  })
  simpleTexture(scene, 'lamp', 11, 22, (c,p) => {
    c.fillStyle=p.ink;c.fillRect(5,7,2,15);c.fillRect(2,21,8,1);c.fillRect(1,1,10,7)
    c.fillStyle=p.paper;c.fillRect(3,3,6,4);c.fillStyle=p.light;c.fillRect(4,4,4,2)
  })
  simpleTexture(scene, 'mailbox', 14, 19, (c,p) => {
    c.fillStyle=p.ink;c.fillRect(2,3,11,8);c.fillRect(6,11,3,8)
    c.fillStyle=p.light;c.fillRect(3,4,9,5);c.fillStyle=p.deep;c.fillRect(8,5,3,2)
  })
  simpleTexture(scene, 'fence', 16, 14, (c,p) => {
    c.fillStyle=p.ink;c.fillRect(1,2,3,12);c.fillRect(12,2,3,12);c.fillRect(0,6,16,2);c.fillRect(0,10,16,2)
    c.fillStyle=p.mid;c.fillRect(2,3,1,5);c.fillRect(13,3,1,5)
  })

  const propDrawings = {
    tripod: (c,p) => { c.fillStyle=p.ink;c.fillRect(7,3,8,7);c.fillRect(9,10,2,4);c.fillRect(4,13,2,9);c.fillRect(14,13,2,9);c.fillRect(9,13,2,9);c.fillStyle=p.paper;c.fillRect(9,5,3,3) },
    'photo-board': (c,p) => { c.fillStyle=p.ink;c.fillRect(1,1,22,16);c.fillRect(4,17,2,7);c.fillRect(18,17,2,7);c.fillStyle=p.paper;c.fillRect(3,3,18,12);c.fillStyle=p.mid;c.fillRect(5,5,6,4);c.fillRect(13,7,6,6) },
    planter: (c,p) => { c.fillStyle=p.dark;c.fillRect(3,8,15,9);c.fillStyle=p.ink;c.fillRect(1,6,19,4);c.fillRect(5,17,3,3);c.fillRect(14,17,3,3);c.fillStyle=p.mid;c.fillRect(5,2,3,5);c.fillRect(10,0,3,7);c.fillRect(15,3,2,4) },
    antenna: (c,p) => { c.fillStyle=p.ink;c.fillRect(8,4,2,20);c.fillRect(2,23,14,2);c.fillRect(4,7,10,2);c.fillRect(6,3,6,2);c.fillStyle=p.mid;c.fillRect(1,1,4,4) },
    monitor: (c,p) => { c.fillStyle=p.ink;c.fillRect(1,1,18,13);c.fillRect(8,14,4,4);c.fillRect(5,18,10,2);c.fillStyle=p.paper;c.fillRect(3,3,14,9);c.fillStyle=p.deep;c.fillRect(5,5,5,2);c.fillRect(11,8,4,2) },
    cable: (c,p) => { c.strokeStyle=p.ink;c.lineWidth=2;c.beginPath();c.moveTo(1,4);c.lineTo(8,4);c.lineTo(8,10);c.lineTo(18,10);c.stroke();c.fillRect(17,8,4,4) },
    'notice-board': (c,p) => { c.fillStyle=p.ink;c.fillRect(1,1,24,17);c.fillRect(4,18,3,8);c.fillRect(20,18,3,8);c.fillStyle=p.light;c.fillRect(3,3,20,13);c.fillStyle=p.paper;c.fillRect(5,5,6,5);c.fillRect(14,6,6,7) },
    bin: (c,p) => { c.fillStyle=p.ink;c.fillRect(3,4,11,15);c.fillRect(1,2,15,3);c.fillStyle=p.dark;c.fillRect(5,6,7,11);c.fillStyle=p.mid;c.fillRect(6,7,2,8) },
    terminal: (c,p) => { c.fillStyle=p.ink;c.fillRect(1,1,22,17);c.fillRect(4,18,16,8);c.fillStyle=p.paper;c.fillRect(4,4,16,10);c.fillStyle=p.deep;c.fillRect(6,6,7,2);c.fillRect(11,10,6,2);c.fillStyle=p.mid;c.fillRect(7,21,10,2) },
    server: (c,p) => { c.fillStyle=p.ink;c.fillRect(2,1,15,24);c.fillStyle=p.deep;c.fillRect(4,3,11,6);c.fillRect(4,11,11,5);c.fillRect(4,18,11,5);c.fillStyle=p.paper;c.fillRect(6,5,2,2);c.fillRect(11,13,2,2);c.fillRect(7,20,2,1) },
    crate: (c,p) => { c.fillStyle=p.ink;c.fillRect(1,1,18,18);c.fillStyle=p.dark;c.fillRect(3,3,14,14);c.fillStyle=p.ink;c.fillRect(4,5,12,2);c.fillRect(4,13,12,2);c.fillRect(8,3,2,14) },
    workbench: (c,p) => { c.fillStyle=p.ink;c.fillRect(1,5,26,5);c.fillRect(3,10,3,12);c.fillRect(22,10,3,12);c.fillStyle=p.mid;c.fillRect(3,6,22,2);c.fillStyle=p.deep;c.fillRect(8,2,8,3);c.fillRect(18,0,4,5) },
    prototype: (c,p) => { c.fillStyle=p.ink;c.fillRect(6,6,12,14);c.fillRect(10,0,4,7);c.fillRect(3,20,18,3);c.fillStyle=p.paper;c.fillRect(8,8,8,8);c.fillStyle=p.deep;c.fillRect(10,10,4,4);c.fillStyle=p.mid;c.fillRect(3,3,4,4);c.fillRect(17,2,3,3) },
    barrel: (c,p) => { c.fillStyle=p.ink;c.fillRect(3,1,13,20);c.fillRect(1,4,17,3);c.fillRect(1,15,17,3);c.fillStyle=p.dark;c.fillRect(5,3,9,16);c.fillStyle=p.mid;c.fillRect(6,4,2,10) },
    stump: (c,p) => { c.fillStyle=p.ink;c.fillRect(2,5,16,10);c.fillStyle=p.dark;c.fillRect(4,4,12,9);c.fillStyle=p.light;c.fillRect(5,2,10,5);c.fillStyle=p.deep;c.fillRect(8,3,4,2) },
    log: (c,p) => { c.fillStyle=p.ink;c.fillRect(2,5,25,10);c.fillStyle=p.dark;c.fillRect(5,6,20,8);c.fillStyle=p.light;c.fillRect(1,7,7,6);c.fillStyle=p.deep;c.fillRect(3,9,3,2) },
    picnic: (c,p) => { c.fillStyle=p.ink;c.fillRect(3,4,22,4);c.fillRect(7,8,3,11);c.fillRect(19,8,3,11);c.fillRect(0,11,29,3);c.fillStyle=p.mid;c.fillRect(5,5,18,1) },
    reeds: (c,p) => { c.fillStyle=p.deep;c.fillRect(3,3,1,10);c.fillRect(7,0,1,13);c.fillRect(11,4,1,9);c.fillRect(1,12,13,2);c.fillStyle=p.light;c.fillRect(2,2,3,2);c.fillRect(6,0,3,2);c.fillRect(10,3,3,2) },
    bicycle: (c,p) => { c.strokeStyle=p.ink;c.lineWidth=2;c.beginPath();c.arc(6,15,5,0,Math.PI*2);c.arc(22,15,5,0,Math.PI*2);c.moveTo(6,15);c.lineTo(13,7);c.lineTo(17,15);c.lineTo(6,15);c.moveTo(13,7);c.lineTo(22,15);c.stroke();c.fillStyle=p.ink;c.fillRect(11,5,7,2) },
  }
  Object.entries(propDrawings).forEach(([key, draw]) => {
    simpleTexture(scene, key, key === 'picnic' ? 30 : 28, 28, draw)
  })
}

const PLAYER_FRAME_WIDTH = 20
const PLAYER_FRAME_HEIGHT = 28

function drawPlayerFrame(context, frame, row, direction, walkFrame) {
  const x = frame * PLAYER_FRAME_WIDTH
  const y = row * PLAYER_FRAME_HEIGHT
  const p = PIXEL_PALETTE
  const bob = walkFrame === 2 ? 1 : 0
  const leftStep = walkFrame === 1
  const rightStep = walkFrame === 3
  context.fillStyle = p.ink
  context.fillRect(x + 4, y + 2 + bob, 12, 10); context.fillRect(x + 3, y + 6 + bob, 14, 5)
  context.fillStyle = p.nearBlack
  context.fillRect(x + 6, y + 3 + bob, 8, 4); context.fillRect(x + 4, y + 5 + bob, 4, 5)
  if (direction !== 'up') {
    context.fillStyle = p.paper
    context.fillRect(x + 5, y + 7 + bob, 10, 7)
    context.fillStyle = p.ink
    if (direction === 'down') {
      context.fillRect(x+7,y+9+bob,1,2);context.fillRect(x+12,y+9+bob,1,2);context.fillRect(x+9,y+12+bob,2,1)
    } else {
      const fx = direction === 'left' ? x + 5 : x + 14
      context.fillRect(fx,y+9+bob,1,2);context.fillRect(direction === 'left' ? x+6 : x+12,y+12+bob,2,1)
    }
  } else {
    context.fillStyle=p.deep;context.fillRect(x+5,y+8+bob,10,6)
  }
  context.fillStyle=p.ink
  context.fillRect(x+5,y+14+bob,10,8)
  context.fillStyle=p.light
  context.fillRect(x+7,y+15+bob,6,6)
  context.fillStyle=p.deep
  context.fillRect(x+(leftStep?2:3),y+15+bob,3,leftStep?8:6)
  context.fillRect(x+(rightStep?15:14),y+15+bob,3,rightStep?8:6)
  context.fillStyle=p.paper
  context.fillRect(x+(leftStep?2:3),y+(leftStep?22:20)+bob,3,2)
  context.fillRect(x+(rightStep?15:14),y+(rightStep?22:20)+bob,3,2)
  context.fillStyle=p.nearBlack
  context.fillRect(x+6,y+22+bob,4,leftStep?4:5);context.fillRect(x+10,y+22+bob,4,rightStep?4:5)
  context.fillRect(x+(leftStep?5:6),y+26,5,2);context.fillRect(x+10,y+26,rightStep?5:4,2)
  context.fillStyle=p.mid;context.fillRect(x+9,y+16+bob,2,3)
}

export function createPlayerTexture(scene) {
  const { canvas, context } = makeCanvas(PLAYER_FRAME_WIDTH * 4, PLAYER_FRAME_HEIGHT * 4)
  ;['down','left','right','up'].forEach((direction, row) => {
    for (let frame = 0; frame < 4; frame += 1) drawPlayerFrame(context, frame, row, direction, frame)
  })
  if (scene.textures.exists('player')) scene.textures.remove('player')
  scene.textures.addSpriteSheet('player', canvas, {
    frameWidth: PLAYER_FRAME_WIDTH,
    frameHeight: PLAYER_FRAME_HEIGHT,
  })
}

function shell(context, roof, body, profile = 'house') {
  const p = PIXEL_PALETTE
  context.fillStyle = p.ink
  if (profile === 'office') {
    context.fillRect(10,18,76,58);context.fillRect(6,22,84,8)
  } else if (profile === 'garage') {
    context.fillRect(5,25,86,51);context.fillRect(11,16,74,12)
  } else {
    context.fillRect(8,24,80,52);context.fillRect(3,29,90,14);context.fillRect(17,15,62,12)
  }
  context.fillStyle = roof
  if (profile === 'office') {
    context.fillRect(12,20,72,13);context.fillRect(8,24,80,5)
  } else if (profile === 'garage') {
    context.fillRect(8,27,80,12);context.fillRect(14,19,68,8)
  } else {
    context.fillRect(11,27,74,14);context.fillRect(7,31,82,8);context.fillRect(20,18,56,9)
  }
  context.fillStyle = body
  context.fillRect(11,42,74,32)
}

function windowBox(c,x,y,w=14,h=13) {
  const p=PIXEL_PALETTE
  c.fillStyle=p.ink;c.fillRect(x,y,w,h)
  c.fillStyle=p.paper;c.fillRect(x+2,y+2,w-4,h-4)
  c.fillStyle=p.dark;c.fillRect(x+Math.floor(w/2),y+2,1,h-4)
}

function door(c,x,y,w=15,h=22) {
  const p=PIXEL_PALETTE
  c.fillStyle=p.ink;c.fillRect(x,y,w,h)
  c.fillStyle=p.deep;c.fillRect(x+2,y+3,w-4,h-3)
  c.fillStyle=p.paper;c.fillRect(x+w-5,y+Math.floor(h/2),2,2)
}

function drawPhotoBuilding(c) {
  const p=PIXEL_PALETTE;shell(c,p.mid,p.light)
  windowBox(c,16,49,18,14);windowBox(c,62,49,16,14);door(c,40,52)
  c.fillStyle=p.ink;c.fillRect(6,19,12,10);c.fillStyle=p.paper;c.fillRect(9,21,6,6);c.fillStyle=p.deep;c.fillRect(11,23,2,2)
  c.fillStyle=p.paper;c.fillRect(71,31,10,7);c.fillStyle=p.ink;c.fillRect(74,32,4,4)
}

function drawBroadcastBuilding(c) {
  const p=PIXEL_PALETTE;shell(c,p.nearBlack,p.light)
  windowBox(c,14,48,21,15);door(c,42,51,16,23);windowBox(c,64,48,17,15)
  c.fillStyle=p.ink;c.fillRect(76,3,3,24);c.fillRect(69,8,17,3);c.fillRect(72,4,11,3)
  c.fillStyle=p.paper;c.fillRect(14,30,25,8);drawPixelText(c,'ON AIR',26,31,1,p.ink,'center')
}

function drawWorkshopBuilding(c) {
  const p=PIXEL_PALETTE;shell(c,p.deep,p.mid,'garage')
  c.fillStyle=p.ink;c.fillRect(12,45,42,29);c.fillStyle=p.nearBlack;c.fillRect(15,48,36,23)
  c.fillStyle=p.light;for(let y=51;y<70;y+=6)c.fillRect(17,y,32,2)
  door(c,65,51,14,23);c.fillStyle=p.paper;c.fillRect(58,32,20,7);c.fillStyle=p.ink;c.fillRect(61,34,14,2)
  c.fillStyle=p.ink;c.fillRect(9,16,4,13);c.fillRect(6,15,10,3)
}

function drawOfficeBuilding(c) {
  const p=PIXEL_PALETTE;shell(c,p.dark,p.light,'office')
  windowBox(c,16,39,17,14);windowBox(c,63,39,17,14);windowBox(c,16,57,17,12);windowBox(c,63,57,17,12)
  door(c,41,51,15,25);c.fillStyle=p.paper;c.fillRect(33,24,30,7);drawPixelText(c,'OFFICE',48,24,1,p.ink,'center')
  c.fillStyle=p.ink;c.fillRect(8,74,80,3)
}

function drawLabBuilding(c) {
  const p=PIXEL_PALETTE;shell(c,p.ink,p.dark,'garage')
  c.fillStyle=p.nearBlack;c.fillRect(9,43,48,31)
  c.fillStyle=p.deep;for(let x=13;x<55;x+=9)c.fillRect(x,46,4,25)
  c.fillStyle=p.paper;c.fillRect(16,52,35,4);c.fillStyle=p.ink;c.fillRect(61,48,20,26)
  c.fillStyle=p.mid;c.fillRect(64,51,14,19);c.fillStyle=p.paper;c.fillRect(75,60,2,2)
  c.fillStyle=p.ink;c.fillRect(80,4,4,24);c.fillStyle=p.mid;c.fillRect(76,2,12,7)
  c.fillStyle=p.paper;c.fillRect(14,29,25,8);drawPixelText(c,'D2D',26,30,1,p.ink,'center')
}

export function createBuildingTextures(scene, pois) {
  const drawings = {
    photo: drawPhotoBuilding,
    broadcast: drawBroadcastBuilding,
    workshop: drawWorkshopBuilding,
    office: drawOfficeBuilding,
    lab: drawLabBuilding,
  }
  pois.forEach((poi) => {
    const { canvas, context } = makeCanvas(96, 80)
    drawings[poi.buildingType](context)
    addCanvasTexture(scene, `building-${poi.id}`, canvas)
  })
}

export function createPoiSignTextures(scene, pois) {
  pois.forEach((poi) => {
    const scale = 1
    const text = measurePixelText(poi.label, scale)
    const border = 2
    const paddingX = 6
    const paddingY = 4
    const signWidth = Math.max(42, text.width + paddingX * 2 + border * 2)
    const boardHeight = text.height + paddingY * 2 + border * 2
    const postHeight = 7
    const { canvas, context } = makeCanvas(signWidth, boardHeight + postHeight)
    const p = PIXEL_PALETTE
    context.fillStyle = p.ink
    context.fillRect(0,0,signWidth,boardHeight)
    context.fillStyle = p.dark
    context.fillRect(2,2,signWidth-4,boardHeight-4)
    context.fillStyle = p.paper
    context.fillRect(4,4,signWidth-8,boardHeight-8)
    context.fillStyle = p.light
    context.fillRect(4,boardHeight-6,signWidth-8,2)
    context.fillStyle = p.ink
    context.fillRect(0,0,3,3);context.fillRect(signWidth-3,0,3,3)
    context.fillRect(0,boardHeight-3,3,3);context.fillRect(signWidth-3,boardHeight-3,3,3)
    const textY = Math.floor((boardHeight - text.height) / 2)
    drawPixelText(context, poi.label, signWidth / 2, textY, scale, p.ink, 'center')
    const leftPost = Math.max(5, Math.round(signWidth * 0.2))
    const rightPost = Math.min(signWidth - 8, Math.round(signWidth * 0.8))
    context.fillStyle = p.ink
    context.fillRect(leftPost,boardHeight,3,postHeight)
    context.fillRect(rightPost,boardHeight,3,postHeight)
    context.fillStyle = p.deep
    context.fillRect(leftPost+1,boardHeight,1,postHeight-1)
    context.fillRect(rightPost+1,boardHeight,1,postHeight-1)
    addCanvasTexture(scene, `sign-${poi.id}`, canvas)
  })
}

export function createMonumentTextures(scene) {
  const { canvas: plaque, context: c } = makeCanvas(88, 61)
  const p = PIXEL_PALETTE
  c.fillStyle=p.ink;c.fillRect(7,3,74,42);c.fillRect(3,8,82,31)
  c.fillStyle=p.paper;c.fillRect(7,8,74,31)
  drawPixelText(c,'D2D PLAZA',44,40,1,p.ink,'center')
  c.fillStyle=p.dark;c.fillRect(18,47,7,14);c.fillRect(63,47,7,14)
  c.fillStyle=p.light;c.fillRect(9,57,70,4)
  addCanvasTexture(scene,'monument-plaque',plaque)

  const source = scene.textures.get('brand-logo').getSourceImage()
  const { canvas: tiny, context: tinyContext } = makeCanvas(32,18)
  tinyContext.imageSmoothingEnabled=true
  tinyContext.drawImage(source,0,0,32,18)
  const pixels=tinyContext.getImageData(0,0,32,18)
  for(let index=0;index<pixels.data.length;index+=4){
    const luminance=pixels.data[index]*0.2126+pixels.data[index+1]*0.7152+pixels.data[index+2]*0.0722
    const opaque=pixels.data[index+3]>80&&luminance<155
    pixels.data[index]=21;pixels.data[index+1]=21;pixels.data[index+2]=20;pixels.data[index+3]=opaque?255:0
  }
  tinyContext.putImageData(pixels,0,0)
  const { canvas: logo, context: logoContext }=makeCanvas(64,36)
  logoContext.drawImage(tiny,0,0,32,18,0,0,64,36)
  addCanvasTexture(scene,'pixel-logo',logo)
}
