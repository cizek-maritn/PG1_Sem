function startGame(AI) {
	var stats;

	var camera, controls, scene, parent, obj, cube, box, renderer;

	var dy = 0.01;
	var dx = 0.02;
	var id;

	// rychlost pálek
	var pdlSpd = 0.15;

	// na kterou stranu má na začátku letět míček
	var startDir = 1;

	// skore hráčů
	var p1score = 0;
	var p2score = 0; 

	// logická proměnná
	var roundStart = 1;

	// bugfix aby se kostka nezasekávala uvnitř pálky
	// trackuju jestli poslední kolize nastala od pálky, nebo ne
	var p1collision = 1;
	var p2collision = 1;

	var width = window.innerWidth;
	var height = window.innerHeight;

	init();
	animate();

	function init() {

		camera = new THREE.PerspectiveCamera( 60, width / height, 1, 1000 );
		camera.position.z = 6.0;

		controls = new THREE.TrackballControls( camera );
		controls.rotateSpeed = 4.0;
		controls.zoomSpeed = 1.2;
		controls.panSpeed = 0.8;
		controls.noZoom = false;
		controls.noPan = false;
		controls.staticMoving = true;
		controls.dynamicDampingFactor = 0.3;
		controls.keys = [ 65, 83, 68 ];
		controls.addEventListener( 'change', render );

		// Create scene hierarchy
		scene = new THREE.Scene();
		parent = new THREE.Object3D();
		obj = new THREE.Object3D();
		box = new THREE.Object3D();
		parent.add(obj);
		scene.add( parent );

		// Add helper object (bounding box)
		var box_geometry = new THREE.BoxGeometry( 11.01, 5.21, 1.01 );
		var box_mesh = new THREE.Mesh(box_geometry, null);
		var bbox = new THREE.BoundingBoxHelper( box_mesh, 0xffffff );
		bbox.update();
		scene.add(bbox);

		// Instantiate a loader
		var loader = new THREE.TextureLoader();
		
		// nacitani objektů
		// uvs na textuře pálek
		var long = [
			new THREE.Vector2(0,1),
			new THREE.Vector2(0,0),
			new THREE.Vector2(0.5,0),
			new THREE.Vector2(0.5,1)
		];
		var bot = [
			new THREE.Vector2(0.5,1),
			new THREE.Vector2(0.5,0.75),
			new THREE.Vector2(1,0.75),
			new THREE.Vector2(1,1)
		];
		var top = [
			new THREE.Vector2(0.5,0.75),
			new THREE.Vector2(0.5,0.5),
			new THREE.Vector2(1,0.5),
			new THREE.Vector2(1,0.75)
		];

		//funkce pro upřesnění uvs na modelu
		function updateVertexUvs(geometry) {
			geometry.faceVertexUvs[0][0] = [ long[0], long[1], long[3] ];
			geometry.faceVertexUvs[0][1] = [ long[1], long[2], long[3] ];

			geometry.faceVertexUvs[0][2] = [ long[0], long[1], long[3] ];
			geometry.faceVertexUvs[0][3] = [ long[1], long[2], long[3] ];

			geometry.faceVertexUvs[0][4] = [ top[0], top[1], top[3] ];
			geometry.faceVertexUvs[0][5] = [ top[1], top[2], top[3] ];

			geometry.faceVertexUvs[0][6] = [ bot[0], bot[1], bot[3] ];
			geometry.faceVertexUvs[0][7] = [ bot[1], bot[2], bot[3] ];

			geometry.faceVertexUvs[0][8] = [ long[0], long[1], long[3] ];
			geometry.faceVertexUvs[0][9] = [ long[1], long[2], long[3] ];

			geometry.faceVertexUvs[0][10] = [ long[0], long[1], long[3] ];
			geometry.faceVertexUvs[0][11] = [ long[1], long[2], long[3] ];
		}

		// načítání "míčku"
		loader.load(
			// URL of texture
			'textures/paddle_temp.png',
			// Function when resource is loaded
			function ( texture ) {
				// Create objects using texture
				var cube_geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
				var tex_material = new THREE.MeshBasicMaterial( { map: texture } );

				updateVertexUvs(cube_geometry);

				cube = new THREE.Mesh( cube_geometry, tex_material );
				obj.add( cube );

				// Call render here, because loading of texture can
				// take lot of time
				render();
			},
			// Function called when download progresses
			function ( xhr ) {
				console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
			},
			// Function called when download errors
			function ( xhr ) {
				console.log( 'An error happened' );
			}
		);

		// načítaní první pálky
		loader.load(
			// URL of texture
			'textures/paddle_p1.png',
			// Function when resource is loaded
			function ( texture ) {
				// Create objects using texture
				var paddle_geometry = new THREE.BoxGeometry( 0.5, 2, 0.5 );
				var material = new THREE.MeshBasicMaterial( { map: texture } );

				updateVertexUvs(paddle_geometry)

				paddle1 = new THREE.Mesh( paddle_geometry, material );
				obj.add( paddle1 );

				paddle1.position.x=-4.0;

				// Call render here, because loading of texture can
				// take lot of time
				render();
			},
			// Function called when download progresses
			function ( xhr ) {
				console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
			},
			// Function called when download errors
			function ( xhr ) {
				console.log( 'An error happened' );
			}
		);

		// načítání druhé pálky, je to Ctrl+C s jiným názvem proměnné, lépe mě to nenapadlo
		loader.load(
			// URL of texture
			'textures/paddle_p2.png',
			// Function when resource is loaded
			function ( texture ) {
				// Create objects using texture
				var paddle_geometry = new THREE.BoxGeometry( 0.5, 2, 0.5 );
				var material = new THREE.MeshBasicMaterial( { map: texture } );

				updateVertexUvs(paddle_geometry)

				//tady je jediná změna
				paddle2 = new THREE.Mesh( paddle_geometry, material );
				obj.add( paddle2 );

				paddle2.position.x=4.0;

				// Call render here, because loading of texture can
				// take lot of time
				render();
			},
			// Function called when download progresses
			function ( xhr ) {
				console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
			},
			// Function called when download errors
			function ( xhr ) {
				console.log( 'An error happened' );
			}
		);

		// nacitani skore
		loader.load(
			// URL of texture
			'textures/0.png',
			// Function when resource is loaded
			function ( texture ) {
				// Create objects using texture
				var geometry = new THREE.PlaneGeometry( 1, 2 );
				var material = new THREE.MeshBasicMaterial( { map: texture } );

				p1num = new THREE.Mesh( geometry, material );

				p1num.position.set(-3,3.2,-5);
				scene.add( p1num );

				// Call render here, because loading of texture can
				// take lot of time
				render();
			},
			// Function called when download progresses
			function ( xhr ) {
				console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
			},
			// Function called when download errors
			function ( xhr ) {
				console.log( 'An error happened' );
			}
		);

		loader.load(
			// URL of texture
			'textures/0.png',
			// Function when resource is loaded
			function ( texture ) {
				// Create objects using texture
				var geometry = new THREE.PlaneGeometry( 1, 2 );
				var material = new THREE.MeshBasicMaterial( { map: texture } );

				p2num = new THREE.Mesh( geometry, material );

				p2num.position.set(3,3.2,-5);
				scene.add( p2num );

				// Call render here, because loading of texture can
				// take lot of time
				render();
			},
			// Function called when download progresses
			function ( xhr ) {
				console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
			},
			// Function called when download errors
			function ( xhr ) {
				console.log( 'An error happened' );
			}
		);
		

		// Display statistics of drawing to canvas
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		stats.domElement.style.left = "0px";
		stats.domElement.style.zIndex = 100;
		document.body.appendChild( stats.domElement );

		// renderer
		renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( width, height );
		document.body.appendChild( renderer.domElement );

		window.addEventListener( 'resize', onWindowResize, false );
	}

	// funkce pro pohyb pálek, dir je hodnota 1 nebo -1 a určuje směr pohybu
	function movePaddle(paddle, paddleBB, dir) {
		//console.log("pressed "+key);

		//podmínka pro dir existuje, aby se pálky nezasekly na okrajích a zároveň aby "neskákaly"
		if (paddleBB.max.y >= 2.5 && dir==1) {
			paddle.position.y = 1.5;
		} else if (paddleBB.min.y <= -2.5 && dir==-1) {
			paddle.position.y = -1.5;
		} else {
			paddle.position.y += (pdlSpd*dir);
		}
	}

	function onWindowResize() {
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize( width, height );
		controls.handleResize();
		render();
	}

	function animate() {
		id=requestAnimationFrame( animate );

		//start kola
		if (roundStart==1) {
			roundStart=0;
			console.log("round started")
			cube.position.x=0.0;
			cube.position.y=0.0;
			dy=(Math.floor(Math.random()*4)*startDir)/100;
			//console.log(dy);
			dx = 0.02*startDir;
		}

		// Test of object animation

		let cube1BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
		cube1BB.setFromObject(cube);
		//console.log(cube1BB);
		let p1BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
		p1BB.setFromObject(paddle1);
		//console.log(p1BB);
		let p2BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
		p2BB.setFromObject(paddle2);

		//paddle1.position.y=1.5;

		//console.log(cube.position.y);
		if (cube.position.y >= 2.3 || cube.position.y <= -2.3) {
			dy = -dy;
			p1collision=1;
			p2collision=1;
		};
		if (cube.position.x >= 5.0 || cube.position.x <= -5.0) {
			roundStart=1;
			updateScore(cube.position.x);
			p1collision=1;
			p2collision=1;
		};

		// kolize s pálkou
		// z nějakého, mně neznámého důvodu, mi nefungovali bounding boxy (intersectsBox is not a function), tak jsem to udělal takhle pomocí souřadnic
		
		if (cube1BB.min.x >= -4.0 && cube1BB.min.x <= -3.75 && p1collision) {
			if (cube1BB.min.y < p1BB.max.y && cube1BB.max.y > p1BB.min.y) {
				//zrychlení "míčku"
				if (dx>-0.15) {
					dx-=0.02;
				}
				dx = -dx;
				deviate();
				p1collision=0;
				p2collision=1;
			}
		}

		if (cube1BB.max.x <= 4.0 && cube1BB.max.x >= 3.75 && p2collision) {
			if (cube1BB.min.y < p2BB.max.y && cube1BB.max.y > p2BB.min.y) {
				if (dx<0.15) {
					dx+=0.02;
				}
				dx = -dx;
				deviate();
				p2collision=0;
				p1collision=1;
			}
		}

		//ovladani palek
		//paddle1.position.y+=0.01;
		document.body.onkeydown = function(e) {
			if (e.key == "w" || e.key == "W") {
				movePaddle(paddle1, p1BB, 1);
			}
			if (e.key == "s" || e.key == "S") {
				movePaddle(paddle1, p1BB, -1);
			}
			if (e.key == "ArrowUp" && AI==0) {
				movePaddle(paddle2, p2BB, 1);
			}
			if (e.key == "ArrowDown" && AI==0) {
				movePaddle(paddle2, p2BB, -1);
			}
		}

		//AI
		//asi je moc silný
		if (AI==1) {
			if (cube1BB.max.x>=0) {
				if (cube1BB.max.y > p2BB.max.y) {
					movePaddle(paddle2, p2BB, 1);
				} else if (cube1BB.min.y < p2BB.min.y) {
					movePaddle(paddle2, p2BB, -1);
				}
			}
		}

		cube.position.y += dy;
		cube.position.x += dx;

		// Update position of camera
		controls.update();
		// Render scene
		render();
	}

	// funkce pro update skore; posx je pozice míčku na konci kola, podle níž určuju, který hráč dostane bod
	function updateScore(posx) {
		if (posx>0) {
			p1score+=1;
			var src='textures/'+p1score+'.png'
			p1num.material.map = THREE.ImageUtils.loadTexture(src);
			p1num.material.needsUpdate = true;
			startDir=1;
		} else {
			p2score+=1;
			var src='textures/'+p2score+'.png'
			p2num.material.map = THREE.ImageUtils.loadTexture(src);
			p2num.material.needsUpdate = true;
			startDir=-1;
		}
		if (p1score==1) {
			finishGame(1);
		} else if (p2score==5) {
			finishGame(2);
		}
	}

	// funkce pro randomizaci odpalu míčku
	function deviate() {
		var dir=-1;
		if (dy>0) {
			dir=1;
		}
		dy=(Math.floor(Math.random()*11)*dir)/100;
	}

	//funkce pro zastavení animace a vypsání výherce
	function finishGame(pid) {
		cancelAnimationFrame(id);
		let text = document.createElement("p");
    	text.setAttribute("id", "win");
    	text.innerText = "Vyhrál hráč " + pid + ".";
    	text.style.color = "white";
    	text.style.fontSize="25px";
    	document.body.appendChild(text);
	}

	function render() {
		renderer.render( scene, camera );
		// Update draw statistics
		stats.update();
	}
}
