// Created by Javi Agenjo @tamat
// https://github.com/jagenjo/htmlcubemap
// Usage: var cubemap = new HTMLCubemap("imgs/301_01_01_",".png","cubemap", {low_post_url: "_tn.png", width: 512,height: 512});

function HTMLCubemap(pre_url, post_url, container_id, options)
{
	options = options || {};

	this.pitch = 0;		//vertical orientation
	this.yaw = 0;		//horizontal orientation
	this.speed = 0.25;	//rotation velocity when dragging
	this.perspective = options.perspective || 300; //controls the fov

	this.faces = {};
	this.box_size = 512;
	this.border_margin = 0.4;

	this.pre_url = pre_url;
	this.post_url = post_url;

	var root = document.createElement("div");
	root.className = "htmlcubemap";
	var parent = document.getElementById(container_id);
	if(!parent) throw("parent node not found");
	parent.appendChild(root);
	this.root = root;
	var that = this;

	var rect = this.root.getClientRects()[0];
	if(options.width) root.style.width = options.width + "px";
	else root.style.width = rect.width + "px";
	if(options.height) root.style.height = options.height + "px";
	else root.style.height = rect.height + "px";
	root.style.backgroundColor = options.backgroundColor || "black";
	root.style.position = "relative";
	root.style.overflow = "hidden";

	root.addEventListener("mousedown",ondown);
	root.addEventListener("touchstart",ondown);
	var last_pos = [0,0];

	function ondown(e)
	{
		if(e.type == "touchstart")
		{
			document.addEventListener("touchmove",onmove);
			document.addEventListener("touchend",onup);
		}
		else
		{
			document.body.addEventListener("mousemove",onmove);
			document.body.addEventListener("mouseup",onup);
		}

		var rect = that.root.getClientRects()[0];
		last_pos = [ e.pageX - rect.left, e.pageY - rect.top ];

		e.stopPropagation();
		e.preventDefault();
		return false;

	}

	function onmove(e)
	{

		var rect = that.root.getClientRects()[0];
		var x = e.pageX - rect.left;
		var y = e.pageY - rect.top;
		var deltax = x - last_pos[0];
		var deltay = y - last_pos[1];

		that.yaw -= deltax * that.speed;
		that.pitch += deltay * that.speed;
		that.update();

		last_pos = [x,y];
		e.stopPropagation();
		e.preventDefault();
		return false;
	}

	function onup(e)
	{
		document.body.removeEventListener("mousemove",onmove);
		document.body.removeEventListener("mouseup",onup);
		document.body.removeEventListener("touchmove",onmove);
		document.body.removeEventListener("touchend",onup);

		e.stopPropagation();
		e.preventDefault();
		return false;
	}

	var center = document.createElement("div");
	center.className = "cubemapcenter";
	root.appendChild(center);
	this.center = center;
	this.center.style.transformStyle = "preserve-3d";
	this.center.style.mozTransformStyle = "preserve-3d";
	this.center.style.webkitTransformStyle = "preserve-3d";
	this.center.style.width = "100%";
	this.center.style.height = "100%";

	if(pre_url && options.low_post_url)
		this.load( pre_url, options.low_post_url);
	if(pre_url && post_url)
		this.load( pre_url, post_url);

	this.update();
}

HTMLCubemap.RIGHT = "0";
HTMLCubemap.LEFT = "1";
HTMLCubemap.TOP = "2";
HTMLCubemap.BOTTOM = "3";
HTMLCubemap.FRONT = "4";
HTMLCubemap.BACK = "5";

HTMLCubemap.prototype.load = function(pre_url, post_url)
{
	this.buildFace("front",pre_url + HTMLCubemap.FRONT + post_url);
	this.buildFace("left",pre_url + HTMLCubemap.LEFT + post_url);
	this.buildFace("right",pre_url + HTMLCubemap.RIGHT + post_url);
	this.buildFace("top",pre_url + HTMLCubemap.TOP + post_url);
	this.buildFace("bottom",pre_url + HTMLCubemap.BOTTOM + post_url);
	this.buildFace("back",pre_url + HTMLCubemap.BACK + post_url);
}

HTMLCubemap.prototype.buildFace = function(face, url)
{
	var element = document.createElement("div");
	element.className = "cubemapface " + face + "face";
	this.center.appendChild(element);

	var halfsize = this.box_size * 0.5 - this.border_margin;
	var transform = "";
	switch(face)
	{
		case 'front': transform = "translateZ(-"+halfsize.toFixed(1)+"px) rotateY(0deg) rotateX(180deg)"; break;
		case 'left': transform = "translateX(-"+halfsize.toFixed(1)+"px) rotateY(90deg) rotateX(180deg)"; break;
		case 'right': transform = "translateX("+halfsize.toFixed(1)+"px) rotateY(-90deg) rotateX(180deg)";break;
		case 'top': transform = "translateY(-"+halfsize.toFixed(1)+"px) rotateX(90deg)";break;
		case 'bottom': transform = "translateY("+halfsize.toFixed(1)+"px) rotateX(-90deg)";break;
		case 'back': transform = "translateZ("+halfsize.toFixed(1)+"px) rotateX(180deg) rotateY(180deg)";break;
		default: throw "wrong face";
	}

	element.style.position = "absolute";
	element.style.left = "0";
	element.style.top = "0";
	element.style.width = this.box_size + "px";
	element.style.height = this.box_size + "px";
	element.style.transform = transform;
	element.style.mozTransform = transform;
	element.style.webkitTransform = transform;

	//create image
	var that = this;
	var img = new Image();
	img.src = url;
	img.onload = function() {
		this.width = that.box_size;
		this.height = that.box_size;
		that.yaw += 0.1; //HACK: forces refresh
		that.update();
	};

	element.appendChild(img);

	//store
	if(this.faces[face])
		this.faces[face].parentNode.removeChild(this.faces[face]);
	this.faces[face] = element;
}

HTMLCubemap.prototype.update = function()
{
	var perspective = this.perspective;
	//perspective = 100 / Math.atan(0.0174532925 * this.fov);
	var distance = perspective;

	this.root.style.perspective = perspective.toFixed(0) + "px";
	this.root.style.webkitPerspective = perspective + "px";
	this.root.style.mozPerspective = perspective + "px";

	var rect = this.root.getClientRects()[0];
	var offsetX = (rect.width - this.box_size) * 0.5;
	var offsetY = (rect.height - this.box_size) * 0.5;
	var transform = "translateZ("+distance+"px) rotateX("+this.pitch.toFixed(1)+"deg) rotateY("+this.yaw.toFixed(1)+"deg) translateX("+offsetX+"px) translateY("+offsetY+"px)";
	this.center.style.transform = transform;
	this.center.style.webkitTransform = transform;
	this.center.style.mozTransform = transform;
}