export class ShowcaseMotion {
  constructor(mode: 'fold' | 'orbit', angle: number, yaw: number);
  mode: 'fold' | 'orbit';
  angle: number;
  yaw: number;
  phase: number;
  step(seconds: number): { angle: number; yaw: number };
}
