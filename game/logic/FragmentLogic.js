/**
 * FragmentLogic — pure fragment collection helpers (no Phaser dependency)
 */

/**
 * Collects a fragment by adding its ID to state.collected.
 * Idempotent: if the fragment is already collected, this is a no-op.
 * Mutates state.collected in place.
 *
 * @param {{ collected: string[] }} state - Mutable fragment state object
 * @param {string} fragmentId - The ID of the fragment to collect
 */
export function collectFragment(state, fragmentId) {
  if (!state.collected.includes(fragmentId)) {
    state.collected.push(fragmentId)
  }
}

/**
 * Returns the subset of fragment definitions that have not yet been collected.
 *
 * @param {{ id: string }[]} definitions - All fragment definitions
 * @param {string[]} collectedIds - IDs of already-collected fragments
 * @returns {{ id: string }[]} Definitions whose IDs are not in collectedIds
 */
export function getSpawnableFragments(definitions, collectedIds) {
  return definitions.filter(def => !collectedIds.includes(def.id))
}
