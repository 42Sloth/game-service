import { SpeedEnum, SizeEnum } from './enums'
import { DIRECTION  } from './enums';

// The ball object (The cube that bounces back and forth)
export class Ball {
	x: number;
	y: number;
	moveX: number;
	moveY: number;
	speed: number;
	defaultSpeed: number;
	radius: number;

	constructor(speed: number) {
	  this.x = 360;
	  this.y = 240;
	  this.moveX = DIRECTION.IDLE;
	  this.moveY = DIRECTION.IDLE;
	  this.speed = speed;
	  this.defaultSpeed = 5;
	  this.radius = 7;
	}

	setSpeedByType(type: SpeedEnum) {
	  if (type === 'slow') this.speed = 3;
	  else if (type === 'moderate') this.speed = 4;
	  else if (type === 'fast') this.speed = 5;
	}

	setSizeByType(type: SizeEnum) {
	  if (type === 'xl') this.radius = 6;
	  else if (type === 'l') this.radius = 5;
	  else if (type === 'm') this.radius = 4;
	  else if (type === 's') this.radius = 3;
	}
  }
