



var baseURL="";
if(TVShell.UserManager.CurrentUser && TVShell.UserManager.CurrentUser.IsAuthorized)
   baseURL=TVShell.UserManager.CurrentUser.ServiceList.Item("help::help").URL


/*	Function: CallPaneHelp

	Purpose: Sets up the arguments for the DoHelp function located in helppane26.js
		This simplifies what the engineer needs to know when calling Pane Help.

		Used by non-panel pages
	
	Parameters: There are 3 ways to call this function. [] = optional
			
		To show a topic table of contents (MSNTV_TRS_TOC_feature.htm)
			CallPaneHelp(PH_topicTOC, HTM PaneHelp TOC page name, [subtopic name])
		
		To show the main table of contents (main menu)
			CallPaneHelp(PH_TOC)
			
		To show a diploma
			CallPaneHelp(PH_diploma, HTM PaneHelp page name, [full URL to jump to after diploma])
	
		To search for keyword: NOT SUPPORTED
			CallPaneHelp(PH_search, keyword, topic display string)
			
		To show specific page
			CallPaneHelp(PH_specificPage, HTML PaneHelp page name)

	Sets global values used by function doHelp:
		H_TOPIC: for searches (PH_search), this is the keyword to search for
				for non-searches, this is the name of the html page
		bSearch: true for searches (PH_search), false for non-searches
*/
var PH_search = 0;
var PH_specificPage = 1;
var PH_TOC = 2;
var PH_topicTOC = 3;
var PH_diploma = 4;

function readBaseHelpURL()
{
	var str = "";
	if(TVShell.UserManager.CurrentUser && TVShell.UserManager.CurrentUser.IsAuthorized)
		   str = TVShell.UserManager.CurrentUser.ServiceList.Item("help::help").URL
	return str;
	
}

function CallPaneHelp(hmode)
{
	var curURL = TVShell.PanelManager.Item('main').URL;
	var PaneHelpURL = "";

	if (hmode == PH_topicTOC){

	 PaneHelpURL = readBaseHelpURL() + "?page=" + encodeURIComponent(arguments[1]);

	}else if (hmode == PH_diploma){

	 PaneHelpURL = readBaseHelpURL() + "?page=" + encodeURIComponent(arguments[1]);

	 if (arguments[2])

	  PaneHelpURL += "&jumpURL=" + encodeURIComponent(arguments[2]);

	 else

	  PaneHelpURL += "&retURL=" + encodeURIComponent( curURL );

	}else if (hmode == PH_TOC){

	 PaneHelpURL = readBaseHelpURL() + '?page=MSNTV_ALTTOC_main.htm';

	}else if (hmode == PH_search){

	 alert("Help search is not supported");

	 return;

	}else if (hmode == PH_specificPage){

	 PaneHelpURL = readBaseHelpURL() + "?page=" + encodeURIComponent(arguments[1]) + "&retURL=" + encodeURIComponent( curURL );

	}
	top.location = PaneHelpURL;
}




//	Returns URL to help page
//	Used by panels

function GetPaneHelpURL(hmode)
{
	var curURL = TVShell.PanelManager.Item('main').URL;
	var PaneHelpURL = "";
	
	if (hmode == PH_topicTOC){

	 PaneHelpURL = readBaseHelpURL() + "?page=" + encodeURIComponent(arguments[1]);

	}else if (hmode == PH_diploma){

	 PaneHelpURL = readBaseHelpURL() + "?page=" + encodeURIComponent(arguments[1]);

	 if (arguments[2])

	  PaneHelpURL += "&jumpURL=" + encodeURIComponent(arguments[2]);

	 else

	  PaneHelpURL += "&retURL=" + encodeURIComponent( curURL );

	}else if (hmode == PH_TOC){

	 PaneHelpURL = readBaseHelpURL() + '?page=MSNTV_ALTTOC_main.htm';

	}else if (hmode == PH_search){

	 alert("Help search is not supported");

	 return;

	}else if (hmode == PH_specificPage){

	 PaneHelpURL = readBaseHelpURL() + "?page=" + encodeURIComponent(arguments[1]) + "&retURL=" + encodeURIComponent( curURL );

	}

    TVShell.Message("helpURL="+PaneHelpURL)
	return PaneHelpURL
}


function GetCompatPrinterListURL()
{
	return GetPaneHelpURL(PH_topicTOC,'MSNTV_PROC_SINGLE_Printing_CompatPrinters.htm');
}

function GetDMRHelpURL(which)
{
	if (which == "") {
		which = "MSNTV_TRS_TOC_Photos";
	}

	if (TVShell.IsUserAuthorizedandConnected) {
		switch (which) {
			case "MSNTV_PROC_SINGLE_Photos_MemoryCard":
				which = "MSNTV_PROC_SINGLE_Photos_CardReader";
				break;
		}
		
		return GetPaneHelpURL(PH_topicTOC, which+".htm");
	}
	else {
		return "msntv:/Help/" + which + "_Offline_v11.htm";
	}
}
