//
// ServiceList.js
//

var VK_BROWSER_HOME			= 0xAC;

function InitializeServiceList(PowerCause)
{
	var ServiceList = TVShell.ServiceList;
	var BuiltinServiceList = TVShell.BuiltinServiceList;
	var entry;

	ServiceList.Restore();

	entry = BuiltinServiceList.Add("SignOn");
	entry.URL = "msntv:/TVShell/login.html";

	entry = BuiltinServiceList.Add("Settings");
	entry.URL = "msntv:/Settings/Settings.html";

	entry = BuiltinServiceList.Add("connection::prereg");
	entry.URL = MSNTVServiceList[0].URL;
	entry.Description = MSNTVServiceList[0].Name;

	entry = BuiltinServiceList.Add("browser::back");
	entry.KeyCode = VK_BROWSER_BACK;
	entry = BuiltinServiceList.Add("browser::esc");
	entry.KeyCode = VK_ESCAPE;

	entry = BuiltinServiceList.Add("browser::expandselectionstart");
	entry.KeyCode = VK_LEFT + 0x8000;
	entry = BuiltinServiceList.Add("browser::expandselectionend");
	entry.KeyCode = VK_RIGHT + 0x8000;

	entry = BuiltinServiceList.Add("browser::print");
	entry.CharCode = "N".charCodeAt(0) & 0x1F;
	entry.KeyCode = VK_PRINT;

	entry = BuiltinServiceList.Add("TVLensMode");
	entry.CharCode = "Z".charCodeAt(0) & 0x1F;
	entry.KeyCode = VK_F6;

	entry = BuiltinServiceList.Add("ZoomUp");
	entry.KeyCode = VK_ADD;
	
	entry = BuiltinServiceList.Add("ZoomDown");
	entry.KeyCode = VK_SUBTRACT;

	entry = BuiltinServiceList.Add("SystemInfo::home");
	entry.URL = "msntv:/Settings/System/System.html";

	entry = BuiltinServiceList.Add("browser::showpopup");
	entry.Charcode = "P".charCodeAt(0) & 0x1F;

	if (TVShell.SystemInfo.Flavor != "release" && TVShell.SystemInfo.Flavor != "ppe") {
		entry = BuiltinServiceList.Add("TVLensModeTest");
		entry.SysCharCode = "z".charCodeAt(0);

		entry = BuiltinServiceList.Add("Tricks");
		entry.URL = "msntv:/Test/Tricks.html";
		entry.SysCharCode = "c".charCodeAt(0);

		entry = BuiltinServiceList.Add("CaptureScreen");
		entry.SysCharCode = "k".charCodeAt(0);

		entry = BuiltinServiceList.Add("HomeNetworkMount");
		entry.SysCharCode = "m".charCodeAt(0);

		entry = BuiltinServiceList.Add("ScreenSaver");
		entry.SysCharCode = "r".charCodeAt(0);
	}

	TVShell.Message("InitializeServiceList - Complete");
}

