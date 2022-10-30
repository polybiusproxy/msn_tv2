var checkedCount = 0;
var selectAllElement = 0;
var bFoldersOrOtherMedia = false;
var XMLFileURL;
var selectedBackgroundColor = "#A3E4EE";

// app is the application "music", "photo", "video"
// defaultpath is the  path to drill down into if we are accessing the root
function BuildArrays2(callbackFunc, userData, itemTypes , defaultPath , app )
{
	var items =  itemTypes + "," + playlistTypes;
	DMRBuildArrays2Ex( callbackFunc, userData, items, true, false, defaultPath, app );
}

function ShowArt(artURL)
{
	var artImage = document.all.artImage;

	if (artImage) {
		if (artURL && artURL != "noart") {
			artImage.style.visibility = "visible";
			artImage.src = artURL;
		} else
			artImage.style.visibility = "hidden";
	}
}

function BuildDirectoryList(container , source )
{
	var numMusic = parseInt( QueryMimeTypes( audioTypes ) );
	var numVideo = parseInt( QueryMimeTypes( videoTypes ) );
	var numPhoto = parseInt( QueryMimeTypes( SupportedPhotoMIMETypes ) );
	var otherTypes = 0;
	var numFolders = 0;
	bFoldersOrOtherMedia = false;
	if ( DirectoryArray ) numFolders = DirectoryArray.length;

	if ( source == "music" )
	{
		otherTypes = numVideo + numPhoto;
	}
	else
	{
		otherTypes = numMusic + numPhoto;
	}

	if( ( otherTypes == 0 ) && ( numFolders <= 0) ) return;

	// there is at least one sub-folder or link to other media
	bFoldersOrOtherMedia = true;		
	
	var st = new Date().getTime();
	var divHTML = new Array();
	var j=0;
	var nameWidth = container.clientWidth - 15 - 22 - 5;	

	if ( uncView && ( ( numFolders > 0 ) || ( otherTypes > 0 ) ) )
	{
		var fstr;
		if ( ( numFolders > 0 ) && ( otherTypes > 0 ) )
		{
			fstr = "Folders and other media";
		}
		else
		{
			if ( numFolders > 0 )
				fstr = "Folders";
			else
				fstr = "Other media";
		}
		divHTML[j++] = "<div class=groupLabel><span class=ellipsis style='width:" + nameWidth + "px;' >" + fstr + "</span></div>";
	}

	var div = container.document.createElement("DIV");
	div.style.paddingBottom = 10;
	div.id = "directoryListDiv";
	div.className = "itemLabel";
	div.style.width = "100%";
	var startFolder = "<div style='width:100%;'><table cellspacing=0 cellpadding=0><tr style='padding:2px 0px 2px 15px;'>";
	var endFolder = "</tr></table></div>";
	var folderCnt = 0;
	var currentURL = document.location.href;
	currentURL = removeParam( currentURL , "path=" );
	currentURL = removeParam( currentURL , "parentFolderName=" );
	currentURL = removeParam( currentURL , "artURL=" );
	for ( var i=0; i < numFolders; i++)
	{
		var destURL=currentURL;
		var nw = nameWidth;
		if(StorageDeviceVN) {
			var pathText = GetPath(StorageDeviceVN, DirectoryArray[i].href);
			if(pathText)
				destURL+="&path=" + encodeURIComponent(pathText);
		}

		destURL += "&parentFolderName=" + encodeURIComponent(DirectoryArray[i].name);
		
		var artURL = "noart";
		var bShowArt = false;

		if (DirectoryArray[i].art && DirectoryArray[i].art != "") {
			artURL = FormatURL(DirectoryArray[i].art);
			destURL += "&artURL=" + encodeURIComponent(artURL);
			bShowArt = true;
		}

		var artStr = "";
		if ( bShowArt )
		{
			artStr = "<td><img style='width:68px; height:68px; padding: 4px; 4px; 4px; 4px;' src='"+EscapeScriptString(artURL)+"'></td>";
			nw -= 78;
		}
		
		divHTML[j++] = startFolder;
		divHTML[j++] = "<td><a class=folderName id='folder" + folderCnt + "' onclick=\"parent.GotoURL('" + EscapeScriptString(destURL) + "');\">" +
						"<table cellpadding=0 cellspacing=0 style='border:none;'><tr>" +
						artStr + "<td valign=top><span class=folderName style='width:" + nw +"px;'>" + Utilities.EscapeHTML(DirectoryArray[i].name) + "</span></a></td></tr></table></td>";
		divHTML[j++] = endFolder;
		folderCnt++;
	}
	
	if ( source == "music" )
	{
		if ( numVideo > 0 )
		{
			var vURL = EscapeScriptString( videoViewerURL() );
			divHTML[j++] = startFolder;
			divHTML[j++] = "<td><a class=folderName id='folder" + folderCnt + "' onclick=\"parent.GotoURL('" + vURL + "');\">" +
							"<span class=ellipsis style='width:" + nameWidth +"px;'>Video files (" + numVideo + ")</span></a></td>";
			divHTML[j++] = endFolder;
			folderCnt++;
		}
	}
	else
	{
		if ( numMusic > 0 )
		{
			var mURL = EscapeScriptString( musicViewerURL() );
			divHTML[j++] = startFolder;
			divHTML[j++] = "<td><a class=folderName id='folder" + folderCnt + "' onclick=\"parent.GotoURL('" + mURL + "');\">" +
							"<span class=ellipsis style='width:" + nameWidth +"px;'>Music files (" + numMusic + ")</span></a></td>";
			divHTML[j++] = endFolder;
			folderCnt++;
		}
	}
	if ( numPhoto > 0 )
	{
		var pURL = EscapeScriptString( photosViewerURL() );
		divHTML[j++]= startFolder;
		divHTML[j++] = "<td><a class=folderName id='folder" + folderCnt + "' onclick=\"parent.GotoURL('" + pURL + "');\">" +
						"<span class=ellipsis style='width:" + nameWidth +"px;'>Photo files (" + numPhoto + ")</span></a></td>";
		divHTML[j++]= endFolder;
		folderCnt++;
	}

	div.innerHTML = divHTML.join("");
	container.appendChild(div);		

	var et = new Date().getTime();

	TVShell.Message( "BuildDirectoryList(). time="
					+ (et - st));
}


