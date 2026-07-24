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
  createPoiSignTextures,
  createPropTextures,
  createTileTextures,
  createWorldGroundTexture,
  PIXEL_PALETTE,
} from './pixelAssets'

const PLAYER_SPEED = 60
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
      createPoiSignTextures(this, pois)
      createMonumentTextures(this)

      this.createTileMap()
      this.createVillage()
      this.createPlayer()
      this.createInput()
      this.createCamera()

      this.physics.add.collider(this.playerBody, this.collisionLayer)
      this.physics.add.collider(this.playerBody, this.obstacles)
      this.events.on(Phaser.Scenes.Events.POST_UPDATE, this.syncVisual, this)
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
        const [x, y] = poi.position
        this.add
          .image(Math.round(x), Math.round(y), `building-${poi.id}`)
          .setOrigin(0.5, 1)
          .setDepth(Math.round(y))
        const [signX, signY] = poi.signOffset
        this.add
          .image(Math.round(x + signX), Math.round(y + signY), `sign-${poi.id}`)
          .setOrigin(0.5, 1)
          .setDepth(Math.round(y + signY + 1))
        this.addObstacle(x, y - 11, poi.id === 'lab' ? 82 : 76, 22)

        if (this.callbacks.debug) {
          this.add
            .circle(poi.interactionPoint[0], poi.interactionPoint[1], poi.interactionRadius)
            .setStrokeStyle(1, 0xffffff, 0.8)
            .setFillStyle(0xffffff, 0.08)
            .setDepth(9999)
          this.add
            .rectangle(poi.interactionPoint[0], poi.interactionPoint[1], 3, 3, 0xffffff)
            .setDepth(10000)
          this.add
            .rectangle(x, y, 3, 3, 0x151514)
            .setDepth(10000)
        }
      })
    }

    createMonument() {
      const x = tileCenter(39)
      const y = tileCenter(29)
      this.add.image(x, y, 'monument-plaque').setOrigin(0.5, 1).setDepth(y)
      this.add.image(x, y - 45, 'pixel-logo').setOrigin(0.5).setDepth(y + 1)
      this.addObstacle(x, y - 6, 68, 14)
    }

    createDecorations() {
      const addDecor = (key, entry, originY = 1) => {
        const x = tileCenter(entry[0])
        const y = tileCenter(entry[1])
        this.add.image(x, y, key).setOrigin(0.5, originY).setDepth(y)
      }

      decorationData.bushes.forEach((entry) => addDecor(`bush-${entry[2] ?? 0}`, entry))
      decorationData.flowers.forEach((entry) => addDecor('flower', entry))
      decorationData.weeds.forEach((entry) => addDecor('weed', entry))
      decorationData.stones.forEach((entry) => addDecor('stone', entry))
      decorationData.mushrooms.forEach((entry) => addDecor('mushroom', entry))
      decorationData.benches.forEach((entry) => {
        const sprite = this.add
          .image(tileCenter(entry[0]), tileCenter(entry[1]), 'bench')
          .setOrigin(0.5, 1)
          .setDepth(tileCenter(entry[1]))
        if (entry[2]) sprite.setFlipX(true)
      })
      decorationData.lamps.forEach((entry) => addDecor('lamp', entry))
      decorationData.mailboxes.forEach((entry) => addDecor('mailbox', entry))
      decorationData.props.forEach(([key, x, y]) => addDecor(key, [x, y]))

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

      this.playerBody = this.physics.add.sprite(PLAYER_SPAWN.x, PLAYER_SPAWN.y, 'player', 0)
      this.playerBody.setOrigin(0.5, 1)
      this.playerBody.setVisible(false)
      this.playerBody.setCollideWorldBounds(true)
      this.playerBody.body.setSize(PLAYER_BODY_SIZE, PLAYER_BODY_SIZE)
      this.playerBody.body.setOffset(
        (20 - PLAYER_BODY_SIZE) / 2,
        28 - PLAYER_BODY_SIZE,
      )
      this.player = this.add.sprite(PLAYER_SPAWN.x, PLAYER_SPAWN.y, 'player', 0)
      this.player.setOrigin(0.5, 1)
      this.player.setDepth(Math.round(this.player.y))
      this.cameraAnchor = this.add.zone(PLAYER_SPAWN.x, PLAYER_SPAWN.y, 1, 1)
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
          if (this.playerBody?.body) this.playerBody.body.setVelocity(0, 0)
        }
      }
      this.clearInput = () => {
        this.heldPointerId = null
        if (this.playerBody?.body) this.playerBody.body.setVelocity(0, 0)
      }
      window.addEventListener('pointerup', this.releaseFromWindow)
      window.addEventListener('pointercancel', this.releaseFromWindow)
      window.addEventListener('blur', this.clearInput)
    }

    createCamera() {
      const camera = this.cameras.main
      camera.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
      camera.startFollow(this.cameraAnchor, true, 1, 1)
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
      this.playerBody.body.setVelocity(0, 0)
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
      const x = worldPoint.x - this.playerBody.x
      const y = worldPoint.y - (this.playerBody.y - 8)
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
        this.playerBody.body.setVelocity(0, 0)
        this.player.anims.stop()
        const idleFrames = { down: 0, left: 4, right: 8, up: 12 }
        this.player.setFrame(idleFrames[this.facing])
        return
      }

      const velocityX = (movement.x / length) * PLAYER_SPEED
      const velocityY = (movement.y / length) * PLAYER_SPEED
      this.playerBody.body.setVelocity(velocityX, velocityY)

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
          this.playerBody.x,
          this.playerBody.y,
          poi.interactionPoint[0],
          poi.interactionPoint[1],
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
      this.updatePoi()
    }

    syncVisual() {
      const renderX = Math.round(this.playerBody.x)
      const renderY = Math.round(this.playerBody.y)
      this.player.setPosition(renderX, renderY)
      this.player.setDepth(renderY)
      this.cameraAnchor.setPosition(renderX, renderY)
    }

    cleanup() {
      this.input.off('pointerdown', this.handlePointerDown, this)
      this.input.off('pointerup', this.releasePointer, this)
      this.input.off('pointerupoutside', this.releasePointer, this)
      this.events.off(Phaser.Scenes.Events.POST_UPDATE, this.syncVisual, this)
      window.removeEventListener('pointerup', this.releaseFromWindow)
      window.removeEventListener('pointercancel', this.releaseFromWindow)
      window.removeEventListener('blur', this.clearInput)
      this.callbacks.onPoiChange?.(null)
    }
  }
}
