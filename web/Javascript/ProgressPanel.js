//
//	ProgressPanel.js
//
//	Requires Panels.js
var PROGRESS_PANEL_NAME = "progress";
var PROGRESS_PANEL_HEIGHT = 84;
var MediumFileExtensions = new Array(".asf",".wma",".wmv",".wm",".asx",".wax",".wvx",".wmx",".wpl",".wmd",
									 ".mpg",".mpeg",".m1v",".mp2",".mp3",".mpa",".mpe",".mpv2",".m3u",".mpga",
									 ".rmi",".aif",".aifc",".aiff",".au",".snd", ".wav",".ivf", ".nsc",".avi");

var PROGRESS_PLEASE_WAIT = "Please wait. ";
var PROGRESS_PLEASE_WAIT_WHILE_GET = "Please wait while we get ";

function IsMediumFile(url)
{
	for (var i=0; i < MediumFileExtensions.length; i++) {
		if (url.substr(url.length-MediumFileExtensions[i].length, url.length) == MediumFileExtensions[i])
			return true;
		var tag = MediumFileExtensions[i]+'?';
		if (url.indexOf(tag) > 0)
			return true;
	}
	return false;	
}

function SetProgressPercent(percent)
{
	var panel = TVShell.PanelManager.Item(PROGRESS_PANEL_NAME);

	if (panel && panel.Document)
		panel.Document.SetProgressPercent(percent);
}

function SetProgressText(text)
{
	var panel = TVShell.PanelManager.Item(PROGRESS_PANEL_NAME);

	if (panel && panel.Document)
		panel.Document.SetProgressText(text);
}

function SetProgressStopFunction(stopFunc)
{
	var panel = TVShell.PanelManager.Item(PROGRESS_PANEL_NAME);

	if (panel && panel.Document)
		panel.Document.SetStopFunction(stopFunc);
}

function ShowProgressPanel()
{
	var panel = TVShell.PanelManager.FocusedPanel;
	if ( panel )
	{
		// do not show if the reconnect panel is up
		if ( panel.Name == "reconnect" ) return;
	}
	TVShell.PanelManager.Show(PROGRESS_PANEL_NAME);
}

function HideProgressPanel()
{
	TVShell.PanelManager.Hide(PROGRESS_PANEL_NAME);
}

function IsProgressShowing()
{
	var panel = TVShell.PanelManager.Item(PROGRESS_PANEL_NAME);

	if (panel && panel.State == PanelState_Showing)
		return true;
	
	return false;
}
