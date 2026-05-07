/**
 * FogLogic — pure fog alpha computation (no Phaser dependency)
 *
 * The fog thins when the player has collected more than half the total fragments.
 */

/**
 * Computes the fog overlay alpha based on how many fragments have been collected.
 *
 * Returns initialAlpha when collected <= total / 2.
 * Returns initialAlpha * 0.5 when collected > total / 2.
 *
 * @param {number} collected - Number of fragments collected so far
 * @param {number} total - Total number of fragments in the game
 * @param {number} initialAlpha - The starting alpha value for the fog
 * @returns {number} The computed fog alpha
 */
export function computeFogAlpha(collected, total, initialAlpha) {
  if (collected > total / 2) {
    return initialAlpha * 0.5
  }
  return initialAlpha
}
