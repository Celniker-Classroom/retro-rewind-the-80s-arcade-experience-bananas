await Canvas(360, 640);
world.gravity.y = 0.8;
world.frameRate = 60;

let player = new Sprite();
player.diameter = 44;
player.color = 'cyan';
player.physics = DYNAMIC;
player.x = 0;
player.y = 180;
player.restitution = 0;
player.friction = 0.2;
player.maxSpeed.y = 18;

let leftWall = new Sprite();
leftWall.physics = STATIC;
leftWall.width = 24;
leftWall.height = 1800;
leftWall.x = -160;
leftWall.y = 0;
leftWall.color = '#333';

let rightWall = new Sprite();
rightWall.physics = STATIC;
rightWall.width = 24;
rightWall.height = 1800;
rightWall.x = 160;
rightWall.y = 0;
rightWall.color = '#333';

let floor = new Sprite();
floor.physics = STATIC;
floor.width = 320;
floor.height = 18;
floor.x = 0;
floor.y = 300;
floor.color = '#228B22';

let platforms = [];
for (let i = 0; i < 10; i++) {
	let platform = new Sprite();
	platform.physics = STATIC;
	platform.width = 120;
	platform.height = 18;
	platform.x = random(-100, 100);
	platform.y = 220 - i * 120;
	platform.color = '#999';
	platforms.push(platform);
}

let cameraY = 0;
let gameState = 'play';
let score = 0;

function playerOnGround() {
	if (player.collides(floor)) return true;
	for (let platform of platforms) {
		if (player.collides(platform)) return true;
	}
	return false;
}

q5.update = function () {
	background('#04111d');

	if (gameState === 'play') {
		if ((mouse.presses() || keyIsDown(32) || keyIsDown(UP_ARROW)) && playerOnGround()) {
			player.vel.y = -13;
		}

		cameraY = min(cameraY, player.y - 160);

		let bottomLimit = cameraY + height / 2 - 24;
		if (player.y > bottomLimit) {
			gameState = 'gameover';
		}

		score = max(score, round(-cameraY));
	}

	translate(0, -cameraY);

	// Draw world bounds and sprites in world coordinates.
	fill('#222');
	rect(-180, cameraY + height / 2 + 120, 360, 240); // lower hazard area below the visible space

	push();
	translate(0, cameraY);
	fill('white');
	textSize(18);
	textAlign(CENTER, CENTER);
	text('Vertical Scroller: Jump Up!', 0, -300);
	textSize(14);
	text('Stay above the bottom and use the walls to bounce.', 0, -280);
	text('Score: ' + score, 0, -260);

	if (gameState === 'gameover') {
		fill('red');
		textSize(28);
		text('GAME OVER', 0, -20);
		textSize(16);
		text('Refresh to try again.', 0, 20);
	}
	pop();
};
