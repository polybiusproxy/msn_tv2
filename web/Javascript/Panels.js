//
// Panels.js
//

// key modifiers
var FCONTROL = 8  // 0x08    CTRL key is required
var FALT  = 16    // 0x10    ALT key is rquired

// Panel.Type
var SYSTEM_PANEL_TYPE	= 0
var APP_PANEL_TYPE		= 1
var ALERT_PANEL_TYPE	= 2

// Panel.Transition
var STATIC_PANEL_STYLE	= 0
var SLIDING_PANEL_STYLE	= 1
var POPUP_PANEL_STYLE	= 2

// Panel Sizes
var LARGE_PANEL_HEIGHT	= 340

// Dialogs based on CSS\Dialog.css
var LARGE_DIALOG_WIDTH = 400;
var LARGE_DIALOG_HEIGHT = 270;

// Panel.State
var PanelState_Showing	= 0;
var PanelState_Rising	= 1;
var PanelState_Lowering	= 2;
var PanelState_Hidden	= 3;

// Rectangle constructor
function Rectangle(x, y, width, height)
{
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
}

// Panel constructor
function Panel(name, URL, type, transition, z_order, historySize, destroyBrowserOnHide)
{
	this.name = name;
	this.URL = URL;
	this.type = type;
	this.transition = transition;
	this.start = new Rectangle(0,0,0,0);
	this.end = null;
	this.step = null;
	this.showTime = 0;
	this.z_order = z_order;
	this.selectable = true;
	this.refreshenabled = false;
	this.modal = false;
	this.transitionsoundenabled = true;
	this.historySize=historySize;
	this.destroyBrowserOnHide=destroyBrowserOnHide;
}

function  AddPanel(PanelManager, panel)
{
    var ipl;
    var result;

	TVShell.Message("Panels.js::AddPanel("+panel.name+")");

    result = PanelManager.CreatePanel(panel.name, panel.URL, panel.z_order, panel.destroyBrowserOnHide);

    if(result==false)
       return null;

    ipl = PanelManager.Item(panel.name);
    ipl.History.RecentSize = panel.historySize;

	if (panel.step != null) {
          ipl.StepX=panel.step.x;
          ipl.StepY=panel.step.y;
          ipl.StepWidth=panel.step.width;
          ipl.StepHeight=panel.step.height;
	}
	if (panel.showTime > 0)
	    ipl.ShowTime=panel.showTime;

    ipl.PanelType = panel.type;
    ipl.Transition = panel.transition;
    ipl.StartRect(panel.start.x, panel.start.y, panel.start.width, panel.start.height);

    if (panel.end != null) {
        ipl.EndRect(panel.end.x, panel.end.y, panel.end.width, panel.end.height);
    }

	ipl.Selectable = panel.selectable;
	ipl.RefreshEnabled = panel.refreshenabled;
	ipl.Modal = panel.modal;
	ipl.TransitionSoundEnabled = panel.transitionsoundenabled;
 
    return ipl;
}

function SetPanelAccelEx(list, panel, name, type, code, msg)
{
	var ServiceEntry;

	TVShell.Message("SetPanelAccelEx("+name+", "+code+", "+msg+")");

	ServiceEntry = list.Item("panel::"+name);
	if (ServiceEntry == null) {
		ServiceEntry = list.Add("panel::"+name);
		ServiceEntry.Panel = panel;
		ServiceEntry.Message = msg;
	}

	if (type & FCONTROL)
		ServiceEntry.CharCode = code & 0x1F;
	else
	if (type & FALT)
		ServiceEntry.SysCharCode = code;
	else
		ServiceEntry.KeyCode = code;
}

function SetPanelAccel(name, type, code)
{
	SetPanelAccelEx(TVShell.BuiltinServiceList, name, name, type, code, "");
}

function SetUserPanelAccel(name, type, code)
{
	var CurrentUser = TVShell.UserManager.CurrentUser;

	if (CurrentUser)
		SetPanelAccelEx(CurrentUser.ServiceList, name, name, type, code, "");
}

function SetUserPanelAccelEx(panel, name, type, code, msg)
{
	var CurrentUser = TVShell.UserManager.CurrentUser;

	if (CurrentUser)
		SetPanelAccelEx(CurrentUser.ServiceList, panel, name, type, code, msg);
}

function SwitchPanelAccel(list, panel, name)
{
	var ServiceEntry = list.Item("panel::"+name);
	if (ServiceEntry) {
//		TVShell.Message("SwitchPanelAccelEx: switching ServiceEntry(" + name + ") from " + ServiceEntry.Panel + " to " + panel);
		ServiceEntry.Panel = panel;
	}
}

function SwitchUserPanelAccel(panel, name)
{
	var CurrentUser = TVShell.UserManager.CurrentUser;

	if (CurrentUser)
		SwitchPanelAccel(CurrentUser.ServiceList, panel, name);
}

