import Phaser from 'phaser'
import MenuScene from './scenes/MenuScene.js'
import TownScene from './scenes/TownScene.js'
import LibraryScene from './scenes/LibraryScene.js'
import CafeScene from './scenes/CafeScene.js'
import EndScene from './scenes/EndScene.js'

new Phaser.Game({
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: [MenuScene, TownScene, LibraryScene, CafeScene, EndScene]
})
