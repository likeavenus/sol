export default class WaterColumn {
  index: number;
  x: number;
  y: number;
  targetY: number;
  speed: number;

  constructor(x = 0, y = 0, index = 0) {
    this.index = index;
    this.x = x;
    this.y = y;
    this.targetY = y;
    this.speed = 0.5;
  }

  update(dampening: number, tension: number) {
    const y = this.targetY - this.y;
    this.speed += tension * y - this.speed * dampening;
    this.y += this.speed;
  }
}