function BuildPlaylistList(container, icon)
{
	if(!PlaylistArray || PlaylistArray.length <= 0)
		return;

	bFoldersOrOtherMedia = true;
	
	if ( uncView )
	{
		var  group = container.document.createElement("DIV");
		group.className = "groupLabel"
		group.innerHTML = "Playlists";
		container.appendChild(group);
	}

	var div = container.document.createElement("DIV");
	div.className="playlistLabel";
	div.id = "playlistListDiv";
	div.style.paddingBottom = 25;
	
	var nameWidth = container.clientWidth - 15 - 30 - 22 - 3;

	var divHTML = new Array();
	var j=0;

	for (i = 0; i < PlaylistArray.length; i++) {
		var dmrItem = PlaylistArray[i];

		divHTML[j++]= "<div style='width:100%;'><table id=dmrPlaylistTable cellspacing=0 cellpadding=0 style=\"width:100%;\"><tr style=\"padding:2px 0px 2px 15px;\">";
		divHTML[j++]= "<td><a id=\"playlist" + i + "\" target=\"_top\" href=\"" + dmrItem.href + 
						 "\" onclick=\"parent.PlayOne();\" contentType=\"" + dmrItem.contentType + "\">" +
						"<span id=mediaItemText class=\"ellipsis\" style=\"width:" + nameWidth + "px;\">" + dmrItem.name + "</span></a></td>";
		divHTML[j++]= "<td style=\"width:30px;\"></td></tr></table></div>";
	}

	div.innerHTML = divHTML.join("");
	container.appendChild(div);

	var tables = div.all.item("dmrPlaylistTable");
	// single entry?
	if ( tables.length )
	{
		for ( var i = 0; i < tables.length; i++)
		{
			if (i < PlaylistArray.length) {
				tables[i].dmrItem = PlaylistArray[i];
			}
		}
	}
	else
		tables.dmrItem = PlaylistArray[0];

}

