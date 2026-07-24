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
  ' ': ['000', '000', '000', '000', '000'],
  A: ['010', '101', '111', '101', '101'],
  B: ['110', '101', '110', '101', '110'],
  C: ['011', '100', '100', '100', '011'],
  D: ['110', '101', '101', '101', '110'],
  E: ['111', '100', '110', '100', '111'],
  F: ['111', '100', '110', '100', '100'],
  G: ['011', '100', '101', '101', '011'],
  H: ['101', '101', '111', '101', '101'],
  I: ['111', '010', '010', '010', '111'],
  J: ['001', '001', '001', '101', '010'],
  K: ['101', '101', '110', '101', '101'],
  L: ['100', '100', '100', '100', '111'],
  M: ['101', '111', '111', '101', '101'],
  N: ['101', '111', '111', '111', '101'],
  O: ['010', '101', '101', '101', '010'],
  P: ['110', '101', '110', '100', '100'],
  Q: ['010', '101', '101', '111', '011'],
  R: ['110', '101', '110', '101', '101'],
  S: ['011', '100', '010', '001', '110'],
  T: ['111', '010', '010', '010', '010'],
  U: ['101', '101', '101', '101', '111'],
  V: ['101', '101', '101', '101', '010'],
  W: ['101', '101', '111', '111', '101'],
  X: ['101', '101', '010', '101', '101'],
  Y: ['101', '101', '010', '010', '010'],
  Z: ['111', '001', '010', '100', '111'],
  '0': ['111', '101', '101', '101', '111'],
  '1': ['010', '110', '010', '010', '111'],
  '2': ['110', '001', '010', '100', '111'],
  '3': ['110', '001', '010', '001', '110'],
  '4': ['101', '101', '111', '001', '001'],
  '5': ['111', '100', '110', '001', '110'],
  '6': ['011', '100', '111', '101', '111'],
  '7': ['111', '001', '010', '010', '010'],
  '8': ['111', '101', '111', '101', '111'],
  '9': ['111', '101', '111', '001', '110'],
  '/': ['001', '001', '010', '100', '100'],
  '-': ['000', '000', '111', '000', '000'],
  '@': ['010', '101', '111', '100', '011'],
}

function makeCanvas(width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  context.imageSmoothingEnabled = false
  return { canvas, context }
}

function addCanvasTexture(scene, key, canvas) {
  if (scene.textures.exists(key)) scene.textures.remove(key)
  return scene.textures.addCanvas(key, canvas)
}

export function drawPixelText(context, text, x, y, scale = 1, color = PIXEL_PALETTE.ink, align = 'left') {
  const characters = String(text).toUpperCase().split('')
  const characterWidth = 4 * scale
  const width = Math.max(0, characters.length * characterWidth - scale)
  const startX = align === 'center' ? Math.round(x - width / 2) : x
  context.fillStyle = color

  characters.forEach((character, characterIndex) => {
    const glyph = FONT[character] || FONT[' ']
    glyph.forEach((row, rowIndex) => {
      row.split('').forEach((pixel, columnIndex) => {
        if (pixel === '1') {
          context.fillRect(
            startX + characterIndex * characterWidth + columnIndex * scale,
            y + rowIndex * scale,
            scale,
            scale,
          )
        }
      })
    })
  })

  return width
}

function drawGrassTile(context, offsetX, alternate = false) {
  const { grass, light, mid, dark } = PIXEL_PALETTE
  context.fillStyle = alternate ? '#c3c3bb' : grass
  context.fillRect(offsetX, 0, 16, 16)
  context.fillStyle = alternate ? mid : light
  context.fillRect(offsetX + 3, 4, 1, 2)
  context.fillRect(offsetX + 11, 11, 2, 1)
  context.fillStyle = dark
  context.fillRect(offsetX + 12, 3, 1, 1)
  context.fillRect(offsetX + 6, 13, 1, 1)
}

