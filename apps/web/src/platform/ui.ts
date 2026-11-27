import logoUrl from "../assets/logo.png";
import { VIRTUAL_HEIGHT, VIRTUAL_WIDTH } from "../game/config";
import type { Screen } from "./screens";

/** The parts of the 2D context the UI draws with, so a test can pass a recording fake. */
export type UiContext = Pick<
  CanvasRenderingContext2D,
  | "clearRect"
  | "save"
  | "restore"
  | "beginPath"
  | "roundRect"
  | "clip"
  | "fill"
  | "stroke"
  | "drawImage"
  | "fillText"
  | "strokeText"
  | "createLinearGradient"
  | "font"
  | "fillStyle"
  | "strokeStyle"
  | "lineWidth"
  | "lineJoin"
  | "textAlign"
  | "textBaseline"
  | "shadowColor"
  | "shadowBlur"
>;

const CENTER_X = VIRTUAL_WIDTH / 2;
const FONT = "system-ui, -apple-system, 'Segoe UI', sans-serif";

// Layout, in virtual pixels. See docs/specs/screens.md.
const LOGO = { w: 320, h: 213, y: 70, radius: 20 };
const PANEL = { w: 320, h: 210, y: 190, radius: 24 };
const PANEL_X = (VIRTUAL_WIDTH - PANEL.w) / 2;

/** Draws the start screen, the score, and the game-over panel on the 2D UI canvas. */
export class GameUI {
  private logo: CanvasImageSource | null = null;

  constructor(private readonly ctx: UiContext) {}

  /** Loads logo.png. Until it loads, or if it fails, the ready screen shows only its text. */
  async loadLogo(): Promise<void> {
    try {
      const img = new Image();
      img.src = logoUrl;
      await img.decode();
      this.logo = img;
    } catch {
      console.error(`GameUI: failed to load the logo from ${logoUrl}`);
    }
  }

  draw(screen: Screen): void {
    this.ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    if (screen.kind === "ready") this.drawReady(screen.best);
    else if (screen.kind === "playing") this.text(String(screen.score), 80, 48, "white");
    else this.drawGameOver(screen.score, screen.best, screen.newBest);
  }

  private drawReady(best: number): void {
    const { ctx } = this;
    if (this.logo) {
      const x = (VIRTUAL_WIDTH - LOGO.w) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, LOGO.y, LOGO.w, LOGO.h, LOGO.radius);
      ctx.clip();
      ctx.drawImage(this.logo, x, LOGO.y, LOGO.w, LOGO.h);
      ctx.restore();
    }
    this.text("Tap or press Space to start", 480, 22, "white");
    if (best > 0) this.text(`Best: ${best}`, 515, 20, "white");
  }

  private drawGameOver(score: number, best: number, newBest: boolean): void {
    const { ctx } = this;

    // The panel: a rounded card with a blue-to-purple gradient and a light blue border.
    ctx.save();
    const gradient = ctx.createLinearGradient(PANEL_X, PANEL.y, PANEL_X + PANEL.w, PANEL.y);
    gradient.addColorStop(0, "#232a66");
    gradient.addColorStop(1, "#4a2f8a");
    ctx.beginPath();
    ctx.roundRect(PANEL_X, PANEL.y, PANEL.w, PANEL.h, PANEL.radius);
    ctx.fillStyle = gradient;
    ctx.shadowColor = "rgba(120, 170, 255, 0.6)";
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#9cc4ff";
    ctx.stroke();
    ctx.restore();

    this.text("SCORE", PANEL.y + 34, 18, "#cfd8ff", false);
    this.text(String(score), PANEL.y + 92, 64, "#8ff6ff", false, "rgba(143, 246, 255, 0.8)");
    this.text(`BEST: ${best}`, PANEL.y + 150, 20, "#b8c2e8", false);
    if (newBest) this.text("NEW BEST!", PANEL.y + 184, 20, "#ffd34d", false);

    this.text("Tap or press Space to play again", PANEL.y + PANEL.h + 45, 22, "white");
  }

  /** Draws centered bold text, with a dark outline for contrast over the game, and an optional glow. */
  private text(
    value: string,
    y: number,
    size: number,
    color: string,
    outline = true,
    glow?: string
  ): void {
    const { ctx } = this;
    ctx.save();
    ctx.font = `bold ${size}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (outline) {
      ctx.lineJoin = "round";
      ctx.lineWidth = Math.max(3, size / 8);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.75)";
      ctx.strokeText(value, CENTER_X, y);
    }
    if (glow) {
      ctx.shadowColor = glow;
      ctx.shadowBlur = 14;
    }
    ctx.fillStyle = color;
    ctx.fillText(value, CENTER_X, y);
    ctx.restore();
  }
}
