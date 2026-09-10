import test from 'node:test';
import assert from 'node:assert/strict';
import { ShowcaseMotion } from '../lib/showcase-motion.mjs';
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);
const advance = (motion, seconds, fps = 60) => {
  for (let i = 0; i < seconds * fps; i++) motion.step(1 / fps);
};
test('rotation completes a slow 32-second turn without changing the hinge', () => {
  const motion = new ShowcaseMotion('orbit', 135, -0.35);
  advance(motion, 32);
  near(motion.yaw, -0.35 + Math.PI * 2);
  near(motion.angle, 135);
});
test('folding gently closes in 10 seconds and reopens in 10 seconds', () => {
  const motion = new ShowcaseMotion('fold', 180, -0.35);
  advance(motion, 5);
  near(motion.angle, 90);
  advance(motion, 5);
  near(motion.angle, 0);
  advance(motion, 10);
  near(motion.angle, 180);
  near(motion.yaw, -0.35);
});
test('starting or resuming from any manual angle does not jump', () => {
  for (const angle of [0, 17, 74, 135, 180]) {
    const motion = new ShowcaseMotion('fold', angle, 1);
    near(motion.step(0).angle, angle);
    for (let i = 0; i < 2400; i++) {
      const before = motion.angle;
      motion.step(1 / 60);
      assert.ok(motion.angle >= 0 && motion.angle <= 180);
      assert.ok(Math.abs(motion.angle - before) < 0.48);
    }
  }
});
test('motion is frame-rate independent and long interruptions are bounded', () => {
  const a = new ShowcaseMotion('fold', 135, 0),
    b = new ShowcaseMotion('fold', 135, 0);
  advance(a, 5, 30);
  advance(b, 5, 120);
  near(a.angle, b.angle);
  const rotation = new ShowcaseMotion('orbit', 135, 0);
  rotation.step(3600);
  assert.ok(rotation.yaw < 0.02);
});
