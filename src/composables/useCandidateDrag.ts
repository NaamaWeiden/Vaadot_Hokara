import { reactive } from 'vue'
import type { Candidate } from '@/types/candidates'

// Holding the mouse this long without moving lifts the row
const LONG_PRESS_MS = 250
// Moving the mouse this far while pressed starts the drag right away
const MOVE_THRESHOLD_PX = 5

// Status drop zones are marked in CandidateGroup with data-drop-group="<group id>"
const DROP_GROUP_ATTR = 'data-drop-group'

interface DragState {
  candidate: Candidate | null
  fromGroupId: string | null
  // The group the candidate will move to on release - null over its own group or outside the table
  targetGroupId: string | null
  // Pointer position, and where inside the row it was grabbed (so the card does not jump)
  x: number
  y: number
  offsetX: number
  offsetY: number
  width: number
}

// Module-level state: shared by every row, group and the table, without passing props around
const state = reactive<DragState>({
  candidate: null,
  fromGroupId: null,
  targetGroupId: null,
  x: 0,
  y: 0,
  offsetX: 0,
  offsetY: 0,
  width: 0,
})

export interface PressHandlers {
  onClick: () => void
  onDrop: (toGroupId: string) => void
}

function findTargetGroup(x: number, y: number): string | null {
  const zone = document.elementFromPoint(x, y)?.closest<HTMLElement>(`[${DROP_GROUP_ATTR}]`)
  const groupId = zone?.getAttribute(DROP_GROUP_ATTR) ?? null
  return groupId && groupId !== state.fromGroupId ? groupId : null
}

function resetState() {
  state.candidate = null
  state.fromGroupId = null
  state.targetGroupId = null
  document.body.classList.remove('candidate-dragging')
}

// Called on pointerdown of a row. Decides between a quick click and a drag:
// release before the long-press delay and without moving -> click, otherwise -> drag.
function startPress(
  event: PointerEvent,
  candidate: Candidate,
  groupId: string,
  handlers: PressHandlers
) {
  if (event.button !== 0 || state.candidate) return

  const rowEl = event.currentTarget as HTMLElement
  const pointerId = event.pointerId
  const startX = event.clientX
  const startY = event.clientY
  let lastX = startX
  let lastY = startY
  let dragging = false

  const timer = window.setTimeout(beginDrag, LONG_PRESS_MS)

  function beginDrag() {
    window.clearTimeout(timer)
    dragging = true
    const rect = rowEl.getBoundingClientRect()
    state.candidate = candidate
    state.fromGroupId = groupId
    state.targetGroupId = null
    state.offsetX = startX - rect.left
    state.offsetY = startY - rect.top
    state.width = rect.width
    state.x = lastX
    state.y = lastY
    // Capturing keeps hover effects and tooltips of other rows quiet while dragging
    rowEl.setPointerCapture(pointerId)
    document.body.classList.add('candidate-dragging')
  }

  function onMove(e: PointerEvent) {
    lastX = e.clientX
    lastY = e.clientY
    if (!dragging) {
      if (Math.hypot(lastX - startX, lastY - startY) < MOVE_THRESHOLD_PX) return
      beginDrag()
    }
    state.x = lastX
    state.y = lastY
    state.targetGroupId = findTargetGroup(lastX, lastY)
  }

  function onUp() {
    removeListeners()
    if (!dragging) {
      handlers.onClick()
      return
    }
    const toGroupId = state.targetGroupId
    resetState()
    if (toGroupId) handlers.onDrop(toGroupId)
  }

  function onCancel() {
    removeListeners()
    if (dragging) resetState()
  }

  function removeListeners() {
    window.clearTimeout(timer)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onCancel)
    window.removeEventListener('blur', onCancel)
  }

  // Listening on window keeps the drag alive even when the cursor leaves the row
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onCancel)
  window.addEventListener('blur', onCancel)
}

export function useCandidateDrag() {
  return {
    drag: state,
    startPress,
  }
}
