var audioTypes				= "audio/wav,audio/x-wav,audio/aiff,audio/x-aiff,audio/basic,audio/x-ms-wma,audio/mpeg";
var videoTypes				= "video/mpeg,video/x-ms-wmv,video/x-ms-wm,video/avi,video/msvideo,video/x-msvideo,video/asf,video/x-ms-asf";
var playlistTypes			= "video/x-ms-wvx,video/x-ms-wmx,application/vnd.ms-wpl,audio/x-mpegurl,audio/x-ms-wax,video/x-ms-asx";
var SupportedPhotoMIMETypes = "image/jpeg, image/gif, image/bmp, image/png";

var DMRMaxSearchCount = -1;
var DMRMaxResultCount = -1;

//Set this to false to prohibit any reading of data.
var DMRAllowReading = true;

var MIMESummaryArray = new Array();
var TopLevelFolderArray = new Array();
var currentSelectedPath = "";
var g_fTruncated = false;
var fFlattenDirectories = false;
var upnpError = false;
var uncView = true;
var UNC_HOST_ONLINE = 3;

// global function to determine if a storage device is a UPNP device
function isUPNP( sd )
{
	var bRet = false;
	if ( sd && !sd.Removable && sd.IsNetwork && sd.Mounted && ( sd.Provider.toLowerCase() != "onlinestorage" ) ) bRet = true;
	return bRet;
}

// global function to determine if a storage device is a USB device
function isUSB( sd )
{
	var bRet = false;
	if ( sd && sd.Removable && !sd.IsNetwork && sd.Mounted && ( sd.Provider.toLowerCase() != "onlinestorage" ) ) bRet = true;
	//mark all of the local drives w/ names A:-Z: as *USB* devices so they
	//show up in the device list.
	if ( sd.Provider.toLowerCase() == "local" && !sd.IsNetwork && sd.Mounted && sd.VolumeName.indexOf(":") == 1 )
		bRet = true;

	return bRet;
}

// count connected UPNP devices  and UNC hosts and
// reconcile which are from the same computer to obtain
// a count of connected individual PCs
function numberPCs()
{
	var numPCs = 0;
	var bNew = true;
	var pcArray = new Array();
	
	for (var i = 0; i < StorageManager.Count; i++)
	{
		var StorageDevice = StorageManager.Item(i);
		if ( isUPNP( StorageDevice ) )
		{
			bNew = true;
			for ( var k = 0 ; k < pcArray.length ; k++ )
			{
				if ( StorageDevice.IPAddress == pcArray[k].IPAddress )
				{
					// same computer
					bNew = false;
					k = pcArray.length;
				}
			}
			if ( bNew )
			{
				pcArray[numPCs] = StorageDevice;
				numPCs++;
			}
		}
	}

	for (var i=0; i<HomeNetworkObj.Count; i++)
	{
		var he = HomeNetworkObj.Item(i);
		bNew = true;
		for ( var k = 0 ; k < pcArray.length ; k++ )
		{
			if ( he.IPAddress == pcArray[k].IPAddress )
			{
				// same computer
				bNew = false;
				k = pcArray.length;
			}
		}
		if ( bNew )
		{
			// only count the unc host if it is online
			if ( he.state == UNC_HOST_ONLINE ) numPCs++;
		}
	}

	return numPCs;

}

// number of UPNP servers (maybe from the same computer)
function numberUPNP()
{
	var numPCs = 0;
	
	for (var i = 0; i < StorageManager.Count; i++)
	{
		var StorageDevice = StorageManager.Item(i);
		if ( isUPNP( StorageDevice ) )
		{
			numPCs++;
		}
	}
	return numPCs;
}


function numUSB()
{
	var cnt = 0;
	for (var i=0; i<StorageManager.Count; i++)
	{
		var StorageDevice = StorageManager.Item(i);

		if ( isUSB( StorageDevice ) )
		{
			cnt++;
		}
	}
	return cnt;
}

function numUNCShares()
{
	var numShares = 0;
	for (var i=0; i<HomeNetworkObj.Count; i++)
	{
		var he = HomeNetworkObj.Item(i);

		for (var j=0; j<he.Count; j++) {
			var se = he.Item(j);
			
			if (HN_RESOURCE_STORAGE == se.Type) {
				numShares++;
			}
		}
	}
	return numShares;
}

