await Canvas();
world.gravity.y = 7;

//static variables
const barelSpeed = 4;
const barelJumpH = 40;
const barelJumpW = 90/2;
const jump = -8;
const acel = 0.5;
const speed = 5;
const jumpFrames = 15;
const scaleSpeed = 0.05;

//changing  variables
let scroolSpeed = 0.8;
let score = 0;
let frameTime = 0;
let frames = 0;
let onGround = false;

//decleration of player sprite
let player = new Sprite(0,0, 50, DYNAMIC);
player.img = '🤪';

//decleration of barrel spanwers
let spawner = new Group();
spawner.physics = STATIC;
spawner.w = 40;
spawner.h = 40;
spawner.vel.y = scroolSpeed;

let spawn1 = new spawner.Sprite(40,-300);

//decleration of barrel group
let barels = new Group();
barels.physics = DYNAMIC;
barels.d = 30;

//decleration of possible tile spawns for game
let tiles = [
	[
		'p    p    p'
	]
];

//starting tiles on the screen
let startTile = [
	'p  p  p  p  p',
	'  p   p    p ',
	'p   p   p   p',
	'p  p  p  p  p',
	'  p   p    p ',
	'p   p   p   p'
];

// physical bariar on edge of screen
let walls = new Group();
walls.physics = STATIC;
walls.width = 10; 
walls.height = 100;
for (let i = 0; i < 10; i++){
	let y = (i-5)*100;
	let a = new walls.Sprite(-755, y);
	let b = new walls.Sprite(755, y);
}


//platforms that player jumps on
let platforms = new Group();
platforms.width = 100;
platforms.height = 10;
platforms.tile = "p";
platforms.physics = KIN;
platforms.vel.y = scroolSpeed;
platforms.addTiles(startTile, -700, -665, 100, 200);
function createPlatform(x, y){
 	let plat = new platforms.Sprite(x, y);
 }
createPlatform(0, 300);

//object below the screen that destroys sprites that hit it
let floor = new Sprite(0,450,1600,50,STATIC);

//returns true when the player is allowed to jump
function playerOnGround(){
	for (let plat of platforms){
		if (player.collides(plat)){
			frames = 0;
			return true;
		}
	}
	for (let plat of barels){
		let x = plat.x;
		let y = plat.y;
		let yOff = player.y-plat.y + player.h/2 + barels.d/2;
		if (yOff <= 0 && yOff >= -barelJumpH){
			let xOff = Math.abs(player.x - plat.x - player.w/2 - barels.d/2);
			if (xOff <= barelJumpW){
				frames = 8;
				return true;
			}
		}
	}
	// if (player.collides(floor)){
	// 	frames = 0;
	// 	return true;
	// }
	frames ++;
	if (frames < jumpFrames){
		return true;
	}
	for (let plat of platforms){
		if (player.colliding(plat)){
			return true;
		}
	}
	// if (player.colliding(floor)){
	// 	return true;
	// }
	return false;
}

//moves the player based on input
function move(){
	if (keyIsDown(LEFT_ARROW)){
		if (player.vel.x > -speed){
			player.vel.x -= acel;
		}
	} else if (keyIsDown(RIGHT_ARROW)){
		if (player.vel.x < speed){
			player.vel.x += acel;
		} 
	}
	if ((mouse.presses() || kb.presses(' ') || kb.presses('up')) && onGround) {
		frames = 10;
		onGround = false;
		player.vel.y += jump;
		if (player.vel.y < jump) {
			player.vel.y = jump;
		}
		else if (player.vel.y > jump/2){
			player.vel.y = jump/2;
		}
	}
}

//spawns barels at spawners once a second
function spawn(t) {
	if (t == 60){
		score++;
		let offSet = barels.d/2;
		for (let tempSpawn of spawner){
			let x = tempSpawn.x;
			let y = tempSpawn.y - barels.d/2 + spawner.h/2; 
			let a = new barels.Sprite(x - offSet, y);
			a.vel.x = - barelSpeed;
			let b = new barels.Sprite(x + offSet, y);
			b.vel.x = barelSpeed;
		}
	}
}

// checks if the player hit a barrel
function checkDefeat(){
	for (let plat of barels){
		if (player.collides(plat)){
			return true;
		}
	}
	return false;
}

//ends the game and shows title screen
function endGame(){
	alert("a");
}
floor.overlaps(player, endGame);

//removes objects that hit the floor sprite
function clearWorld(floor, sprite, dur){
	sprite.delete();
}

floor.overlaps(barels, clearWorld);
floor.overlaps(platforms, clearWorld);

//checks if there are no longer sprites above the vissible screen
function shouldSpawnTile(){
	for (let plat of platforms){
		if (plat.y < -470){
			return false;
		}
	}
	return true;
}

//spawns a random tile
function spawnTile(){
	platforms.addTiles(tiles[0], -700, -665, 100, 200);
}

//ajusts position of dynamic objects to acount for scroll speed
function scroll(){
	player.y += scroolSpeed/60;
	for (let plat of barels){
		plat.y += scroolSpeed/60;
	}
}

//scales the speed at which objects scrol donwards on the screen;
function scaleDifficulty(){
	if (scroolSpeed < 3){
		scroolSpeed += scaleSpeed;
	}
}

//calls all functions that need to happen when playing the game
function play() {
	player.vel.y += 3/60;
	frameTime++;
	onGround = playerOnGround();
	move();
	spawn(frameTime);
	scroll();
	if (checkDefeat()){
		endGame();
	}
	if (frameTime > 59){
		score++;
		frameTime = 0;
		scaleDifficulty();
		if (shouldSpawnTile()){
			spawnTile();
		}
	}
}
q5.update = function () {
	background('skyblue');
	text('click to jump!', 0, -50);
	play();
}