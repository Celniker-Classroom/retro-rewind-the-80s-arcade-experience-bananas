await Canvas();
world.gravity.y = 7;
frameRate(60);

// Game constants: fixed values used for movement, timing, and difficulty scaling.
const barelSpeed = 4;          // horizontal velocity of barrels when spawned
const barelJumpH = 40;         // maximum vertical tolerance for jumping on a barrel
const barelJumpW = 90/2;       // horizontal tolerance for landing on a barrel
const jump = -8;               // upward velocity applied when player jumps
const acel = 0.5;              // horizontal acceleration for smooth movement
const speed = 5;               // maximum horizontal movement speed
const jumpFrames = 15;         // number of frames jump input is still accepted after leaving ground
const scaleSpeed = 0.05;       // how fast the scroll speed increases over time
const spawnTime = 120;         // frames between score increments and difficulty ramps
const startScroolSpeed = 0.8;  // initial downward scroll speed

//changing  variables
let gameOver = false;
let titleScreen = true;
let playing = false;
let scroolSpeed = startScroolSpeed;
let score = 0;
let frameTime = 0;
let frames = 0;
let onGround = false;
let facing = 'right';

//decleration of player sprite
let player = new Sprite(0,50, 60, 80, DYNAMIC);
player.w = 60;
player.h = 80;
player.image = 'images/various monke/monke_right (2).png';
player.imgFit = 'contain';
player.visible = true;
player.autoDraw = true;
player.rotationLock = true; // prevent player from rotating due to physics
player.debug = false;      // disable debug to show the sprite image

//decleration of barrel spanwers
let spawner = new Group();
spawner.physics = STATIC;
spawner.w = 40;
spawner.h = 40;
spawner.vel.y = scroolSpeed;
spawner.img = 'images/barrel spawner (1).png';
spawner.imgFit = 'contain';


//decleration of barrel group
let barels = new Group();
barels.physics = DYNAMIC;
barels.d = 30;
barels.img = 'images/Barrel (4).png';
barels.imgFit = 'contain';
barels.debug = true; // show debug outlines for barrels

// Possible platform arrangements used when spawning new tiles.
let tiles = [
	['p'],
	[' p'],
	['  p'],
	['   p'],
	['    p'],
	['     p'],
	['      p'],
	['       p'],
	['        p'],
	['         p'],
	['          p'],
	['           p'],
	['            p'],
	['             p'],
	['              p']
];

// Initial platform layout shown when the game starts.
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

// Used to keep the viewport scaled to a consistent width regardless of window size.
let scale = 0;
function scaleCamera() {
	scale = windowWidth / 1563;
	camera.zoomTo(scale);
}
scaleCamera();

// Invisible floor below the visible game area used to remove off-screen sprites.
let floor = new Sprite(0, height + 25, 1520, 50, STATIC);
floor.color = 'red';
floor.stroke = 'red';

// Reset text style for HUD and in-game messages.
function setGameTextStyle() {
	textSize(32);
	fill('white');
	stroke('black');
	strokeWeight(1);
	textAlign(LEFT, TOP);
	allSprites.stroke = 'black';
}

// Starts or restarts the game by resetting the world, player position, and initial tiles.
function startGame() {
	scaleCamera();
	setGameTextStyle();

	// Clear any existing spawners from a previous run.
	spawner.removeAll?.();

	player.x = 0;
	player.y = 30;
	player.vel.y = 0;
	player.vel.x = 0;
	player.image = 'images/various monke/monke_right (2).png';
	player.ani = null;
	player.visible = true;
	player.autoDraw = true;
	facing = 'right';

	// Position the floor and spawn the initial spawners.
	floor.y = height / 2 / scale + floor.h / 2;
	new spawner.Sprite(300, -300);
	new spawner.Sprite(-300, -300);

	// Create the starting set of platforms for the player to jump on.
	platforms.addTiles(startTile, -700, -665, 100, 200);

	// Create invisible left/right boundary walls for the playable area.
	for (let i = 0; i < 15; i++) {
		let y = (i - 7) * 100;
		new walls.Sprite(-755, y);
		new walls.Sprite(755, y);
	}

	score = 0;
	scroolSpeed = startScroolSpeed;
}

