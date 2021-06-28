import Sprite from "./Sprite.ts";

const defaultConfig = {
  WIDTH: 191,
  HEIGHT: 11,
} as const;

export default class GameOverText extends Sprite<typeof defaultConfig> {
  /**
   * Game Over
   */
  constructor(canvas: HTMLCanvasElement) {
    super(canvas, "TEXT_SPRITE");
  }

  override init() {
    this.config = defaultConfig;
    this.phases = [[0, 13]];
    this.x = (this.container.width - this.config.WIDTH) / 2;
    this.y = (this.container.height - this.config.HEIGHT - 25) / 2;
  }

  override update() {
    super.update(0);
  }

  clear() {
    const canvasCtx = this.canvas.getContext("2d")!;
    canvasCtx.save();

    canvasCtx.clearRect(
      this.x,
      this.y,
      this.config.WIDTH,
      this.config.HEIGHT + 4,
    );
    canvasCtx.restore();
  }
}
