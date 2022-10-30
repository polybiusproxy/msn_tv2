var Utilities				= TVShell.Utilities;
var PanelManager			= TVShell.PanelManager;
var StorageManager			= TVShell.StorageManager;
var CurrentUser				= TVShell.UserManager.CurrentUser;	
var mainPanel				= PanelManager.Item("main");
var HomeNetworkObj			= TVShell.ConnectionManager.HomeNetworking;

var StorageDeviceVN 		= parameters.StorageDeviceVN;
var path 					= parameters.path;
// LOCATION = 0 := ON_THE_BOX (i.e. the unit's internal flash drive)
// LOCATION = 1 := REMOVABLE_LOCAL_STORAGE (i.e. memory card)
// LOCATION = 2 := OTHER (i.e. network, mail, or ... )
var location 				= parameters.location;

var ContentSync				= new ActiveXObject("MSNTV.ContentSync");
var userDataPath			= ContentSync.UserDataPath;
var userDataVolumeName		= userDataPath;

var playlistFilename		= "playlist.asx";
var tempPlaylistUrl1		= "file:///Temp/1" + playlistFilename;
var tempPlaylistUrl2		= "file:///Temp/2" + playlistFilename;
var songListUrl				= "file://" + userDataVolumeName + "\\" + playlistFilename;

var DMRItemArray = new Array();
var DirectoryArray = new Array();
var PlaylistArray = new Array();

var WMPSettingsPath="MediaPlayer\\Settings"
var vsFileName="WMPVisualization.txt"

WMPVisualizationFireworks = 1;
WMPVisualizationPhotoScreenSaver = 2;
WMPVisualizationAlbumArt = 3;

function GotoURL(destURL)
{
	if(destURL)
		document.location = destURL;
}

function ReplaceURL(destURL)
{
	if(destURL)
		document.location.replace( destURL );
}

function ReplaceBackSlashWithSlash(text)
{
	return text.replace(/\\/gi, "/");
}

function IsSameURL(URL1, URL2)
{
	return (ReplaceBackSlashWithSlash(URL1.toLowerCase()) == ReplaceBackSlashWithSlash(URL2.toLowerCase()));
}

function IsClientASXFile(URL)
{
	return (IsSameURL(URL, tempPlaylistUrl1) || IsSameURL(URL, tempPlaylistUrl2) || IsSameURL(URL, songListUrl));
}


// common tools across apps

function FormatURL(srcURL)
{
	if(srcURL && !IsNetworkFile(srcURL) && srcURL.toLowerCase().substr(0, 7) != "file://")
	{
		var tempURL = "file://" + srcURL;
		return tempURL;
	}
	return srcURL;
}

function IsNetworkFile(fileName)
{
	return (fileName && fileName.toLowerCase().substr(0, 7) == "http://") ? true : false;
}

function GetPath( StorageDeviceVN, hrefText)
{
	var hrefTextLC = hrefText.toLowerCase();
	var pathText = hrefText;
	var slashPos = hrefTextLC.indexOf(StorageDeviceVN.toLowerCase());
	if(slashPos != -1)
		pathText = hrefText.slice(slashPos+StorageDeviceVN.length + 1);
		
	return pathText;
}

function GetParentLocationString( devVN, parentDir )
{
	var res = "";
	var folder = devVN;
	if ( parentDir != null && parentDir != "" )
		folder = parentDir;
	
	if (folder != null)
	{
		var i = folder.lastIndexOf("\\");
		// if i == -1, then use the whole string if length > 0
		if ( (i+1) < folder.length )
			res = " under " + folder.substring( i +1, folder.length );
	}

	return res;
}

function SynchronizeShares()
{
	// first update the online state for each host
	for (var i = 0; i < HomeNetworkObj.Count; i++)
	{
		HomeNetworkObj.Item(i).BringOnline();
	}

	// Then autodetect for shares
	for (var i = 0; i < HomeNetworkObj.Count; i++) {
		HomeNetworkObj.Item(i).AutoDetect(1);
	}
}

