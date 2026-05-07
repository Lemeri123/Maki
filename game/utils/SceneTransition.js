/**
 * SceneTransition — fade-to-black transition utility
 *
 * isTransitioning guard prevents duplicate calls while a transition is in progress.
 */

let isTransitioning = false

/**
 * Fades the current scene to black, then starts the target scene.
 *
 * @param {Phaser.Scene} fromScene - The scene initiating the transition
 * @param {string} targetSceneKey - The key of the scene to start
 * @param {object} [data={}] - Optional data to pass to the target scene
 */
export function transitionTo(fromScene, targetSceneKey, data = {}) {
  if (isTransitioning) return
  isTransitioning = true
  fromScene.cameras.main.fadeOut(300, 0, 0, 0)
  fromScene.cameras.main.once('camerafadeoutcomplete', () => {
    isTransitioning = false
    fromScene.scene.start(targetSceneKey, data)
  })
}
