await Canvas();
world.gravity.y = 7;
frameRate(60);

//static variables
const barelSpeed = 4;
const barelJumpH = 40;
const barelJumpW = 90/2;
const jump = -8;
const acel = 0.5;
const speed = 5;
const jumpFrames = 15;
const scaleSpeed = 0.05;
const spawnTime = 120;
const startScroolSpeed = 0.8;

//changing  variables
let gameOver = false;
let titleScreen = true;
let playing = false;
let scroolSpeed = startScroolSpeed;
let score = 0;
let frameTime = 0;
let frames = 0;
let onGround = false;

//decleration of player sprite
let player = new Sprite(0,0, 30, 45, DYNAMIC);
// make the player smaller by adjusting `w` and `h` above
player.w = 30;
player.h = 45;
// track which way the player is facing so we can swap sprites
let playerFacing = 'right';
// start with a neutral right-facing sprite; change these paths to any
// other sprite files in images/various monke as you like
player.img = 'images/various monke/monke_right (1).png';
player.imgFit = 'contain';
player.rotationLock = true;

//decleration of barrel spanwers
let spawner = new Group();
spawner.physics = STATIC;
// make spawners smaller
spawner.w = 24;
spawner.h = 24;
spawner.vel.y = scroolSpeed;
spawner.img = 'images/barrel spawner.png';
spawner.imgFit = 'contain';


//decleration of barrel group
let barels = new Group();
barels.physics = DYNAMIC;
barels.d = 20;
barels.img = 'images/Barrel (2).png';
barels.imgFit = 'contain';

//decleration of possible tile spawns for game
let tiles = [
	[
		'p'
	],
	[
		' p'
	],
	[
		'  p'
	],
	[
		'   p'
	],
	[
		'    p'
	],
	[
		'     p'
	],
	[
		'      p'
	],
	[
		'       p'
	],
	[
		'        p'
	],
	[
		'         p'
	],
	[
		'          p'
	],
	[
		'           p'
	],
	[
		'            p'
	],
	[
		'             p'
	],
	[
		'              p'
	]
];

//starting tiles on the screen
let startTile = [
	'p  p     p  p',
	'  p   p    p ',
	'p   p p p   p',
	'p  p     p  p',
	'  p   ppp   p '
];

// physical bariar on edge of screen
let walls = new Group();
walls.physics = STATIC;
walls.width = 10; 
walls.height = 100;


//platforms that player jumps on
let platforms = new Group();
platforms.width = 100;
platforms.height = 10;
platforms.tile = "p";
platforms.physics = KIN;
platforms.vel.y = scroolSpeed;

let scale = 0
//scales the screen to make it a set width
function scaleCamera(){
	scale = windowWidth/1563
	camera.zoomTo(scale);
}
scaleCamera();

//object below the screen that destroys sprites that hit it
let floor = new Sprite(0,height+25,1520,50,STATIC);
floor.color= 'red';
floor.stroke = 'red';

//returns text to default size
function setGameTextStyle(){
	textSize(32);
	fill('white');
	stroke('black');
	strokeWeight(1);
	textAlign(LEFT, TOP);
	allSprites.stroke = 'black';
}

//starts the game and puts all the sprites in the right spot
function startGame(){
	scaleCamera();
	setGameTextStyle();
	spawner.removeAll?.();
	player.x = 0;
	player.y = 30;
	player.vel.y = 0;
	player.vel.x = 0;
	floor.y = height/2/scale + floor.h/2;
	let spawn1 = new spawner.Sprite(300,-300);
	let spawn3 = new spawner.Sprite(-300,-300);
	platforms.addTiles(startTile, -700, -665, 100, 200);
	for (let i = 0; i < 15; i++){
		let y = (i-7)*100;
		let a = new walls.Sprite(-755, y);
		let b = new walls.Sprite(755, y);
	}
	score = 0;
	scroolSpeed = startScroolSpeed;
}

