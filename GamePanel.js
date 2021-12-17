

class GamePanel {
    
    static defaults = {
		width: 					300,
		height: 				300,
		text:				"A B C",
		fontFamily:		"helvetica",
		fontSize:				 96,
		color: 		      "#16264c",						//dark shade of blue
		size:					 50,
		radius:                  20,
		parent: 		null,								// replaced by <body> if needed
    }
    
    constructor(params) {
		this.params = {};

		Object.assign(this.params, { ...GamePanel.defaults ,...params });

		this.createCanvas();

		this.mode  = "trace";
		this.image = null;

		this.tapImage = new Image();
		this.tapImage.src = "fingerprint.png";
		this.tapImage.onerror = (error) => console.log(error);

		this.reset();

	}

	readjust() {
		this.canvas.parentNode.removeChild(this.canvas);

		this.createCanvas();	

		this.mode =  this.mode; // reset mode

		this.show();
	}

	/**
	 * Create a canvas to cover all the available screen
	 */
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

		this.reset();
	}

	/**
	 * Assign width and height properties to reflect the available screen size
	 */
	computeSize() {
		const win = window;
    	const docElement = document.documentElement;
    	const body = docElement.getElementsByTagName('body')[0];
    	
		this.width  = win.innerWidth  || docElement.clientWidth  || body.clientWidth;
    	this.height = win.innerHeight || docElement.clientHeight || body.clientHeight;
		
	}

	/**
	 * Change background image URL.
	 * Setting the current URL produces no effect.
	 * Changing the URL of setting it for the first time resets the drawing
	 */
	set imageURL(url) {
		if(!this.image || this.image.src !== url ) {
			this.image = new Image();
			this.image.onload = this.show.bind(this);
			this.image.onerror = (error) => alert(error);
			this.image.src = url;
			this.reset();
		}
	}

	/**
	 * URL of current background image 
	 */
	get imageURL() {
		return this.image.src;
	}

	/**
	 * Change interaction mode. Current values are:
	 * 	trace - lines with stylus, finger or mouse 
	 * 	tap - to create small circles
	 */
	set mode(value) {
		const willBeTrace = value === "trace";
		const needsReset = willBeTrace !== this.isTrace;

		switch(value) {
			case "trace":
			this.canvas.onpointerdown = this.tracePointerDown.bind(this);
			this.canvas.onpointermove = this.tracePointerMove.bind(this);
			this.canvas.onpointerup   = this.tracePointerUp.bind(this);
			break;
			case "tap":
			this.canvas.onpointerdown = this.tapPointerDown.bind(this);
			this.canvas.onpointermove = null;
			this.canvas.onpointerup   = null;
			break;
			default:
				throw new Error(`invalid mode ${mode}`);
		}

		this.isTrace = willBeTrace;

		if(needsReset)
			this.reset;
	}

	/**
	 * Get current mode. Vailables modes are "trace" and "tap".
	 * The former is the default
	 */
	get mode() {
		return this.isTrace ? "trace" : "tap";
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

	set color(value)  {
		this.params.color = value;
	}

	get color() {
		return this.params.color;
	}

	set size(value)  {
		this.params.size = value;
	}

	get size() {
		return this.params.size;
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
	 * Show according to mode
	 */
	show() {
		if(this.isTrace)
			this.showTraces();
		else
			this.showTaps();
	}

	/**
	 * Show taps ver the background on canvas
	 */
	 showTaps() {
		const gc = this.gc;
		const params = this.params;
		const size = this.params.size;

		this.showBackgroundImage();

		for(let point of this.points) {
			/*
			gc.fillStyle = params.color
			gc.fillRect(0, 0, this.width, this.height);
			gc.globalCompositeOperation = "destination-in";
			*/
			gc.drawImage(this.tapImage , point.x, point.y,size,size);

			/*
			gc.beginPath();
			gc.arc(point.x, point.y, params.radius, 0, 2 * Math.PI, false);
			gc.fillStyle = 'grey';
			gc.fill();
			*/
		}
	 }

	/**
	 * Show traces over the background on canvas
	 */
	showTraces() {
		const gc = this.gc;
		const params = this.params;

		this.showBackgroundImage();

		gc.strokeStyle = this.params.color;
		gc.lineWidth = this.params.size / 10;
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

