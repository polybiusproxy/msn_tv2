function ToUNCHostName( srcURL )
{
	var hostName = "";

	if ( srcURL != null && srcURL.length > 2 
		 && srcURL.charAt(0) == '\\' && srcURL.charAt(1) == '\\' )
	{
		var s = srcURL.substring(2, srcURL.length );
		var idx1 = s.indexOf("\\");
		hostName = s.substring(0, idx1 );
	}

	return hostName;
}

function ToUNCShareName( srcURL )
{
	var shareName = "";

	if ( srcURL != null && srcURL.length > 2 
		 && srcURL.charAt(0) == '\\' && srcURL.charAt(1) == '\\' )
	{
		var srcURL = srcURL.substring(2, srcURL.length );
		var idx1 = srcURL.indexOf("\\");
		shareName = srcURL.substring(idx1+1, srcURL.length );
		idx1 = shareName.indexOf("\\" );
		if (idx1>-1)
			shareName = shareName.substring( 0, idx1);
	}

	return shareName;
}

function FindHomeNetworkService( hostName, hostIPAddress, shareName )
{
	hostName = (hostName ? hostName.toLowerCase() : null );
	shareName = (shareName ? shareName.toLowerCase() : null );
	var HomeNetworkObj = TVShell.ConnectionManager.HomeNetworking;
	var i;
	for (i=0; i < HomeNetworkObj.Count ; i++ )
	{
		var he = HomeNetworkObj.Item(i);
		if ( ( hostIPAddress && hostIPAddress != "" && he.IPAddress == hostIPAddress )
		     ||(hostName && hostName != "" && he.Name.toLowerCase() == hostName ) )
		{
			var j;
			for (j=0; j<he.Count; j++)
			{
				var se = he.Item(j);
				if ( se.Name.toLowerCase() == shareName )
				{
					return se;
				}
			}
		}
	}

	return null;
}

function FindHomeNetworkServiceForUNCStorageDevice( sd )
{
	var se = null;
	if ( sd != null )
	{
		se = FindHomeNetworkService( null, sd.IPAddress, 
									 ToUNCShareName(sd.VolumeName));
	}

	return se;
}

function FindHomeNetworkServiceForUNCPath( srcURL )
{
	var se = null;
	if ( srcURL != null && srcURL.length > 2 
		 && srcURL.charAt(0) == '\\' && srcURL.charAt(1) == '\\' )
	{
		var srcURL = srcURL.substring(2, srcURL.length );
		var idx1 = srcURL.indexOf("\\");
		var hostName = srcURL.substring(0, idx1 );
		var shareName = srcURL.substring(idx1+1, srcURL.length );
		idx1 = shareName.indexOf("\\" );
		if (idx1>-1)
			shareName = shareName.substring( 0, idx1);
		se = FindHomeNetworkService( hostName, null, shareName );		
	}

	return se;
}

function Mount(i,j)
{

	var he = HomeNetworkObj.Item(i);
	if(he)
	{
		TVShell.Message( "mount " + i + " " + j );
		var se = he.Item(j);
		if(se) {
			TVShell.Message("mounting " + se.Name);
			ShowProgressPanel();
			SetProgressPercent(50);
			SetProgressStopFunction(null);
			SetProgressText(PROGRESS_PLEASE_WAIT + "Connecting...");
			se.Mount();
		}
	} 
}
		
var MountEx_MountsInProgress = null;

function MountEx( uncPath, callbackFunc )
{
	var invokeCb = true;
	var HomeNetworkShare = uncPath ? FindHomeNetworkServiceForUNCPath( uncPath ) : null;

	if ( HomeNetworkShare && HomeNetworkShare.State == 1 )
	{
		if ( callbackFunc != null )
			MountEx_AddCb(ToUNCHostName( uncPath ),ToUNCShareName( uncPath ),
						  callbackFunc);
		invokeCb = false;
		HomeNetworkShare.Mount();
	} 
	else if (/*uncPath &&*/ HomeNetworkShare && callbackFunc)
	{
		var host = ToUNCHostName( uncPath ).toLowerCase();
		var share = ToUNCShareName( uncPath ).toLowerCase();
		//If the network share is mounted, but the storage device has
		//not yet been added we will wait for the device add before preceeding
		if (FindStorageDevice("\\\\" + host + "\\" + share)==null)
		{
			invokeCb = false;
			MountEx_AddCb(ToUNCHostName( uncPath ),
			              ToUNCShareName( uncPath ),
			              callbackFunc);
		}
	}

	if (invokeCb && callbackFunc)
		callbackFunc();
}

function MountEx_AddCb( host, share, callbackFunc )
{
	if ( MountEx_MountsInProgress == null )
	{
		MountEx_MountsInProgress = new Object();
		Sink.AttachEvent(TVShell.StorageManager, "OnDeviceAdd", MountEx_OnDeviceAdd);
		Sink.AttachEvent(TVShell.ConnectionManager.HomeNetworking, "OnServiceHandler", MountEx_OnServiceHandler);
	}

	var req = new Object();
	req.host = host.toLowerCase();
	req.share = share.toLowerCase();
	req.func = callbackFunc;
	MountEx_MountsInProgress["\\\\" + req.host + "\\" + req.share]=
		req;
}

