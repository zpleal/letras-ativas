const defaults = {
  width: 300,
  height: 300,
  text: "A B C",
  fontFamily: "helvetica",
  fontSize: 96,
  color: "#16264c",
  //dark shade of blue
  size: 50,
  radius: 20,
  baseTapImage: "fingerprint.png",
  // image for tapping (color will be appyied)
  parent: null // replaced by <body> if needed

};

class GamePanel {
  constructor(params) {
    this.params = {};
    Object.assign(this.params, defaults);
    Object.assign(this.params, params);
    this.createCanvas();
    this.mode = "trace";
    this.image = null;
    this.reset();
  }

  readjust() {
    this.canvas.parentNode.removeChild(this.canvas);
    this.createCanvas();
    this.adjustBackgroundImage();
    this.mode = this.mode; // reset mode

    this.show();
  }
  /**
   * Create a canvas to cover all the available screen
   */


  createCanvas() {
    const parent = this.params.parent ? this.params.parent : document.querySelector("body");
    this.computeSize();
    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute("width", this.width);
    this.canvas.setAttribute("height", this.height);
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
    if (this.changedDimension()) this.reset();
  }
  /**
   * Checks if this screen has actually changed dimensions of just rotated
   * @return true if dimensions changed and false otherwise
   */


  changedDimension() {
    const changed = (this.width !== this.previousWidth || this.height !== this.previousHeight) && (this.width !== this.previousHeight || this.height !== this.previousWidth);
    this.previousWidth = this.width;
    this.previousHeight = this.height;
    return changed;
  }
  /**
   * Assign width and height properties to reflect the available screen size
   */


  computeSize() {
    const win = window;
    const docElement = document.documentElement;
    const body = docElement.getElementsByTagName('body')[0];
    this.width = win.innerWidth || docElement.clientWidth || body.clientWidth;
    this.height = win.innerHeight || docElement.clientHeight || body.clientHeight;
  }
  /**
   * Change background image URL.
   * Setting the current URL produces no effect.
   * Changing the URL of setting it for the first time resets the drawing
   */


