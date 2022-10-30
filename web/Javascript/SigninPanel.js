//
//	SigninPanel.js
//
//	Requires Panels.js
var SIGNIN_PANEL_NAME = "signinpanel";

function ShowSigninPanel()
{
	TVShell.PanelManager.Show(SIGNIN_PANEL_NAME);
}

function HideSigninPanel()
{
	TVShell.PanelManager.Hide(SIGNIN_PANEL_NAME);
}