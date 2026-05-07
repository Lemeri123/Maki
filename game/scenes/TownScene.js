import { Scene, manager } from '@tialops/maki'
import { transitionTo } from '../utils/SceneTransition.js'
import { canMove } from '../logic/MovementLogic.js'
import { DialogueSystem } from '../systems/DialogueSystem.js'
import { FragmentSystem } from '../systems/FragmentSystem.js'
import { QuestSystem } from '../systems/QuestSystem.js'
import { HUD } from '../ui/HUD.js'
import { FogOverlay } from '../ui/FogOverlay.js'
import GameState from '../state/GameState.js'
import npcs from '../data/npcs.js'
import fragments from '../data/fragments.js'

// Building entrance trigger zones
const TRIGGER_ZONES = [
  { id: 'library_entrance', x: 192, y: 192, w: 32, h: 32, targetScene: 'LibraryScene', returnPos: { x: 192, y: 208 } },
  { id: 'cafe_entrance',    x: 576, y: 352, w: 32, h: 32, targetScene: 'CafeScene',    returnPos: { x: 576, y: 368 } },
]

const TILE_SIZE = 16

export default class TownScene extends Scene {
  constructor() {
    super('TownScene')
  }

  preload() {
    this._makiPlayers = []
    super.preload()
    this.ash = this.maki.player('ash')
    manager.map(this, 'town_map')
    manager.preload(this)
    // Load lia spritesheet for NPC rendering (frameWidth/Height from Maki config)
    if (!this.textures.exists('npc')) {
      this.load.spritesheet('npc', 'sprites/lia.png', { frameWidth: 32, frameHeight: 64 })
    }
  }

  create() {
    super.create()
    manager.create(this)

    // Restore return position if coming back from an interior
    const data = this.scene.settings.data ?? {}
    const startX = data.returnPos?.x ?? 5 * TILE_SIZE
    const startY = data.returnPos?.y ?? 5 * TILE_SIZE
    this.ash.sprite.setPosition(startX, startY)

    // Collision
    this.physics.add.collider(this.ash.sprite, manager.getWallGroup(this, 'town_map'))

    // Camera
    const mapW = 50 * TILE_SIZE
    const mapH = 50 * TILE_SIZE
    this.cameras.main.setBounds(0, 0, mapW, mapH)
    this.cameras.main.startFollow(this.ash.sprite, true, 0.1, 0.1)

    // Systems
    this._dialogue = new DialogueSystem(this)
    this._fragments = new FragmentSystem(this, this.ash.sprite)
    this._quests = new QuestSystem()
    this._hud = new HUD(this)
    this._fog = new FogOverlay(this, mapW, mapH)

    // Each NPC gets a distinct tint so they look different despite sharing one spritesheet
    const NPC_TINTS = {
      lia:   0xaaddff,  // Lia — cool blue (librarian)
      mayor: 0xffdd88,  // Mayor Bram — gold (official)
      chef:  0xff9966,  // Chef Rosa — warm orange (café)
      pete:  0x99ff99,  // Old Pete — mossy green (fisherman)
    }

    // Spawn NPCs using the lia spritesheet loaded as 'npc'
    this._npcSprites = []
    for (const npc of npcs) {
      const px = npc.tileX * TILE_SIZE
      const py = npc.tileY * TILE_SIZE
      // Frame 18 = first frame of down-facing animation (idle pose)
      const sprite = this.add.sprite(px, py, 'npc', 18)
        .setDepth(10)
        .setTint(NPC_TINTS[npc.id] ?? 0xffffff)
      // Name label above the sprite
      this.add.text(px, py - 36, npc.name, {
        fontSize: '9px', fill: '#ffffff', backgroundColor: '#00000088', padding: { x: 2, y: 1 }
      }).setOrigin(0.5, 1).setDepth(11)
      this._npcSprites.push({ npc, sprite })
    }

    // Spawn fragments
    this._fragments.spawnFragments(fragments)

    // Interaction prompt — world-space, positioned above nearby NPC each frame
    this._promptText = this.add.text(0, 0, '[E] Talk', {
      fontSize: '11px', fill: '#ffff88', backgroundColor: '#000000aa', padding: { x: 4, y: 2 }
    }).setOrigin(0.5, 1).setDepth(150).setVisible(false)

    // E key for dialogue
    this._eKey = this.input.keyboard.addKey('E')

    // I key for inventory
    this._iKey = this.input.keyboard.addKey('I')
    this._escKey = this.input.keyboard.addKey('ESC')

    // Overlay state
    this._overlayState = { dialogueOpen: false, inventoryOpen: false, cutsceneActive: false }

    // Listen for dialogue closed
    this.events.on('dialogue-closed', () => {
      this._overlayState.dialogueOpen = false
      // Handle pending quest offer
      if (this._dialogue.hasPendingQuestOffer()) {
        const questId = this._dialogue.getPendingQuestOfferId()
        if (questId) this._quests.accept(questId)
      }
    })

    // Update GameState location
    GameState.currentLocation = 'town'

    // Trigger zones as invisible rectangles
    this._triggerZones = TRIGGER_ZONES.map(zone => {
      const rect = this.add.rectangle(zone.x, zone.y, zone.w, zone.h, 0x00ff00, 0)
      this.physics.add.existing(rect, true)
      return { ...zone, rect }
    })
  }

