/** Relative pointer movement: right opens, left closes, independent of touch size. */
export class FoldGesture {
  session = null;
  begin(pointerId, x, angle, width) {
    if (this.session) return false;
    this.session = { pointerId, x, angle, width: Math.max(width, 180), current: angle };
    return true;
  }
  move(pointerId, x) {
    const s = this.session;
    if (!s || s.pointerId !== pointerId) return null;
    s.current = Math.round(Math.max(0, Math.min(180, s.angle + (x - s.x) * 360 / s.width)));
    return s.current;
  }
  end(pointerId) {
    if (!this.session || this.session.pointerId !== pointerId) return null;
    const angle = this.session.current;
    this.session = null;
    return angle;
  }
}
