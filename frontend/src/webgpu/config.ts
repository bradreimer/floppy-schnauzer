// Virtual resolution for the game world
export const VIRTUAL_WIDTH = 400;
export const VIRTUAL_HEIGHT = 700;

// Physics tuning
export const GRAVITY = 1800; // Softer pull so bird stays visible
export const JUMP_VELOCITY = -450; // Balanced jump for 400×700 world

// Pipe behavior
export const PIPE_SPEED = 180; // Pipes enter screen in ~2 seconds
export const PIPE_GAP = 270; // Good difficulty for 700px height
export const PIPE_SPAWN_INTERVAL = 1.4;

// Ground collision
export const GROUND_HEIGHT = 40; // Matches your ground sprite
export const FLOOR_Y = VIRTUAL_HEIGHT - GROUND_HEIGHT;

// Parallax scroll speeds (pixels per second)
export const SCROLL_SKY_SPEED = 5; // Slowest layer for depth
export const SCROLL_CLOUDS_SPEED = 10;
export const SCROLL_HILLS_SPEED = 20;
export const SCROLL_GROUND_SPEED = PIPE_SPEED; // Match pipe speed for consistency