function BuildItemList(container, groupHeading, icon, checkbox, onItemClick, songList, noneText)
{
	var bItemsAvailable = true;
	if (!DMRItemArray || DMRItemArray.length <= 0) bItemsAvailable = false;

	var numFolders = 0;
	if ( DirectoryArray ) numFolders = DirectoryArray.length;
	var numPlayLists = 0;
	if ( PlaylistArray ) numPlayLists = PlaylistArray.length;
	if ( !bItemsAvailable && ( ( numFolders > 0 ) || ( numPlayLists > 0 )) ) return;

	var st = new Date().getTime();
	var displaySelectAll = false;
	if ( bItemsAvailable && DMRItemArray.length > 1 && !songList && ( bFoldersOrOtherMedia || g_fTruncated ) ) displaySelectAll = true;

	if ( groupHeading || displaySelectAll )
	{
		var  div = container.document.createElement("DIV");
		div.id = 'mediaTitleDiv';
		var str = "<table cellpadding=0 cellspacing=0 width=100% height=100%><tr style='padding: 2px 0px;'>";		
		if ( groupHeading )
		{
			str += "<td class='mediaTitleText'>" + groupHeading + "</td>";
		}
		str += "<td></td>";
		if ( displaySelectAll )
		{
			str += "<td class='countText' style='text-align:right;'>Select All&nbsp";
			str += "<input type=checkbox id='selectAll' onpropertychange='parent.OnSelectAllPropertyChange();'></td>";
		}
		str += "</tr></table>";
		div.innerHTML = str;
		container.appendChild(div);
		if ( displaySelectAll ) selectAllElement = container.document.all.selectAll;
	}
	
	var div = container.document.createElement("DIV");
	div.className="itemLabel";
	div.id = "itemListDiv";
	if (!groupHeading && !icon) {
		div.style.borderTop =  "2px solid #57799E";
	}
	
	var divHTML = new Array();
	var j=0;
	var tabIndex = onItemClick ? 0 : -10001;
	var onClick = onItemClick ? "onclick=\"" + onItemClick + "\"" : "";
	
	checkedCount = 0;

	var nameWidth = container.clientWidth - 15 - 22 - 10;
	
	if (checkbox == "left" || checkbox == "right") {
		nameWidth -= 25;
	}
	if (songList && checkbox != "left" && checkbox != "right") {
		nameWidth -= 36;
	}

	if ( !bItemsAvailable )
	{
		var str = ( noneText ? noneText : "None available" );
		divHTML[j++]= "<div style=\"width:100%;\"><table cellspacing=0 cellpadding=0><tr style=\"padding:2px 0px 2px 15px;\">";
		divHTML[j++]= "<td><span id=mediaItemText class=\"ellipsis\" style=\"width:" + nameWidth + "px;\">";
		divHTML[j++]= str + "</span></td></tr></table></div>";
		div.innerHTML = divHTML.join("");
		container.appendChild(div);
		return;
	}
	
	TVShell.Message("BuildItemList " + DMRItemArray.length);
	for (i = 0; i < DMRItemArray.length; i++) {
		var dmrItem = DMRItemArray[i];
		
		divHTML[j++]= "<div style=\"width:100%;\"><table id=dmrItemTable cellspacing=0 cellpadding=0><tr style=\"padding:2px 0px 2px 15px;\">";
		if (checkbox == "left") {
			divHTML[j++]= "<td style=\"width:25px; text-align:left;\"><input id=check " + 
							(dmrItem.checked ? " checked=true " : "") + " type=checkbox></td>"
		}
		divHTML[j++]= "<td><a id=\"anchor\" target=\"_top\" href=\"" + dmrItem.href + "\" itemIndex=\"" + i + "\" " + 
						" tabIndex=\"" + tabIndex + "\" contentType=\"" + dmrItem.contentType + "\">" +
						"<span id=mediaItemText class=\"ellipsis\" style=\"width:" + nameWidth + "px;\">";
						
//		if (songList) {
//			divHTML[j++]="<font class=\"itemIndex\">" + (i + 1) + "&nbsp;</font>";
//		}
		divHTML[j++]= dmrItem.name + "</span>";
		if (songList && checkbox != "left" && checkbox != "right") {
			divHTML[j++]="<span style=\"width:18px; display:inline;\"></span><span style=\"width:18px; height:16px; display:inline-block;\"></span>";
		}			
		divHTML[j++]= "</a></td>";
		if (checkbox == "right") {
			divHTML[j++]= "<td style=\"width:25px; text-align:right;\"><input id=check " + 
							(dmrItem.checked ? " checked=true " : "") + " type=checkbox></td>"
		}
		divHTML[j++]= "</tr></table></div>";
		
		if (dmrItem.checked) {
			checkedCount++;
		}
	}

	div.innerHTML = divHTML.join("");
	container.appendChild(div);

	var et1 = new Date().getTime();
	TVShell.Message( "BuildItemList(). time=" + (et1-st) );

	var tmpArray;
	var els = div.all.namedItem("dmrItemTable");
	if ( els.length )
		tmpArray = els;
	else
	{
		tmpArray = new Array();
		tmpArray[0] = els;
	}
	var tmpElement;
	var tb;
	if ( tmpArray.length )
	{
		if ( tmpArray.length > 1 && !scrollFrame.document.all.directoryListDiv && !scrollFrame.document.all.playlistListDiv && !songList) {
			tmpElement = tmpArray[0].all.check;
			if ( tmpElement ) tmpElement.onkeydown = OnTopCheckboxKeydown;
		}
		
		for ( var i = 0; i < tmpArray.length; i++) {
			tb = tmpArray[i];
			if (i < DMRItemArray.length) {
				tb.dmrItem = DMRItemArray[i];
				if ( DMRItemArray[i].checked )
					tb.style.backgroundColor = selectedBackgroundColor;
				else
					tb.style.backgroundColor = "";
			}
			tmpElement = tb.all.check;
			if ( tmpElement ) tmpElement.onclick = OnCheckboxPropertyChange;
			if ( onItemClick )
			{
				tmpElement = tb.all.anchor;
				if ( tmpElement ) tmpElement.onclick = onItemClick;
			}
		}
	}
	delete tmpArray;
	delete els;

	UpdateSelectedCount();

	var et = new Date().getTime();
	TVShell.Message( "BuildItemList(). time=" + (et-st) );
}

