// config.ts
export const VIRTUAL_WIDTH = 400;
export const VIRTUAL_HEIGHT = 700;
export const ASPECT_RATIO = VIRTUAL_WIDTH / VIRTUAL_HEIGHT;

export const GRAVITY = 1800;          // px/s^2
export const JUMP_VELOCITY = -550;    // px/s

export const PIPE_SPEED = 120;        // px/s
export const PIPE_GAP = 180;          // px
export const PIPE_SPAWN_INTERVAL = 1.4; // seconds between new pipes

export const FLOOR_Y = VIRTUAL_HEIGHT - 40; // adjust to your ground sprite