  set imageURL(url) {
    if (!this.image || !this.image.src.endsWith(url)) {
      this.image = new Image();

      this.image.onload = () => {
        this.adjustBackgroundImage();
        this.show();
      };

      this.image.onerror = error => alert(error);

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
   * 	trace - lines 
   * 	tap   - dots (image)
   * created stylus, finger or mouse  
   */


  set mode(value) {
    const willBeTrace = value === "trace";
    const needsReset = willBeTrace !== this.isTrace;

    switch (value) {
      case "trace":
        this.canvas.onpointerdown = this.tracePointerDown.bind(this);
        this.canvas.onpointermove = this.tracePointerMove.bind(this);
        this.canvas.onpointerup = this.tracePointerUp.bind(this);
        break;

      case "tap":
        this.canvas.onpointerdown = this.tapPointerDown.bind(this);
        this.canvas.onpointermove = null;
        this.canvas.onpointerup = null;
        this.makeTapImage();
        break;

      default:
        throw new Error(`invalid mode ${mode}`);
    }

    this.isTrace = willBeTrace;
    if (needsReset) this.reset();else this.show();
  }
  /**
   * Make an image to show taps (e.g. a fingerprint)
   * The image is sized and colored to the current selection
   * (aspect ration of original image is kept)
   */


  makeTapImage() {
    const fp = new Image();
    fp.src = this.params.baseTapImage;

    fp.onload = () => {
      const aspectRatio = fp.naturalWidth / fp.naturalHeight;
      const canvas = document.createElement("canvas");
      const gc = canvas.getContext("2d");
      const size = this.params.size;
      canvas.width = size;
      canvas.height = size / aspectRatio;
      gc.fillStyle = this.params.color;
      gc.fillRect(0, 0, canvas.width, canvas.height);
      gc.globalCompositeOperation = "destination-in";
      gc.drawImage(fp, 0, 0, canvas.width, canvas.height);
      this.tapImage = new Image();
      this.tapImage.src = canvas.toDataURL();

      this.tapImage.onerror = error => console.log(error);
    };

    fp.onerror = console.log;
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
    this.show();
  }
  /**
   * @param {string} value
   */


  set fontFamily(value) {
    this.params.fontFamily = value;
    this.show();
  }

  get fontSize() {
    return this.params.fontSize;
  }

  set color(value) {
    this.params.color = value;
    this.show();
  }

  get color() {
    return this.params.color;
  }

  set size(value) {
    this.params.size = value;
    this.show();
  }

  get size() {
    return this.params.size;
  }
  /**
   * Forget all paths and redraw, when selected font is available
   */


  reset() {
    this.points = [];
    this.strokes = [];
    this.tracing = false; // wait for font to be loaded

    document.fonts.load(this.font).then(() => this.show());
  }
  /**
   * Handle a pointerdown event when tapping
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
    if (this.tracing) this.stroke.addPoint(event);
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
    if (this.isTrace) this.showTraces();else this.showTaps();
  }
  /**
   * Show taps ver the background on canvas
   */


  showTaps() {
    const gc = this.gc;
    const params = this.params;
    const size = this.params.size;
    this.showBackgroundImage();

    for (let point of this.points) {
      gc.drawImage(this.tapImage, point.x - size / 2, point.y - size / 2, size, size);
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

    for (let stroke of this.strokes) {
      gc.beginPath();
      let first = true;

      for (let point of stroke.points) if (first) {
        gc.moveTo(point.x, point.y);
        first = false;
      } else gc.lineTo(point.x, point.y);

      gc.stroke();
    }
  }
  /**
   * Adjust background window transformation according to canvas
   * size and orientation (landscape or portrait).
   */


  adjustBackgroundImage() {
    const cWidth = this.width;
    const cHeight = this.height;
    const iWidth = this.image.naturalWidth;
    const iHeight = this.image.naturalHeight;

    if (cWidth < cHeight) {
      const xScale = cWidth / iHeight;
      const yScale = cHeight / iWidth;
      this.scale = Math.min(xScale, yScale);
      this.x0 = cWidth - (cWidth - iHeight * this.scale) / 2;
      this.y0 = (cHeight - iWidth * this.scale) / 2;
      this.rotate = Math.PI / 2;
    } else {
      const xScale = cWidth / iWidth;
      const yScale = cHeight / iHeight;
      this.scale = Math.min(xScale, yScale);
      this.x0 = (cWidth - iWidth * this.scale) / 2;
      this.y0 = (cHeight - iHeight * this.scale) * this.scale / 2;
      this.rotate = 0;
    }
  }
  /**
   * Show background image with computed adjustements.
   * This method should be called before drawing strokes or taps
   */


  showBackgroundImage() {
    if (this.image) {
      const gc = this.gc;
      this.canvas.width = this.canvas.width;
      gc.fillStyle = "white";
      gc.fillRect(0, 0, this.width, this.height);
      gc.save();
      gc.translate(this.x0, this.y0);
      gc.scale(this.scale, this.scale);
      gc.rotate(this.rotate);
      gc.drawImage(this.image, 0, 0);
      gc.restore();
    }
  }
  /**
   * Font configuration string with size and family 
   */


  get font() {
    return `${this.params.fontSize}px ${this.params.fontFamily}`;
  }

}

class Stroke {
  constructor(event) {
    this.points = [new Point(event)];
  }

  addPoint(event) {
    this.points.push(new Point(event));
  }

}

class Point {
  constructor(event) {
    // Convert absolute to relative coordinates
    const bounds = event.target.getBoundingClientRect();
    this.x = event.clientX - bounds.left;
    this.y = event.clientY - bounds.top;
    this.time = new Date();
    this.pressure = event.pressure;
    this.tilt = event.tilt;
    this.type = event.pointerType;
  }

}