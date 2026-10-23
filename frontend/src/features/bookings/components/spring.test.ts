import { describe, expect, it } from 'vitest'

import { createVelocityTracker, isSettled, projectMomentum, rubberband, stepSpring } from './spring'

const run = (velocity: number, dampingRatio: number) => {
  let state = { value: 0, velocity }
  let max = 0
  for (let frame = 0; frame < 120; frame++) {
    state = stepSpring(state, 100, { dampingRatio, response: 0.3 }, 1 / 60)
    max = Math.max(max, state.value)
  }
  return { state, max }
}

describe('stepSpring', () => {
  it('settles on the target within two seconds', () => {
    const { state } = run(0, 1)
    expect(isSettled(state, 100)).toBe(true)
  })

  it('does not overshoot when critically damped', () => {
    expect(run(0, 1).max).toBeLessThanOrEqual(100.5)
  })

  it('overshoots when under-damped and thrown toward the target', () => {
    expect(run(1500, 0.8).max).toBeGreaterThan(100)
  })

  it('carries the starting velocity into the first frame', () => {
    const moving = stepSpring({ value: 0, velocity: -2000 }, 100, { dampingRatio: 1, response: 0.3 }, 1 / 60)
    expect(moving.value).toBeLessThan(0)
  })
})

describe('projectMomentum', () => {
  it('projects about half a pixel per px/s with the scroll rate, in the direction of travel', () => {
    expect(projectMomentum(1000)).toBeCloseTo(499)
    expect(projectMomentum(-1000)).toBeCloseTo(-499)
    expect(projectMomentum(0)).toBe(0)
  })
})

describe('rubberband', () => {
  it('follows less than 1:1 and never reaches the dimension', () => {
    expect(rubberband(100, 400)).toBeLessThan(100)
    expect(rubberband(100000, 400)).toBeLessThan(400)
    expect(rubberband(-100, 400)).toBeCloseTo(-rubberband(100, 400))
  })
})

describe('createVelocityTracker', () => {
  it('measures px/s over the recent window and reads 0 once the pointer rests', () => {
    const tracker = createVelocityTracker()
    tracker.add(0, 0)
    tracker.add(10, 16)
    tracker.add(20, 32)
    expect(tracker.velocity(32)).toBeCloseTo(625)
    expect(tracker.velocity(500)).toBe(0)
  })
})
