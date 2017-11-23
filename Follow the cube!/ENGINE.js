var engine_module = (function () 
{
	const ROW = 5; // amount of rows in our "table" of cubes (must be above 0)
	const COL = 5; // amount of cols in our "table" of cubes (must be above 0)
	const PREDEFINED_K = 2; // in what level we start with (must be above 0)
	const SAME_DIFFICULTY_PERSISTANCE = 3; // how many times I replay the same level before going to the next level
	
	const POINT_INCREASE_PER_LEVEL = 1; // how many points are increased per winning
	const POINT_FACTOR_PER_STREAK = 2; // by how much more the points increase per streak

	
	
	let arr = []; // cubes array
	let k; // difficulty, aka level
	
	let advance; // indicates if user WON this turn or LOST this turn
	let difficulty_persistance = 0; // inidicates user's replay value (how many times the user stayed at the same level)
	let turn = 1; // users square's "done" value
	let lost_square = new Object();  // predefined engine variable, do not touch, handles telling the GUI what was the wrongly clicked square if game was lost
	let streak = 0; // easier point management, extra points handled to real winners ;)
	let points = 0; // variable holding the points value

	let PC_OR_USER = 0; // engine variable, do not touch
	let k_INCREASED = 0; // engine variable, telling the GUI the levlel increased for change in text
	 // turns starting from 1->N
	 
	const init_vars = function() // init module replacement
	{
		let i,j;
		for(i=0; i<ROW; i++)
		{
			let subarr = [];
			for(j=0; j<COL; j++)
			{
				let square = new Object(); // array of arrays (aka two dimensional array) defination
				square.val = 0;
				subarr.push(square);
			}
			arr.push(subarr);
		}
		k=PREDEFINED_K;
	};
	const generate_sequence = function()
	{
		const FACTOR = 0.3; // chance for a square to be CHOSEN
		let i,j,l;
		l=0;
		clean_arr();
		for(i=0; i<ROW; i++)
		{
			for(j=0; j<COL; j++)
			{
				if(Math.random() < FACTOR) // choose square upon chance
				{
					arr[i][j].val = l+1;
					l++;
				}
				if(l == k) // if enough squares were chosen
					break;
			}
			if(j<COL) // if I broke for that reason, ENOUGH is ENOUGH ;)
				break; 
		}
		if(l != k) // not enough squares were chosen, we should try AGAIN
		{
			clean_arr();
			return generate_sequence(); // could be recursive endless, must take factor into selection
		}
		PC_OR_USER = 1;
		turn = 1;
		return true;
	};

	const clean_arr = function()
	{
		let i,j;
		for(i=0; i<ROW; i++)
		{
			for(j=0; j<COL; j++)
			{
				let square = arr[i][j];
				square.val = 0;
			}
		}
	};

	const pick_number = function(x,y)
	{
		if(PC_OR_USER == 0)
			return null;
		let square = arr[x][y];
		//console.log(square.val);
		if(square.val == turn) // could be (k-turn) for backwards compability
		{
			turn++; // next square
			if(turn > k) // user done picking all squares in the right order
			{
				PC_OR_USER = 0; // means repick
				advance = 1;
			}
			return true; 
		}
		PC_OR_USER = 0; // user picked wrong
		advance = 0; // user should stay at the same level
		lost_square.x = x;
		lost_square.y = y;
		return false;
	};

	const check_winning = function()
	{
		k_INCREASED = 0; // reset a variable telling the GUI that this is NOT YET (or not) the turn that "got to next level"
		if(PC_OR_USER == 0)
		{
			if(advance == 0)
			{
				clean_arr();
				streak=0; // streak lost
				return lost_square; // just for the GUI to handle user interface which square we lost
			}
			else
			{
				difficulty_persistance++; // indicates we replayed this difficulty once more
				points+=POINT_INCREASE_PER_LEVEL + POINT_INCREASE_PER_LEVEL*k + streak;
				streak++; // streak gained
				if(difficulty_persistance == SAME_DIFFICULTY_PERSISTANCE) // case it was more than enough
				{
					difficulty_persistance = 0;
					k++; // level up
					k_INCREASED=1; // mark for level up to the gui
					if(k==ROW*COL)
						k--;
				}
				clean_arr();
				return true;
			}
		}
		return false;
	};
	const getkincrease = function() // for our troubles with dead memory
	{
		return k_INCREASED;
	};
	const getstreak = function() // for our troubles with dead memory
	{
		return streak;
	};
	const getk = function() // for our troubles with dead memory
	{
		return k;
	};
	const getpoints = function() // for our troubles with dead memory
	{
		return points;
	};
	return { ROW,COL,getkincrease,getstreak,getk,getpoints,check_winning,pick_number,generate_sequence,init_vars,arr}
}
());