function InitializeOfflineServices()
{
	var BuiltinServiceList = TVShell.BuiltinServiceList;
	var entry;

	entry = BuiltinServiceList.Add("Settings::HomeNetwork");
	entry.URL = "msntv:/Settings/Network/HomeNetworking.html";
	entry.Safe = true;

	entry = BuiltinServiceList.Add("Photo::Home");
	entry.URL = "msntv:/Photo/PhotoHome.html";
	entry.Safe = true;
	entry.KeyCode = VK_F12;
	entry.ProvisioningRequired = true;
	
	entry = BuiltinServiceList.Add("Photo::Albums");
	entry.URL = "msntv:/Photo/PhotoOrganizer.html?state=organize&storage=local";
	
	entry = BuiltinServiceList.Add("Photo::OnlineStorage");
	entry.URL = "msntv:/Photo/PhotoOrganizer.html?state=organize&storage=online";
	entry = BuiltinServiceList.Add("Photo::ChangeScreenSaver");
	entry.URL = "msntv:/Photo/PhotoOrganizer.html?state=screensaver&storage=local";
	
	entry = BuiltinServiceList.Add("Photo::AttachmentViewer");
	entry.URL = "msntv:/Photo/Viewer.html?AttachmentViewer=true";
		
	if (TVShell.Property("MusicFeature")) {
		entry = BuiltinServiceList.Add("Music::Home");
		entry.URL = "msntv:/Music/MusicHome.html";
		entry.KeyCode = VK_F10;
		entry.Safe = true;
		entry.ProvisioningRequired = true;

		entry = BuiltinServiceList.Add("Music::SongList");
		entry.URL = "msntv:/Music/SongList.html";
		
		entry = BuiltinServiceList.Add("Music::Settings");
		entry.URL = "msntv:/Settings/WMPVisualization.html";
		entry.Safe = true;
	}
	
	if (TVShell.Property("VideoFeature")) {
		entry = BuiltinServiceList.Add("Video::Home");
		entry.URL = "msntv:/Video/VideoHome.html";
		entry.KeyCode = VK_F11;
		entry.Safe = true;
		entry.ProvisioningRequired = true;

		// for backward compat w/ video home
		entry = BuiltinServiceList.Add("Video");
		entry.URL = "msntv:/Video/VideoHome.html";
		entry.Safe = true;
		entry.ProvisioningRequired = true;
		
		entry = BuiltinServiceList.Add("Video::HomeNetworking");
		entry.URL = "msntv:/MediaNav/MediaNav.html?fromApplication=video&mediaLocation=pc";
		entry.Safe = true;
		entry.ProvisioningRequired = true;
	}

	if (TVShell.Property("GameFeature")) {
		entry = BuiltinServiceList.Add("Game");
		entry.URL = "msntv:/Game/GameHome.html";
		entry.Safe = true;
		entry.ProvisioningRequired = true;
	}

	entry = BuiltinServiceList.Add("Chat");
	entry.URL = "msntv:/OLTK/chatBlock.html";
	entry.Safe = true;
		
	entry = BuiltinServiceList.Add("mail::listmail");
	entry.URL = "msntv:/OLTK/EmailBlock.html";
	entry.Safe = true;
	
	entry = BuiltinServiceList.Add("Help");
	entry.URL = "msntv:/Help/Contents.html";
	entry.KeyCode = VK_HELP;

	entry = BuiltinServiceList.Add("media::default");
	entry.URL = "msntv:/Music/MusicHome.html";

	entry = BuiltinServiceList.Add("favorite::shortcut1");
	entry.KeyCode = VK_F1;

	entry = BuiltinServiceList.Add("favorite::shortcut2"); 
	entry.KeyCode = VK_F2;

	entry = BuiltinServiceList.Add("favorite::shortcut3");
	entry.KeyCode = VK_F3;

	entry = BuiltinServiceList.Add("offline::tempMail");
	entry.KeyCode = VK_LAUNCH_MAIL;
	entry.Safe = true;

	entry = BuiltinServiceList.Add("offline::tempSearch");
	entry.KeyCode = VK_BROWSER_SEARCH;
	entry.Safe = true;
	
	
}

function IsRegistered()
{
	return (TVShell.ServiceList("connection::login") != null && TVShell.UserManager.Count > 0);
}

//
// IsSignOnEnabled() returns true if the sign-on page is enabled for this session
//
function IsSignOnEnabled()
{
	return IsRegistered() && TVShell.PowerCause != "FullUpdate" && TVShell.PowerCause != "AutoUpdate";
}

function GotoSignOn()
{
	var func = GotoSignOn;
	var showError = (func.arguments.length > 0 ? func.arguments[0] : false);

	TVShell.Message("GotoSignOn");

	var signonEntry = TVShell.BuiltinServiceList("SignOn");
	var SystemInfo = TVShell.SystemInfo;

	if (signonEntry && IsRegistered()) {
		// Set the default post-registration screen saver
		var ScreenSaver = TVShell.ScreenSaver;
		if (ScreenSaver.CurrentSaver.Name == "Prereg") {
			var TotalRAM = (SystemInfo.TotalPhysicalMemory + SystemInfo.ObjectStoreSize) / (1024*1024);

			if (TotalRAM > 64) {
				ScreenSaver.CurrentSaver = "Photo";
			}
			else {
				ScreenSaver.CurrentSaver = "Butterfly";
			}
		}
		if (TVShell.BuiltinServiceList.Item("home::target") && !IsMainPanelOnPage("msntv:/tvshell/login.html")) {
			var CurrentUser = TVShell.UserManager.CurrentUser;	
			if (CurrentUser)
				CurrentUser.ServiceList.Remove("home::target");
			ShowSigninPanel();
		}
		else {
			signonEntry.KeyCode = VK_BROWSER_HOME;
			TVShell.URL = signonEntry.URL;
		}
	}
	else if (SystemInfo.Flavor == "release" || SystemInfo.Flavor == "ppe") {
		TVShell.URL = "msntv:/Registration/pages/Welcome.html";
	}
	else {
		if (showError) {
			if (signonEntry && IsRegistered() == false) {
				alert( 'Warning: No users have been added. Register first.' );
			} else if ( signonEntry == null ) {
				alert( 'Unable to signon. There is no signon service entry.' );
			}
		}

		TVShell.URL = "msntv:/tvshell/Register.html";
	}
	
	return false;
}

function GotoSettings()
{
	var entry = TVShell.BuiltinServiceList("Settings");

	TVShell.Message("GotoSettings");

	if (entry)
		TVShell.URL = entry.URL;

	return false;
}
