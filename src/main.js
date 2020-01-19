// src/main.js
import foo from './foo.js';
import SVG_Drawer_By_Paths from './SVG_Drawer_By_Paths.js';

export default class{

	constructor()
	{
		console.log(foo);
		console.log("MORE");
	} 

	getByPath()
	{
		return new SVG_Drawer_By_Paths(); 
	}

}
 
//export {SVG_Drawer_By_Paths} from './SVG_Drawer_By_Paths.js';