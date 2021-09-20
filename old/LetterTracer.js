

class LetterTracer {
    
    static defaults = {
		width: 					300,
		height: 				300,
		text:				"A B C",
		fontFamily:		"helvetica",
		fontSize:				 96,
		textColor:		"lightGrey",
		lineColor: 		  "#16264c",						//dark shade of blue
		
		parent: 		null								// replaced by <body> if needed
    }
    
    constructor(params) {
		this.params = {};

		Object.assign(this.params, { ...LetterTracer.defaults ,...params });

		this.createCanvas();
	}

	createCanvas() {
		const parent = this.params.parent ? this.params.parent : document.querySelector("body")

		this.canvas =  document.createElement("canvas");
		
		this.canvas.setAttribute("width",this.params.width);
		this.canvas.setAttribute("height",this.params.height);

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
		
		this.canvas.onpointerdown = this.pointerDown.bind(this);
		this.canvas.onpointermove = this.pointerMove.bind(this);
		this.canvas.onpointerup   = this.pointerUp.bind(this);

		this.reset();
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
		this.strokes = [];
		this.tracing = false;

		// wait for font to be loaded
		document.fonts.load(this.font).then( this.show.bind(this) ); 
	}

	/**
	 * Handle a pointerdown event
	 * @param {*} event 
	 */
	pointerDown(event) {
		this.tracing = true;
		this.stroke = new Stroke(event);
		this.strokes.push(this.stroke);
		this.show();
	}

	/**
	 * Handle a pointermove event
	 * @param {*} event 
	 */
	pointerMove(event) {
		if(this.tracing)
			this.stroke.addPoint(event);
		this.show();
	}

	/**
	 * Handle a pointerup event
	 * @param {*} event 
	 */
	pointerUp(event) {
		this.tracing = false;
		this.show();
	}

	/**
	 * Show the content on canvas
	 */
	show() {
		const gc = this.gc;
		const params = this.params;

		this.canvas.width = this.canvas.width;

		gc.textAlign ="center";
		gc.textBaseline = "middle";
		gc.fillStyle = params.textColor;
		gc.font = this.font;
		gc.fillText(params.text,this.canvas.width/2,this.canvas.height/2);

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

