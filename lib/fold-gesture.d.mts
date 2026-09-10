export class FoldGesture {
  session: { pointerId: number; x: number; angle: number; width: number; current: number } | null;
  begin(pointerId: number, x: number, angle: number, width: number): boolean;
  move(pointerId: number, x: number): number | null;
  end(pointerId: number): number | null;
}
