import { ChevronUp } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import {
  createVelocityTracker,
  isSettled,
  projectMomentum,
  rubberband,
  stepSpring,
  type SpringConfig,
} from './spring'

type Detent = 'peek' | 'expanded'

// Critically damped by default; Apple's drawer bounce (0.8) only when a flick carried momentum.
const SETTLE: SpringConfig = { dampingRatio: 1, response: 0.3 }
const FLICK: SpringConfig = { dampingRatio: 0.8, response: 0.3 }
// Above this release speed (px/s) the direction of the flick decides the detent.
const FLICK_SPEED = 400
// A press that moves less than this is a tap, not a drag.
const DRAG_SLOP = 10

type BottomSheetProps = {
  // Accessible name of the sheet.
  label: string
  // The row that stays visible while collapsed; it is also the toggle button, so no links in it.
  peek: ReactNode
  children: ReactNode
}

// A sheet that peeks from the bottom of the screen. Drag or flick it, tap the peek row, or grab it
// mid-flight: motion always starts from where the sheet is on screen and keeps the finger's speed.
export function BottomSheet({ label, peek, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLButtonElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const chevronRef = useRef<SVGSVGElement>(null)
  const controls = useRef<{ toggle: () => void; collapse: () => void }>(null)
  const [detent, setDetent] = useState<Detent>('peek')
  const [peekHeight, setPeekHeight] = useState(0)

  useEffect(() => {
    const sheet = sheetRef.current
    const header = headerRef.current
    const body = bodyRef.current
    const chevron = chevronRef.current
    if (!sheet || !header || !body || !chevron) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const tracker = createVelocityTracker()
    // Motion state changes every frame, so it lives here and is written straight to the DOM.
    let y = sheet.offsetHeight // translateY in px: 0 = expanded, peekY = only the header shows
    let velocity = 0
    let peekY = 0
    let current: Detent = 'peek'
    let config = SETTLE
    let frame = 0
    let lastTime = 0
    let suppressClick = false
    let gesture: {
      pointerId: number
      startClientY: number
      startY: number
      dragging: boolean
      caught: boolean
    } | null = null

    const detentY = (d: Detent) => (d === 'expanded' ? 0 : peekY)

    // The body fades in and the chevron turns as the sheet rises, hinting where the drag leads.
    const render = () => {
      sheet.style.transform = `translate3d(0, ${y}px, 0)`
      const progress = peekY > 0 ? Math.min(Math.max(1 - y / peekY, 0), 1) : 0
      body.style.opacity = String(progress)
      chevron.style.transform = `rotate(${progress * 180}deg)`
    }

    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
    }

    const tick = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.064)
      lastTime = time
      const target = detentY(current)
      const next = stepSpring({ value: y, velocity }, target, config, dt)
      if (isSettled(next, target)) {
        y = target
        velocity = 0
        frame = 0
      } else {
        y = next.value
        velocity = next.velocity
        frame = requestAnimationFrame(tick)
      }
      render()
    }

    // Retargets from the current on-screen position and velocity, so a new target mid-flight
    // bends the motion instead of restarting it.
    const animateTo = (next: Detent, nextConfig: SpringConfig) => {
      current = next
      config = nextConfig
      setDetent(next)
      if (reducedMotion.matches) {
        stop()
        y = detentY(next)
        velocity = 0
        render()
        sheet.animate([{ opacity: 0.6 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' })
        return
      }
      if (!frame) {
        lastTime = performance.now()
        frame = requestAnimationFrame(tick)
      }
    }

    // Lands where the release velocity would carry the sheet, not where the finger let go.
    const release = (releaseVelocity: number) => {
      velocity = releaseVelocity
      const flick = Math.abs(releaseVelocity) > FLICK_SPEED
      const projected = y + projectMomentum(releaseVelocity)
      const next: Detent = flick
        ? releaseVelocity < 0
          ? 'expanded'
          : 'peek'
        : projected < peekY / 2
          ? 'expanded'
          : 'peek'
      animateTo(next, flick ? FLICK : SETTLE)
    }

    const bounded = (raw: number) => {
      const size = sheet.offsetHeight
      if (raw < 0) return -rubberband(-raw, size)
      if (raw > peekY) return peekY + rubberband(raw - peekY, size)
      return raw
    }

    const onPointerDown = (e: PointerEvent) => {
      if (!e.isPrimary || e.button !== 0) return
      // Long content scrolls instead of dragging the sheet.
      if (body.contains(e.target as Node) && body.scrollHeight > body.clientHeight) return
      suppressClick = false
      const caught = frame !== 0
      // Respond on press: a moving sheet freezes under the finger at its on-screen position.
      stop()
      gesture = { pointerId: e.pointerId, startClientY: e.clientY, startY: y, dragging: false, caught }
      tracker.reset()
      tracker.add(y, e.timeStamp)
      sheet.dataset.pressed = 'true'
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!gesture || e.pointerId !== gesture.pointerId) return
      if (!gesture.dragging) {
        // A sheet caught mid-flight is already being dragged; one at rest waits out the slop.
        if (!gesture.caught && Math.abs(e.clientY - gesture.startClientY) < DRAG_SLOP) return
        gesture.dragging = true
        // Track from here, so the sheet does not jump by the slop distance.
        gesture.startClientY = e.clientY
        gesture.startY = y
        // Capture only once dragging, so a plain tap still clicks the link under it.
        sheet.setPointerCapture(e.pointerId)
      }
      y = bounded(gesture.startY + e.clientY - gesture.startClientY)
      tracker.add(y, e.timeStamp)
      render()
    }

    const onPointerEnd = (e: PointerEvent) => {
      if (!gesture || e.pointerId !== gesture.pointerId) return
      const { dragging, caught } = gesture
      gesture = null
      delete sheet.dataset.pressed
      if (dragging || caught) {
        // The press was a grab, not a tap: no click on whatever is under the finger.
        suppressClick = true
        release(e.type === 'pointercancel' ? 0 : tracker.velocity(e.timeStamp))
      }
    }

    const onClickCapture = (e: MouseEvent) => {
      if (!suppressClick) return
      suppressClick = false
      e.preventDefault()
      e.stopPropagation()
    }

    // Keeps the detents right when the content or the window changes size.
    const measure = () => {
      peekY = sheet.offsetHeight - header.offsetHeight
      setPeekHeight(header.offsetHeight)
      body.style.touchAction = body.scrollHeight > body.clientHeight ? 'pan-y' : 'none'
      if (!frame && !gesture) {
        y = detentY(current)
        render()
      }
    }

    controls.current = {
      toggle: () => animateTo(current === 'expanded' ? 'peek' : 'expanded', SETTLE),
      collapse: () => animateTo('peek', SETTLE),
    }

    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(sheet)
    resizeObserver.observe(header)
    sheet.addEventListener('pointerdown', onPointerDown)
    sheet.addEventListener('pointermove', onPointerMove)
    sheet.addEventListener('pointerup', onPointerEnd)
    sheet.addEventListener('pointercancel', onPointerEnd)
    sheet.addEventListener('click', onClickCapture, true)

    // Enter from below, the same way it would leave.
    peekY = sheet.offsetHeight - header.offsetHeight
    setPeekHeight(header.offsetHeight)
    render()
    animateTo('peek', SETTLE)

    return () => {
      stop()
      resizeObserver.disconnect()
      sheet.removeEventListener('pointerdown', onPointerDown)
      sheet.removeEventListener('pointermove', onPointerMove)
      sheet.removeEventListener('pointerup', onPointerEnd)
      sheet.removeEventListener('pointercancel', onPointerEnd)
      sheet.removeEventListener('click', onClickCapture, true)
      controls.current = null
    }
  }, [])

  return (
    <>
      {/* Keeps the end of the page reachable above the collapsed sheet. */}
      <div aria-hidden style={{ height: peekHeight }} />
      <div
        ref={sheetRef}
        role="region"
        aria-label={label}
        onKeyDown={(e) => {
          if (e.key !== 'Escape' || detent !== 'expanded') return
          controls.current?.collapse()
          headerRef.current?.focus()
        }}
        style={{ transform: 'translateY(100%)' }}
        className="glass group fixed inset-x-0 bottom-(--tab-bar-space) z-40 mx-auto flex max-h-[calc(85dvh-var(--tab-bar-space))] w-full max-w-lg touch-none flex-col rounded-t-2xl border-t border-border/60 shadow-sheet select-none will-change-transform contrast-more:border-foreground md:border-x"
      >
        <button
          ref={headerRef}
          type="button"
          aria-expanded={detent === 'expanded'}
          onClick={() => controls.current?.toggle()}
          className="flex w-full shrink-0 cursor-grab flex-col gap-2 rounded-t-2xl px-4 pt-2 pb-4 text-left outline-none group-data-pressed:cursor-grabbing focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-inset"
        >
          <span
            aria-hidden
            className="mx-auto h-1 w-9 rounded-full bg-muted-foreground/40 transition-[width,background-color] duration-100 group-data-pressed:w-12 group-data-pressed:bg-muted-foreground"
          />
          <span className="flex items-center gap-4">
            <span className="min-w-0 flex-1">{peek}</span>
            <ChevronUp ref={chevronRef} aria-hidden className="size-4 shrink-0 text-muted-foreground" />
          </span>
        </button>
        <div
          ref={bodyRef}
          inert={detent === 'peek'}
          className="min-h-0 flex-1 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          {children}
        </div>
        {/* Fills the gap under the sheet when it is pulled past the top; on phones it also runs on
            behind the floating tab bar, which sits above the sheet. */}
        <div aria-hidden className="glass absolute inset-x-0 top-full h-dvh md:border-x" />
      </div>
    </>
  )
}
