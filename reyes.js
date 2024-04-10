`use strict`

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
class Vector {
	constructor(x = null,y = null){
		this.x = x;
		this.y = y;
	};
}

class Eye{
	constructor(center,width,ctx,canvas){
		this.theta = new Vector();


		this.ctx = ctx;
		this.canvas = canvas;
		this.center = center;

		this.width = width;
	};

	drawEyeBall(){	
		this.radius = (this.width/2)*REF_WHITE;
		this.iris = (this.width/2)*REF_IRIS;

		this.ctx.fillStyle = COLOR_LINE;	
		this.ctx.beginPath();
		this.ctx.ellipse(this.center.x,this.center.y,this.width/2,(this.width/2)*REF_ASPECT_SINGLE,0,0,Math.PI*2,true);
		this.ctx.fill();
		this.ctx.closePath();

		this.clearIris();
	}

	drawIris(theta){	
		this.theta = theta;

		let x = (this.radius*Math.sin(this.theta.x)) + this.center.x;
		let y = (this.radius*Math.sin(this.theta.y)) + this.center.y;

		let strech_x = 1/Math.cos(this.theta.x);
		let strech_y = 1/Math.cos(this.theta.y);
		this.ctx.fillStyle = COLOR_IRIS;

		this.ctx.beginPath();
		let rot = -(Math.atan2(x-this.center.x,y-this.center.y));
		
		this.ctx.beginPath();
		this.ctx.fillStyle = COLOR_IRIS;
		this.ctx.ellipse(x,y,this.radius*REF_IRIS*strech_x,this.radius*REF_IRIS*strech_y*REF_ASPECT_SINGLE,0,0,Math.PI*2,true);  // 見る人からみて正円に見えるように
		this.ctx.fill();
		this.ctx.closePath();
	};

	drawErrIris(){
		this.ctx.strokeStyle = COLOR_IRIS;
		this.ctx.drawImage(cross,this.center.x-this.radius*REF_IRIS,this.center.y-this.radius*REF_IRIS,2*this.radius*REF_IRIS,2*this.radius*REF_IRIS*REF_ASPECT_SINGLE);
		return;
		/*
		this.ctx.font=`${this.radius*REF_IRIS}px serif`;
		this.textAlign = "center";
		this.textBaseline = 'middle';
		this.ctx.fillText("の",this.center.x,this.center.y);
		*/

	};

	clearIris(){	
		this.ctx.fillStyle = COLOR_WHITE;
		this.ctx.beginPath();
		this.ctx.ellipse(this.center.x,this.center.y,this.radius,this.radius*REF_ASPECT_SINGLE,0,0,Math.PI*2,true);
		this.ctx.fill();
		this.ctx.closePath();
		return;
	};

	udateSize(width){
		this.width = width;
		this.drawEyeBall();
		return;
	};
}

class Eyes{
	constructor(ctx,canvas){
		this.ctx = ctx;
		this.canvas = canvas;
		this.distance = REF_CANVAS_TO_DISTANCE*this.canvas.width;
		this.singl_width = REF_CANVAS_TO_SINGLE*this.canvas.width;


		this.center = new Vector(this.canvas.width/2,this.canvas.height/2);
		this.eyes = [];
		this.lcenter = new Vector(this.center.x/2,this.center.y);
		this.rcenter = new Vector(3*this.center.x/2,this.center.y);

		this.leye = new Eye(this.lcenter,this.singl_width,this.ctx,this.canvas);
		this.reye = new Eye(this.rcenter,this.singl_width,this.ctx,this.canvas);
		this.eyes.push(this.leye);
		this.eyes.push(this.reye);


	};

	drawEyeBallAll(){
		this.eyes.forEach((e)=>e.drawEyeBall());
	}

	drawIrisAll(theta){
		this.eyes.forEach((e)=>e.drawIris(theta));
	};

	drawErrIrisAll(){
		this.eyes.forEach((e)=>e.drawErrIris());
	};


	clearIrisAll(){
		this.eyes.forEach((e)=>e.clearIris());
	};

	updateSizeAll(){
		this.distance = REF_CANVAS_TO_DISTANCE*this.canvas.width;
		this.singl_width = REF_CANVAS_TO_SINGLE*this.canvas.width;


		this.center = new Vector(this.canvas.width/2,this.canvas.height/2);
		this.eyes = [];
		this.lcenter = new Vector(this.center.x/2,this.center.y);
		this.rcenter = new Vector(3*this.center.x/2,this.center.y);

		this.leye = new Eye(this.lcenter,this.singl_width,this.ctx,this.canvas);
		this.reye = new Eye(this.rcenter,this.singl_width,this.ctx,this.canvas);
		this.eyes.push(this.leye);
		this.eyes.push(this.reye);
		this.drawEyeBallAll();
	};
}

class EyeInfo{
	constructor(id,theta){
		this.id = id;
		this.theta = theta;
	};
}

