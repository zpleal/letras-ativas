

class GamePanel {
    
    static defaults = {
		width: 					300,
		height: 				300,
		text:				"A B C",
		fontFamily:		"helvetica",
		fontSize:				 96,
		textColor:		"lightGrey",
		lineColor: 		  "#16264c",						//dark shade of blue
		radius:                  20,
		parent: 		null,								// replaced by <body> if needed
		image:          null
    }
    
    constructor(params) {
		this.params = {};

		Object.assign(this.params, { ...GamePanel.defaults ,...params });

		this.createCanvas();

		this.doTrace();

		this.reset();

	}

	recreateCanvas() {
		this.canvas.parentNode.removeChild(this.canvas);

		this.createCanvas();	

		
	}

	createCanvas() {
		const parent = this.params.parent ? this.params.parent : document.querySelector("body")

		this.computeSize();

		this.canvas =  document.createElement("canvas");
		
		this.canvas.setAttribute("width",this.width);
		this.canvas.setAttribute("height",this.height);

		parent.appendChild(this.canvas);
		this.gc = this.canvas.getContext("2d");

		/*
		 * After a short period of time, the (mobile) browser will claim the pointermove event
		 * for "native" behavior like panning the page.
		 *
         * The designed, simple solution is to use the css property touch-action and set it 
		 * to none on the container that has the event handler.
		 * https://stackoverflow.com/questions/48124372/pointermove-event-not-working-with-touch-why-not
		*/
		this.canvas.style.touchAction = "none";
	
	}

	computeSize() {
		const win = window;
    	const docElement = document.documentElement;
    	const body = docElement.getElementsByTagName('body')[0];
    	
		this.width  = win.innerWidth  || docElement.clientWidth  || body.clientWidth;
    	this.height = win.innerHeight || docElement.clientHeight || body.clientHeight;
		
	}

	/**
	 * Interact with the game panel by tracing
	 */
	doTrace() {
		this.canvas.onpointerdown = this.tracePointerDown.bind(this);
		this.canvas.onpointermove = this.tracePointerMove.bind(this);
		this.canvas.onpointerup   = this.tracePointerUp.bind(this);
	}

	/**
	 * Interact with the game panel by tapping
	 */
	doTap() {
		this.canvas.onpointerdown = this.tapPointerDown.bind(this);
		this.canvas.onpointermove = null;
		this.canvas.onpointerup   = null;
	}


	/**
	 * @param {string} value
	 */
	 set text(value) {
		this.params.text = value;
		this.reset();
	}

	/**
	 * @param {string} value
	 */
	set fontFamily(value) {
		this.params.fontFamily = value;
		this.reset();
	}

	set fontSize(value) {
		this.params.fontSize = value;
		this.reset();
	}

	/**
	 * Forget all paths and redraw, when selected font is available
	 */
	reset() {
		this.points  = [];
		this.strokes = [];
		this.tracing = false;

		// wait for font to be loaded
		document.fonts.load(this.font).then( this.showTraces.bind(this) ); 
	}

	/**
	 * Handle a pointerdown event when tappi
	 * @param {*} event 
	 */
	tapPointerDown(event) {
			this.points.push(new Point(event));
			this.showTaps();
		}

	/**
	 * Handle a pointerdown event when tracing
	 * @param {*} event 
	 */
	tracePointerDown(event) {
		this.tracing = true;
		this.stroke = new Stroke(event);
		this.strokes.push(this.stroke);
		this.showTraces();
	}

	/**
	 * Handle a pointermove event  when tracing
	 * @param {*} event 
	 */
	tracePointerMove(event) {
		if(this.tracing)
			this.stroke.addPoint(event);
		this.showTraces();
	}

	/**
	 * Handle a pointerup event  when tracing
	 * @param {*} event 
	 */
	tracePointerUp(event) {
		this.tracing = false;
		this.showTraces();
	}

	/**
	 * Show taps ver the background on canvas
	 */
	 showTaps() {
		const gc = this.gc;
		const params = this.params;

		this.showBackgroundImage();

		for(let point of this.points) {
			gc.beginPath();
			gc.arc(point.x, point.y, params.radius, 0, 2 * Math.PI, false);
			gc.fillStyle = 'grey';
			gc.fill();
		}
	 }

	/**
	 * Show traces over the background on canvas
	 */
	showTraces() {
		const gc = this.gc;
		const params = this.params;

		this.showBackgroundImage();

		gc.fillStyle = this.params.lineColor;
		for(let stroke of this.strokes) {
			gc.beginPath();
			
			let first = true;
			for(let point of stroke.points)
				if(first) {
					gc.moveTo(point.x,point.y);
					first = false;
				} else
					gc.lineTo(point.x,point.y);
			gc.stroke();
		}

	}

	showBackgroundImage() {
		this.canvas.width = this.canvas.width;

		if(this.image)
			this.gc.drawImage(this.image,0,0,this.width,this.height);
	}

	/**
	 * Font configuration string with size and family 
	 */
	get font() {
		return `${this.params.fontSize}px ${this.params.fontFamily}`
	}

}

class Stroke {

	constructor(event) {
		
		this.points  = [ new Point(event) ];
	}

	addPoint(event) {
		this.points.push(new Point(event));
	}

}

class Point {

	constructor(event) {
		// Convert absolute to relative coordinates
		const bounds = event.target.getBoundingClientRect();

		this.x			= event.clientX - bounds.left;
		this.y			= event.clientY - bounds.top;
		this.time 		= new Date();

		this.pressure	= event.pressure;
		this.tilt		= event.tilt;

		this.type		= event.pointerType;
	}


}