function InitializeScrollFrame(scrollFrame)
{
	var scrollDocument = scrollFrame.document;

	scrollDocument.open();
	scrollDocument.write("<html><body></body></html>");
	scrollDocument.close();

	var scrollBody = scrollDocument.body;

	for (var i = 0; i < document.styleSheets.length; i++) {
		//Import style sheets.
		var href = document.styleSheets[i].href;
		scrollDocument.createStyleSheet(href);
	}

	scrollBody.style.backgroundColor = "transparent";
	scrollBody.style.marginRight = "22px";
	scrollBody.style.marginBottom = "4px";
	document.body.delegate = scrollBody;

	scrollBody.innerHTML =	"<table id=\"warningTable\" cellspacing=0 cellpadding=0 style=\"width:100%; display:none\">" + 
								"<tr width=100%>" +
									"<td valign=center>" + 
										"<div style=\"position:relative;left:5px;margin:0 0 0 0;behavior:url(#default#alphaImageLoader);src:url(msntv:/Panels/Images/Icon_Info_ErrorPanels.png);width:40px;height:40px;\"></div>" +
									"</td><td width=5></td>" +
									"<td id=\"warningCell\" class='warningCellText' >" + 
									"</td>" +
								"</tr>" +
							"</table>";
}

function CreateMediaItem(dmrItem)
{
	var entry = TVShell.PlaylistManager.createMediaItem(dmrItem.href);
			
	entry.setItemInfo("DisplayTitle", dmrItem.name);
	if (dmrItem.title) {
		entry.setItemInfo("Title", dmrItem.title);
	}
	if (dmrItem.artist) {
		entry.setItemInfo("Author", dmrItem.artist);
	}
	if (dmrItem.album) {
		entry.setItemInfo("Abstract", dmrItem.album);
	}
	if (dmrItem.duration) {
		entry.setItemInfo("Duration", dmrItem.duration);
	}
	if (dmrItem.albumArt) {
		entry.setItemInfo("AlbumArt", dmrItem.albumArt);
	}
	
	return entry;
}