export function createTileTextures(scene) {
  const { canvas, context } = makeCanvas(16 * 8, 16)
  const { path, paper, light, mid, dark, deep, nearBlack } = PIXEL_PALETTE

  drawGrassTile(context, 0, false)
  drawGrassTile(context, 16, true)

  context.fillStyle = path
  context.fillRect(32, 0, 16, 16)
  context.fillStyle = light
  context.fillRect(34, 3, 2, 1)
  context.fillRect(43, 12, 1, 1)
  context.fillStyle = '#d4d4cc'
  context.fillRect(39, 7, 1, 1)
  context.fillRect(46, 2, 1, 2)

  context.fillStyle = paper
  context.fillRect(48, 0, 16, 16)
  context.fillStyle = light
  context.fillRect(49, 1, 4, 4)
  context.fillRect(59, 11, 4, 4)
  context.fillStyle = '#d8d8d0'
  context.fillRect(54, 7, 1, 1)
  context.fillRect(62, 3, 1, 1)

  context.fillStyle = mid
  context.fillRect(64, 0, 16, 16)
  context.fillStyle = dark
  context.fillRect(66, 2, 2, 2)
  context.fillRect(75, 10, 2, 1)
  context.fillStyle = light
  context.fillRect(70, 6, 1, 2)

  context.fillStyle = dark
  context.fillRect(80, 0, 16, 16)
  context.fillStyle = deep
  context.fillRect(81, 2, 5, 4)
  context.fillRect(89, 8, 6, 5)
  context.fillStyle = mid
  context.fillRect(86, 1, 5, 3)
  context.fillRect(82, 10, 4, 4)
  context.fillStyle = nearBlack
  context.fillRect(92, 3, 2, 2)

  context.fillStyle = '#595955'
  context.fillRect(96, 0, 16, 16)
  context.fillStyle = deep
  context.fillRect(98, 1, 6, 5)
  context.fillRect(105, 9, 6, 5)
  context.fillStyle = '#73736d'
  context.fillRect(104, 2, 6, 4)
  context.fillRect(98, 11, 5, 4)

  context.fillStyle = nearBlack
  context.fillRect(112, 0, 16, 16)

  addCanvasTexture(scene, 'village-tiles', canvas)
}

export function createWorldGroundTexture(scene, groundData, tileSize) {
  const rows = groundData.length
  const columns = groundData[0].length
  const { canvas, context } = makeCanvas(columns * tileSize, rows * tileSize)
  const tileSource = scene.textures.get('village-tiles').getSourceImage()
  context.imageSmoothingEnabled = false

  groundData.forEach((row, y) => {
    row.forEach((tile, x) => {
      context.drawImage(
        tileSource,
        tile * tileSize,
        0,
        tileSize,
        tileSize,
        x * tileSize,
        y * tileSize,
        tileSize,
        tileSize,
      )
    })
  })

  addCanvasTexture(scene, 'world-ground', canvas)
}

function drawTree(context, variant = 0) {
  const { ink, nearBlack, deep, dark, mid, light } = PIXEL_PALETTE
  context.clearRect(0, 0, 24, 32)
  context.fillStyle = ink
  context.fillRect(9, 20, 7, 12)
  context.fillStyle = deep
  context.fillRect(11, 21, 3, 10)

  context.fillStyle = ink
  context.fillRect(5, 4, 14, 2)
  context.fillRect(3, 7, 18, 12)
  context.fillRect(5, 3, 14, 18)
  context.fillRect(1, 10, 22, 7)
  context.fillStyle = variant ? dark : deep
  context.fillRect(5, 6, 14, 13)
  context.fillRect(3, 10, 18, 7)
  context.fillStyle = variant ? mid : dark
  context.fillRect(7, 4, 8, 6)
  context.fillRect(4, 9, 6, 5)
  context.fillStyle = variant ? light : mid
  context.fillRect(8, 5, 5, 3)
  context.fillRect(5, 10, 3, 3)
  context.fillStyle = nearBlack
  context.fillRect(17, 11, 4, 5)
  context.fillRect(13, 17, 5, 3)
}