  update() {
    const collected = GameState.fragments.collected.length

    // Movement guard
    this._overlayState.dialogueOpen = this._dialogue.isOpen()
    this._overlayState.inventoryOpen = this._hud.isInventoryOpen()

    if (canMove(this._overlayState)) {
      this.maki.move(this.ash)
    }

    // HUD update
    this._hud.update(GameState)

    // Fog update
    this._fog.updateForFragments(collected, GameState.fragments.total)

    // Quest completion checks
    this._quests.checkAllCompletions()

    // NPC proximity prompt
    this._updateNpcPrompt()

    // E key: open/advance dialogue
    if (Phaser.Input.Keyboard.JustDown(this._eKey)) {
      if (this._dialogue.isOpen()) {
        this._dialogue.advance()
      } else if (this._nearbyNpc) {
        this._dialogue.show(this._nearbyNpc)
        this._overlayState.dialogueOpen = true
      }
    }

    // I key: toggle inventory
    if (Phaser.Input.Keyboard.JustDown(this._iKey) ||
        (Phaser.Input.Keyboard.JustDown(this._escKey) && this._hud.isInventoryOpen())) {
      if (this._hud.isInventoryOpen()) {
        this._hud.closeInventory()
      } else if (!this._dialogue.isOpen()) {
        this._hud.openInventory()
      }
    }

    // Building entrance trigger zones
    if (canMove(this._overlayState)) {
      for (const zone of this._triggerZones) {
        const ashBounds = this.ash.sprite.getBounds()
        const zoneBounds = zone.rect.getBounds()
        if (Phaser.Geom.Rectangle.Overlaps(ashBounds, zoneBounds)) {
          GameState.townReturnPos = zone.returnPos
          transitionTo(this, zone.targetScene)
          break
        }
      }
    }

    // Win condition: all fragments collected
    if (collected >= GameState.fragments.total) {
      transitionTo(this, 'EndScene')
    }
  }

  _updateNpcPrompt() {
    const ashX = this.ash.sprite.x
    const ashY = this.ash.sprite.y
    this._nearbyNpc = null

    for (const { npc } of this._npcSprites) {
      const dx = ashX - npc.tileX * TILE_SIZE
      const dy = ashY - npc.tileY * TILE_SIZE
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 40) {
        this._nearbyNpc = npc
        break
      }
    }

    if (this._nearbyNpc && !this._dialogue.isOpen()) {
      // Position prompt above the NPC in world space
      this._promptText.setPosition(
        this._nearbyNpc.tileX * TILE_SIZE,
        this._nearbyNpc.tileY * TILE_SIZE - 22
      )
      this._promptText.setVisible(true)
    } else {
      this._promptText.setVisible(false)
    }
  }
}
