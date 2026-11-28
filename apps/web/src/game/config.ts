// Virtual resolution for the game world
export const VIRTUAL_WIDTH = 400;
export const VIRTUAL_HEIGHT = 700;

// Physics tuning
export const GRAVITY = 1800; // Softer pull so bird stays visible
export const JUMP_VELOCITY = -450; // Balanced jump for 400×700 world

// The schnauzer: a square sprite, with physics on its top-left corner
export const BIRD_X = 100;
export const BIRD_SIZE = 64; // The sprite frame drawn on screen
// The collision box, relative to the sprite's top-left corner. It's the union of the opaque pixels
// in all four frames of schnauzer.png: the full width, rows 17 to 47. hitbox.test.ts checks it.
export const BIRD_HITBOX = { x: 0, y: 17, w: 64, h: 31 } as const;
export const WING_FRAMES = 4; // Frames side by side in schnauzer.png
export const WING_FPS = 10; // Wing animation frames per second

// Pipe behavior
export const PIPE_WIDTH = 70;
export const PIPE_SPACING = 220; // Horizontal distance from one pipe to the next
export const PIPE_SPEED = 120; // Pipes enter screen in ~2 seconds
export const PIPE_GAP = 270; // Good difficulty for 700px height
// Pipes spawn by distance, not time, so exactly the pipes that are needed exist. A new pipe
// appears PIPE_SPACING right of the last one as soon as the last one has moved in to
// PIPE_SPAWN_X - PIPE_SPACING. A pipe arrives every PIPE_SPACING / PIPE_SPEED = 1.83 s.
export const PIPE_SPAWN_X = VIRTUAL_WIDTH + 50; // Just past the right edge of the screen
export const FIRST_PIPE_X = 840; // The first pipe reaches the schnauzer about 5.6 s into a round

// Ground collision
export const GROUND_HEIGHT = 80; // The ground art is drawn from FLOOR_Y to the bottom
export const FLOOR_Y = VIRTUAL_HEIGHT - GROUND_HEIGHT;

// Parallax: each layer scrolls at this share of the pipe speed. The ground moves with the pipes,
// and farther layers move slower, which reads as depth.
export const PARALLAX_SKY = 0.1; // 12 px/s
export const PARALLAX_CLOUDS = 0.25; // 30 px/s
export const PARALLAX_HILLS = 0.5; // 60 px/s
export const PARALLAX_GROUND = 1; // 120 px/s, the pipe speed

// Frame time
export const MAX_FRAME_TIME = 0.05; // Longest step, in seconds, that one frame may simulate
