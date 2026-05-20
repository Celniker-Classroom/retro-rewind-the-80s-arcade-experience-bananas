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
const spawnTime = 120;
const startScroolSpeed = 0.8;

text.size = 32;
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
let player = new Sprite(0,0, 50, DYNAMIC);
player.img = '🤪';


//decleration of barrel spanwers
let spawner = new Group();
spawner.physics = STATIC;
spawner.w = 40;
spawner.h = 40;
spawner.vel.y = scroolSpeed;



//decleration of barrel group
let barels = new Group();
barels.physics = DYNAMIC;
barels.d = 30;

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

//object below the screen that destroys sprites that hit it
let floor = new Sprite(0,1000,1520,50,STATIC);
floor.color= 'red';
floor.stroke = 'red';

function scaleCamera(){
	camera.zoomTo(windowWidth/1563);
}
scaleCamera();

//starts the game and puts all the sprites in the right spot
function startGame(){
	scaleCamera();
	player.x = 0;
	player.y = 50;
	floor.y = window.innerHeight/2 + floor.h/2;
	let spawn1 = new spawner.Sprite(300,-300);
	let spawn3 = new spawner.Sprite(-300,-300);
	platforms.addTiles(startTile, -700, -665, 100, 200);
	for (let i = 0; i < 10; i++){
		let y = (i-5)*100;
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

//displays the gameOver screen
function gameOverScreen(){
	text("Game Over", 0, -50);
	text("You Scored: " + score, 0, 0);
	text("Click to return to title screen", 0, 50);
	if (mouse.presses()){
		titleScreen = true;
		gameOver = false;
	}
}

//ends the game 
function endGame(){
	floor.y = 1000;
	player.x = 1000;
	player.y = 10;
	playing = false;
	for (let plat of barels){
		plat.delete();
	}
	for (let plat of platforms){
		plat.delete();
	}
	for (let plat of spawners){
		plat.delete();
	}
	for (let plat of walls){
		plat.delete();
	}
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

//displays the tileScreen
function displayTitleScreen(){
	player.y = 50;
	text.size = 100;
	text("Going Bana-nas!", 0, -130);
	text.size = 32;
	text("Use arrow keys to move", 0 , -50);
	text("Outrun the scrolling screen!", 0, 0);
	text("Avoid the falling barrels!", 0, 50);
	text("If you dare jump on the tops of barrels!", 0, 100);
	text("Click to start", 0, 150);
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
}
q5.update = function () {
	background('skyblue');
	text('score: ' + score, -width/2+50, -height/2+50);
	if (playing){
		play();
	}
	if (gameOver){
		gameOverScreen();
	}
	if (titleScreen){
		displayTitleScreen();
	}
}