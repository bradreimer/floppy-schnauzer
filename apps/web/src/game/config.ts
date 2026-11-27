// Virtual resolution for the game world
export const VIRTUAL_WIDTH = 400;
export const VIRTUAL_HEIGHT = 700;

// Physics tuning
export const GRAVITY = 1800; // Softer pull so bird stays visible
export const JUMP_VELOCITY = -450; // Balanced jump for 400×700 world

// The schnauzer: a square sprite, with physics on its top-left corner
export const BIRD_X = 100;
export const BIRD_SIZE = 64;

// Pipe behavior
export const PIPE_WIDTH = 70;
export const PIPE_SPACING = 220; // Horizontal distance from one pipe to the next
export const PIPE_SPEED = 120; // Pipes enter screen in ~2 seconds
export const PIPE_GAP = 270; // Good difficulty for 700px height
export const PIPE_SPAWN_INTERVAL = 1.4;

// Ground collision
export const GROUND_HEIGHT = 80; // The ground art is drawn from FLOOR_Y to the bottom
export const FLOOR_Y = VIRTUAL_HEIGHT - GROUND_HEIGHT;

// Parallax scroll speeds (pixels per second)
export const SCROLL_SKY_SPEED = 2; // Slowest layer for depth
export const SCROLL_CLOUDS_SPEED = 5;
export const SCROLL_HILLS_SPEED = 10;
export const SCROLL_GROUND_SPEED = PIPE_SPEED / 60; // Match pipe speed for consistency

// Frame time
export const MAX_FRAME_TIME = 0.05; // Longest step, in seconds, that one frame may simulate