function clear_canvas(ctx,canvas){
	ctx.fillStyle = COLOR_BG;
	ctx.fillRect(0,0,canvas.width,canvas.height);
	return;
}


const AZ_FOV = 0.6561787179913949/2;

const DEFAULT_FOV = 0.2914567944778674;  // 半分でrad
const COLOR_IRIS = "#000000";
const COLOR_WHITE = "#FFFFFF";
const COLOR_LINE = "#000000";
const COLOR_BG = "#CCCCCC";


const RADIUS_WHITE = 100;

const REF_ASPECT_SINGLE = 4/3;
const REF_WHITE = 16/19;
const REF_IRIS = 3/16;
const REF_ASPECT_WINDOW = 2/3;

const REF_CANVAS_TO_SINGLE = 19/40;
const REF_CANVAS_TO_DISTANCE = 2/40;




async function getStream(){	
	let constrain = {
		audio: false,
		video: {
			//facingMode: { exact: "user" },  // これはPCにはきついOverconstrainedErrorが出る
			facingMode: "user" ,
		},
	}

	let stream = await navigator.mediaDevices.getUserMedia(constrain);

	const track = stream.getVideoTracks()[0];

	const capabilities = track.getCapabilities();

	let width;
	let height;
	let zoom;
	try{
		width = capabilities.width.max;
	} catch {
		width = 9999;
	}

	try{
		height = capabilities.height.max;
	} catch{
		height = 9999;
	}

	try{
		zoom = capabilities.zoom.min;
	} catch{
		zoom = 1.0;
	}


	let new_constrain = {
		audio: false,
		video: {
			facingMode: "user" ,
			width: {ideal: width},
			height: {ideal: height},
			zoom: {ideal: zoom},
		}
	}	
	
	let res = await track.applyConstraints(new_constrain);

	return stream;
}

window.addEventListener("load", async ()=>{	
	const cross = document.querySelector("#cross");

	const video = document.createElement("video");
	const stream = await getStream();
	video.srcObject = await getStream();	
	video.controls = true;
	video.autoplay = true;
	document.body.appendChild(video);

	const setting = stream.getTracks()[0].getSettings();
	const cameraDimention = {width: setting.width, height: setting.height};
	
	const canvas = document.createElement("canvas");

	const display_aspect = window.innerHeight/window.innerWidth;

	if(display_aspect <=  REF_ASPECT_WINDOW){
		canvas.height = window.innerHeight;
		canvas.width = window.innerHeight/REF_ASPECT_WINDOW;
	}
	else{
		canvas.width = window.innerWidth;
		canvas.height = window.innerWidth*REF_ASPECT_WINDOW;
	}

	document.body.appendChild(canvas);
	
	const ctx = canvas.getContext("2d");

	await faceapi.nets.tinyFaceDetector.loadFromUri("./face-api.js/weights");	

	let fov = DEFAULT_FOV;

	clear_canvas(ctx, canvas);

	const center = new Vector(canvas.width/2,canvas.height/2);
	
	const eyes = new Eyes(ctx,canvas);
	eyes.drawEyeBallAll();

	
	//let eye = new Eye(center,200,ctx,canvas);
	//eye.drawEyeBall();

	const eyeInfo = new EyeInfo(0,0);

	async function draw_loop(timeStamp){	
		const faces = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
		//const face = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());

		eyes.clearIrisAll();

		const n = faces.length;

		if(n === 0){
			//eyes.drawErrIrisAll();
			eyes.drawIrisAll(eyeInfo.theta);
		}
		else{
			const face = faces[0];	
			const theta = getTheta(face, fov,cameraDimention);
			eyes.drawIrisAll(theta);
			eyeInfo.theta = theta;
		}

		window.requestAnimationFrame(draw_loop);
	}

	window.addEventListener("resize", ()=>{	
		const display_aspect = window.innerHeight/window.innerWidth;

		if(display_aspect <=  REF_ASPECT_WINDOW){
			canvas.height = window.innerHeight;
			canvas.width = window.innerHeight/REF_ASPECT_WINDOW;
		}
		else{
			canvas.width = window.innerWidth;
			canvas.height = window.innerWidth*REF_ASPECT_WINDOW;
		}
		clear_canvas(ctx, canvas);
		eyes.updateSizeAll();
	});

	canvas.addEventListener("click", ()=>{
	});
	
	//window.requestAnimationFrame(draw_loop);
	await delay(1000);
	await draw_loop();

});

function getTheta(face,fov,cameraDimention){
	let camdim = cameraDimention;
	let vexc = face._box._x;
	let veyc = face._box._y;
	let vew = face._box._width;
	let veh = face._box._height;

	let vex = vexc + vew/2;
	let vey = veyc + veh/2;

	let factor_x = (vex-(camdim.width/2))/(camdim.width/2);
	let factor_y = (vey - (camdim.height/2))/(camdim.height/2);

	let theta_x = -Math.atan(factor_x*Math.tan(fov));
	let theta_y = Math.atan(factor_y*Math.tan(fov));

	return {x: theta_x, y:theta_y};
}