// Returns true if the player is standing on a platform, barrel, or still within jump grace frames.
function playerOnGround() {
	for (let plat of platforms) {
		if (player.collides(plat)) {
			// Player is landing on top of a platform.
			if (player.y + player.h / 2 <= plat.y) {
				frames = 0;
				return true;
			}
		}
	}

	// Allow the player to land on barrels with some tolerance for position.
	for (let plat of barels) {
		let yOff = player.y - plat.y + player.h / 2 + barels.d / 2;
		if (yOff <= 0 && yOff >= -barelJumpH) {
			let xOff = Math.abs(player.x - plat.x - player.w / 2 - barels.d / 2);
			if (xOff <= barelJumpW) {
				frames = 8;
				return true;
			}
		}
	}

	// If the player recently left the ground, still allow a short jump grace period.
	frames++;
	if (frames < jumpFrames) {
		return true;
	}
	for (let plat of platforms) {
		if (player.colliding(plat)) {
			if (player.y + player.h / 2 <= plat.y) {
				return true;
			}
		}
	}

	return false;
}

// Apply horizontal movement and jump input to the player.
function move() {
	if (keyIsDown(LEFT_ARROW)) {
		facing = 'left';
		if (player.vel.x > -speed) {
			player.vel.x -= acel;
		}
	} else if (keyIsDown(RIGHT_ARROW)) {
		facing = 'right';
		if (player.vel.x < speed) {
			player.vel.x += acel;
		}
	}

	// Jump when the player is grounded and presses space, up, or clicks.
	if ((mouse.presses() || kb.presses(' ') || kb.presses('up')) && onGround) {
		frames = 10;
		onGround = false;
		player.vel.y += jump;
		if (player.vel.y < jump) {
			player.vel.y = jump;
		} else if (player.vel.y > jump / 2) {
			player.vel.y = jump / 2;
		}
	}
}

// Update the player's displayed image depending on movement and jump state.
function updatePlayerSprite() {
	if (!onGround) {
		player.image = facing === 'left'
			? 'images/various monke/monke_jump_left (1).png'
			: 'images/various monke/monke_jump_right (1).png';
		return;
	}

	if (keyIsDown(LEFT_ARROW) || Math.abs(player.vel.x) > 0.5) {
		player.image = facing === 'left'
			? 'images/various monke/monke_walking_left (2).png'
			: 'images/various monke/monke_walking_right (3).png';
		return;
	}

	player.image = 'images/various monke/monke_right (2).png';
}

// Spawn barrels from each spawner when the frame counter reaches 60.
function spawn(t) {
	if (t == 60) {
		score++;
		let offSet = barels.d / 2;
		for (let tempSpawn of spawner) {
			let x = tempSpawn.x;
			let y = tempSpawn.y - barels.d / 2 + spawner.h / 2;
			let a = new barels.Sprite(x - offSet, y);
			a.vel.x = -barelSpeed;
			let b = new barels.Sprite(x + offSet, y);
			b.vel.x = barelSpeed;
		}
	}
}

// Returns true if a barrel collision ends the game.
function checkDefeat() {
	for (let plat of barels) {
		if (player.collides(plat)) {
			return true;
		}
	}
	return false;
}

// Draw the game over screen and wait for a click to return to the title.
function gameOverScreen() {
	background(20, 20, 30);
	textAlign(CENTER, CENTER);

	textSize(90);
	fill('red');
	stroke('black');
	strokeWeight(6);
	text('GAME OVER', 0, -140);

	textSize(42);
	fill('white');
	strokeWeight(3);
	text('Score: ' + score, 0, -40);

	textSize(28);
	fill('#ffd166');
	strokeWeight(2);
	text('Click to return to title screen', 0, 20);

	if (mouse.presses()) {
		titleScreen = true;
		gameOver = false;
	}
}