function CreateASXFile(items, all, fileName, name)
{
	var playlist = TVShell.PlaylistManager.createPlaylist(name, null);
	
	playlist.setItemInfo("Title", name);

	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		
		if (all || item.checked) {
			playlist.appendItem(CreateMediaItem(item));
		}
	}
	
	TVShell.PlaylistManager.savePlaylist(fileName, playlist);
}

function WPLToASX(wplUrl, asxUrl)
{
	var wplDocument = TVShell.CreateXmlDocument();

	if (wplDocument.load(wplUrl)) {
		var playlist = TVShell.PlaylistManager.createPlaylist(name, null);
		var nodes;
		var node;

		node = wplDocument.selectSingleNode("//title");
		if (node) {
			playlist.setItemInfo("Title", node.text);
		}

		nodes = wplDocument.selectNodes("//media");
		if (nodes && nodes.length > 0) {
			for (i = 0; i < nodes.length; i++) {
				var entry = TVShell.PlaylistManager.createMediaItem(Utilities.CombineUrl(wplUrl, nodes[i].getAttribute("src"), 0));

				playlist.appendItem(entry);
			}
		}
		
		TVShell.PlaylistManager.savePlaylist(asxUrl, playlist);
	}
}

function PlayOne()
{
	var	event = scrollFrame.event;

	if (event.srcElement.contentType == "application/vnd.ms-wpl") {
		var playlistUrl = NextPlaylistURL();

		// Translate Windows Media Playlists.
		WPLToASX(event.srcElement.href, playlistUrl);
		SetPlayerURL(playlistUrl);
	}
	else {
		for (var element = event.srcElement; element != null; element = element.parentElement) {
			if (element.tagName == "TABLE") {
				var dmrItem = element.dmrItem;
				var playlistUrl = NextPlaylistURL();
				var items = new Array();
				
				items.push(dmrItem);
				CreateASXFile(items, true, playlistUrl, "My " + itemsText);
				SetPlayerURL(playlistUrl);
			}
		}
	}
	event.returnValue = false;
}

function PlaySelected(itemName)
{
	if (CheckSelection("Play Now", itemName)) {
		var playlistUrl = NextPlaylistURL();

		CreateASXFile(DMRItemArray, false, playlistUrl, "My " + itemsText);
		SetPlayerURL(playlistUrl);
	}
}

function CheckSelection(action, itemName)
{
	var numSelected = 0;
	
	if (DMRItemArray) {
		for (i = 0; i < DMRItemArray.length; i++) {
			if (DMRItemArray[i].checked) {
				numSelected++;
			}
		}
	}

	if (numSelected == 0) {
		var str = "Please select ";
		str += (DMRItemArray.length==1)? ("the " + itemName) : ("one or more " + itemName + "s");
		str += " on the left before choosing <EM>" + action + "</EM>.";
		PanelManager.CustomMessageBox(str, "", "Ok", 0, "", false, 0x30, 1);
	}
	
	return numSelected;
}