//returns true when the player is allowed to jump
function playerOnGround(){
	for (let plat of platforms){
		if (player.collides(plat)){
			if (player.y + player.h/2 <= plat.y){
				frames = 0;
				return true;
			}
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
		playerFacing = 'left';
		// switch to walking-left spritesheet while moving left
		player.img = 'images/various monke/monke_walking_left (1).png';
		if (player.vel.x > -speed){
			player.vel.x -= acel;
		}
	} else if (keyIsDown(RIGHT_ARROW)){
		playerFacing = 'right';
		// switch to walking-right spritesheet while moving right
		player.img = 'images/various monke/monke_walking_right (2).png';
		if (player.vel.x < speed){
			player.vel.x += acel;
		} 
	} else {
		// not moving horizontally: use idle sprites depending on facing
		if (playerFacing === 'left'){
			player.img = 'images/various monke/monke_left (1).png';
		} else {
			player.img = 'images/various monke/monke_right (1).png';
		}
	}
	if ((mouse.presses() || kb.presses(' ') || kb.presses('up')) && onGround) {
		frames = 10;
		onGround = false;
		// use jump sprite based on facing
		if (playerFacing === 'left') {
			player.img = 'images/various monke/monke_jump_left.png';
		} else {
			player.img = 'images/various monke/monke_jump_right.png';
		}
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

//displays the gameOver screen
function gameOverScreen(){

	background(20, 20, 30);

	textAlign(CENTER, CENTER);

	// title
	textSize(90);
	fill('red');
	stroke('black');
	strokeWeight(6);
	text("GAME OVER", 0, -140);

	// score
	textSize(42);
	fill('white');
	strokeWeight(3);
	text("Score: " + score, 0, -20);

	// restart message
	textSize(28);
	fill('#ffd166');
	strokeWeight(2);
	text("Click to return to title screen", 0, 90);

	//moves to tile screen
	if (mouse.presses()){
		titleScreen = true;
		gameOver = false;
	}
}

//ends the game 
function endGame(){
	floor.y = 1000;
	player.x = 1000;
	player.vel.x = 0;
	player.vel.y = 0;
	player.y = 10;
	playing = false;
	barels.deleteAll();
	platforms.deleteAll();
	spawner.deleteAll();
	walls.deleteAll();
	gameOver = true;
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

//spawns 2 random tile with chance of more spawning that decreases as game progresses
function spawnTile(){
	//aTiles is a list of tiles that are not taken
	let aTiles = [];
	for (let i = 0; i < tiles.length; i++){
		aTiles.push(i);
	}

	let index1 = Math.floor(Math.random()*aTiles.length);
	let tile = [aTiles[index1],0];
	aTiles.splice(index1, 1);

	let index2 = Math.floor(Math.random()*aTiles.length);
	tile[1] = aTiles[index2];
	aTiles.splice(index2, 1);

	platforms.addTiles(tiles[tile[0]], -700, -665, 100, 200);
	platforms.addTiles(tiles[tile[1]], -700, -665, 100, 200);

	let i = 2;
	let spawnChance = 4;
	while ((Math.random()*spawnChance) > scroolSpeed && aTiles.length > 5){
		let index = Math.floor(Math.random()*aTiles.length);
		tile.push(aTiles[index]);
		aTiles.splice(index, 1);
		platforms.addTiles(tiles[tile[i]], -700, -665, 100, 200);
		spawnChance -= 0.4;
		i++;
	}
}

//ajusts position of dynamic objects to acount for scroll speed
function scrool(){
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

//displays the titleScreen
function displayTitleScreen(){

	// ensure player is visible on the title screen
	player.x = 0;
	player.y = 50;

	background(135, 206, 235);

	textAlign(CENTER, CENTER);

	// title
	textSize(100);
	fill('#ffdd00');
	stroke('#d17d00');
	strokeWeight(8);
	text("Going Bana-nas!", 0, -220);

	// subtitle
	textSize(34);
	fill('white');
	stroke('black');
	strokeWeight(3);

	text("Use ← → Arrow Keys to Move", 0, -70);
	text("Outrun the scrolling screen!", 0, -10);
	text("Avoid the falling barrels!", 0, 50);

	fill('#ffef99');
	text("Jump on barrels if you dare!", 0, 110);

	// start button text
	textSize(42);
	fill('#00ff88');
	stroke('black');
	strokeWeight(4);
	text("CLICK TO START", 0, 220);

	if (mouse.presses()){
		startGame();
		titleScreen = false;
		playing = true;
	}
}

//calls all functions that need to happen when playing the game
function play() {
	player.vel.y += 3/60;
	frameTime++;
	onGround = playerOnGround();
	move();
	spawn(frameTime);
	scrool();
	if (shouldSpawnTile()){
		spawnTile();
	}
	if (checkDefeat()){
		endGame();
	}
	if (frameTime > spawnTime){
		score++;
		frameTime = 0;
		scaleDifficulty();
	}
	fill('white');
	stroke('black');
	text('score: ' + score, -width/2+50, -height/2+50);
}
q5.update = function () {
	background('skyblue');
	if (playing){
		play();
	}
	else if (gameOver){
		gameOverScreen();
	}
	else if (titleScreen){
		displayTitleScreen();
	}
}