// End the current game and remove all active sprites from the world.
function endGame() {
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

// Register overlap callbacks for the floor.
floor.overlaps(player, endGame);

function clearWorld(floor, sprite, dur) {
	sprite.delete();
}

floor.overlaps(barels, clearWorld);
floor.overlaps(platforms, clearWorld);

// Check whether there is enough empty space above the top of the screen to spawn more tile rows.
function shouldSpawnTile() {
	for (let plat of platforms) {
		if (plat.y < -470) {
			return false;
		}
	}
	return true;
}

// Spawn platform tiles in random positions and optionally spawn extra platforms.
function spawnTile() {
	// Build a list of unused tile pattern indices.
	let aTiles = [];
	for (let i = 0; i < tiles.length; i++) {
		aTiles.push(i);
	}

	let index1 = Math.floor(Math.random() * aTiles.length);
	let tile = [aTiles[index1], 0];
	aTiles.splice(index1, 1);

	let index2 = Math.floor(Math.random() * aTiles.length);
	tile[1] = aTiles[index2];
	aTiles.splice(index2, 1);

	platforms.addTiles(tiles[tile[0]], -700, -665, 100, 200);
	platforms.addTiles(tiles[tile[1]], -700, -665, 100, 200);

	let i = 2;
	let spawnChance = 4;
	while (Math.random() * spawnChance > scroolSpeed && aTiles.length > 5) {
		let index = Math.floor(Math.random() * aTiles.length);
		tile.push(aTiles[index]);
		aTiles.splice(index, 1);
		platforms.addTiles(tiles[tile[i]], -700, -665, 100, 200);
		spawnChance -= 0.4;
		i++;
	}
}

// Move dynamic objects downward as the world scrolls.
function scrool() {
	player.y += scroolSpeed / 60;
	for (let plat of barels) {
		plat.y += scroolSpeed / 60;
	}
}

// Increase scroll speed over time until a maximum limit.
function scaleDifficulty() {
	if (scroolSpeed < 3) {
		scroolSpeed += scaleSpeed;
	}
}

// Display the title screen with instructions and start prompt.
function displayTitleScreen() {
	player.x = 1000;
	player.y = 50;
	player.image = 'images/various monke/monke_right (2).png';
	player.visible = true;
	player.autoDraw = true;
	facing = 'right';
	camera.x = 0;
	camera.y = 0;
	camera.zoomTo(1);

	background(135, 206, 235);
	textAlign(CENTER, CENTER);

	textSize(100);
	fill('#ffdd00');
	stroke('#d17d00');
	strokeWeight(8);
	text('Going Bana-nas!', 0, -220);

	textSize(34);
	fill('white');
	stroke('black');
	strokeWeight(3);
	text('Use ← → Arrow Keys to Move', 0, -70);
	text('Outrun the scrolling screen!', 0, -10);
	text('Avoid the falling barrels!', 0, 50);

	fill('#ffef99');
	text('Jump on barrels if you dare!', 0, 110);

	textSize(42);
	fill('#00ff88');
	stroke('black');
	strokeWeight(4);
	text('CLICK TO START', 0, 220);

	if (mouse.presses()) {
		startGame();
		titleScreen = false;
		playing = true;
	}
}

// Main game loop called while the player is actively playing.
function play() {
	player.vel.y += 3 / 60; // apply a small downward force for gravity
	frameTime++;
	onGround = playerOnGround();
	move();
	updatePlayerSprite();
	spawn(frameTime);
	scrool();

	if (shouldSpawnTile()) {
		spawnTile();
	}

	if (checkDefeat()) {
		endGame();
	}

	if (frameTime > spawnTime) {
		score++;
		frameTime = 0;
		scaleDifficulty();
	}

	fill('white');
	stroke('black');
	text('score: ' + score, -width / 2 + 50, -height / 2 + 50);
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