// Physics for gesture-driven motion, after Apple's "Designing Fluid Interfaces" (WWDC 2018).
// A spring has no duration: it is described by its damping ratio (1 = settles without overshoot,
// lower = bouncier) and its response (roughly how many seconds it takes to reach the target).
export type SpringConfig = { dampingRatio: number; response: number }

export type SpringState = { value: number; velocity: number }

// Small fixed steps keep the spring stable even when a frame arrives late.
const STEP = 1 / 240

// Advances a spring (mass 1) toward target by dt seconds. Velocity is in units per second.
export function stepSpring(
  state: SpringState,
  target: number,
  config: SpringConfig,
  dt: number,
): SpringState {
  const stiffness = ((2 * Math.PI) / config.response) ** 2
  const damping = (4 * Math.PI * config.dampingRatio) / config.response
  let { value, velocity } = state
  for (let left = dt; left > 0; left -= STEP) {
    const h = Math.min(STEP, left)
    velocity += (-stiffness * (value - target) - damping * velocity) * h
    value += velocity * h
  }
  return { value, velocity }
}

export const isSettled = (state: SpringState, target: number) =>
  Math.abs(state.value - target) < 0.5 && Math.abs(state.velocity) < 10

// How far a flick would carry on its own, like scroll deceleration (Apple's projection function).
// 0.998 feels like normal scrolling, 0.99 stops sooner.
export function projectMomentum(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate)
}

// Past a boundary the element follows less and less, instead of stopping dead.
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))
}

// Velocity from the last few pointer samples, so one jittery event does not decide a flick.
export function createVelocityTracker(windowMs = 100) {
  let samples: { value: number; time: number }[] = []
  return {
    reset() {
      samples = []
    },
    add(value: number, time: number) {
      samples.push({ value, time })
      samples = samples.filter((sample) => time - sample.time <= windowMs)
    },
    // Units per second at `now`; 0 when the pointer has been still for the whole window.
    velocity(now: number) {
      const recent = samples.filter((sample) => now - sample.time <= windowMs)
      const first = recent[0]
      const last = recent[recent.length - 1]
      if (!first || !last || last.time === first.time) return 0
      return ((last.value - first.value) / (last.time - first.time)) * 1000
    },
  }
}
