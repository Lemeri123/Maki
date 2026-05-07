import { Scene, manager } from '@tialops/maki'
import { transitionTo } from '../utils/SceneTransition.js'
import { canMove } from '../logic/MovementLogic.js'
import { DialogueSystem } from '../systems/DialogueSystem.js'
import { FragmentSystem } from '../systems/FragmentSystem.js'
import { HUD } from '../ui/HUD.js'
import GameState from '../state/GameState.js'
import fragments from '../data/fragments.js'

const CAFE_FRAGMENTS = fragments.filter(f => f.id === 'fragment_recipe')
const EXIT_ZONE = { x: 160, y: 224, w: 48, h: 16 }
const TILE_SIZE = 16

export default class CafeScene extends Scene {
  constructor() {
    super('CafeScene')
  }

  preload() {
    this._makiPlayers = []
    super.preload()
    this.ash = this.maki.player('ash')
    manager.map(this, 'cafe_map')
    manager.preload(this)
  }

  create() {
    super.create()
    manager.create(this)

    GameState.currentLocation = 'cafe'

    this.ash.sprite.setPosition(160, 32)

    this.physics.add.collider(this.ash.sprite, manager.getWallGroup(this, 'cafe_map'))

    this.cameras.main.setBounds(0, 0, 20 * TILE_SIZE, 15 * TILE_SIZE)
    this.cameras.main.startFollow(this.ash.sprite, true, 0.1, 0.1)

    this._dialogue = new DialogueSystem(this)
    this._fragments = new FragmentSystem(this, this.ash.sprite)
    this._hud = new HUD(this)

    this._fragments.spawnFragments(CAFE_FRAGMENTS)

    this.add.text(10, 10, 'The Foggy Cup Café', {
      fontSize: '12px', fill: '#aabbdd', backgroundColor: '#00000088', padding: { x: 4, y: 2 }
    }).setScrollFactor(0).setDepth(200)

    this._exitRect = this.add.rectangle(EXIT_ZONE.x, EXIT_ZONE.y, EXIT_ZONE.w, EXIT_ZONE.h, 0x00ff00, 0)
    this.physics.add.existing(this._exitRect, true)

    this._overlayState = { dialogueOpen: false, inventoryOpen: false, cutsceneActive: false }
  }

  update() {
    this._overlayState.dialogueOpen = this._dialogue.isOpen()
    this._overlayState.inventoryOpen = this._hud.isInventoryOpen()

    if (canMove(this._overlayState)) {
      this.maki.move(this.ash)
    }

    this._hud.update(GameState)

    if (canMove(this._overlayState)) {
      const ashBounds = this.ash.sprite.getBounds()
      const exitBounds = this._exitRect.getBounds()
      if (Phaser.Geom.Rectangle.Overlaps(ashBounds, exitBounds)) {
        GameState.currentLocation = 'town'
        transitionTo(this, 'TownScene', { returnPos: GameState.townReturnPos })
      }
    }
  }
}
