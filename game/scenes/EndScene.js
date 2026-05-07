import { Scene, manager } from '@tialops/maki'
import { transitionTo } from '../utils/SceneTransition.js'
import GameState from '../state/GameState.js'

const CUTSCENE_LINES = [
  'The fog begins to lift over Maplewood...',
  'One by one, the residents remember.',
  'Lia finds her journal. Mayor Bram remembers the town\'s name.',
  'Chef Rosa bakes the Maple Fog Cake for the first time in years.',
  'Old Pete watches the lake and smiles. "Lake Bellmere," he says softly.',
  'And Ash, the wandering archivist, writes it all down.',
  '"Every town has a story. This one just needed someone to find it."',
]

export default class EndScene extends Scene {
  constructor() {
    super('EndScene')
  }

  preload() {
    super.preload()
    manager.preload(this)
  }

  create() {
    super.create()
    manager.create(this)

    this._lineIndex = 0
    this._showingEnd = false

    const { width, height } = this.scale

    // Dark overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000)

    // Cutscene text
    this._cutsceneText = this.add.text(width / 2, height / 2, CUTSCENE_LINES[0], {
      fontSize: '18px', fill: '#ffffff', wordWrap: { width: 640 }, align: 'center'
    }).setOrigin(0.5)

    // Hint
    this._hintText = this.add.text(width / 2, height - 40, '[ Enter / Space ] Continue', {
      fontSize: '13px', fill: '#888888'
    }).setOrigin(0.5)

    // Input
    this._enterKey = this.input.keyboard.addKey('ENTER')
    this._spaceKey = this.input.keyboard.addKey('SPACE')
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this._enterKey) ||
        Phaser.Input.Keyboard.JustDown(this._spaceKey)) {
      this._advance()
    }
  }

  _advance() {
    if (this._showingEnd) {
      // Restart
      GameState.reset()
      transitionTo(this, 'MenuScene')
      return
    }

    this._lineIndex++

    if (this._lineIndex < CUTSCENE_LINES.length) {
      this._cutsceneText.setText(CUTSCENE_LINES[this._lineIndex])
    } else {
      this._showEnd()
    }
  }

  _showEnd() {
    this._showingEnd = true
    const { width, height } = this.scale

    this._cutsceneText.destroy()
    this._hintText.destroy()

    this.add.text(width / 2, height / 2 - 40, 'Maplewood remembers.', {
      fontSize: '28px', fill: '#ffdd88', fontStyle: 'bold'
    }).setOrigin(0.5)

    this.add.text(width / 2, height / 2 + 10, 'Thanks for playing.', {
      fontSize: '20px', fill: '#aabbdd'
    }).setOrigin(0.5)

    this.add.text(width / 2, height / 2 + 70, '[ Enter / Space ] Play Again', {
      fontSize: '14px', fill: '#ffffff'
    }).setOrigin(0.5)
  }
}
