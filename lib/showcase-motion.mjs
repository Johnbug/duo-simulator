/** Continuous presentation motion, measured in seconds rather than frame count. */
export class ShowcaseMotion {
  constructor(mode, angle, yaw) {
    this.mode = mode;
    this.angle = Math.max(0, Math.min(180, angle));
    this.yaw = yaw;
    this.phase = Math.acos(this.angle / 90 - 1);
  }
  step(seconds) {
    // Long gaps (background tabs or a stalled frame) must never teleport the device.
    const dt = Math.max(0, Math.min(0.1, seconds));
    if (this.mode === 'orbit') this.yaw += (dt * Math.PI * 2) / 32;
    else {
      this.phase += (dt * Math.PI) / 10;
      this.angle = 90 * (1 + Math.cos(this.phase));
    }
    return { angle: this.angle, yaw: this.yaw };
  }
}