function UpdateSelectedCount()
{
	if ( DMRItemArray.length <= 1 ) return;
	
	var selectedCount = document.all.selectedCountField;
	
	if (selectedCount)
	{
		var cntStr = DMRItemArray.length + " " + itemsText +", " + checkedCount + " selected";

		// intervening folders or text, do not create the "select all" checkbox here
		if ( bFoldersOrOtherMedia || g_fTruncated )
			selectedCount.innerText = cntStr;
		else
		{
			if ( selectAllElement && document.all.countStrDiv )
			{
				document.all.countStrDiv.innerText = cntStr;
			}
			else
			{
				var str = "<table cellpadding=0 cellspacing=0 width=100% height=100%><tr style='padding: 2px 0px;'>";
				str += "<td><div id='countStrDiv' class=countText>" + cntStr + "</div></td><td></td>";
				str += "<td style='text-align:right;' class=countText>Select All&nbsp";
				str += "<input type=checkbox id='selectAll' onpropertychange='parent.OnSelectAllPropertyChange();'></td>";
				str += "<td width=22></td></tr></table>";
				selectedCount.innerHTML = str;
				selectAllElement = document.all.selectAll;
			}
		}
	}
}

var		inOnCheckboxPropertyChange = 0;
var		inOnSelectAllPropertyChange = 0;

function OnCheckboxPropertyChange()
{
	var event = scrollFrame.event;

	inOnCheckboxPropertyChange++;

	if (event.type == "click") {
		for (var element = event.srcElement; element != null; element = element.parentElement) {
			if (element.tagName == "TABLE") {
				var dmrItem = element.dmrItem;
				
				if (event.srcElement.checked) {
					element.style.backgroundColor = selectedBackgroundColor;
				}
				else {
					element.style.backgroundColor = "";
				}
				
				if (dmrItem) {
					if (dmrItem.checked && !event.srcElement.checked) {
						checkedCount--;
					}
					else if (!dmrItem.checked && event.srcElement.checked) {
						checkedCount++;
					}
					dmrItem.checked = event.srcElement.checked;
				}
				break;
			}
		}
	}

	if (!inOnSelectAllPropertyChange && selectAllElement ) {
		if ( selectAllElement.checked ) {
			selectAllElement.checked = false;
		} else {
			if ( event.srcElement.checked ) {
				for (i = 0; i < DMRItemArray.length; i++) {
					if (!DMRItemArray[i].checked) 
						break;
				}
				selectAllElement.checked = (i == DMRItemArray.length);
			}
		}
		UpdateSelectedCount();
	}
		
	inOnCheckboxPropertyChange--;
}

function OnSelectAllPropertyChange()
{
	var event = selectAllElement.document.parentWindow.event;
	
	inOnSelectAllPropertyChange++;
	if (event.propertyName == "checked" && !inOnCheckboxPropertyChange &&
		scrollFrame.document.all.itemListDiv != null) {
		var checked = event.srcElement.checked;

		var checkboxes = scrollFrame.document.all.itemListDiv.all.item("check");
		var itemTables = scrollFrame.document.all.itemListDiv.all.item("dmrItemTable");

		var bgColor = checked ? selectedBackgroundColor : "";
		var ln = checkboxes.length;
		for (var i = 0; i < ln; i++)
		{
			checkboxes[i].checked = checked;
			var tb = itemTables[i];
			tb.dmrItem.checked = checked;
			tb.style.backgroundColor = bgColor;
		}
		checkedCount = checked ?  checkboxes.length : 0;
		UpdateSelectedCount();
	}

	inOnSelectAllPropertyChange--;
}

function OnTopCheckboxKeydown()
{
	var event = scrollFrame.event;

	if (selectAllElement && event.keyCode == VK_UP && scrollFrame.document.body.scrollTop == 0) {
		selectAllElement.focus();
		event.returnValue = false;
	}
}

		
function OnDeviceRemove(storageDevice)
{
	if (!TVShell.IsOn)
		return;

	if (storageDevice.VolumeName == StorageDeviceVN) 
	{
		if (AskDoneOrRetryOnContentUnavailable(storageDevice,homeMediaType)=="Done")
			history.go(-1);
		else
			history.go(0);
	}
}
