//
// Provisioning.js
//

function canAccessOfflineApp()
{
	var UserManager = TVShell.UserManager;

	if (UNDER_NT)
		return true;

	if (UserManager.CurrentUser && UserManager.CurrentUser.IsAuthorized) {
		return true;
	}

	if (TVShell.DeviceControl.ClockSet == false) {
		return false;
	}

	if (TVShell.DeviceControl.ClockSet == false || UserManager.LastLoginTime == 0) {	
		if (UserManager.OfflineAppAccessTimes >= UserManager.OfflineAppMaxAccessTimes)
			return false;
		else {
			UserManager.OfflineAppAccessTimes = UserManager.OfflineAppAccessTimes + 1;
			UserManager.Save();
			return true;
		}
	}
	else {
		var dt = new Date();
		var currentTime = dt.getTime() / 1000 + dt.getTimezoneOffset() * 60;
		if ((currentTime - UserManager.LastLoginTime) > UserManager.OfflineAppMaxAccessDays * 24 * 3600)
			return false;
		
		if (UserManager.OfflineAppAccessTimes >= UserManager.OfflineAppMaxAccessTimes)
			return false;
		else {
			UserManager.OfflineAppAccessTimes = UserManager.OfflineAppAccessTimes + 1;
			UserManager.Save();
			return true;
		}
	}
}

function NotProvisionedMessageBox(contentType, mediaType)
{
	var UserManager = TVShell.UserManager;

	var playMsg = "access media";
	if ( contentType.substr(0,7) == "msntv:/" ) {
		contentType = contentType.substr(7,20);
		contentType = contentType.substr(0,contentType.indexOf('/'));
	}		
	if ( contentType == "Photo" || contentType == "Photos" ) {
		playMsg = "see photos";
	} else if ( contentType == "Music" ) {
		playMsg = "listen to music";
	} else if ( contentType == "Video" ) {
		playMsg = "watch videos";
	}
	if ( mediaType == "USB" ) {
		playMsg += " from your storage devices.";
	} else if ( mediaType == "network" ) {
		playMsg += " from your home network.";
	} else {
		playMsg += " from your home network or storage devices.";
	}
	var currentURL = mainPanel.URL;	
	var msg = "Please sign in so we can verify your account status. <p><p>Once you've signed in, you can either stay online and explore, or sign out and " + playMsg;
	var alreadyOnSigninPage = (currentURL == "msntv:/TVShell/login.html");
	var havePassword = (UserManager.CurrentUser && UserManager.CurrentUser.SavePassword);
	var ret = 0;
	if ( alreadyOnSigninPage && !havePassword ) 
		TVShell.PanelManager.CustomMessageBox(msg, "Please sign in", "OK", 0, "");
	else
		ret = TVShell.PanelManager.CustomMessageBox(msg, "Please sign in", "Sign In;Cancel", 0, "");
	
	
	if ( ret == 0 ) {
		if (havePassword && TVShell.UserManager.Count == 1) {
			TVShell.BuiltinServiceList.Remove("home::target");
			var e = UserManager.CurrentUser.ServiceList.Add("home::target");
			e.URL = "home::home";
			
			LoginToService("connection::login");

		} else {
			if ( !alreadyOnSigninPage ) {
				TVShell.PanelManager.Show("signinpanel");
			}
		}
	}
	return ret;
}
