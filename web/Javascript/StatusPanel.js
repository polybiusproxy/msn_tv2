//
//	StatusPanel.js
//
//	Requires Panels.js
var STATUS_PANEL_NAME = "statusbar";

function ShowLoadIcon()
{
	var panel = TVShell.PanelManager.Item(STATUS_PANEL_NAME);

	if (panel)
		panel.Document.ShowLoadIcon();
}

function HideLoadIcon()
{
	var panel = TVShell.PanelManager.Item(STATUS_PANEL_NAME);

	if (panel)
		panel.Document.HideLoadIcon();
}
