/** Align Apple's Y-up model so its display faces the viewer. */
export function orientDuoModel(group) {
  group.rotation.set(Math.PI / 2, 0, 0);
}
