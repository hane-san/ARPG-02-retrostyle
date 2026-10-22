// Issue #44: a step chosen on the ground is a little slower than before (6.15);
// a destination chosen on the atlas is a little faster — a walked fast-travel
// that still takes every legal step of the same route.
export const WALK_SPEED=Object.freeze({field:5.7,map:7.35});
export const walkSpeed=source=>WALK_SPEED[source]||WALK_SPEED.field;
