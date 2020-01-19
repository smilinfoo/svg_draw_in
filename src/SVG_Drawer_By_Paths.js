export default class SVG_Drawer_By_Paths
{
	//
	constructor()
	{
		console.log("CONSTRUCTOR");
		//draw elements
		this.canvas;
		this.ctx;

		//config
		this.updateRef = this.update.bind(this);
		this.speed = 1; //segments per ms;
		this.start = null;
		this.canvasClass = 'svg_draw_canvas';

		//set up buffers
		this.lastIndex = 0;
		this.actions = [];
		this.last = { x: 0, y: 0 };

		//should be destroyed
		this.kill = false;

		this.completeCallback = 0;

	}

	//Add a custom css class or classes to the canvas object
	//call only once, passes strings are nto appended to previous class, passed string replaces the old class
	//better to manage css from parent node, this here if needed
	//must be called before init
	additionalCanvasClass(classString)
	{
		this.canvasClass = classString;
	}

	//initialize the object with an svg to parse, a canvas to draw to and a complete callback (not required)
	//no other calls can be made until after this is set
	//returns the number of draw commands found - to be used if controlling draw speed.
	init(svg, canvasTarget, completeCallback) 
	{

		this.completeCallback = (completeCallback === undefined) ? null : completeCallback;

		this.paths = svg.getElementsByTagName('path');
		this.canvas = document.createElement('canvas');


		var height, width, temp;
		if (svg.getAttribute("height") && svg.getAttribute("width")) {
			height = svg.getAttribute("height");
			width = svg.getAttribute("width");
		} else {
			temp = svg.getAttribute("viewBox").split(' ');
			width = temp[2] - temp[0];
			height = temp[3] - temp[1];
		}

		this.speed = svg.getAttribute("speed") ? svg.getAttribute("speed") : this.speed;

		this.canvas.width = width;
		this.canvas.height = height;
		canvasTarget.appendChild(this.canvas);
		this.ctx = this.canvas.getContext('2d');
		this.canvas.classList.add(this.canvasClass);

		return this.fillBuffers();
	}

	//Set the number of path actions ber sercond
	//will override runtime
	setSpeed(pathsPerSecond)
	{
		//TODO:
		//confirm it is a number
		this.speed = ((pathsPerSecond === undefined) ? 1 : pathsPerSecond)/1000;
	}

	//set total time of animation
	//will override pathsPerSecond
	setRunTime(totalTimeInSeconds)
	{
		//TODO:
		//confirm svg loaded and buffers filled
		var speed =  this.actions.length / totalTimeInSeconds;
		console.log(speed + " to get to " + this.actions.length);
		this.setSpeed(speed);
	}

	//set color
	setColor(colroHex)
	{
		colroHex = (colroHex === undefined) ? '#ffffff' : colroHex;
 		//TODO:
		//Confirm color or correct
		this.ctx.strokeStyle = colroHex;
	}

	//callback used when the animation is complete
	setCallback(callbackFunction)
	{
		this.completeCallback = callbackFunction;
	}

	//start it all up
	start_draw()
	{
		//TODO:
		//check if buffers set - if not dont start and raise error

		//TODO:
		//guard from a sceond draw call until complete

		//reset timer and counter
		this.progress = 0;
		this.runTIme = 0;

		this.update();
	}

	//remove the 
	destroy() 
	{
		this.kill = true;
		this.canvas.parentNode.innerHTML = '';
		this.canvas = null;
	}

	fillBuffers() 
	{
		this.actions = [];

		for (var i = 0; i < this.paths.length; i++) {
			var string = this.paths[i].getAttribute("d");
			var regexSegments = new RegExp('([A-Za-z])+([^A-Za-z]*)', 'g');
			var regexCoords = /([-]+[^-,]*|\d+[^-,]*)/g;

			var m = undefined;
			var coords = undefined;

			while ((m = regexSegments.exec(string)) !== null) {
				if (m.index === regexSegments.lastIndex) {
					regexSegments.lastIndex++;
				}
				var action = [m[1]];

				while ((coords = regexCoords.exec(m[2])) !== null) {
					if (coords.index === regexCoords.lastIndex) {
						regexCoords.lastIndex++;
					}

					action.push(Number(coords[1]));
				}
				this.actions.push(action);
			}
		}
		
		return this.actions.length;
	}

	draw()
	{
		var length = this.actions.length;
		for (var i = 0; i < length; i++) {
			this.doAction(this.actions[i]);
		}
	}

	doAction(inst) 
	{
		if (inst === undefined) return;
		this.ctx.beginPath();
		this.ctx.lineWidth = 1;
		switch (inst[0]) {
			case "z":
				//fill not suppoerted
				break;
			case 'm':
				this.dom(inst);
				break;
			case 'M':
				this.doM(inst);
				break;
			case 'c':
				this.doc(inst);
				break;
			case 'C':
				this.doC(inst);
				break;
			case 'l':
				this.dol(inst);
				break;
			case 'L':
				this.doL(inst);
				break;
		}
		this.ctx.stroke();
	}


	dom(inst)
	{
		for (var i = 1; i < inst.length; i += 2) {
			this.last.x += inst[i];
			this.last.y += inst[i + 1];
		}
	}

	doM(inst)
	{
		for (var i = 1; i < inst.length; i += 2) {
			this.ctx.moveTo(0, 0);
			this.last.x = inst[i];
			this.last.y = inst[i + 1];
		}
	}

	dol(inst)
	{
		for (var i = 1; i < inst.length; i += 2) {
			this.ctx.moveTo(this.last.x, this.last.y);
			this.last.x += inst[i];
			this.last.y += inst[i + 1];
			this.ctx.lineTo(this.last.x, this.last.y);
		}
	}

	doL(inst)
	{
		for (var i = 1; i < inst.length; i += 2) {
			this.ctx.moveTo(this.last.x, this.last.y);
			this.last.x = inst[i];
			this.last.y = inst[i + 1];
			this.ctx.lineTo(this.last.x, this.last.y);
		}
	}

	doc(inst)
	{
		for (var i = 1; i < inst.length; i += 6) {
			this.ctx.moveTo(this.last.x, this.last.y);
			this.ctx.bezierCurveTo(this.last.x + inst[i], this.last.y + inst[i + 1], this.last.x + inst[i + 2], this.last.y + inst[i + 3], this.last.x + inst[i + 4], this.last.y + inst[i + 5]);
			this.last.x += inst[i + 4];
			this.last.y += inst[i + 5];
		}
	}

	doC(inst)
	{
		for (var i = 1; i < inst.length; i += 6) {
			this.ctx.moveTo(this.last.x, this.last.y);
			this.ctx.bezierCurveTo(inst[i], inst[i + 1], inst[i + 2], inst[i + 3], inst[i + 4], inst[i + 5]);
			this.last.x = inst[i + 4];
			this.last.y = inst[i + 5];
		}
	}

	update(timestamp)
	{
		if (this.kill) return;
		if (!this.start) this.start = timestamp;
		this.runTIme = timestamp - this.start;
		this.progress = Math.min(this.runTIme * this.speed, this.actions.length);

		var leadIndex = Math.floor(this.progress);

		this.drawTo(leadIndex);

		if (isNaN(this.progress) || this.progress < this.actions.length) {
			requestAnimationFrame(this.updateRef);
		}
		else
		{
			if(this.completeCallback)
			{
				this.completeCallback();
			}
		}
	}

	//draw upto a given action index,
	updateByActionNumber(actionNumber)
	{
		this.drawTo(actionNumber);
	}

	//draw to a given percentage complete (0-1)
	updateByPercentComplete(percent_complete)
	{
		percent_complete = Math.min(percent_complete, 1);
		this.drawTo(  Math.floor(percent_complete*this.actions.length)  );
	}

	drawTo(leadIndex)
	{
		if(leadIndex <= this.lastIndex) return;

		for (var i = this.lastIndex; i < leadIndex; i++) {
			//TODO:
			//BREAK on count bigger than action counts
			this.doAction(this.actions[i]);
		}

		this.lastIndex = leadIndex;
	}
}

export {SVG_Drawer_By_Paths}