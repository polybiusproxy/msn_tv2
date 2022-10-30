// Used for Diplomas settings
var MDIPLOMA_PAGESIZE	= 0x00000001;
var MDIPLOMA_TEXTRESIZE	= 0x00000002;
var MDIPLOMA_UNUSED1	= 0x00000004;
var MDIPLOMA_UNUSED2	= 0x00000008;
var MDIPLOMA_DOCVIEWERFS = 0x10;
var MDIPLOMA_IM = 0x20;
//var MDIPLOMA_WARNCANTFILTERHOMENETWORKCONTENT = 0x40;
var MDIPLOMA_VIDEOHOMETOUR = 0x40;

function DiplomaCustomMessageBox( noDialogReturn, diploma, text, title, buttons )
{
	var func = DiplomaCustomMessageBox;
	if (IsRegistered()) 
	{
		var defaultButton = (func.arguments.length > 5 ? func.arguments[5] : 0);
		var errorString = (func.arguments.length > 6 ? func.arguments[6] : "");
		var trusted = (func.arguments.length > 7 ? func.arguments[7] : false);
		var iconType = (func.arguments.length > 8 ? func.arguments[8] : MGX_ICON_WARNING);
		var size = (func.arguments.length > 9 ? func.arguments[9] : MGX_SIZE_LARGE);

		var old = TVShell.UserManager.CurrentDiplomaSettings;
		TVShell.UserManager.CurrentDiplomaSettings = old | diploma;
		TVShell.UserManager.Save();

		if ( (old & diploma) == 0 )
			noDialogReturn = TVShell.PanelManager.CustomMessageBox(text,title,buttons,defaultButton,errorString,trusted,iconType,size);

	}

	return noDialogReturn;
}

