import CollisionBox from "./CollisionBox";
import { FPS, IS_HIDPI, IS_MOBILE } from "./constants";
import Runner from "./Runner";
import { ObstacleType } from "./sprite";
import { getRandomNum } from "./utils";

export default class Obstacle {
  static types: ObstacleType[];
  /** Coefficient for calculating the maximum gap. */
  static MAX_GAP_COEFFICIENT = 1.5;

  /** Maximum obstacle grouping count. */
  static MAX_OBSTACLE_LENGTH = 3;

  canvasCtx: CanvasRenderingContext2D;
  spritePos: object;
  typeConfig: ObstacleType;
  gapCoefficient: number;
  size: number;
  dimensions: object;
  remove: boolean;
  xPos: number;
  yPos: number;
  width: number;
  collisionBoxes: CollisionBox[];
  gap: number;
  speedOffset: number;
  imageSprite: CanvasImageSource;

  // For animated obstacles.
  currentFrame: number;
  timer: number;
  jumpAlerted: any;

  /**
 * Obstacle.
 * @param {CanvasRenderingContext2D} canvasCtx
 * @param {ObstacleType} type
 * @param {Object} spriteImgPos Obstacle position in sprite.
 * @param {Object} dimensions
 * @param {number} gapCoefficient Mutipler in determining the gap.
 * @param {number} speed
 * @param {number=} optXOffset
 */
  constructor(
    canvasCtx: CanvasRenderingContext2D,
    type: ObstacleType,
    spriteImgPos: object,
    dimensions: object,
    gapCoefficient: number,
    speed: number,
    optXOffset: number | undefined,
  ) {
    this.canvasCtx = canvasCtx;
    this.spritePos = spriteImgPos;
    this.typeConfig = type;
    this.gapCoefficient = Runner.slowDown ? gapCoefficient * 2 : gapCoefficient;
    this.size = getRandomNum(1, Obstacle.MAX_OBSTACLE_LENGTH);
    this.dimensions = dimensions;
    this.remove = false;
    this.xPos = dimensions.WIDTH + (optXOffset || 0);
    this.yPos = 0;
    this.width = 0;
    this.collisionBoxes = [];
    this.gap = 0;
    this.speedOffset = 0;
    this.imageSprite = Runner.imageSprite;

    // For animated obstacles.
    this.currentFrame = 0;
    this.timer = 0;

    this.init(speed);
  }

  /**
   * Initialise the DOM for the obstacle.
   * @param {number} speed
   */
  init(speed: number) {
    this.cloneCollisionBoxes();

    // Only allow sizing if we're at the right speed.
    if (this.size > 1 && this.typeConfig.multipleSpeed > speed) {
      this.size = 1;
    }

    this.width = this.typeConfig.width * this.size;

    // Check if obstacle can be positioned at various heights.
    if (Array.isArray(this.typeConfig.yPos)) {
      const yPosConfig = IS_MOBILE
        ? this.typeConfig.yPosMobile
        : this.typeConfig.yPos;
      this.yPos = yPosConfig[getRandomNum(0, yPosConfig.length - 1)];
    } else {
      this.yPos = this.typeConfig.yPos;
    }

    this.draw();

    // Make collision box adjustments,
    // Central box is adjusted to the size as one box.
    //      ____        ______        ________
    //    _|   |-|    _|     |-|    _|       |-|
    //   | |<->| |   | |<--->| |   | |<----->| |
    //   | | 1 | |   | |  2  | |   | |   3   | |
    //   |_|___|_|   |_|_____|_|   |_|_______|_|
    //
    if (this.size > 1) {
      this.collisionBoxes[1].width = this.width -
        this.collisionBoxes[0].width -
        this.collisionBoxes[2].width;
      this.collisionBoxes[2].x = this.width - this.collisionBoxes[2].width;
    }

    // For obstacles that go at a different speed from the horizon.
    if (this.typeConfig.speedOffset) {
      this.speedOffset = Math.random() > 0.5
        ? this.typeConfig.speedOffset
        : -this.typeConfig.speedOffset;
    }

    this.gap = this.getGap(this.gapCoefficient, speed);

    // Increase gap for audio cues enabled.
    if (Runner.audioCues) {
      this.gap *= 2;
    }
  }

  /**
 * Draw and crop based on size.
 */
  draw() {
    let sourceWidth = this.typeConfig.width;
    let sourceHeight = this.typeConfig.height;

    if (IS_HIDPI) {
      sourceWidth = sourceWidth * 2;
      sourceHeight = sourceHeight * 2;
    }

    // X position in sprite.
    let sourceX = sourceWidth * this.size * (0.5 * (this.size - 1)) +
      this.spritePos.x;

    // Animation frames.
    if (this.currentFrame > 0) {
      sourceX += sourceWidth * this.currentFrame;
    }

    this.canvasCtx.drawImage(
      this.imageSprite,
      sourceX,
      this.spritePos.y,
      sourceWidth * this.size,
      sourceHeight,
      this.xPos,
      this.yPos,
      this.typeConfig.width * this.size,
      this.typeConfig.height,
    );
  }

  /**
 * Obstacle frame update.
 * @param {number} deltaTime
 * @param {number} speed
 */
  update(deltaTime: number, speed: number) {
    if (!this.remove) {
      if (this.typeConfig.speedOffset) {
        speed += this.speedOffset;
      }
      this.xPos -= Math.floor(((speed * FPS) / 1000) * deltaTime);

      // Update frame
      if (this.typeConfig.numFrames) {
        this.timer += deltaTime;
        if (this.timer >= this.typeConfig.frameRate) {
          this.currentFrame =
            this.currentFrame === this.typeConfig.numFrames - 1
              ? 0
              : this.currentFrame + 1;
          this.timer = 0;
        }
      }
      this.draw();

      if (!this.isVisible()) {
        this.remove = true;
      }
    }
  }

  /**
 * Calculate a random gap size.
 * - Minimum gap gets wider as speed increses
 * @param {number} gapCoefficient
 * @param {number} speed
 * @return {number} The gap size.
 */
  getGap(gapCoefficient: number, speed: number): number {
    const minGap = Math.round(
      this.width * speed + this.typeConfig.minGap * gapCoefficient,
    );
    const maxGap = Math.round(minGap * Obstacle.MAX_GAP_COEFFICIENT);
    return getRandomNum(minGap, maxGap);
  }

  /**
 * Check if obstacle is visible.
 * @return Whether the obstacle is in the game area.
 */
  isVisible() {
    return this.xPos + this.width > 0;
  }

  /**
 * Make a copy of the collision boxes, since these will change based on
 * obstacle type and size.
 */
  cloneCollisionBoxes() {
    const collisionBoxes = this.typeConfig.collisionBoxes;

    for (let i = collisionBoxes.length - 1; i >= 0; i--) {
      this.collisionBoxes[i] = new CollisionBox(
        collisionBoxes[i].x,
        collisionBoxes[i].y,
        collisionBoxes[i].width,
        collisionBoxes[i].height,
      );
    }
  }
}