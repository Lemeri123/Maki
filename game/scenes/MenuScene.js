import { Scene, manager } from '@tialops/maki'
import { transitionTo } from '../utils/SceneTransition.js'

export default class MenuScene extends Scene {
  constructor() {
    super('MenuScene')
  }

  preload() {
    super.preload()
    manager.preload(this)
    // Handle asset load errors
    this.load.on('loaderror', () => {
      this._showError()
    })
  }

  create() {
    super.create()
    manager.create(this)

    const { width, height } = this.scale

    // Dark background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a)

    // Title
    this.add.text(width / 2, height / 2 - 80, 'Pixel Pals', {
      fontSize: '48px', fill: '#ffdd88', fontStyle: 'bold'
    }).setOrigin(0.5)

    this.add.text(width / 2, height / 2 - 30, 'The Town That Forgot Its Story', {
      fontSize: '20px', fill: '#aabbdd'
    }).setOrigin(0.5)

    // Start prompt (interactive)
    const startText = this.add.text(width / 2, height / 2 + 60, '[ Press Enter or Click to Start ]', {
      fontSize: '16px', fill: '#ffffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    // Blink animation
    this.tweens.add({
      targets: startText,
      alpha: 0,
      duration: 700,
      yoyo: true,
      repeat: -1
    })

    // Keyboard
    this.input.keyboard.on('keydown-ENTER', () => transitionTo(this, 'TownScene'))

    // Click
    startText.on('pointerdown', () => transitionTo(this, 'TownScene'))

    // Subtitle
    this.add.text(width / 2, height - 30, 'Maki Hackathon 2026', {
      fontSize: '12px', fill: '#556677'
    }).setOrigin(0.5)
  }

  update() {}

  _showError() {
    this.add.text(400, 300, 'Error loading assets.\nPlease refresh the page.', {
      fontSize: '18px', fill: '#ff4444', align: 'center'
    }).setOrigin(0.5)
  }
}
