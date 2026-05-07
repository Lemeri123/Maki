/**
 * MovementLogic — pure movement guard (no Phaser dependency)
 *
 * Determines whether the player is allowed to move based on the current
 * state of UI overlays.
 */

/**
 * Returns true only when all UI overlays are closed/falsy.
 *
 * @param {{ dialogueOpen: boolean, inventoryOpen: boolean, cutsceneActive: boolean }} overlayState
 * @returns {boolean}
 */
export function canMove(overlayState) {
  return !overlayState.dialogueOpen &&
         !overlayState.inventoryOpen &&
         !overlayState.cutsceneActive
}