function MountEx_RemoveCb(host,share)
{
	host = host.toLowerCase();
	share = share.toLowerCase();

	MountEx_MountsInProgress["\\\\" + host + "\\" + share] = null;
	var found = false;
	for ( i in MountEx_MountsInProgress )
	{
		if ( MountEx_MountsInProgress[i] != null )
		{
			found = true;
			break;
		}
	}
	if ( found == false )
		MountEx_MountsInProgress = new Object();
}

function MountEx_Close()
{
	if ( MountEx_MountsInProgress != null )
	{
		MountEx_MountsInProgress = null;
		Sink.DetachEvent(TVShell.StorageManager, "OnDeviceAdd", MountEx_OnDeviceAdd);
		Sink.DetachEvent(TVShell.ConnectionManager.HomeNetworking, "OnServiceHandler", MountEx_OnServiceHandler);
	}
}

function MountEx_OnDeviceAdd(sd)
{
	if (sd != null && MountEx_MountsInProgress != null )
	{
		var host = ToUNCHostName(sd.VolumeName).toLowerCase();
		var share = ToUNCShareName(sd.VolumeName).toLowerCase();
		var vn = "\\\\" +host+"\\"+share;
		var req = MountEx_MountsInProgress[vn];
		if ( req )
			req.func(vn, sd,/*status=*/0);

		MountEx_RemoveCb(host,share);
	}
}
		
function MountEx_OnServiceHandler(he, se, evt, status)
{
	switch (evt) {
	case HN_EVT_MOUNTED:

		//If this is the device we are viewing, then let's close the HTC.
		if ( status != 0 && he != null && se != null )
		{
			var host = he.Name.toLowerCase();
			var share = se.Name.toLowerCase();
			var vn = "\\\\" +host+"\\"+share;
			var req = MountEx_MountsInProgress[vn];
			if ( req )
				req.func(vn, null,/*status=*/status);

			MountEx_RemoveCb(host,share);
		}
		break;
	}
}	

//Use this to display the appropriate dialog when the media content
//becomes unavailable because the device has been removed. This function
//returns "Done" if user wants to quit the viewer, and "Retry" if the
//user wishes to refresh the page.
function AskDoneOrRetryOnContentUnavailable(storageDevice,media)
{
	//If this is a UNC storage device, give the user the option
	//of refreshing the page. 
	var res = "Done";
	var Media = "Photos";
	if (media=="video")
		Media = "Videos";
	else if (media=="music")
		Media = "Music";
	if ( storageDevice.IsNetwork
		 && storageDevice.Provider.toLowerCase() == "unc" )
	{
		var retVal = PanelManager.CustomMessageBox("The " + media + " you are trying to access is no longer available. <p> Choose <em>Refresh</em> to get the latest list of files in this folder. Choose <em>Done</em> to leave the folder and return to the " + Media + " home page.","", "Refresh;Done", 1,"");						
		if(retVal==0)
		{
			res = "Retry";
		}
	}
	else
	{
		PanelManager.CustomMessageBox("The content you are viewing is no longer available. Your current activity cannot be completed. Choose OK to continue.","Content Not Available", "OK", 0,"");
	}
	return res;
}

var ST_ON_NB = "NBOnline";
var ST_ON_BB = "BBOnline";
var ST_OFF = "Offline";
var HN_Y = "HasHomeNetworkOrUsb";
var HN_N = "NoHomeNetworkOrUsb";
var forceHomeNw = null;
var forceOnlineState = null;

function GetHomeNetworkStatus()
{
	if (forceHomeNw)
		return forceHomeNw;

	var hnState = HN_N;
	if ( HomeNetworkObj.Count > 0 )
	{
		hnState = HN_Y;
	}
	else
	{
		for (var i = 0; i < StorageManager.Count; i++) 
		{
			var StorageDevice = StorageManager.Item(i);
			if (StorageDevice.IsNetwork
				|| (StorageDevice.Removable && 
				StorageDevice.Mounted) ) 
			{
				hnState = HN_Y;
				break;
			}
		}
	}

	return hnState;
}

function GetOnlineState()
{
	if ( forceOnlineState )
		return forceOnlineState;

	var onlineState = ST_OFF;
	
	if ( TVShell.UserManager.CurrentUser && TVShell.UserManager.CurrentUser.IsAuthorized &&
		 TVShell.ConnectionManager.WANState == ConnectState_Connected)
	{
		if (GetWanConnectionType() == CONN_BB)
			onlineState = ST_ON_BB;
		else
			onlineState = ST_ON_NB;
	}

	return onlineState;
}

var CONN_BB = 'BB';
var CONN_NB = 'NB';

function GetWanConnectionType()
{
	return TVShell.ConnectionManager == null
		 || TVShell.ConnectionManager.WANAdapter == null
		 || TVShell.ConnectionManager.WANAdapter.Type == AdapterType_Modem 
		 ? CONN_NB : CONN_BB;
}

