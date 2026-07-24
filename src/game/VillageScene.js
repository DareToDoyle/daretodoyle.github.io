import Phaser from 'phaser'
import { pois } from '../data/pois'
import {
  createCollisionData,
  createForestTreePositions,
  createGroundData,
  decorationData,
  MAP_HEIGHT,
  MAP_WIDTH,
  PLAYER_SPAWN,
  solidRocks,
  TILE,
  TILE_SIZE,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../data/villageData'
import {
  createBuildingTextures,
  createMonumentTextures,
  createPlayerTexture,
  createPropTextures,
  createTileTextures,
  createWorldGroundTexture,
  PIXEL_PALETTE,
} from './pixelAssets'

const PLAYER_SPEED = 58
const PLAYER_BODY_SIZE = 8

function tileCenter(tile) {
  return tile * TILE_SIZE + TILE_SIZE / 2
}

export function createVillageScene(callbacks) {
  return class VillageScene extends Phaser.Scene {
    constructor() {
      super('D2DVillage')
      this.callbacks = callbacks
      this.heldPointerId = null
      this.lastPoiId = null
      this.hasMoved = false
      this.facing = 'down'
      this.obstacles = null
    }

    preload() {
      this.load.image('brand-logo', `${callbacks.baseUrl}logo.png`)
    }

    create() {
      createTileTextures(this)
      createPropTextures(this)
      createPlayerTexture(this)
      createBuildingTextures(this, pois)
      createMonumentTextures(this)

      this.createTileMap()
      this.createVillage()
      this.createPlayer()
      this.createInput()
      this.createCamera()

      this.physics.add.collider(this.player, this.collisionLayer)
      this.physics.add.collider(this.player, this.obstacles)
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this)

      this.time.delayedCall(80, () => callbacks.onReady?.())
    }

    createTileMap() {
      const groundData = createGroundData()
      const collisionData = createCollisionData()
      createWorldGroundTexture(this, groundData, TILE_SIZE)
      this.groundLayer = this.add.image(0, 0, 'world-ground').setOrigin(0).setDepth(0)

      const collisionMap = this.make.tilemap({
        data: collisionData,
        tileWidth: TILE_SIZE,
        tileHeight: TILE_SIZE,
      })
      const collisionTiles = collisionMap.addTilesetImage(
        'village-tiles',
        'village-tiles',
        TILE_SIZE,
        TILE_SIZE,
      )
      this.collisionLayer = collisionMap.createLayer(0, collisionTiles, 0, 0)
      this.collisionLayer.setCollision([TILE.SOLID])
      this.collisionLayer.setVisible(false)

      this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
    }

    createVillage() {
      this.obstacles = this.physics.add.staticGroup()
      this.createForest()
      this.createBuildings()
      this.createMonument()
      this.createDecorations()
    }

    createForest() {
      createForestTreePositions().forEach(({ x, y, variant }) => {
        this.add
          .image(Math.round(x), Math.round(y + 16), `tree-${variant}`)
          .setOrigin(0.5, 1)
          .setDepth(Math.round(y + 16))
      })
    }

    addObstacle(x, y, width, height) {
      const zone = this.add.zone(Math.round(x), Math.round(y), width, height)
      this.physics.add.existing(zone, true)
      this.obstacles.add(zone)
      return zone
    }

    createBuildings() {
      pois.forEach((poi) => {
        const [x, y] = poi.buildingPosition
        this.add
          .image(Math.round(x), Math.round(y), `building-${poi.id}`)
          .setOrigin(0.5, 1)
          .setDepth(Math.round(y))
        this.addObstacle(x, y - 8, poi.id === 'lab' ? 62 : 54, 16)
      })
    }

    createMonument() {
      const x = tileCenter(56)
      const y = tileCenter(39)
      this.add.image(x, y, 'monument-plaque').setOrigin(0.5, 1).setDepth(y)
      this.add.image(x, y - 38, 'pixel-logo').setOrigin(0.5).setDepth(y + 1)
      this.addObstacle(x, y - 6, 68, 14)
    }

    createDecorations() {
      const addDecor = (key, entry, originY = 1) => {
        const x = tileCenter(entry[0])
        const y = tileCenter(entry[1])
        this.add.image(x, y, key).setOrigin(0.5, originY).setDepth(y)
      }

      decorationData.bushes.forEach((entry) => addDecor('bush', entry))
      decorationData.flowers.forEach((entry) => addDecor('flower', entry))
      decorationData.stones.forEach((entry) => addDecor('stone', entry))
      decorationData.benches.forEach((entry) => {
        const sprite = this.add
          .image(tileCenter(entry[0]), tileCenter(entry[1]), 'bench')
          .setOrigin(0.5, 1)
          .setDepth(tileCenter(entry[1]))
        if (entry[2]) sprite.setFlipX(true)
      })
      decorationData.lamps.forEach((entry) => addDecor('lamp', entry))
      decorationData.mailboxes.forEach((entry) => addDecor('mailbox', entry))

      decorationData.fences.forEach(([startX, y, length]) => {
        for (let offset = 0; offset < length; offset += 1) {
          addDecor('fence', [startX + offset, y])
        }
        this.addObstacle(
          tileCenter(startX + (length - 1) / 2),
          tileCenter(y) - 3,
          length * TILE_SIZE,
          6,
        )
      })

      solidRocks.forEach((entry) => {
        addDecor('rock', entry)
        this.addObstacle(tileCenter(entry[0]), tileCenter(entry[1]) - 3, 11, 8)
      })
    }

    createPlayer() {
      const animationRate = callbacks.reducedMotion ? 4 : 8
      const rows = { down: 0, left: 1, right: 2, up: 3 }
      Object.entries(rows).forEach(([direction, row]) => {
        const first = row * 4
        this.anims.create({
          key: `walk-${direction}`,
          frames: this.anims.generateFrameNumbers('player', {
            frames: [first + 1, first + 2, first + 3, first + 2],
          }),
          frameRate: animationRate,
          repeat: -1,
        })
      })

      this.player = this.physics.add.sprite(PLAYER_SPAWN.x, PLAYER_SPAWN.y, 'player', 0)
      this.player.setOrigin(0.5, 1)
      this.player.setDepth(Math.round(this.player.y))
      this.player.setCollideWorldBounds(true)
      this.player.body.setSize(PLAYER_BODY_SIZE, PLAYER_BODY_SIZE)
      this.player.body.setOffset(
        (16 - PLAYER_BODY_SIZE) / 2,
        24 - PLAYER_BODY_SIZE,
      )
    }

    createInput() {
      this.cursors = this.input.keyboard.createCursorKeys()
      this.keys = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
      })

      this.input.on('pointerdown', this.handlePointerDown, this)
      this.input.on('pointerup', this.releasePointer, this)
      this.input.on('pointerupoutside', this.releasePointer, this)

      this.releaseFromWindow = (event) => {
        if (this.heldPointerId === null || event.pointerId === this.heldPointerId) {
          this.heldPointerId = null
          if (this.player?.body) this.player.body.setVelocity(0, 0)
        }
      }
      this.clearInput = () => {
        this.heldPointerId = null
        if (this.player?.body) this.player.body.setVelocity(0, 0)
      }
      window.addEventListener('pointerup', this.releaseFromWindow)
      window.addEventListener('pointercancel', this.releaseFromWindow)
      window.addEventListener('blur', this.clearInput)
    }

    createCamera() {
      const camera = this.cameras.main
      camera.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
      camera.startFollow(this.player, true, 1, 1)
      camera.setRoundPixels(true)
      camera.roundPixels = true
      camera.setBackgroundColor(PIXEL_PALETTE.nearBlack)
    }

    handlePointerDown(pointer) {
      const event = pointer.event
      if (event?.pointerType === 'mouse' && event.button !== 0) return
      this.heldPointerId = event?.pointerId ?? pointer.id
      this.markMoved()
    }

    releasePointer(pointer) {
      const pointerId = pointer.event?.pointerId ?? pointer.id
      if (this.heldPointerId !== null && pointerId !== this.heldPointerId) return
      this.heldPointerId = null
      this.player.body.setVelocity(0, 0)
    }

    markMoved() {
      if (this.hasMoved) return
      this.hasMoved = true
      this.callbacks.onMove?.()
    }

    getKeyboardVector() {
      let x = 0
      let y = 0
      if (this.keys.left.isDown || this.cursors.left.isDown) x -= 1
      if (this.keys.right.isDown || this.cursors.right.isDown) x += 1
      if (this.keys.up.isDown || this.cursors.up.isDown) y -= 1
      if (this.keys.down.isDown || this.cursors.down.isDown) y += 1
      return { x, y }
    }

    getPointerVector() {
      if (this.heldPointerId === null) return { x: 0, y: 0 }
      const pointer = this.input.activePointer
      const worldPoint = pointer.positionToCamera(this.cameras.main)
      const x = worldPoint.x - this.player.x
      const y = worldPoint.y - (this.player.y - 8)
      if (x * x + y * y < 36) return { x: 0, y: 0 }
      return { x, y }
    }

    updateMovement() {
      let movement = this.getKeyboardVector()
      if (movement.x || movement.y) {
        this.markMoved()
      } else {
        movement = this.getPointerVector()
      }

      const length = Math.hypot(movement.x, movement.y)
      if (!length) {
        this.player.body.setVelocity(0, 0)
        this.player.anims.stop()
        const idleFrames = { down: 0, left: 4, right: 8, up: 12 }
        this.player.setFrame(idleFrames[this.facing])
        return
      }

      const velocityX = (movement.x / length) * PLAYER_SPEED
      const velocityY = (movement.y / length) * PLAYER_SPEED
      this.player.body.setVelocity(velocityX, velocityY)

      if (Math.abs(velocityX) > Math.abs(velocityY)) {
        this.facing = velocityX < 0 ? 'left' : 'right'
      } else {
        this.facing = velocityY < 0 ? 'up' : 'down'
      }
      this.player.anims.play(`walk-${this.facing}`, true)
    }

    updatePoi() {
      let nearest = null
      let nearestDistance = Infinity
      pois.forEach((poi) => {
        const distance = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          poi.position[0],
          poi.position[1],
        )
        if (distance < poi.interactionRadius && distance < nearestDistance) {
          nearest = poi
          nearestDistance = distance
        }
      })

      const nextId = nearest?.id ?? null
      if (nextId !== this.lastPoiId) {
        this.lastPoiId = nextId
        this.callbacks.onPoiChange?.(nearest)
      }
    }

    update() {
      this.updateMovement()
      this.player.setDepth(Math.round(this.player.y))
      this.updatePoi()
    }

    cleanup() {
      this.input.off('pointerdown', this.handlePointerDown, this)
      this.input.off('pointerup', this.releasePointer, this)
      this.input.off('pointerupoutside', this.releasePointer, this)
      window.removeEventListener('pointerup', this.releaseFromWindow)
      window.removeEventListener('pointercancel', this.releaseFromWindow)
      window.removeEventListener('blur', this.clearInput)
      this.callbacks.onPoiChange?.(null)
    }
  }
}