function drawBush(context) {
  const { ink, dark, mid, light } = PIXEL_PALETTE
  context.fillStyle = ink
  context.fillRect(2, 4, 14, 7)
  context.fillRect(4, 2, 10, 10)
  context.fillStyle = dark
  context.fillRect(3, 5, 12, 5)
  context.fillRect(5, 3, 8, 7)
  context.fillStyle = mid
  context.fillRect(5, 4, 4, 3)
  context.fillStyle = light
  context.fillRect(6, 4, 2, 2)
}

function drawRock(context) {
  const { ink, deep, dark, mid } = PIXEL_PALETTE
  context.fillStyle = ink
  context.fillRect(2, 3, 11, 7)
  context.fillRect(4, 1, 7, 9)
  context.fillStyle = deep
  context.fillRect(3, 4, 9, 5)
  context.fillRect(5, 2, 5, 6)
  context.fillStyle = dark
  context.fillRect(5, 3, 4, 3)
  context.fillStyle = mid
  context.fillRect(6, 3, 2, 1)
}

export function createPropTextures(scene) {
  const { canvas: tree0, context: tree0Context } = makeCanvas(24, 32)
  drawTree(tree0Context, 0)
  addCanvasTexture(scene, 'tree-0', tree0)

  const { canvas: tree1, context: tree1Context } = makeCanvas(24, 32)
  drawTree(tree1Context, 1)
  addCanvasTexture(scene, 'tree-1', tree1)

  const { canvas: bush, context: bushContext } = makeCanvas(18, 12)
  drawBush(bushContext)
  addCanvasTexture(scene, 'bush', bush)

  const { canvas: rock, context: rockContext } = makeCanvas(15, 11)
  drawRock(rockContext)
  addCanvasTexture(scene, 'rock', rock)

  const { canvas: flower, context: flowerContext } = makeCanvas(7, 8)
  flowerContext.fillStyle = PIXEL_PALETTE.deep
  flowerContext.fillRect(3, 3, 1, 5)
  flowerContext.fillStyle = PIXEL_PALETTE.paper
  flowerContext.fillRect(1, 1, 2, 2)
  flowerContext.fillRect(4, 1, 2, 2)
  flowerContext.fillRect(2, 0, 3, 4)
  flowerContext.fillStyle = PIXEL_PALETTE.ink
  flowerContext.fillRect(3, 1, 1, 1)
  addCanvasTexture(scene, 'flower', flower)

  const { canvas: stone, context: stoneContext } = makeCanvas(7, 5)
  stoneContext.fillStyle = PIXEL_PALETTE.deep
  stoneContext.fillRect(1, 1, 5, 4)
  stoneContext.fillStyle = PIXEL_PALETTE.mid
  stoneContext.fillRect(2, 0, 3, 2)
  addCanvasTexture(scene, 'stone', stone)

  const { canvas: bench, context: benchContext } = makeCanvas(18, 12)
  benchContext.fillStyle = PIXEL_PALETTE.ink
  benchContext.fillRect(1, 3, 16, 2)
  benchContext.fillRect(2, 7, 14, 3)
  benchContext.fillRect(3, 10, 2, 2)
  benchContext.fillRect(13, 10, 2, 2)
  benchContext.fillStyle = PIXEL_PALETTE.mid
  benchContext.fillRect(2, 4, 14, 1)
  benchContext.fillRect(3, 8, 12, 1)
  addCanvasTexture(scene, 'bench', bench)

  const { canvas: lamp, context: lampContext } = makeCanvas(9, 18)
  lampContext.fillStyle = PIXEL_PALETTE.ink
  lampContext.fillRect(4, 6, 2, 12)
  lampContext.fillRect(2, 17, 6, 1)
  lampContext.fillRect(1, 1, 8, 6)
  lampContext.fillStyle = PIXEL_PALETTE.paper
  lampContext.fillRect(3, 2, 4, 4)
  addCanvasTexture(scene, 'lamp', lamp)

  const { canvas: mailbox, context: mailboxContext } = makeCanvas(12, 16)
  mailboxContext.fillStyle = PIXEL_PALETTE.ink
  mailboxContext.fillRect(2, 2, 9, 7)
  mailboxContext.fillRect(5, 9, 2, 7)
  mailboxContext.fillStyle = PIXEL_PALETTE.light
  mailboxContext.fillRect(3, 3, 7, 5)
  mailboxContext.fillStyle = PIXEL_PALETTE.deep
  mailboxContext.fillRect(7, 4, 3, 2)
  addCanvasTexture(scene, 'mailbox', mailbox)

  const { canvas: fence, context: fenceContext } = makeCanvas(16, 12)
  fenceContext.fillStyle = PIXEL_PALETTE.ink
  fenceContext.fillRect(1, 2, 3, 10)
  fenceContext.fillRect(12, 2, 3, 10)
  fenceContext.fillRect(0, 5, 16, 2)
  fenceContext.fillRect(0, 9, 16, 2)
  fenceContext.fillStyle = PIXEL_PALETTE.mid
  fenceContext.fillRect(2, 3, 1, 4)
  fenceContext.fillRect(13, 3, 1, 4)
  addCanvasTexture(scene, 'fence', fence)
}