function getTruncationText()
{
	// first check if viewing mail attachments
	var str;
	var maxFiles = (DMRMaxResultCount == -1 ? "1,000" : DMRMaxResultCount);
	if ( parameters.AttachmentViewer )
	{
		str = "<P>This folder displays the " + maxFiles + " photos that you’ve received most recently. To see older photos, please go to Mail.</P>";
		return str;
	}
	else if (XMLFileURL)
	{
		str = "<P>There are more than " + maxFiles + " photos in this e-mail attachment. Only the first " + maxFiles + " are displayed.</P>";
		return str;
	}
	
	
	var sd = FindStorageDevice(StorageDeviceVN);
	var usb = false;
	if ( sd ) usb = isUSB(sd);
	if ( usb )
	{
		str = "<P>This folder displays only its first " + maxFiles + " items. To see more, plug your device into a PC and reorganize this folder.</P>";

	}
	else
	{
		str = "<P>This folder displays only its first " + maxFiles + " items. To see more, go to your PC and reorganize the folder to have fewer files and subfolders.</P>";
	}
	return str;
}

function BuildTopLevelFolderDiv()
{
	if ( TopLevelFolderArray.length <= 0 )
	{
		topSpaceRow.style.display = "none";
		topLevelNavRow.style.display = "none";
		var fName = "";
		var topLevelFolder = "";
		var titleWidth = viewByRow.clientWidth - 15 - 22 - 5;
		if ( parameters.topLevelFolder ) topLevelFolder = parameters.topLevelFolder;
		if ( parameters.parentFolderName )
		{
			fName = parameters.parentFolderName;
		}
		else
		{
			if ( StorageDeviceVN )
			{
				var sd = FindStorageDevice(StorageDeviceVN);
				if ( sd )
				{
					if ( !isUSB( sd ) && !isUPNP( sd ) && ( sd.Provider.toLowerCase() != "onlinestorage" ) )
					{
						//unc share, show share name
						var slashPos = StorageDeviceVN.lastIndexOf("\\");
						if( slashPos!=-1 ) fName = StorageDeviceVN.slice(slashPos+1);
					}
				}
			}
		}

		if ( fName != "" )
		{
			viewByRow.style.display = "block";
			topLevelViewBy.style.width = titleWidth;
			if ( topLevelFolder == "" )
			{
				if(parameters["AlbumName"])
				  topLevelViewBy.innerHTML = "You are in <em>" + parameters["AlbumName"] + "</em>";
				else
				  topLevelViewBy.innerHTML = "You are in <em>" + fName + "</em>";
			}
			else
			{
				
				topLevelViewBy.innerHTML = "View " + homeMediaType + " by " + topLevelFolder + ": <em>" + fName + "</em>";
			}
		}
		else
		{
			viewByRow.style.display = "none";
		}
		return;
	}
	
	topSpaceRow.style.display = "block";
	viewByRow.style.display = "block";
	topLevelNavRow.style.display = "block";
	var str = "";
	var currentURL = document.location.href;
	currentURL = removeParam( currentURL , "path=" );
	currentURL = removeParam( currentURL , "topLevelFolder=" );

	for ( var i = 0 ; i < TopLevelFolderArray.length ; i++ )
	{
		var folder = TopLevelFolderArray[i];
		var nm = folder.nameLowerCase;
		var bSelected = ( nm == currentSelectedPath ) ? true : false;
		var destURL=currentURL;
		var pathText = GetPath(StorageDeviceVN, folder.href);
		if(pathText) destURL+="&path=" + encodeURIComponent(pathText);
		pathText = folder.name;
		if(pathText) destURL+="&topLevelFolder=" + encodeURIComponent(pathText);
		var className = (bSelected ? "selectedTopFolder" : "normalTopFolder");
		var filler = "<span style='width:6px;'></span>";
		str += "<a class='" + className + "' onclick='parent.ReplaceURL(\"" + EscapeScriptString(destURL) + "\");' >";
		str += filler;
		str += Utilities.EscapeHTML( folder.name );
		str += filler;
		str += "</a>";
	}
	topLevelFolderDiv.innerHTML = str;

}

