await Canvas();
world.gravity.y = 10;

const jump = -8;
const acel = 1;
const speed = 5;
const jumpFrames = 10;
let frames = 0;
let onGround = false;
let player = new Sprite(0,0,50,DYNAMIC);
player.img = '🤪';

let tiles = [
	[
		'p  p  p  p  p',
		'  p   p    p '
	]
];

let platforms = new Group();
platforms.addTiles(tiles[0], -500, -200, 100, 10);
platforms.width = 100;
platforms.height = 10;
platforms.tile = "p";
function createPlatform(x, y){
 	let plat = new platforms.Sprite(x, y);
 }
createPlatform(0, 300);
let floor = new Sprite(0,380,1600,50,STATIC);

function playerOnGround(){
	for (let plat of platforms){
		if (player.collides(plat)){
			frames = 0;
			return true;
		}
	}
	if (player.collides(floor)){
		frames = 0;
		return true;
	}
	frames ++;
	if (frames < jumpFrames){
		return true;
	}
	for (let plat of platforms){
		if (player.colliding(plat)){
			return true;
		}
	}
	if (player.colliding(floor)){
		return true;
	}
	return false;
}

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

function play() {
	onGround = playerOnGround();
	move();
}
q5.update = function () {
	background('skyblue');
	text('click to jump!', 0, -50);
	play();
}