function MountAll()
{
	for (var i=0; i<HomeNetworkObj.Count; i++) {
		var he = HomeNetworkObj.Item(i);
		for (var j=0; j<he.Count; j++) {
			var se = he.Item(j);
			if (se && se.Enabled) {
				se.Mount();
			}
		}
	}
}

function SetPlayerURL(URL)
{
	playerDiv.innerHTML = "";	// EdTecot - this is needed so that RemoveMedia gets called before AddMedia
	playerDiv.innerHTML = "<object id=\"player\" classid=\"CLSID:6BF52A52-394A-11d3-B153-00C04F79FAA6\"></object>";
	player.URL = URL;
}

function NextPlaylistURL()
{
	var playlistUrl = tempPlaylistUrl1;
	var mediaPanel = PanelManager.Item("mediapanel");

	if (mediaPanel) {
		var videoie = mediaPanel.Document.all.videoie;

		if (videoie) {
			if (IsSameURL(videoie.URL, playlistUrl)) {
				playlistUrl = tempPlaylistUrl2;
			}
		}
	}

	return playlistUrl;
}

// DMRItem constructor
function DMRItem(name, href, contentType, checked, date, time, thumbnailURL, printReadyURL, from, mailURL, subject )
{
	this.name = Utilities.EscapeHTML(name);
	this.href = href;
	this.contentType = contentType;
	this.checked = checked;
	this.date = date;
	this.time = time;
	
	// mail photoitem specific data
	this.thumbnailURL = thumbnailURL;
	this.printReadyURL = printReadyURL;
	this.from = from;
	this.mailURL= mailURL;
	this.subject = subject;
}

function ToFriendlyName(StorageDeviceVN, usbIndex)
{
	var DeviceName = "";
	if(StorageDeviceVN)
	{
		var StorageDevice = FindStorageDevice(StorageDeviceVN);
		var nm = StorageDeviceVN;
		if (StorageDevice)
		{
			nm = StorageDevice.Name;
			if (StorageDevice.Removable 
				&& !StorageDevice.IsNetwork
				&& StorageDevice.Provider.toLowerCase() == "local" 
				&& StorageDevice.VolumeName.indexOf(":") < 0)
			{
				var numUSBDevice=0;
				var StorageManager = TVShell.StorageManager;
				var i;
				var sd;
				for (i=0; i<StorageManager.Count && !usbIndex; i++) 
				{
					sd = StorageManager.Item(i);

					if ( (sd.Removable 
						  && !sd.IsNetwork
						  && sd.Mounted ) == false )
						continue;

					numUSBDevice++;

					if ( sd.VolumeName.indexOf(":") >= 0 )
						continue;//Don't rename A:-Z: drives


					if ( sd.VolumeName == StorageDevice.VolumeName )
						usbIndex = numUSBDevice;
				}
				if ( usbIndex )
					nm = "Device (#" + usbIndex + ")";
			}
		}
		var slashPos = nm.indexOf("\\\\");
		if(slashPos!=-1)
		{
			DeviceName = nm.slice(slashPos+2);
			slashPos = DeviceName.indexOf("\\");
			if(slashPos!=-1)
			{
				DeviceName = DeviceName.slice(0,slashPos);	
			}
		}
		else
		{
			slashPos = nm.indexOf("\\");
			DeviceName = (slashPos!=-1?nm.slice(slashPos+1): nm);
		}
	}

	return DeviceName;
}

function WriteHeadingLabel(StorageDeviceVN, path,app)
{
	if(StorageDeviceVN)
	{
		var DeviceName = ToFriendlyName(StorageDeviceVN);

		if(document.all.Heading && DeviceName!="")
		{
			if ( app == "photo" )
				Heading.label = DeviceName;
			else
				Heading.subTitle = DeviceName;
		}
	}
}