function drawPlayerFrame(context, frameX, frameY, direction, walkFrame) {
  const x = frameX * 16
  const y = frameY * 24
  const { ink, nearBlack, deep, dark, mid, light, paper } = PIXEL_PALETTE
  const bob = walkFrame === 2 ? 1 : 0
  const leftStep = walkFrame === 1
  const rightStep = walkFrame === 3

  // Hair/hat and oversized head.
  context.fillStyle = ink
  context.fillRect(x + 3, y + 2 + bob, 10, 9)
  context.fillRect(x + 2, y + 5 + bob, 12, 5)
  context.fillStyle = nearBlack
  context.fillRect(x + 4, y + 3 + bob, 8, 4)
  context.fillRect(x + 3, y + 5 + bob, 3, 5)

  if (direction !== 'up') {
    context.fillStyle = paper
    context.fillRect(x + 4, y + 6 + bob, 8, 6)
    if (direction === 'left') context.fillRect(x + 3, y + 7 + bob, 2, 4)
    if (direction === 'right') context.fillRect(x + 11, y + 7 + bob, 2, 4)
    context.fillStyle = ink
    if (direction === 'down') {
      context.fillRect(x + 5, y + 8 + bob, 1, 1)
      context.fillRect(x + 10, y + 8 + bob, 1, 1)
      context.fillRect(x + 7, y + 10 + bob, 2, 1)
    } else if (direction === 'left') {
      context.fillRect(x + 4, y + 8 + bob, 1, 1)
      context.fillRect(x + 4, y + 10 + bob, 2, 1)
    } else {
      context.fillRect(x + 11, y + 8 + bob, 1, 1)
      context.fillRect(x + 10, y + 10 + bob, 2, 1)
    }
  } else {
    context.fillStyle = deep
    context.fillRect(x + 4, y + 7 + bob, 8, 5)
  }

  // Compact jacket and opposite arm swing.
  context.fillStyle = ink
  context.fillRect(x + 4, y + 12 + bob, 8, 7)
  context.fillStyle = light
  context.fillRect(x + 5, y + 13 + bob, 6, 5)
  context.fillStyle = deep
  context.fillRect(x + (leftStep ? 2 : 3), y + 13 + bob, 2, leftStep ? 7 : 5)
  context.fillRect(x + (rightStep ? 12 : 11), y + 13 + bob, 2, rightStep ? 7 : 5)
  context.fillStyle = paper
  context.fillRect(x + (leftStep ? 2 : 3), y + (leftStep ? 19 : 18) + bob, 2, 2)
  context.fillRect(x + (rightStep ? 12 : 11), y + (rightStep ? 19 : 18) + bob, 2, 2)

  context.fillStyle = nearBlack
  context.fillRect(x + 5, y + 19 + bob, 3, leftStep ? 3 : 4)
  context.fillRect(x + 8, y + 19 + bob, 3, rightStep ? 3 : 4)
  if (leftStep) context.fillRect(x + 4, y + 22, 4, 2)
  else context.fillRect(x + 5, y + 22, 3, 2)
  if (rightStep) context.fillRect(x + 8, y + 22, 4, 2)
  else context.fillRect(x + 8, y + 22, 3, 2)

  context.fillStyle = mid
  context.fillRect(x + 7, y + 14 + bob, 2, 2)
}

