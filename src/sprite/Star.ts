import Sprite from "./Sprite.ts";
import { getRandomNum } from "../utils.ts";

const defaultConfig = {
  HEIGHT: 9,
  WIDTH: 9,
  /** 限制最大 y 坐标，防止星星生成到地面 */
  MAX_Y: 70,
};

export default class Star extends Sprite<typeof defaultConfig> {
  /**
   * 星星 ✨
   *
   * 和障碍物(Obstacle)类似，但是没有碰撞盒子。
   */
  constructor(canvas: HTMLCanvasElement, containerWidth: number) {
    super(canvas, containerWidth, "STAR");
    this.phases = [[0, 0], [0, 9], [0, 18]];
  }

  override init() {
    this.config = defaultConfig;
    this.y = getRandomNum(0, this.config.MAX_Y);
  }
}