var GUI_module = (function () 
{
	/* 
	  Configuration modules below, changing any of the CONSTS will configure the game accordingily to the input field, please be adviced for
	  JQUERY UI not accepting "out of bonds" and "theoriticilly impossible" variables (aka font size animation and color animation)
	*/
	const SQUARE_AVAILABLE_COLOR = 'blue'; // SQUARE IS AVAIBLE TO CLICK AND PLAY
	const DEFAULT_SQUARE_COLOR = 'white'; // SQUARE IS NOT PART OF CURRENT GAME
	const SQUARE_INACTIVE_COLOR = 'gray'; // SQUARE IS NOT LOADED YET, BUT IT IS PART OF THE GAME
	const SQUARE_WRONG_CLICKED_COLOR = 'red';  // SQUARE WAS CLICKED IN THE WRONG ORDER
	const RESPAWN_DEFAULT_MINIMAL = 300; // the minimal amount of time between each respawn of cube, factor is added to it, limited by TIME_LIM
	const HIDE_SPEED = 1000; // how fast the square hides after being pressed (correct)
	const QUICK_RESIZE = 50; // how fast it resizes
	const RESIZE_FACTOR = 1.5; // resize factor of the square, how big it gets compared to original SQUARE_SIZE
	const SQUARE_WRONG_WAIT = 1500; // time to wait if the wrong square was clicked
	const AMOUNT_OF_WINNING_SOUNDS = 10;  // array size defination, must be according to file amount's and name in /sfx/winning (mp3)
	const AMOUNT_OF_LOSING_SOUNDS = 5; // array size defination, must be according to file amount's and name in /sfx/losing (mp3) 
	const AMOUNT_OF_TIME_SOUNDS = 6;// array size defination, must be according to file amount's and name in /sfx/time (mp3)
	const AMOUNT_OF_ADVANCE_SOUNDS = 7;// array size defination, must be according to file amount's and name in /sfx/advance (wav)
	const SQUARE_SIZE = 100; // predefined SQUARE size, in px
	const TXT_INCREASE_DELAY = 700; // winning/losing text increase time
	const TXT_DECREASE_DELAY = 300; // winning/losing text decreases time
	const WIN_COLOR = 'green'; // winning text font color
	const LOSE_COLOR = 'red';	 // losing text font color
	const FONT_ANIMTE_SIZE_INCREASE = 80; // winning text font size increase size
	const FONT_ANIMATE_SIZE_REGULER = 40;  // winning text font size decreases size
	let factor = 500;  // time standart when the game starts, decreases drasticilly until it reaches TIME_LIM, manages the time request for cube spawn
	const TIME_LIM = 100; // minimum time factor possible for cube spawn
	const TIME_CHANGE = 2; // by how much per level the game "speeds up"
	const LOSE_TEXT = "YOU LOSE!"; // the text displaed on animation when user "loses";
	const WIN_TEXT = "YOU WIN! ;)"; // the text displaed on animation when user "wins";
	const LEVEL_UP_TEXT = " LEVEL UP!"; // the text displaed on animation when user "levels up as long as winning", concat to WIN_TEXT;
	
	let losing_sounds = [];
	let winning_sounds = [];
	let time_sounds = [];
	let advance_sounds = [];
	
	
	const draw_table = function()
	{
		document.getElementById("nikod").innerHTML = "Points: 0 \t Streak: 0 \t Level: " + engine_module.getk();
		let table = document.createElement("table");
		let i,j;
		for(i=0; i<engine_module.ROW; i++)
		{
			let row = table.insertRow(i);
			for(j=0; j<engine_module.COL; j++)
			{
				let cell = row.insertCell(j);
				cell.id = i+"_"+j;
				cell.className = i+"_"+j;
				cell.style.backgroundColor = DEFAULT_SQUARE_COLOR;
				cell.width = SQUARE_SIZE;
				cell.height = SQUARE_SIZE;
				cell.onclick = null;
			}		
		}
		for(i=1; i<=AMOUNT_OF_LOSING_SOUNDS; i++)
			losing_sounds.push(new Audio('sfx/losing'+i+".mp3"));
		for(i=1; i<=AMOUNT_OF_WINNING_SOUNDS; i++)
			winning_sounds.push(new Audio('sfx/winning'+i+".mp3"));
		for(i=1; i<=AMOUNT_OF_TIME_SOUNDS; i++)
			time_sounds.push(new Audio('sfx/time'+i+".mp3"));
		for(i=1; i<=AMOUNT_OF_ADVANCE_SOUNDS; i++)
			advance_sounds.push(new Audio('sfx/advance'+i+".wav"));
		let div = document.createElement("div");
		div.id = "main_game";
		div.className = "main_game";
		div.appendChild(table);
		document.body.appendChild(div);
		document.getElementById("gif").style.visibility = "hidden";
	};

	const NEXT_GAME = function()
	{
		document.getElementById("gif").style.visibility = "visible";
		engine_module.generate_sequence();
		let i,j;
		let sequence_arr = [];
		for(i=0; i<engine_module.ROW; i++)
		{
			for(j=0; j<engine_module.COL; j++)
			{
				if(engine_module.arr[i][j].val != 0)
				{
					let element = document.getElementById(i+"_"+j);
					let square = new Object();
					square.element = element;
					square.val = engine_module.arr[i][j].val;

					sequence_arr.push(square);
				}
			}
		}
		const wake_all_sequence = function()
		{
			sequence_arr.forEach(function(val)
			{
				val.element.onclick = click_func;
			});
			document.getElementById("gif").style.visibility = "hidden";
		};
		for(i=0; i<engine_module.getk(); i++)
		{
			let square = sequence_arr[i];
			const timeout_func = function()
			{
				square.element.style.backgroundColor = SQUARE_INACTIVE_COLOR;
				square.element.onclick = function()
				{
					let rand = parseInt( Math.random()*AMOUNT_OF_TIME_SOUNDS);
					time_sounds[rand].play();
				};
				if(square.val == engine_module.getk())
				{
					let i;
					for(i=0; i<engine_module.getk(); i++)
					{
						if(i+1 == engine_module.getk())
						{
							$("." + sequence_arr[i].element.id ).css({'background-color': SQUARE_INACTIVE_COLOR});
							$("." + sequence_arr[i].element.id ).animate(
							{
								backgroundColor: SQUARE_AVAILABLE_COLOR
							}, i*factor + RESPAWN_DEFAULT_MINIMAL,null, wake_all_sequence);
						}
						else
						{
							$("." + sequence_arr[i].element.id ).css({'background-color': SQUARE_INACTIVE_COLOR});
							$("." + sequence_arr[i].element.id ).animate(
							{
								backgroundColor: SQUARE_AVAILABLE_COLOR
							}, i*factor + RESPAWN_DEFAULT_MINIMAL);
						}
					}
					
				}
			};
			setTimeout(timeout_func,square.val*factor + RESPAWN_DEFAULT_MINIMAL);
		}
	};

	const CLEAN_TABLE = function()
	{
		let i,j;
		for(i=0; i<engine_module.ROW; i++)
		{
			for(j=0; j<engine_module.COL; j++)
			{
				let element = document.getElementById(i+"_"+j);
				element.style.backgroundColor = 'white';
				element.onclick = null;
				$("." + i + "_" + j).show();
				
			}
		}
	};

	const click_func = function(e)
	{
		let element = e.srcElement;
		let x = element.id.substring(0,element.id.indexOf("_"));
		let y = element.id.substring(element.id.indexOf("_")+1,element.id.length);
		if(engine_module.pick_number(x,y) != null)
		{
			let res = engine_module.check_winning();
			if(res == false)
			{
				let rand = parseInt( Math.random()*AMOUNT_OF_ADVANCE_SOUNDS);
				advance_sounds[rand].play();
				$("." + x + "_" + y).animate(
				{
					width: SQUARE_SIZE*RESIZE_FACTOR,
					height: SQUARE_SIZE*RESIZE_FACTOR
				},QUICK_RESIZE,null,function()
				{
					$("." + x + "_" + y).animate(
					{
						width: SQUARE_SIZE,
						height: SQUARE_SIZE
					},0,null,function()
					{
						$("." + x + "_" + y).hide(HIDE_SPEED,function()
						{
							element.style.backgroundColor = DEFAULT_SQUARE_COLOR;
							$("." + x + "_" + y).show();
						});
					});
				});
				return;
			}
			else if(res == true)
			{
				let rand = parseInt( Math.random()*AMOUNT_OF_WINNING_SOUNDS);
				winning_sounds[rand].play();
				$("." + x + "_" + y).animate(
				{
					width: SQUARE_SIZE*2,
					height: SQUARE_SIZE*2
				},QUICK_RESIZE,null,function()
				{
					$("." + x + "_" + y).animate(
					{
						width: SQUARE_SIZE,
						height: SQUARE_SIZE
					},0,null,function()
					{
						$("." + x + "_" + y).hide(HIDE_SPEED,function()
						{
							element.style.backgroundColor = DEFAULT_SQUARE_COLOR;
							$("." + x + "_" + y).show();
							CLEAN_TABLE();
							NEXT_GAME();
						});
					});
				});
				document.getElementById("nikod").innerHTML = "Points: " + engine_module.getpoints() + "\t Streak: " + engine_module.getstreak() + "\t Level: " + engine_module.getk();
				let win_text = "" + WIN_TEXT;
				if(engine_module.getkincrease() == 1)
					win_text += LEVEL_UP_TEXT
				document.getElementById("winlosetxt").innerHTML = win_text.fontcolor(WIN_COLOR);
				
				$msg = $('#winlosetxt');
				$msg.animate({"font-size": FONT_ANIMTE_SIZE_INCREASE + "pt"}, TXT_INCREASE_DELAY, "swing",function()
				{
					$msg.animate({"font-size": FONT_ANIMATE_SIZE_REGULER + "pt"}, TXT_DECREASE_DELAY, "swing",function()
					{
						document.getElementById("winlosetxt").innerHTML = "";
					});
				});

				factor-=TIME_CHANGE;
				if(factor<TIME_LIM)
					factor=TIME_LIM;
			}
			else
			{
				let rand = parseInt( Math.random()*AMOUNT_OF_LOSING_SOUNDS);
				losing_sounds[rand].play();
				CLEAN_TABLE();
				//document.getElementById(res.x +"_" + res.y).style.backgroundColor = SQUARE_WRONG_CLICKED_COLOR;
				
				$("." + x + "_" + y).css({'background-color': SQUARE_AVAILABLE_COLOR});
				$("." + x + "_" + y).animate(
				{
					backgroundColor: SQUARE_WRONG_CLICKED_COLOR
				}, SQUARE_WRONG_WAIT ,function()
				{
					CLEAN_TABLE();
					NEXT_GAME();
				});


				let lose_text = "" + LOSE_TEXT;
				document.getElementById("txt").innerHTML = lose_text.fontcolor(LOSE_COLOR);
				
				$msg = $('#winlosetxt');
				$msg.animate({"font-size": FONT_ANIMTE_SIZE_INCREASE + "pt"}, TXT_INCREASE_DELAY, "swing",function()
				{
					$msg.animate({"font-size": FONT_ANIMATE_SIZE_REGULER + "pt"}, TXT_DECREASE_DELAY, "swing",function()
					{
						document.getElementById("winlosetxt").innerHTML = "";
					});
				});

				

			}
		}
	};
	return{draw_table,NEXT_GAME,}
}
());