export function createPlayerTexture(scene) {
  const { canvas, context } = makeCanvas(16 * 4, 24 * 4)
  const directions = ['down', 'left', 'right', 'up']
  directions.forEach((direction, row) => {
    for (let frame = 0; frame < 4; frame += 1) {
      drawPlayerFrame(context, frame, row, direction, frame)
    }
  })
  if (scene.textures.exists('player')) scene.textures.remove('player')
  scene.textures.addSpriteSheet('player', canvas, {
    frameWidth: 16,
    frameHeight: 24,
  })
}

function drawBuildingBase(context, roofColor, wallColor, width = 72) {
  const { ink, deep, light } = PIXEL_PALETTE
  const left = Math.round((72 - width) / 2)
  context.fillStyle = ink
  context.fillRect(left + 6, 18, width - 12, 42)
  context.fillRect(left + 2, 22, width - 4, 14)
  context.fillRect(left + 10, 12, width - 20, 8)
  context.fillStyle = roofColor
  context.fillRect(left + 8, 18, width - 16, 15)
  context.fillRect(left + 4, 23, width - 8, 9)
  context.fillRect(left + 12, 14, width - 24, 5)
  context.fillStyle = wallColor
  context.fillRect(left + 8, 34, width - 16, 24)
  context.fillStyle = light
  context.fillRect(left + 11, 36, width - 22, 3)
  context.fillStyle = deep
  context.fillRect(left + width / 2 - 6, 45, 12, 13)
  context.fillStyle = ink
  context.fillRect(left + width / 2 - 1, 48, 2, 2)
}

function drawBuildingDetails(context, poi) {
  const { ink, nearBlack, deep, dark, mid, light, paper } = PIXEL_PALETTE
  const type = poi.buildingType

  if (type === 'photo') {
    context.fillStyle = ink
    context.fillRect(13, 42, 13, 10)
    context.fillStyle = paper
    context.fillRect(16, 44, 7, 6)
    context.fillStyle = deep
    context.fillRect(18, 45, 3, 3)
    context.fillStyle = paper
    context.fillRect(11, 40, 5, 3)
  } else if (type === 'broadcast') {
    context.fillStyle = ink
    context.fillRect(16, 42, 13, 10)
    context.fillStyle = paper
    context.fillRect(18, 44, 9, 6)
    context.fillStyle = deep
    context.fillRect(21, 45, 3, 4)
    context.fillStyle = ink
    context.fillRect(57, 8, 2, 15)
    context.fillRect(53, 9, 10, 2)
    context.fillRect(55, 6, 6, 2)
  } else if (type === 'workshop') {
    context.fillStyle = ink
    context.fillRect(13, 41, 16, 11)
    context.fillStyle = nearBlack
    context.fillRect(15, 43, 12, 7)
    context.fillStyle = paper
    context.fillRect(17, 45, 4, 1)
    context.fillRect(22, 47, 3, 1)
    context.fillStyle = dark
    context.fillRect(59, 47, 8, 11)
    context.fillStyle = light
    context.fillRect(60, 48, 6, 2)
  } else if (type === 'office') {
    context.fillStyle = deep
    context.fillRect(12, 40, 12, 12)
    context.fillRect(48, 40, 12, 12)
    context.fillStyle = light
    context.fillRect(14, 42, 8, 8)
    context.fillRect(50, 42, 8, 8)
    context.fillStyle = ink
    context.fillRect(17, 42, 1, 8)
    context.fillRect(53, 42, 1, 8)
  } else if (type === 'lab') {
    context.fillStyle = nearBlack
    context.fillRect(10, 38, 52, 20)
    context.fillStyle = dark
    for (let x = 14; x < 60; x += 8) context.fillRect(x, 40, 3, 16)
    context.fillStyle = paper
    context.fillRect(16, 45, 40, 3)
    context.fillStyle = ink
    context.fillRect(59, 8, 4, 17)
    context.fillStyle = mid
    context.fillRect(57, 5, 8, 5)
  }

  context.fillStyle = paper
  context.fillRect(7, 28, 58, 10)
  context.fillStyle = ink
  context.fillRect(7, 28, 58, 1)
  context.fillRect(7, 37, 58, 1)
  context.fillRect(7, 28, 1, 10)
  context.fillRect(64, 28, 1, 10)
  const label = poi.label.replace('Instagram', 'Photo').replace('LinkedIn', 'Office')
  const textScale = label.length > 7 ? 1 : 2
  drawPixelText(context, label, 36, textScale === 2 ? 29 : 31, textScale, ink, 'center')
}