function removeParam( url , item )
{
	var index = url.indexOf("?");
	if ( index < 0 ) return url;
	var str = url.substr( 0 , index );
	var params = url.substr( index + 1 );
	var par = params.split( "&" );
	var delimiter = "?";
	for ( var i = 0 ; i < par.length ; i++ )
	{
		if ( par[i].indexOf( item ) != 0 )
		{
			
			str += ( delimiter + par[i] );
			delimiter = "&";
		}
	}
	return str;
}

function EscapeScriptString(element)
{
	if (element) {
		var re = /['"\\]/g;	//'
		return element.replace(re, "\\$&");
	}
}

function ChangeHyphenToSlash(element)
{
	if(element)
	{
		var re = /[-]/g; 
		return element.replace(re, '/');
	}
}


// Directory constructor
function Directory(name, art, href,nameLowerCase)
{
	this.name = name;
	this.href= href;
	this.art = art;
	this.nameLowerCase = nameLowerCase;
}

function MIMETypeSum( nm , cnt )
{
	this.name = nm;
	this.count = cnt;
}

var UPNPGenericError= "<p>Your Media Receiver encountered an error while trying to access content on</p><p>%DEVICE%.</p>";
/* Add UPNP errors to this list.
 */
var UPNPErrors= [
	[ -2147220535, "<p>Your Media Receiver is not authorized to access content on</p><p>%DEVICE%.</p><p>Configure your Computer to share content with this Media Receiver.</p>" ]
];

function GetUPNPError(errCode, StorageDevice)
{
	var ix;
	var errString = UPNPGenericError;
	var foundError = false;
	for (ix=0; ix< UPNPErrors.length; ix++) 
	{
		if (errCode == UPNPErrors[ix][0]) {
			errString = UPNPErrors[ix][1];
			foundError = true;
			break;
		}
	}
	if ( !foundError )
		TVShell.Message("UNKNOWN UPNP ERROR " + errCode + " ON DEVICE " + StorageDevice.Name );

	errString = errString.replace(/%DEVICE%/g, StorageDevice.Name );

	return errString;
}

function DMRAbortViewer()
{
	TVShell.Message( "Aborting viewer." );
	HideProgressPanel();
	DMRAllowReading = false;
	history.go(-1);
}

function DMRBuildArrays2Ex( userCallback, userData, itemTypes, formatURLs, flattenMemoryCard, defaultPath, app )
{
	if ( DMRAllowReading == false )
	{
		if ( userCallback )
			userCallback( userData );
		return;
	}

	TVShell.Message( "DMRBuildArrays2Ex(itemTypes=" + itemTypes + ",formatURLs="+formatURLs+",flatten=" +flattenMemoryCard+",path="+defaultPath + ",app=" + app + ")" );
	var myData = new Object();
	myData.userCallback = userCallback;
	myData.userData = userData;
	myData.itemTypes = itemTypes;
	myData.formatURLs = formatURLs;
	myData.flattenMemoryCard = flattenMemoryCard;
	myData.defaultPath = defaultPath;
	myData.app = app;

	myData.accessRoot = false;
	myData.bUPNPServer = false;
	myData.currentSelectedPath = "";
	if (StorageManager && StorageDeviceVN) myData.sdev = FindStorageDevice(StorageDeviceVN);
	if ( myData.sdev && myData.sdev.Mounted ) myData.bUPNPServer = ( myData.sdev.Provider == "UPNP" ) ? true : false;
	TopLevelFolderArray = new Array();

	if ( !myData.bUPNPServer  )
	{
		uncView = true;
		DMRBuildArraysEx( userCallback, userData, myData.itemTypes , myData.formatURLs, myData.flattenMemoryCard );
		return;
	}

	uncView = false;
	// handle upnp different
	// we need to keep top level folders for quick navigation
	TVShell.Message("UPNP device, get root folders");

	// temp store the desired path;
	myData.tmpPath = "";
	if ( path ) myData.tmpPath = path;

	// if we are accessing the root, we will want to drill into app specific stuff later
	if ( !path || path == "" )
	{
		myData.accessRoot = true;
	}

	upnpError = false;	// can be set in DMRBuildArrays
	// first access the top level app specific folders

	// Always access root first to obtain top level folders
	path = "0";		// root
	DMRBuildArraysEx( DMRBuildArrays2Ex_Root, myData, myData.itemTypes , myData.formatURLs, myData.flattenMemoryCard );
}

// possible names for top level folders
var musicNames = [ "music" , "song" ];
var photoNames = [ "photo" , "picture" ];
var video = [ "video" , "movie" ];

function DMRBuildArrays2Ex_Root(myData)
{
	var searchArray = new Array();
	if ( myData.app == "music" ) searchArray = musicNames;
	if ( myData.app == "photo" ) searchArray = photoNames;
	if ( myData.app == "video" ) searchArray = video;
	
	if ( (searchArray.length <= 0 ) || upnpError || DMRAllowReading == false ) {
		if (myData.userCallback) myData.userCallback(myData.userData);
		return;
	}

	var href = "";
	// find the best folder to drill into
	for ( var i = 0 ; i < DirectoryArray.length ; i++ )
	{
		for ( var k = 0 ; k < searchArray.length ; k++ )
		{
			if ( DirectoryArray[i].nameLowerCase.indexOf( searchArray[k] ) >= 0 )
			{
				href = DirectoryArray[i].href;
			}
		}
	}

	if ( href == "" )
	{
		path = myData.tmpPath;
		DMRBuildArraysEx( DMRBuildArrays2Ex_Step3, myData, myData.itemTypes , myData.formatURLs, myData.flattenMemoryCard );
		return;
	}
	

	// drill down into the desired top level folder (music, video or photos)
	path = href;
	DMRBuildArraysEx( DMRBuildArrays2Ex_Step2, myData, myData.itemTypes , myData.formatURLs, myData.flattenMemoryCard );
}

function DMRBuildArrays2Ex_Step2(myData)
{
	if ( upnpError || DMRAllowReading == false ) {
		if (myData.userCallback)
			myData.userCallback(myData.userData);
		return;
	}

	// store the top level folders for navigation 
	TopLevelFolderArray = DirectoryArray;

	// if we were accessing the root, then we will want to drill down further into the default folder
	// see if that folder exists and if so, drill into it
	if ( myData.accessRoot )
	{
		for ( var i = 0 ; i < TopLevelFolderArray.length ; i++ )
		{
			var nm = TopLevelFolderArray[i].nameLowerCase;
			if ( nm == myData.defaultPath.toLowerCase() )
			{
				path = TopLevelFolderArray[i].href;
				myData.currentSelectedPath = nm;
				currentSelectedPath = nm;
				parameters.topLevelFolder = TopLevelFolderArray[i].name;
				DMRBuildArraysEx( myData.userCallback, myData.userData, myData.itemTypes , myData.formatURLs, myData.flattenMemoryCard );
				return;
			}
		}

	}

	// otherwise enumerate the original desired path
	path = myData.tmpPath;
	DMRBuildArraysEx( DMRBuildArrays2Ex_Step3, myData, myData.itemTypes , myData.formatURLs, myData.flattenMemoryCard );
}

function DMRBuildArrays2Ex_Step3( myData )
{
	if ( DMRAllowReading == false )
	{
		if ( userCallback )
			userCallback( userData );
		return;
	}

	// if we are navigating to a new top level folder, update the currentSelectedPath variable
	for ( var i = 0 ; i < TopLevelFolderArray.length ; i++ )
	{
		var folder = TopLevelFolderArray[i];
		if ( folder.href == path ) currentSelectedPath = folder.nameLowerCase;
	}

	// if we are down below the top level, then we don't show the top level folders
	if ( currentSelectedPath == "" )  TopLevelFolderArray = new Array();

	if (myData.userCallback)
		myData.userCallback( myData.userData );
}

var DMRBuildArraysEx_st = null;
function DMRBuildArraysEx(userCallback, userData, itemTypes, formatURLs, flattenMemoryCard )
{
	var StorageDevice = null;
	var deviceAvailable = false;
	if (StorageManager && StorageDeviceVN)
	{
		StorageDevice = FindStorageDevice(StorageDeviceVN);
		if ( StorageDevice && StorageDevice.Mounted ) deviceAvailable = true;
	}

	if ( !deviceAvailable )
	{
		TVShell.PanelManager.CustomMessageBox("<P>This device is currently not available.</P>","","OK",0,"",
			true, MGX_ICON_WARNING, MGX_SIZE_SMALL );
	}

	if ( ( deviceAvailable == false ) || (  DMRAllowReading == false ) )
	{
		if ( userCallback )
			userCallback( userData );
		return;
	}

	var myData = new Object();
	myData.userCallback = userCallback;
	myData.userData = userData;
	myData.itemTypes = itemTypes;
	myData.formatURLs = formatURLs;
	myData.flattenMemoryCard = flattenMemoryCard;
	myData.checked = false;
	myData.st = new Date().getTime();

	TVShell.Message("DMR Build Arrays Ex ENTER (" + myData.itemTypes + ") " + myData.flattenMemoryCard );
    g_fTruncated = false;
	DirectoryArray = new Array();
	PlaylistArray = new Array();
	DMRItemArray = new Array();
	MIMESummaryArray = new Array();
	
	EnumerateItems( DMRBuildArraysEx_Step2, myData, StorageDevice, path, myData.itemTypes, 1 );
}

function DMRBuildArraysEx_Step2( myData, StorageDevice, path, itemTypes, xmlDoc, error)
{
	if ( DMRAllowReading == false )
	{
		if ( myData.userCallback )
			myData.userCallback( myData.userData );
		return;
	}

	var nodes = null;
	var i;

	if(xmlDoc)
	{
	    var statusNode=xmlDoc.selectSingleNode("//status");
        if(statusNode)
		{
			var statusAttributes=statusNode.attributes;
			if(statusAttributes && statusAttributes.length>=3)
			{   
				var ErrorReturned = parseInt(statusAttributes.item(0).value);
				var TotalMatches  = parseInt(statusAttributes.item(1).value);
				var NumberReturned= parseInt(statusAttributes.item(2).value);
			    
			    if(TotalMatches > NumberReturned)
			    {
					g_fTruncated=true;
				}
				TVShell.Message("TotalMatches="+TotalMatches);
				TVShell.Message("NumberReturned="+NumberReturned);
				TVShell.Message("ErrorReturned="+ErrorReturned);
						
				// windows media connect does not authorize our device - tell the user 
				//-2147024878 is not an error. It simply means no more item found
				if (ErrorReturned!=0 && ErrorReturned!=-2147024878) {  
					var info=GetUPNPError(ErrorReturned, StorageDevice);
					HideProgressPanel();
					upnpError = true;	// set flag for caller
					TVShell.PanelManager.CustomMessageBox(info,"","OK",2,"", true);
					history.go(-1);
				}
			}
		}
	}

	if ( xmlDoc )
	{
		nodes = xmlDoc.selectNodes("//a:mimetype" );
		if ( nodes && nodes.length > 0 )
		{
			var ind = 0;
			for ( var k = 0 ; k < nodes.length ; k++ )
			{
				var atts = nodes[k].attributes;
				var nm = atts.item(0).value;
				var cn = atts.item(1).value;
				if ( nm && cn )
				{
					TVShell.Message("MimeType:>" + nm + "< - Count: " + cn );
					MIMESummaryArray[ind] = new MIMETypeSum( nm , cn );
					ind++;
				}
			}
		}
	}

	TVShell.Message("Number of mime types = " + MIMESummaryArray.length );
		
	// Build directory array
	if (xmlDoc) {
		nodes = xmlDoc.selectNodes("//a:response[a:propstat/a:prop/a:iscollection = 1]");
	}
	if (nodes && nodes.length > 0) {
		var length = nodes.length;
		var maybeMemoryCard = StorageDevice.Removable && !StorageDevice.IsNetwork && StorageDevice.Mounted;
		fFlattenDirectories = false;

		for (i = 0; i < length; i++) {
			var node = nodes.item(i);
			var name = node.selectSingleNode(".//a:displayname").text;
			var nameLowerCase = name.toLowerCase();
			var href = node.selectSingleNode(".//a:href").text;
			var optionalNode = node.selectSingleNode(".//a:displayhref");
			var art = null;
					
			if (optionalNode) {
				art = optionalNode.text;
			}
			if (href) {
				if (maybeMemoryCard && nameLowerCase == "dcim")	fFlattenDirectories = true;
				DirectoryArray[i] = new Directory(name, art, href,nameLowerCase);
			}
		}
	}

	// enumerate all sub-folders if this is a memoryCard (used by photos app)
	if(myData.flattenMemoryCard && fFlattenDirectories)
	{
		EnumerateItems(DMRBuildArraysEx_Step3, myData, StorageDevice, path, myData.itemTypes, -1);
	} else {
		DMRBuildArraysEx_Step3( myData, StorageDevice, path, myData.itemTypes, xmlDoc, error, nodes);
	}
}

function DMRBuildArraysEx_Step3( myData, StorageDevice, path, itemTypes, xmlDoc, error)
{
	if ( DMRAllowReading == false )
	{
		if ( myData.userCallback )
			myData.userCallback( myData.userData );
		return;
	}

	// Build playlist and track arrays
	var nodes = null;
	if (xmlDoc) {
		nodes = xmlDoc.selectNodes("//a:response[a:propstat/a:prop/a:iscollection = 0]");
	}

	if (nodes && nodes.length > 0) {
		var length = nodes.length;

		for (i = 0; i < length; i++) {
			var node = nodes.item(i);
		    var name = node.selectSingleNode(".//a:displayname").text;
			var href = node.selectSingleNode(".//a:href").text;
			var contentType = node.selectSingleNode(".//a:getcontenttype").text;
			var dateNode = node.selectSingleNode(".//a:getlastmodified");
			if(!dateNode)	dateNode = node.selectSingleNode(".//a:creationDate");
			var date = "";
			if(dateNode) date = dateNode.text;
			var timeV =new Date(ChangeHyphenToSlash(date));
			var timeMs = timeV.getTime();

			if (href) {
				if (myData.formatURLs) {
					href = FormatURL(href);
				}
				if ( TVShell.Utilities.isMimeInList( contentType , playlistTypes ) )
				{
					PlaylistArray.push(new DMRItem(name, href, contentType, myData.checked, date, timeMs ));
				}
				else {
					var dmrItem = new DMRItem(name, href, contentType, myData.checked, date, timeMs );
					DMRItemArray.push(dmrItem);
					var titleNode = node.selectSingleNode(".//a:title");
					var artistNode = node.selectSingleNode(".//a:artist");
					var albumNode = node.selectSingleNode(".//a:album");
					var durationNode = node.selectSingleNode(".//a:duration");
					if (titleNode) {
						dmrItem.title = titleNode.text;
					}
					if (artistNode) {
						dmrItem.artist = artistNode.text;
					}
					if (albumNode) {
						dmrItem.album = albumNode.text;
					}
					if (durationNode) {
						dmrItem.duration = durationNode.text;
					}
				}
			}
		}
	}

	var et = new Date().getTime();
	TVShell.Message( "DMRBuildArraysEx(). time=" + (et-myData.st) );

	//Now tell the caller that DMRBuildArraysEx is done.
	if ( myData && myData.userCallback )
		myData.userCallback( myData.userData );
	
}

// This function totals the counts of all mimeTypes found in the MimeSummaryArray
// which was created in BuildArrays
function QueryMimeTypes( mimeTypes )
{
	var count = 0;
	if ( MIMESummaryArray && MIMESummaryArray.length > 0 )
	{
		for ( var i = 0 ; i  < MIMESummaryArray.length ; i++ )
		{
			if ( TVShell.Utilities.isMimeInList( MIMESummaryArray[i].name , mimeTypes ) )
			{
				count += parseInt( MIMESummaryArray[i].count );
			}
		}
	}
	return count;
}

// obtain URL of viewer with the current parameters intact
function musicViewerURL()
{
	return replaceBaseURL( "msntv:/Music/Viewer.html" );
}

function photosViewerURL()
{
	return replaceBaseURL( "msntv:/Photo/Viewer.html" );
}

function videoViewerURL()
{
	return replaceBaseURL( "msntv:/Video/Viewer.html" );
}

// replace the main panel url but leave the parameters intact 
function replaceBaseURL( url )
{
	var mainURL = TVShell.PanelManager.Item("main").URL;
	TVShell.Message("Main URL = " + mainURL );
	var index = mainURL.indexOf( "?" );
	if ( index >= 0 )
	{
		url += mainURL.substr( index );
	}
	TVShell.Message("new URL = " + url );
	return url;
}


//
// Does asynchronous calls to the storage manager. Will invoke 
// the callbackFunc( callerData, storageDevice, folderPath, mimeTypes, xmlDoc, error)
// when done.
var EnumInited = false;
var EnumSink = null;
var EnumQueue = new Array();
var EnumCurrRequest = null;
function EnumerateItems(callbackFunc,callerData,storageDevice,folderPath,mimeTypes,maxDepth)
{
	if ( !EnumInited )
		EnumOpen();

	var req = new Object();

	req.volumeName = storageDevice.VolumeName.toLowerCase();
	req.func = callbackFunc;
	req.userData = callerData;

	req.storageDevice = storageDevice;
	req.folderPath = folderPath;
	req.mimeTypes = mimeTypes;
	req.maxDepth = maxDepth;
	
	EnumQueue[EnumQueue.length++] = req;

	if ( EnumQueue.length == 1 )	
		setTimeout(EnumProcessItem,10);
}

function EnumProcessItem()
{
	var req = EnumQueue.pop();
	if (req)
	{
		EnumCurrRequest = req;
		try
		{
			req.storageDevice.EnumerateItemsEx( req.folderPath,req.mimeTypes, req.maxDepth, DMRMaxSearchCount, DMRMaxResultCount, 0, 0 );
		} catch (ex) {
			TVShell.Message( "asynchronous Storage exception: " +
							req.storageDevice.Name +
							ex + " " + ex.description + ". trying sync API");
			//For now, we'll try the sync storage api as a backup.
			var xmlDoc = null;
			var error = 1;
			try
			{
				var xmlResult =
					req.storageDevice.EnumerateItems( req.folderPath, req.mimeTypes, req.maxDepth, DMRMaxSearchCount, DMRMaxResultCount );
				xmlDoc = xmlResult ?
					new ActiveXObject("Msxml2.DOMDocument") : null;
				if (xmlDoc) {
					xmlDoc.async = false;
					xmlDoc.resolveExternals = false;
					xmlDoc.validateOnParse  = false;
					if (!xmlDoc.loadXML(xmlResult)) {
						xmlDoc = null;
					}
				}
				xmlResult = null;
				if ( xmlDoc ) {
					error = 0;
					TVShell.Message( "Sync API was successful" );
				} else {
					TVShell.Message( "Sync API was unsuccessful" );
				}
			} catch (ex) {
				TVShell.Message( "WARNING: sync API failed as well: " +ex 
								 + " " + ex.description );
				xmlDoc = null;
				error = 1;
			}

			Enum_OnEnumComplete( req.storageDevice, xmlDoc, 0, 0, 0 );
			xmlDoc = null;
		}
	}
}

function Enum_OnEnumComplete( storageDevice, xmlDoc, total, matched, error )
{
	var vn = storageDevice.VolumeName.toLowerCase();
	var req = EnumCurrRequest;
	if ( req && vn == req.volumeName )
	{
		EnumCurrRequest = null;
		if (error)
			xmlDoc = null;
		req.func( req.userData, req.storageDevice, req.folderPath, req.mimeTypes, xmlDoc, error);
	}
	if ( EnumQueue.length > 0 )
		setTimeout(EnumProcessItem, 10 );
}

function EnumOpen()
{
	if (!EnumSink)
		EnumSink = new ActiveXObject("MSNTV.MultipleEventSink");
	EnumInited = true;
	EnumSink.AttachEvent(TVShell.StorageManager,"OnEnumComplete" , Enum_OnEnumComplete);	
}

function EnumClose()
{
	EnumSink.DetachEvent(TVShell.StorageManager,"OnEnumComplete" , Enum_OnEnumComplete);	
}