export function createBuildingTextures(scene, pois) {
  pois.forEach((poi) => {
    const { canvas, context } = makeCanvas(72, 64)
    const roofColors = {
      photo: PIXEL_PALETTE.mid,
      broadcast: PIXEL_PALETTE.nearBlack,
      workshop: PIXEL_PALETTE.deep,
      office: PIXEL_PALETTE.dark,
      lab: PIXEL_PALETTE.ink,
    }
    drawBuildingBase(context, roofColors[poi.buildingType], PIXEL_PALETTE.light)
    drawBuildingDetails(context, poi)
    addCanvasTexture(scene, `building-${poi.id}`, canvas)
  })
}

export function createMonumentTextures(scene) {
  const { canvas: plaque, context: plaqueContext } = makeCanvas(84, 58)
  const { ink, dark, light, paper } = PIXEL_PALETTE
  plaqueContext.fillStyle = ink
  plaqueContext.fillRect(7, 3, 70, 40)
  plaqueContext.fillRect(3, 8, 78, 29)
  plaqueContext.fillStyle = paper
  plaqueContext.fillRect(7, 8, 70, 29)
  drawPixelText(plaqueContext, 'D2D PLAZA', 42, 39, 1, ink, 'center')
  plaqueContext.fillStyle = dark
  plaqueContext.fillRect(17, 45, 6, 13)
  plaqueContext.fillRect(61, 45, 6, 13)
  plaqueContext.fillStyle = light
  plaqueContext.fillRect(9, 54, 66, 4)
  addCanvasTexture(scene, 'monument-plaque', plaque)

  const source = scene.textures.get('brand-logo').getSourceImage()
  const { canvas: tiny } = makeCanvas(32, 18)
  const tinyContext = tiny.getContext('2d')
  tinyContext.imageSmoothingEnabled = true
  tinyContext.drawImage(source, 0, 0, 32, 18)
  const pixels = tinyContext.getImageData(0, 0, 32, 18)
  for (let index = 0; index < pixels.data.length; index += 4) {
    const luminance =
      pixels.data[index] * 0.2126 +
      pixels.data[index + 1] * 0.7152 +
      pixels.data[index + 2] * 0.0722
    const opaque = pixels.data[index + 3] > 80 && luminance < 155
    pixels.data[index] = 21
    pixels.data[index + 1] = 21
    pixels.data[index + 2] = 20
    pixels.data[index + 3] = opaque ? 255 : 0
  }
  tinyContext.putImageData(pixels, 0, 0)
  const { canvas: logo, context: logoContext } = makeCanvas(64, 36)
  logoContext.imageSmoothingEnabled = false
  logoContext.drawImage(tiny, 0, 0, 32, 18, 0, 0, 64, 36)
  addCanvasTexture(scene, 'pixel-logo', logo)
}
