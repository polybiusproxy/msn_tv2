TVShell.Message( "Loading PhotosNavigate.js" );

Sink.AttachEvent(PanelManager,			"OnBeforeNavigate2",OnBeforeNavigate2);
Sink.AttachEvent(PanelManager,			"OnAfterHide",		OnAfterHide);

var count=0;
var nPhotos = 0;
var isAPicker = false;
if ( parameters.picker )
	isAPicker = true;

var fileOpen = parameters.fileOpen;
var upload = parameters.upload;
var postURL;
if (upload)
{
	postURL = parameters.postURL;
	if(!postURL || postURL=="")
	{
		warn( "Empty Post URL", "No URL has been specified to post photos to" );	
		HidePickerPanel();
	}
	else
		TVShell.Message("postURL = " + postURL);
}
var nThumbnailReady = 0;
var selectedPhotoIndex=0;
var XMLFileURL;
var XMLDocument;
var scrollingDiv = null;
var maxScrollIndexSoFar = 0;

var BuildArraysTimeoutID;

var RES_QUERY_SIZE="query-size";
var RES_WEBREADY="webready";
var RES_FULL="full";
var forceSelectable = false;

var SELECTOR_WIDTH = 26;
//var UNSELECTED_CELL_BACKGROUND="#3b3736";
//var UNSELECTED_CELL_BACKGROUND="#666666";
//var UNSELECTED_CELL_BACKGROUND="#fdfdfd";
var UNSELECTED_CELL_BACKGROUND="transparent";
var BORDER_SIZE=1;//Make this 1 if transparent, 0 if not.
var SELECTED_CELL_BACKGROUND="#C3D5BA";

var CELL_SIZES_PER_DIMENSION = [
	//dim, width, height
	[ 1, 320, 240 ],
	[ 2, 189, 107 ],
	[ 3, 125, 65 ],
//	[ 4, 58, 45 ]
	[ 4, 93, 43 ]
];

function warn( title, msg )
{
	PanelManager.CustomMessageBox(msg ,title, "OK", 0, "", false, MGX_ICON_WARNING , MGX_SIZE_SMALL );
}
function GetCellWidth( dim ) { return CELL_SIZES_PER_DIMENSION[dim -1][1]; }
function GetCellHeight( dim ) { return CELL_SIZES_PER_DIMENSION[dim -1][2]; }

var dimension = 3; 
var cellSpanWidth = GetCellWidth( dimension );
var cellSpanHeight= GetCellHeight( dimension );

var nImageOnPage = dimension*dimension + dimension;		
var scrollIndex = 0;
var highestScrollTopSofar = 0;	

var CheckedItemCount = 0;
var selectedRadioIndex = -1;
var MAX_NUM_TO_ATTACH_ON_BROADBAND=36;
var MAX_NUM_TO_ATTACH_ON_NARROWBAND=36;

TVShell.Message("PhotosNavigate.js: params = " + document.location.search);
TVShell.Message("PhotosNavigate.js: path = " + path);
var fromMail = parameters.fromMail;	
var ATTACHMENT_LIST_FILENAME = "\\temp\\photo\\TempSelectedPhotoList.txt";		
var IDOK=1;
var IDCANCEL=2;
				
var dayList = new Array("Sun", "Mon", "Tue", "Wed","Thu", "Fri", "Sat");
var monthList = new Array("Jan", "Feb", "Mar", "Apr","May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov" , "Dec");
var DifferentDatesList = new Array();
var UndatedString = "Undated";
var DifferentDatesCount=0;
var currentGroup="";
var currentGroupID=0;
var MaxGroupNum = 15;
var currentGranularity = "date";

var loadingStartPercent = 30;
var loadingEndPercent = 90;
var loadingCurrentPercent = loadingStartPercent;
var loadingIncrementPercent = 5;

var selectAllElement = 0;
var bFoldersOrOtherMedia = false;


// Picker/select Device panel related code

function HidePickerPanel()
{
	TVShell.Message("hiding photo picker panel");
	PanelManager.Hide("PhotoPickerPanel");
}

function OnCancel()
{
	if(fileOpen)
		PanelManager.CloseGetFileOpen(IDCANCEL);
	HidePickerPanel();
}

function OnAfterHide(name)
{
	TVShell.Message("PhotosNavigate.js: OnAfterHide " +  name);
	if(name == "PhotoPickerPanel")
		PanelManager.Remove("PhotoPickerPanel");
}

function OnBeforeNavigate2(name, URL, isLocal )
{
	TVShell.Message("PhotosNavigate.js: OnBeforeNavigate2 " + name + " " + URL);
	if(name =="main")
		setTimeout(HidePickerPanel,1);
}
		 
Sink.AttachEvent(PhotoManager, "OnThumbnailReady"   , OnThumbnailReady);
		
var QUERY_TAG = "tag";
var QUERY_NAMED_ITEM = "namedItem";

var AttachmentImageFileNames = new Object();
var AttachmentItemCount = 0;
var AttachmentInDMRItemArrayItemCount = 0;
var AttachmentFileList = null;
var AttachmentFileArray = new Array();

var EmailRootURL = "";

if (fromMail)
{
	AttachmentFileList = Utilities.ReadTextFile(ATTACHMENT_LIST_FILENAME);  

	if(AttachmentFileList)
	{
		var fileList = AttachmentFileList.split('\n');				
		AttachmentItemCount = Math.floor(fileList.length / 2);
		var fileName;
		var dotPos;
		var reWebready = /^\\temp\\photo\\resizedcache/g; 
		var reRotated = /^\\temp\\photo\\rotated/g; 

		for(i=0; i< AttachmentItemCount; i++)
		{
			AttachmentFileArray[i] = new Object();
			AttachmentFileArray[i].resizedImgURL = fileList[2*i];
			AttachmentFileArray[i].size = fileList[(2*i) + 1];

			fileName = fileList[2*i];
			if ( IsURL(fileName) == false )
			{
				fileName = fileName.toLowerCase();
				fileName = fileName.replace(reWebready,'');
				fileName = fileName.replace(reRotated,'');
				dotPos = fileName.lastIndexOf(".");
				if(dotPos!=-1)
					fileName = fileName.substring(0,dotPos);
			}
			AttachmentImageFileNames[fileName]=true;
		}
	}
} 

var foundRules = new Object();
function GetIFrameStyleRule( tag )
{
	var rule = foundRules[tag];
	if ( rule )
		return rule != "-" ? rule : null;

	var subFrame = window.frames['scrollListIFrame'];
	var subDoc = subFrame.document;

	var style;
	for (var i = 0; i < subDoc.styleSheets.length; i++)
	{
		style = subDoc.styleSheets[i];
		for ( var j in style.rules )
		{
			if ( style.rules[j].selectorText == tag ) {
				foundRules[tag] = style.rules[j];
				return foundRules[tag];
			}
		}
	}
	foundRules[tag] = "-";
	return null;
}

function GetItems( queryType, tag )
{
	var res = null;
	if ( queryType == QUERY_TAG ) {
		res = scrollListDiv.all.tags( tag );
	} else {
		var i = scrollListDiv.all.namedItem( tag );
		if ( i == null )
		{
			res = new Array();
		}
		else if ( i.length == null )
		{
			res = new Array();
			res[0] = i;
		}
		else
		{
			res = i;
		}
	}
	if ( res == null )
		res = new Array();

	return res;
}

var cachedCells = new Array();
var cachedThumbnails = new Array();
var cachedCheckboxes = new Array();

function GetCells() 
{
	return cachedCells;
}

function GetCellSpans() 
{
	return GetItems( QUERY_NAMED_ITEM, "CellSpan");
}

function GetThumbnailImages() 
{
	return cachedThumbnails;
}

function GetCheckboxes() 
{
	return cachedCheckboxes;
}

function RequestThumbnail(fileName)
{
	var func = RequestThumbnail;
	var getItNow = (func.arguments.length > 2 ? func.arguments[2] : false);

	var imgThumbURL=PhotoManager.DefaultPhotoThumbURL;
	
	imgThumbURL = PhotoManager.RequestThumbnail(fileName, getItNow);

	//NOTE: We handle Bad thumbnails like this so that if the file is 
	//able to be loaded the second time, it will no longer be mark as bad.
	if ( IsBadImage(fileName) && IsDefaultThumbnailFile(imgThumbURL) )
		imgThumbURL = kUnavailablePhotoThumbName;

	return imgThumbURL;
}

var indexMap = null;
function LookupIndex(imgSrcURL)
{
	if (indexMap==null && DMRItemArray != null)
	{
		indexMap = new Object();
		for( var i = 0; i < nPhotos; i++ )
		{
			if (DMRItemArray[i] && DMRItemArray[i].href)
			{
				indexMap[DMRItemArray[i].href] = i;
			}
		}
	}
	var ref;
	if ( indexMap )
		ref = indexMap[imgSrcURL];
	return ref != null ? ref : nPhotos;
}

function CallBuildTable()
{
	//dummy
}

function OnThumbnailReady(imgSrcURL, opStatus)
{
	//TVShell.Message("PhotosNavigate.js: OnThumbnailReady " + imgSrcURL + " opStatus=" + opStatus);

	var index = LookupIndex(imgSrcURL);
	if ( !opStatus )
	{
		TVShell.Message( 'PhotosNavigate.js: Unable to get thumbnail for "' 
		                 + imgSrcURL + '"' );
		MarkAsBadImage( imgSrcURL );
		if ( index < nPhotos && forceSelectable == false )
		{
			var checkboxes = GetCheckboxes();
			if(checkboxes[index].checked)
			{
				CheckedItemCount--;
				checkboxes[index].checked = false;
				DMRItemArray[index].checked = false;
				
				var cells = GetCells();
				if(cells && cells[index])
					cells[index].style.backgroundColor=UNSELECTED_CELL_BACKGROUND;
				delete cells;
			}
			checkboxes[index].disabled = true;
			
			var thumbnails = GetThumbnailImages();
			thumbnails[index].onclick= null;
			
			delete thumbnails;
			delete checkboxes;
		}
		
	} else if ( IsBadImage(imgSrcURL) ) {
		MarkAsGoodImage( imgSrcURL );
		if ( index < nPhotos )
		{
			var checkboxes = GetCheckboxes();
			checkboxes[index].disabled = false;
			delete checkboxes;
		}
	}

	if ( index < nPhotos )
	{
		//TVShell.Message("PhotosNavigate.js: i=" + index + " n= " + nPhotos + " F= " + DMRItemArray[index].href);
		//TVShell.Message("PhotosNavigate.js: imgSrcURL = " + imgSrcURL);
		var thumbURL  = FormatURL(
			opStatus ? PhotoManager.GetThumbnailImageURL(imgSrcURL): 
			kUnavailablePhotoThumbName ); 

		//TVShell.Message("PhotosNavigate.js: thumbURL = " + thumbURL);
		
		var thumbnails = GetThumbnailImages();
		var imgThumbnailElement = thumbnails[index];
		if(imgThumbnailElement)
		{
			nThumbnailReady++;
		
			imgThumbnailElement.src = thumbURL;
				
			if(nThumbnailReady==count)
			{
				setTimeout(CallBuildTable,1000); 
			}
		}
		delete thumbnails;
	}	
}

function IsURL( href )
{
	var isURL = false;
	if ( href ) {
		href = href.toLowerCase();
		isURL = href && (href.substring(0,7) == "http://"
	                 || href.substring(0,8) == "https://");
	}
	return isURL;
}

function GetCheckedPhotoIndices( list )
{
	var checkedIndices = new Array();
	if ( CheckedItemCount > 0 )
	{
		var j=0;
		for (var i = 0 ; i < DMRItemArray.length; i++)
		{
			if ( DMRItemArray[i].checked )
				checkedIndices[j++] = i;
		}
	}

	return checkedIndices;
}

function ToNewlineSeparatedList( list, checkedOnly )
{
	var fileList = new Array();
	var j=0;
	if (checkedOnly)
	{
		for ( var i = 0; i < list.length; i++)
		{
			if ( list[i].checked )
			{
				fileList[j++] = list[i].href;
			}
		}
	}
	else
	{
		for ( var i = 0; i < list.length; i++)
		{
			if ( !IsBadImage(list[i].href) )
				fileList[j++] = list[i].href;
		}
	}
	if ( j == 0 )
		return null;

	fileList[j++]="";

	return fileList.join("\n");
}

function DescendingASCIISort(item1, item2)
{
	if( item1.nameLowerCase > item2.nameLowerCase ) return 1;
	if( item1.nameLowerCase == item2.nameLowerCase ) return 0;
	return -1;
}

function SortItemsByTime(item1, item2)
{
	if( item1.time > item2.time ) return 1;
	if( item1.time == item2.time ) return 0;
	return -1;
}

function BuildArrays(userCallback, userData, mimeType)
{
	var myData = new Object();
	myData.fStartTime = new Date().getTime();
	myData.userCallback = userCallback;
	myData.userData = userData;
	myData.mimeType = mimeType;

	TVShell.Message( "PhotosNavigate.js: Photo BuildArrays. ENTER" );
	CheckedItemCount = 0;
	
	DMRBuildArrays2Ex( BuildArrays_Step2, myData, mimeType , false , true , "album" , "photo" );
}

function BuildArrays_Step2(myData)
{
	var fstart = new Date().getTime();
	// sort the DirectoryArray in ascending, ASCII character order
	if(DirectoryArray && DirectoryArray.length>1)
		DirectoryArray.sort(DescendingASCIISort);
	var len = 0;
	if (DMRItemArray)
		len = DMRItemArray.length;
	var j = 0;

	var dotPos;
	var href;
	AttachmentInDMRItemArrayItemCount = 0;
	for ( var i = 0 ; i < len ; i++ )
	{
		href = DMRItemArray[i].href;
		if ( href )
		{
			if ( IsURL(href) == false )
			{
				href = href.toLowerCase();
				if (UNDER_NT && href.length > 1
					&& href.substring(0,2) == "\\\\" )
					href = href.substring(1,href.length);

				dotPos = href.lastIndexOf(".");
				if(dotPos!=-1)
					href = href.substring(0,dotPos);
			}

			if ( AttachmentFileList 
				 && ( AttachmentImageFileNames[href] 
					 || (DMRItemArray[i].printReadyURL 
				         &&AttachmentImageFileNames[DMRItemArray[i].printReadyURL])))
			{
				//Don't count these attachment images as part
				//of the checked item count. These aren't selected
				//CheckedItemCount++;
				DMRItemArray[j].attachment = true;
				AttachmentInDMRItemArrayItemCount++;
			}
			j++;
		}
	}
	
	nPhotos = 0;
	if(DMRItemArray && DMRItemArray.length>0)
	{
		nPhotos = DMRItemArray.length;
		DMRItemArray.sort(SortItemsByTime);
		GenerateGroups();
	}

	var fEndTime = new Date().getTime();
	TVShell.Message( "PhotosNavigate.js: BuildArrays(" + (myData?myData.mimeType:"") + ") LEAVE. time="
					 + (fEndTime-(myData?myData.fStartTime:fstart)) );
					 
	if (myData && myData.userCallback)
		myData.userCallback(myData.userData);
}

var BuildArraysFromXMLFileURL_callbackFunc;

function LoadXML()
{
	var nodes = null;
	var i = 0;
	
	var RootNode = XMLDocument.selectSingleNode("//Root");
	if(RootNode)
	{
		TVShell.Message("found Root");
		
		var rootURLNode = XMLDocument.selectSingleNode("//RootURL");
		if(rootURLNode)
			EmailRootURL = rootURLNode.text;
		
		var photoCount = 0;
		var photoCountNode = XMLDocument.selectSingleNode("//PhotoCount");
		if(photoCountNode)
			photoCount = photoCountNode.text;
						
		nodes = XMLDocument.selectNodes("//Photo");
		if (nodes && nodes.length > 0) 
		{
			TVShell.Message("nodes.length = " + nodes.length + " PC=" + photoCount);
			var length = nodes.length;
			
			if(photoCount > length)
				g_fTruncated=true;					
			
			for (i = 0; i < length; i++) 
			{
				var node = nodes.item(i);
				
				var date	= "";
				var subject = "";
				var from	= "";
				var mailURL = "";
				var timeMs	= "";
				
				var dateNode = node.selectSingleNode(".//Date");
				if(dateNode)
					date = dateNode.text;
					
				var subjectNode = node.selectSingleNode(".//Subject");
				if(subjectNode)
					subject = subjectNode.text;
					
				var fromNode = node.selectSingleNode(".//From");
				if(fromNode)
					from = fromNode.text;
				
				var mailURLNode = node.selectSingleNode(".//MailURL");
				if(mailURLNode)
					mailURL = mailURLNode.text;
				
				var thumbnailURL = node.selectSingleNode(".//Thumbnail//URL").text;
				var webReadyURL = node.selectSingleNode(".//WebReady//URL").text;
				var printReadyURL = node.selectSingleNode(".//PrintReady//URL").text;

				if(IsURL(thumbnailURL) == false && EmailRootURL!="")
					thumbnailURL = EmailRootURL+thumbnailURL;
					
				if(IsURL(webReadyURL) == false && EmailRootURL!="")
					webReadyURL = EmailRootURL+webReadyURL;
					
				if(IsURL(printReadyURL) == false && EmailRootURL!="")
					printReadyURL = EmailRootURL+printReadyURL;

				if(date !="")
				{
					var timeV =new Date(ChangeHyphenToSlash(date));
					timeMs = timeV.getTime();
				}
					
				if ( !DMRItemArray )
					DMRItemArray = new Array();
					
				DMRItemArray[i] = new DMRItem("", webReadyURL, "image/jpeg", "", date, timeMs,  thumbnailURL, printReadyURL, from, mailURL, subject);
			}
			
			nPhotos = DMRItemArray.length;
		
			if(DMRItemArray && DMRItemArray.length>0)
			{
				DMRItemArray.sort(SortItemsByTime);
				GenerateGroups();
			}
		}
		
		BuildArrays_Step2(null);
		setTimeout(BuildArraysFromXMLFileURL_callbackFunc, 10);
	}
	else
	{
		var ErrorNode = XMLDocument.selectSingleNode("//Error");
		if(ErrorNode)
		{
			TVShell.Message(" error : " + ErrorNode.text);
			warn("",ErrorNode.text);
			DMRAbortViewer();
		}
		else
		{
			var RetryNode = XMLDocument.selectSingleNode("//Retry");
			if(RetryNode)
			{
				TVShell.Message(" RetryNode : " + RetryNode.text);
				clearTimeout(BuildArraysTimeoutID);
				BuildArraysTimeoutID = setTimeout(BuildArraysFromXMLFileURL, parseInt(RetryNode.text));
				if (loadingCurrentPercent + loadingIncrementPercent < loadingEndPercent)
					loadingCurrentPercent+=loadingIncrementPercent;
				SetProgressPercent(loadingCurrentPercent);
			}
			else
			{
				TVShell.Message(" no photo case ");
				HideProgressPanel();
				warn("","MSN TV ran into a technical problem");
				DMRAbortViewer();
			}
		}
	}
}

function OnXMLAvailable()
{
	if (XMLDocument && XMLDocument.readyState == 4)
	{
		TVShell.Message("reached end");
		LoadXML();
	}
}

function BuildArraysFromXMLFileURL()
{				
	XMLDocument = TVShell.CreateXmlDocument();
	XMLDocument.async = true;
	XMLDocument.resolveExternals = false;
	XMLDocument.validateOnParse = false;
	XMLDocument.onreadystatechange=OnXMLAvailable;
	XMLDocument.ondataavailable=OnXMLAvailable;
	XMLDocument.load(XMLFileURL);
}

function BuildArraysFromAttachmentList(itemTypes,callbackFunc)
{
	forceSelectable = true;
	var checked = false;
	var st = new Date().getTime();
	TVShell.Message("Build Arrays From Attachment List ENTER (" + itemTypes + ") ");
    g_fTruncated = false;
	DirectoryArray = new Array();
	PlaylistArray = new Array();
	DMRItemArray = new Array();
	MIMESummaryArray = new Array();

	for ( var i = 0; i < AttachmentFileArray.length; i++)
	{
		var name = AttachmentFileArray[i].resizedImgURL;
		var href = AttachmentFileArray[i].resizedImgURL;

		var contentType = itemTypes;
		var timeV = new Date();
		var date = "" + timeV;
		var timeMs = timeV.getTime();

		if (href) 
		{
			var dmrItem = new DMRItem(name, href, contentType,checked, date , timeV.getTime() );
			dmrItem.resizedImgURL = AttachmentFileArray[i].resizedImgURL;
			dmrItem.size = AttachmentFileArray[i].size;
			//dmrItem.attachment = true; Don't set this. We need to edit these
			DMRItemArray.push( dmrItem );
		}
	}

	CheckedItemCount = 0;
	nPhotos = DMRItemArray.length;

	var et = new Date().getTime();

	TVShell.Message( "BuildArraysFromAttachmentList(). time=" + (et-st) );
	if(DMRItemArray && DMRItemArray.length>0)
	{
		DMRItemArray.sort(SortItemsByTime);
		GenerateGroups();
	}	

	if (callbackFunc)
		callbackFunc();
}

function formatDate(date)
{
	if(date=="")
		return UndatedString;
		
	date = ChangeHyphenToSlash(date);
	var currentDate = new Date (date);
	var result = "";
	
	if(currentGranularity=="year")
		result = currentDate.getYear();
	else if(currentGranularity=="month")
		result = monthList[currentDate.getMonth()] + ", " + currentDate.getYear();
	else
		result = currentDate.getDate() + " " + monthList[currentDate.getMonth()] + ", " + currentDate.getYear();
	
	return result;
}


function GenerateGroups()
{
	//TVShell.Message("PhotosNavigate.js: GenerateGroups " + currentGranularity);
	
	if(!DMRItemArray || DMRItemArray.length<=0)
		return;
	
	var continueGenerateGroups = true;	
	while( continueGenerateGroups )
	{
		DifferentDatesCount = 0;
		DifferentDatesList = new Array();
				
		var formattedDate = formatDate(DMRItemArray[0].date);
		//TVShell.Message("PhotosNavigate.js: formattedDate = " + formattedDate);
		DifferentDatesList[DifferentDatesCount] =formattedDate;
		
		var i;
		for(i=1; i<DMRItemArray.length; i++)
		{
			formattedDate = formatDate(DMRItemArray[i].date);
			if(DifferentDatesList[DifferentDatesCount]!=formattedDate)
			{
				DifferentDatesCount++;
				DifferentDatesList[DifferentDatesCount] = formattedDate;
			}
		}
		
		if(DifferentDatesCount > MaxGroupNum)
		{
			if(currentGranularity=="date")
			{
				currentGranularity = "month";
				GenerateGroups();
			}
			else if (currentGranularity=="month")
			{
				currentGranularity = "year";
				GenerateGroups();
			}
			else
				continueGenerateGroups = false;	
		}
		else
			continueGenerateGroups = false;
	}
}


function BuildDirectoryList(scrollListDiv, source)
{
	var numMusic = 0;
	var numVideo = 0;
	if ( !fromMail )
	{	// not interested in other media types if we are attaching files from mail
		numMusic = parseInt( QueryMimeTypes( audioTypes ) );
		numVideo = parseInt( QueryMimeTypes( videoTypes ) );
	}
	var numFolders = 0;
	if ( DirectoryArray ) numFolders = DirectoryArray.length;
	if(( numMusic == 0 ) && ( numVideo == 0 ) && ( numFolders <= 0 ) )	return;

	// there is at least one sub-folder or link to other media
	bFoldersOrOtherMedia = true;		

	var st = new Date().getTime();

	var div = scrollListDiv.document.createElement("DIV");		
	
	//currentGroupID++;					
	var j = 0;
	var divHTML = new Array();
	var nameWidth = scrollListDiv.clientWidth - 15 - 22 - 5;	

	if ( uncView && ( ( numFolders > 0 ) || ( numMusic > 0 ) || ( numVideo > 0 ) ) )
	{
		var fstr;
		if ( ( numFolders > 0 ) && ( ( numMusic + numVideo ) > 0 ) )
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
		
		divHTML[j++] = "<div class=groupLabel style='padding-top:8px;'><span class=ellipsis style='width:" + nameWidth + "px;' >" + fstr + "</span></div>";
	}

	var basicDestURL= "Viewer.html?location=" + location;
	if ( source == "Picker" )
		basicDestURL += "&picker=1";

	if(StorageDeviceVN)
	{
		basicDestURL+="&StorageDeviceVN=" + encodeURIComponent(StorageDeviceVN);
	}
			
	if(source=="Picker")
	{
		if(fileOpen)
			basicDestURL+="&fileOpen=true";
		else if(upload && postURL)
		{
		    basicDestURL+="&upload=true&postURL=";
		    basicDestURL+=encodeURIComponent(postURL);
		}
		else
			basicDestURL+="&fromMail=true";
	}

	var destURL;
	var pathText;
	div.className="itemLabel";
	var startFolder = "<table cellspacing=0 cellpadding=0 style='padding-right:22px;'><tr style='padding:2px 0px 0px 15px;'>";
	var endFolder = "</tr></table>";

	for ( var i=0; i < numFolders; i++) {
		destURL = basicDestURL;
		if(StorageDeviceVN)
		{
			pathText = GetPath(StorageDeviceVN, DirectoryArray[i].href);
			if(pathText)
				destURL+="&path=" + encodeURIComponent(pathText);
		}

		destURL += "&parentFolderName=" + encodeURIComponent(DirectoryArray[i].name);
		if ( parameters.topLevelFolder )
		{
			destURL += "&topLevelFolder=" + encodeURIComponent( parameters.topLevelFolder );
		}
			
		divHTML[j++] = startFolder;
		divHTML[j++]="<td><a class=folderName id=\"folder" + i + "\" style=\"display:inline-block;\" onclick=\"parent.GotoURL('" + EscapeScriptString(destURL) + "');\">" +
						"<span class=ellipsis style='width:" + nameWidth +"px;'>" + DirectoryArray[i].name + "</span></a></td>";
		divHTML[j++] = endFolder;
			
	}

	if ( numMusic > 0 )
	{
		var mURL = EscapeScriptString( musicViewerURL() );
		divHTML[j++] = startFolder;
		divHTML[j++] = "<td><a class=folderName onclick=\"parent.GotoURL('" + mURL + "');\">" +
						"<span class=ellipsis style='width:" + nameWidth +"px;'>Music files (" + numMusic + ")</span></a></td>";
		divHTML[j++] = endFolder;
	}
	if ( numVideo > 0 )
	{
		var vURL = EscapeScriptString( videoViewerURL() );
		divHTML[j++] = startFolder;
		divHTML[j++] = "<td><a class=folderName onclick=\"parent.GotoURL('" + vURL + "');\">" +
						"<span class=ellipsis style='width:" + nameWidth +"px;'>Video files (" + numVideo + ")</span></a></td>";
		divHTML[j++] = endFolder;
	}
	
	div.innerHTML = divHTML.join("");
	scrollListDiv.appendChild(div);		

	var et = new Date().getTime();
	TVShell.Message( "PhotosNavigate.js: BuildDirectoryList(). time=" + (et-st));
}
								
function BuildCompleteTable()
{
	var fsStart = new Date().getTime();
	TVShell.Message( "PhotosNavigate.js: BuildCompleteTable: ENTER" );

	var div = scrollListDiv.document.createElement("DIV");		
	div.id = "photoDiv";
	BuildPhotoTable( div );

	scrollListDiv.appendChild(div);	

	if ( scrollListDiv.document.all.SelectAllID )
	{
		selectAllElement = scrollListDiv.document.all.SelectAllID;
	}
	else
	{
		if ( document.all.selectAllTD && !fileOpen )
		{
			document.all.selectAllTD.innerHTML = "Select All <input type=checkbox id=SelectAllID onclick='SelectAll();' NAME='SelectAllID'>";
			selectAllElement = document.all.SelectAllID;
		}			
	}
	if ( (AttachmentInDMRItemArrayItemCount + CheckedItemCount)>= DMRItemArray.length
		 && DMRItemArray.length > 0 )
		selectAllElement.checked = true;

	if ( AttachmentInDMRItemArrayItemCount >= DMRItemArray.length )
		selectAllElement.disabled = true;

	cachedCells = GetItems( QUERY_NAMED_ITEM, "Cell");
	cachedThumbnails = GetItems( QUERY_NAMED_ITEM, "imgThumbnail");
	cachedCheckboxes = GetItems( QUERY_NAMED_ITEM, "chk");

	var fsEnd = new Date().getTime();
	TVShell.Message( "PhotosNavigate.js: BuildCompleteTable: LEAVE. time=" + (fsEnd-fsStart) );
}


function UpdateWidthHeight()
{
	cellSpanWidth = GetCellWidth( dimension );
	cellSpanHeight= GetCellHeight( dimension );

	var rule = GetIFrameStyleRule(".imgThumbnailCellOuterSpan");

	rule.style.height= cellSpanHeight;
	rule.style.width= cellSpanWidth;

	rule = GetIFrameStyleRule(".imgThumbnailCellSpan");

	rule.style.height= cellSpanHeight;
	rule.style.width= cellSpanWidth - SELECTOR_WIDTH - 0;

	rule = GetIFrameStyleRule(".imgThumbnailCellImg");
	rule.style.height= cellSpanHeight;

	// HELP: For some reason setting the image width causes wierd resizing
	//behavior in the force fit mode. NOTE: without this, the normal mode looks
	//awlful. Doing this only for NT.
	if (UNDER_NT)
		rule.style.width= cellSpanWidth - SELECTOR_WIDTH- 0;
}

function OnThumbnailLoadError()
{
	var index = this.index;
	TVShell.Message( 'PhotosNavigate.js: OnThumbnailLoadError : Unable to get thumbnail for index="' + index + '"' );
	
	if(DMRItemArray[index])
		MarkAsBadImage( DMRItemArray[index].href );
	
	if ( index < nPhotos && forceSelectable == false )
	{
		var checkboxes = GetCheckboxes();
		if(checkboxes[index].checked)
		{
			CheckedItemCount--;
			checkboxes[index].checked = false;
			DMRItemArray[index].checked = false;
			
			var cells = GetCells();
			if(cells && cells[index])
				cells[index].style.backgroundColor=UNSELECTED_CELL_BACKGROUND;
			delete cells;
		}
		checkboxes[index].disabled = true;
		checkboxes[index].onclick = null;
		
		var thumbnails = GetThumbnailImages();
		thumbnails[index].onclick = null;
		thumbnails[index].onmouseover=null;
		thumbnails[index].onError=null;
		thumbnails[index].src = kUnavailablePhotoThumbName;
		
		delete thumbnails;
		delete checkboxes;
	}
}

function CreateCellTemplate( checked, enabled )
{
	var imgTemplate = new Object();
	var divHTML = new Array();
	imgTemplate.divHTML = divHTML;
	var indexList = new Array();
	imgTemplate.indexList = indexList;
	var j = 0;
	var index = -1;

	divHTML[j++]="<span class='imgThumbnailCellOuterSpan' style='border:" + BORDER_SIZE + 
				 "px solid #666666; background-color: ";
	if(checked && enabled)
		divHTML[j++]=SELECTED_CELL_BACKGROUND; 
	else
		divHTML[j++]=UNSELECTED_CELL_BACKGROUND;
	divHTML[j++]="; padding: 1px; margin: 1px; overflow:none;' id=Cell > \
				    <span id=CellSpan class='imgThumbnailCellSpan' \
				    style='text-align:center; height: 100%; margin: 0; overflow: hidden; padding-top: 5px; '> \
					<img src='";
	divHTML[j++]=kDefaultPhotoThumbName;
	divHTML[j++]="' class='imgThumbnailCellImg' id=imgThumbnail border=0 >\
					</span>\
					<span style='height:100%;margin: 0'>\
					<INPUT NAME=chk ";

	if(fileOpen)
		divHTML[j++]= " TYPE=radio ";
	else
		divHTML[j++]= " TYPE=checkbox ";
		
	if(checked)
		divHTML[j++]= " CHECKED=true ";

	if ( enabled == false )
		divHTML[j++]= " DISABLED=true ";
		
	divHTML[j++] = " ></span></span>";

	return imgTemplate;
}

function AppendTemplate( divHTML, imgTemplate, index )
{
	for (var i =0; i < imgTemplate.indexList.length;i++)
	{
		imgTemplate.divHTML[imgTemplate.indexList[i]] = index;
	}
	var j = divHTML.length;
	for ( var i = 0; i < imgTemplate.divHTML.length; i++ )
	{
		divHTML[j++] = imgTemplate.divHTML[i];
	}
	return j;
}

function BuildPhotoTable( div )
{
	var numFolders = 0;
	if ( DirectoryArray ) numFolders = DirectoryArray.length;
	if ( ( nPhotos < 1 ) && ( numFolders > 0 ) ) return;
	
	var fsStart = new Date().getTime();
	TVShell.Message( "PhotosNavigate.js: BuildPhotoTable: ENTER" );

	var j = 0;
	var divHTML = new Array();
	var selectVisible = true;
	if ( fileOpen || ( nPhotos <= 1 ) ) selectVisible = false;
	if ( !bFoldersOrOtherMedia && !g_fTruncated ) selectVisible = false;
	divHTML[j++] = "<div class=groupLabel style='padding-top:10px;'>\
						<table cellpadding=0 cellspacing=0 width=100% height=100%>\
							<tr><td><span>Photos</span></td><td></td>";
	if ( selectVisible )
	{
		divHTML[j++] = "<td id='selectAllTD' style='width:110px; text-align:right; font-size:18px;'>Select All <input type=checkbox id=SelectAllID onclick='parent.SelectAll();' NAME='SelectAllID'></td>";
	}
	divHTML[j++] = "</tr></table></div>";

	if ( nPhotos <= 0 )
	{
		divHTML[j++]= "<div class=itemLabel style=\"width:100%;\"><table cellspacing=0 cellpadding=0 width=100%><tr style=\"padding:2px 0px 2px 15px;\">";
		divHTML[j++]= "<td><span>No photos found</span></td></tr></table></div>";
		div.innerHTML = divHTML.join("");
		delete divHTML;
		return;
	}
	
	
	//Reset the current groups
	currentGroup="";
	currentGroupID=0;

	UpdateWidthHeight();

	var unselectedCell = CreateCellTemplate( false, true );
	var selectedCellEnabled = CreateCellTemplate( true, true );
	var selectedCellDisabled = CreateCellTemplate( true, false );

	for( var index = 0; index < nPhotos ; index++ )
	{
		var formattedDate = formatDate(DMRItemArray[index].date);
		
		if(currentGroup!=formattedDate && !(DifferentDatesCount==0 && DifferentDatesList && DifferentDatesList[0]==UndatedString))
		{			 
			currentGroup=formattedDate;
			divHTML[j++]="<a class='groupLabel' style='border-bottom:none' id='group"
				+ currentGroupID + "'";
			if ( index == 0 && DirectoryArray && DirectoryArray.length == 0)
			{
				divHTML[j++]=" style='borderTop: none;' ";
			}
			divHTML[j++]=">" + currentGroup + "</a>";
			currentGroupID++;	
		}

		if(DMRItemArray[index].attachment)
			j = AppendTemplate( divHTML, selectedCellDisabled, index );
		else if (DMRItemArray[index].checked)
			j = AppendTemplate( divHTML, selectedCellEnabled, index );
		else
			j = AppendTemplate( divHTML, unselectedCell, index );
	}
	
	TVShell.Message("************* j = " + j);

	div.innerHTML = divHTML.join("");
	
	// proactively clean up all temporary variables instead of depending on IE 
	 
	delete unselectedCell.divHTML;
	delete unselectedCell.indexList;
	delete unselectedCell;
	
	delete selectedCellEnabled.divHTML;
	delete selectedCellEnabled.indexList;
	delete selectedCellEnabled;
	
	delete selectedCellDisabled.divHTML;
	delete selectedCellDisabled.indexList;
	delete selectedCellDisabled;

	delete divHTML;

	UpdateSelectedCountStr();
		
	count = nPhotos;

	var fsEnd = new Date().getTime();
	TVShell.Message( "PhotosNavigate.js: BuildPhotoTable: LEAVE. time=" + (fsEnd-fsStart) );
}

function IsHighSpeed()
{
	return (TVShell.ConnectionManager.WANAdapter.RXSpeed >= 100000);
}

var isOnlineStorageDevice = null;
function IsOnlineDevice()
{
	if ( isOnlineStorageDevice == null )
	{
		var sd ;
		isOnlineStorageDevice = false;
		if ( StorageDeviceVN )
		{
			sd = FindStorageDevice( StorageDeviceVN );
			if (sd && sd.Provider.toLowerCase() == "onlinestorage" )
				isOnlineStorageDevice = true;
		}
		if (parameters.AttachmentViewer)
			isOnlineStorageDevice = true;
	}

	return isOnlineStorageDevice;
}

function AskQuality()
{
	var isLocal = (StorageDeviceVN != null 
	    && userDataVolumeName != null
		&& StorageDeviceVN.toLowerCase() == userDataVolumeName.toLowerCase());

	var retVal = isLocal? 1 : PanelManager.CustomMessageBox(
		"Sending photos at full quality can take a long time.<p><p> Choose <b>Friendly</b> to send lower quality photos that are e-mail friendly (these are smaller files that are good for viewing but not for printing). Choose <b>Full</b> if you don't want to change the quality.",
		"Choose photo quality", "Full;Friendly;Cancel", 1, "" );

	if (retVal == 2)
		return null;

	return retVal == 0 ? RES_FULL : RES_WEBREADY;
}

var sendPhotoIndex = 0;
var sendPhotosCheckedItems = null;
var sendPhotosFileInfo = "";
var sendPhotosQuality = null;
var sendPhotosAction = null;
var sendPhotosWaitOnImgSrcURL = null;
var sendPhotosFailures = new Array();
function SendPhotos(quality, action)
{
	if (CheckedItemCount<=0)
	{
		return;
	}
	sendPhotosFromOnlineStorage = false;
	sendPhotosCheckedItems = GetCheckedPhotoIndices(DMRItemArray);
	sendPhotosFailures = new Array();

	var ucAction = action.substring(0,1).toUpperCase() + action.substring(1,action.length);

	var maxNum = IsHighSpeed() ? MAX_NUM_TO_ATTACH_ON_BROADBAND:MAX_NUM_TO_ATTACH_ON_NARROWBAND;

	if ( (AttachmentItemCount+CheckedItemCount) > maxNum )
	{
		PanelManager.CustomMessageBox(" You are attempting to " + action + " more than the maximum " + maxNum + " photos. Choose fewer photos and then choose " + ucAction + " Photos." ,"Too Many Photos", "OK", 1,"");
		return;
	}


	var progressMsg = "";
	if ( action == "send" )
	{
		progressMsg = "Creating empty email and attaching photos.";
	}
	else if ( action == "attach" )
	{
		progressMsg = "Attaching photos to email.";
	}
	else
	{
		progressMsg = ucAction + "ing photos.";
	}


	TVShell.Message( "PhotosNavigate.js: Showing progress " + progressMsg );

	sendPhotoIndex = 0;
	sendPhotosFileInfo = "";

	var allPhotosAreRotated = true;
	for ( var i = 0; i < sendPhotosCheckedItems.length; i++)
	{
		var srcURL = DMRItemArray[sendPhotosCheckedItems[i]].href;
		if(IsInRotatedImageList(srcURL) == false)
		{
			allPhotosAreRotated = false;
			break;
		}
	}
	if ( allPhotosAreRotated )
		quality = RES_WEBREADY;

	if ( quality == RES_QUERY_SIZE )
	{
		quality = AskQuality();
		if ( quality == null )
			return;
	}

	SetProgressStopFunction(null);
	SetProgressText(PROGRESS_PLEASE_WAIT + progressMsg );
	SetProgressPercent(0);
	ShowProgressPanel();

	sendPhotosQuality = quality;
	sendPhotosAction = action;

	setTimeout( SendPhotos1, 10 );
}

function SendPhotos1()
{
	TVShell.Message("SendPhotos1");
	
	var quality = sendPhotosQuality;
	var action = sendPhotosAction;
	var i = sendPhotosCheckedItems[sendPhotoIndex];
	var srcURL = DMRItemArray[i].href;
	try
	{
		if ( quality == RES_FULL && IsURL(srcURL)
			 && DMRItemArray[i].printReadyURL )
			srcURL = DMRItemArray[i].printReadyURL;

		if (CheckedItemCount == 0)
		{
			SendPhotosContinue();
			return;
		}
		
		if(!IsInRotatedImageList(srcURL))
		{
			sendPhotosWaitOnImgSrcURL = srcURL;
			if (quality != RES_FULL && IsOnlineDevice() == false )
				srcURL= ResizeAndGetURL(srcURL, false,
							SendPhotosOnResizedImageReady, null );
		}
		if (IsDefaultResizeFile(srcURL) == false )
		{
			Heartbeat();
			SendPhotos2(srcURL);				
		}
		else
		{
			TVShell.Message( "PhotosNavigate.js: Send Photos waiting for resize to complete. file = "
			                 + DMRItemArray[i].href );
		}
	}
	catch ( ex )
	{
		TVShell.Message( "PhotosNavigate.js: SendPhoto1: Got exception " + ex + " i=" + i );
						 
		//keep track of the ones that we can't resize.
		sendPhotosFailures.push( srcURL );
		SendPhotosContinue();
	}
}

function SendPhotosOnResizedImageReady( myData, imgSrcURL, opStatus )
{
	if ( sendPhotosWaitOnImgSrcURL == imgSrcURL )
	{
		sendPhotosWaitOnImgSrcURL = null;
		TVShell.Message( "PhotosNavigate.js: SendPhotosOnResizedImageReady(" + imgSrcURL + ")");
		try
		{
			if (opStatus)
			{
				SendPhotos2( ResizeAndGetURL(imgSrcURL, true) );
			}
			else
			{
				//keep track of the ones that we can't resize.
				sendPhotosFailures.push( imgSrcURL );
				SendPhotosContinue();
			}
		} catch (ex) {
			TVShell.Message( "PhotosNavigate.js: SendPhotosOnResizedImageReady(" + imgSrcURL + ") failed with exception " + ex + " " +ex.description);
			SendPhotosContinue();
		}
	}
}

function SendPhotos2(srcURL)
{
	var orig = srcURL;

	if (srcURL.indexOf("file://") == 0)
		srcURL = srcURL.substr(7,srcURL.length);

	sendPhotosWaitOnImgSrcURL = null;
	var quality = sendPhotosQuality;
	var action = sendPhotosAction;
	var i = sendPhotosCheckedItems[sendPhotoIndex];
	try
	{
		var imageSize = 0;
	
		if(IsInRotatedImageList(srcURL))
		{
			var rotatedURL = GetRotatedImageURL(srcURL);
			imageSize = Utilities.DetermineFileSize(rotatedURL);
		}
		else if ( IsInRotatedImageList(srcURL)==false && IsOnlineDevice() )
		{
			imageSize = -1;
			if ( quality == RES_FULL )
			{
				imageSize = -2;
				if ( DMRItemArray[i].printReadyURL ) 
					srcURL = DMRItemArray[i].printReadyURL;
			}
		}
		else if ( IsURL(srcURL) )
		{
			imageSize = (quality == RES_FULL ? -2 : -1 );
		}
		else
		{
			imageSize = Utilities.DetermineFileSize(srcURL);
		}

		TVShell.Message("srcURL = " + srcURL);
		if(srcURL!="")
		{
			sendPhotosFileInfo+=srcURL;
			sendPhotosFileInfo+='\n';
			sendPhotosFileInfo+=imageSize;
			sendPhotosFileInfo+='\n';	
		}
		else 
		{
			TVShell.Message( "Unable to attach " + orig );
		}

		var percentComplete = Math.round( ( 100 * sendPhotoIndex )/CheckedItemCount);
		TVShell.Message( "PhotosNavigate.js: % complete=" + percentComplete );
		SetProgressPercent( percentComplete );
		SendPhotosContinue();
	}
	catch ( ex )
	{
		TVShell.Message( "PhotosNavigate.js: SendPhotos2: Got exception " + ex + " i=" + i + " " + ex.description );
		alert( "Unable to finish inserting photo because " + ex.description );
		SendPhotosContinue();
	}
}

function SendPhotosContinue()
{
	TVShell.Message("SendPhotosContinue");
	
	sendPhotoIndex++;
	if ( sendPhotoIndex < CheckedItemCount )
	{
		setTimeout( SendPhotos1, 10 );
	}
	else
	{
		TVShell.Message( "PhotosNavigate.js: Hiding progress" );
		HideProgressPanel();
		
		// if an error occurred in send mail.
		try
		{
			var fileContent="";
			if(AttachmentFileList)
				fileContent+=AttachmentFileList;
			fileContent+=sendPhotosFileInfo;
					
			if (sendPhotosFileInfo != "" )
				SendMail(fileContent);
			else
				TVShell.Message( "PhotosNavigate.js: WARNING: SendPhotos() could not attach any photos" );
		}
		catch (ex)
		{
			alert( "Unable to create a new email to insert photos" );
			TVShell.Message( "PhotosNavigate.js: error sendMail: ex" + ex );
		}

		if (sendPhotosFailures.length > 0 )
		{
			var str = (sendPhotosFailures.length == 1? " photo" : " photos");
			var retVal = PanelManager.CustomMessageBox("Unable to send " + 
					sendPhotosFailures.length + str, "Send " + str,
					"Continue", 1,"");
		}
	}
}

function UpdateAttachmentFileList()
{
	TVShell.Message("UpdateAttachmentFileList");
	sendPhotosFileInfo="";
	for (var i = 0; i < DMRItemArray.length; i++) 
	{
		if ( ! DMRItemArray[i].checked )
		{
			sendPhotosFileInfo += DMRItemArray[i].resizedImgURL;
			sendPhotosFileInfo+='\n';
			sendPhotosFileInfo += DMRItemArray[i].size;
			sendPhotosFileInfo+='\n';
		}
	}

	SendMail(sendPhotosFileInfo);
}

function UpdateCountStr(index)
{
	selectedPhotoIndex = index;
//	var CountStr = document.all.CountStr;
//	if(CountStr)
//		CountStr.innerText = (index+1) + " of " + nPhotos ;
}

function OnMouseOver()
{
	var index = this.index;
	if(index)
		UpdateCountStr(index);
		
}

function OnImageOpen()
{
	var index = this.index;
	UpdateCountStr(index);
	OpenZoomWindow();
}

function DefaultUpdateSelectedCountStrFunction()
{
	var SelectedCountStr = document.all.SelectedCountStr;
	if(SelectedCountStr)
	{
		var itemCount = AttachmentItemCount+CheckedItemCount;
		SelectedCountStr.innerText = ", " + itemCount + " selected";
	}		
}

var OnUpdateSelectedCountStr=DefaultUpdateSelectedCountStrFunction;
function UpdateSelectedCountStr()
{
	OnUpdateSelectedCountStr();
}

function GenerateNewTable(newDimension)
{
	var fsStart = new Date().getTime();
	TVShell.Message( "PhotosNavigate.js: GenerateNewTable: ENTER" );

	if(newDimension == dimension) {
		TVShell.DeviceControl.PlaySound("Page_Boundary");
		return;
	}
	else if (newDimension > dimension) {
		TVShell.DeviceControl.PlaySound("DecreaseTextSize");
	}
	else {
		TVShell.DeviceControl.PlaySound("IncreaseTextSize");
	}

	if ( newDimension < 1 )
		newDimension = 1;
	if ( newDimension > 4 )
		newDimension = 4;

	dimension = newDimension;
	nImageOnPage = dimension*dimension + dimension;
	
	if (nPhotos < 1)
		return;

	var startIndex = GetScrollIndex();
	var endIndex = startIndex + nImageOnPage;
	if ( endIndex >= nPhotos )
		endIndex = nPhotos - 1;
	
	var saveScrollIndex = startIndex;
	var activeElement = document.activeElement;
	var cells = GetCells();
	var cellSpans = GetCellSpans();
//	var thumbnails = GetThumbnailImages();

	for (var i = saveScrollIndex; i < endIndex; i++) {
		var cell = cells[i];

		// Current focus always wins.
		if (cell.contains(activeElement)) {
			saveScrollIndex = i;
			break;
		}

		// If at least 3/4 of image visible, us it as top index.
		if ((cell.offsetTop + cell.offsetHeight / 4) >= scrollListDiv.scrollTop && saveScrollIndex == 0) {
			saveScrollIndex = i;
		}
	}

	UpdateWidthHeight();

	scrollListDiv.scrollTop = 0;
	cells[saveScrollIndex].scrollIntoView(false);

	delete cells;
	delete cellSpans;
	
	var fsEnd = new Date().getTime();
	TVShell.Message( "PhotosNavigate.js: GenerateNewTable: LEAVE. time=" + (fsEnd-fsStart) );
}

function ClearAll() 
{
	var cells = GetCells();
	var checkboxes = GetCheckboxes();
	for (var i = 0; i<count; i++) {
		if(!checkboxes[i].disabled)
		{
			checkboxes[i].checked = false;
			cells[i].style.backgroundColor=UNSELECTED_CELL_BACKGROUND;
			DMRItemArray[i].checked = false;
		}
	}
	
	CheckedItemCount = 0;
	UpdateSelectedCountStr();
	
	delete cells;
	delete checkboxes;
}

function SelectAll() 
{
	ClearAll();

	var cells = GetCells();
	var checkboxes = GetCheckboxes();
	var itemCount = 0;
	
	if (selectAllElement && selectAllElement.checked) {			
		for (var i = 0; i<count; i++) {
			if(!checkboxes[i].disabled)
			{
				checkboxes[i].checked = true;
				cells[i].style.backgroundColor=SELECTED_CELL_BACKGROUND;
				DMRItemArray[i].checked = true;
				itemCount++;
			}
		}
		
		CheckedItemCount = itemCount;
	}
	
	UpdateSelectedCountStr();
	
	delete cells;
	delete checkboxes;
}

function GetScrollIndex()
{
	var fsStart = new Date().getTime();
	TVShell.Message( "PhotosNavigate.js: GetScrollIndex: ENTER" );

	var low = 0;
	var high = Math.ceil( (count - 1) / dimension );

	var i;
	var cells = GetCells();

	var top = scrollListDiv.parentElement.scrollTop;

	var res = null;
	while( low <= high  && res == null)
	{
		i = Math.floor( (low  + high) / 2);
		var cell = cells[i * dimension ];

		//i is too SMALL. Need to search in higher space.
		if ( cell != null && (cell.offsetTop + cell.offsetHeight <= top))
		{
			low = i + 1;
			continue;
		}
		//If cell is null, then we're too high. Need to search in a
		//smaller space.
		if ( cell == null )
		{
			high = i - 1;
			continue;
		}
		var prevCell = null;

		var j;
		for ( j=i-1; j>-1; j--)
		{
			prevCell = cells[j * dimension ];
			if (prevCell == null || prevCell.offsetTop != cell.offsetTop
				|| prevCell.offsetHeight != cell.offsetHeight)
				break;
		}
		i = j+1;

		if ( i == 0 )
		{
			res = i;
			break;
		}
	
		if (cell != null && prevCell != null
			&&(prevCell.offsetTop + prevCell.offsetHeight <= top))
		{
			res = i;
			break; // Match! prev cell is before area & this cell after.
		}

		high = i - 1;
	}
	
	delete cells;

	var fsEnd = new Date().getTime();
	TVShell.Message( "PhotosNavigate.js: GetScrollIndex: LEAVE. time=" + (fsEnd-fsStart) );

	return res * dimension;
}

var refreshThumbnailsTimerID = -1;

function OnScrollHandler()
{
	if ( DMRItemArray == null || DMRItemArray.length == 0 )
		return;

	clearTimeout( refreshThumbnailsTimerID );
	refreshThumbnailsTimerID = setTimeout( RefreshThumbnails, 300 );
}

var refreshThumbnailsLastScrollIndex = -2;
var refreshThumbnailsLastDimension = -2;

function RequestThumbnailRange(thumbnails,startIndex,endIndex)
{
	var incr = ( startIndex < endIndex ? 1 : -1);
	var len = incr * (endIndex - startIndex);

	var checkboxes = GetCheckboxes();
	
	TVShell.Message("RequestThumbnailRange : SI= " + startIndex + " EI=" + endIndex + " len= " + len );
			
	var imgThumbURL;
	var i;
	for( var j = 0 ; j<=len ; j++)
	{
		i = startIndex + incr*j;
		try {
			if(DMRItemArray[i] && DMRItemArray[i].href)
			{
				if (IsInRotatedImageList(DMRItemArray[i].href) == false
				    && DMRItemArray[i].thumbnailURL)
					imgThumbURL = DMRItemArray[i].thumbnailURL;
				else
					imgThumbURL = RequestThumbnail(DMRItemArray[i].href);	
				var imgThumbnailElement = thumbnails[i];
				if(imgThumbnailElement)	
				{			
					imgThumbnailElement.index = i;
					imgThumbnailElement.onmouseover=OnMouseOver;
					imgThumbnailElement.onclick=OnImageOpen;
					imgThumbnailElement.onerror=OnThumbnailLoadError;
					imgThumbnailElement.src = imgThumbURL;		
				}
				
				var chkBox = checkboxes[i];
				if(chkBox)
				{
					if(!chkBox.checked)
						chkBox.checked = false;
					
					if(!chkBox.onclick)
					{
						chkBox.index   = i;
						
						if(chkBox.type=="checkbox")
							chkBox.onclick = OnClickedCheckBox;
						else if	(chkBox.type=="radio")
							chkBox.onclick = OnClickedRadio;
					}		
				}				
			}
		} catch (ex) {
		}
	}
	delete checkboxes;
}

function RefreshThumbnails()
{
	var fsStart = new Date().getTime();
	TVShell.Message( "PhotosNavigate.js: RefreshThumbnails: ENTER" );

	scrollIndex = GetScrollIndex();
	if(maxScrollIndexSoFar < scrollIndex )
		maxScrollIndexSoFar = scrollIndex ;
		
	TVShell.Message("PhotosNavigate.js: SI = " + scrollIndex + " maxScrollIndexSoFar = " + maxScrollIndexSoFar);
	if ( scrollIndex != refreshThumbnailsLastScrollIndex
		|| dimension != refreshThumbnailsLastDimension)
	{
		PhotoManager.ClearThumbnailRequestQueue();
	
		st = new Date().getTime();

		var thumbnails = GetThumbnailImages();
		var checkboxes = GetCheckboxes();
	
		if ( XMLFileURL )
		{
			//We don't need the resize queue so for XML files,
			// we request the thumbnails for the current page before
			//requesting the others.
			RequestThumbnailRange(thumbnails,scrollIndex,
								  scrollIndex + (nImageOnPage*2));
			RequestThumbnailRange(thumbnails,
			                      scrollIndex-1,
								  scrollIndex - nImageOnPage);
		}
		else
		{
			//Request the thumbnails for the current page at the 
			//end because the thumbnail queue is a LIFO queue rather
			//than a FIFO.
			RequestThumbnailRange(thumbnails,scrollIndex - nImageOnPage,
			                      scrollIndex-1);

			RequestThumbnailRange(thumbnails,scrollIndex + (nImageOnPage*2),
			                      scrollIndex);
		}
		
		// clean out src for thumbnails 1 page out of view at this point
		
		for( var j = 0 ; j<scrollIndex - nImageOnPage ; j++)
		{
			var imgThumbnailElement = thumbnails[j];
			if(imgThumbnailElement && imgThumbnailElement.src!= kDefaultPhotoThumbName)	
			{	
				//TVShell.Message("RefreshThumbnails : setting " + j + " from " + imgThumbnailElement.src);
				imgThumbnailElement.onmouseover=null;
				imgThumbnailElement.onclick=null;
				imgThumbnailElement.onerror=null;
				imgThumbnailElement.src = kDefaultPhotoThumbName;
			}
			
			var chkBox = checkboxes[j];
			if(chkBox)
				chkBox.onclick = null;	
		}
		for( var j = scrollIndex + (nImageOnPage*2) + 1; j<thumbnails.length && j <=(maxScrollIndexSoFar + (nImageOnPage*2)); j++)
		{
			var imgThumbnailElement = thumbnails[j];
			if(imgThumbnailElement && imgThumbnailElement.src!= kDefaultPhotoThumbName)	
			{			
				//TVShell.Message("RefreshThumbnails : setting " + j + " from " + imgThumbnailElement.src);
				imgThumbnailElement.onmouseover=null;
				imgThumbnailElement.onclick=null;
				imgThumbnailElement.onerror=null;
				imgThumbnailElement.src = kDefaultPhotoThumbName;
			}
			
			var chkBox = checkboxes[j];
			if(chkBox)
				chkBox.onclick = null;	
		}
		
		et = new Date().getTime();
		TVShell.Message( "PhotosNavigate.js: RequestThumb time=" + (et-st) );

		refreshThumbnailsLastScrollIndex = scrollIndex;
		refreshThumbnailsLastDimension = dimension;
		
		delete thumbnails;
		delete checkboxes;
	}

	var fsEnd = new Date().getTime();
	TVShell.Message( "PhotosNavigate.js: RefreshThumbnails: LEAVE. time=" + (fsEnd-fsStart) );
}

function ZoomIn()
{
	var fsStart = new Date().getTime();
	TVShell.Message( "PhotosNavigate.js: ZoomIn: ENTER" );
	if(dimension>4)
		GenerateNewTable(4);
	//else if(dimension<=1)
	//	GenerateNewTable(1);
	else if(dimension<=2)
		GenerateNewTable(2);
	else
		GenerateNewTable(dimension-1);	
	var fsEnd = new Date().getTime();
	TVShell.Message( "PhotosNavigate.js: ZoomIn: LEAVE. time=" + (fsEnd-fsStart) );
}

function ZoomOut()
{
	var fsStart = new Date().getTime();
	TVShell.Message( "PhotosNavigate.js: ZoomOut: ENTER" );
	if(dimension>=4)
		GenerateNewTable(4);
	//else if(dimension<1)
	//	GenerateNewTable(1);
	else if(dimension<2)
		GenerateNewTable(2);
	else
		GenerateNewTable(dimension+1);	
	var fsEnd = new Date().getTime();
	TVShell.Message( "PhotosNavigate.js: ZoomOut: LEAVE. time=" + (fsEnd-fsStart) );
}

function OnClickedRadio()
{
	var i = this.index;
	var checked = this.checked;
	
	TVShell.Message(" i = " + i + " checked = " + checked);
	
	UpdateCountStr(i);
	var cells = GetCells();
	for (var j = 0; j < DMRItemArray.length ; j++)
	{
		DMRItemArray[j].checked = false;
		cells[j].style.backgroundColor=UNSELECTED_CELL_BACKGROUND;
	}
	DMRItemArray[i].checked = true;		
	cells[i].style.backgroundColor=SELECTED_CELL_BACKGROUND;
	CheckedItemCount=1;

	if (selectAllElement)
	{
		if(CheckedItemCount == nPhotos)
			selectAllElement.checked = true;
		else
			selectAllElement.checked = false;
	}
		
	UpdateSelectedCountStr();
	delete cells;
}
				
function OnClickedCheckBox()
{
	var i = this.index;
	var checked = this.checked;
	
	TVShell.Message(" i = " + i + " checked = " + checked);
	
	UpdateCountStr(i);
	var cells = GetCells();
	if(checked)
	{
		CheckedItemCount++;
		DMRItemArray[i].checked = true;
		cells[i].style.backgroundColor=SELECTED_CELL_BACKGROUND;
	}
	else
	{
		CheckedItemCount--;
		DMRItemArray[i].checked = false;
		cells[i].style.backgroundColor=UNSELECTED_CELL_BACKGROUND;
	}

	if ( selectAllElement )
	{
		if(CheckedItemCount == nPhotos)
			selectAllElement.checked = true;
		else
			selectAllElement.checked = false;
	}
		
	UpdateSelectedCountStr();
	TVShell.Message("PhotosNavigate.js:  CheckedItemCount =" + CheckedItemCount);
	
	delete cells;
}

function OnDropDownSelect()
{
	var subFrame = window.frames['scrollListIFrame'];
	var subDoc = subFrame.document;

	subDoc.all["group" + dropDown.selectedIndex].scrollIntoView(false);
}

function GoPrevDDValue()
{
	if(dropDown.selectedIndex<=0)
		dropDown.selectedIndex = dropDown.length - 1;
	else
		dropDown.selectedIndex--;
		
	dropDown.onSelect();
}

function GoNextDDValue()
{
	if(dropDown.selectedIndex>=dropDown.length - 1)
		dropDown.selectedIndex = 0;
	else
		dropDown.selectedIndex++;

	dropDown.onSelect();
}

var scrollListDiv = null;
var warningCell = null;
var warningTable = null;

function CreateScrollingDiv()
{
	var div = null;
	try
	{
		var subFrame = window.frames['scrollListIFrame'];
		var subDoc = subFrame.document;
		subDoc.mainDocument = document;
		for ( var i =0; i <document.styleSheets.length; i++)
		{
			//Import style sheets.
			var href = document.styleSheets[i].href;
			subDoc.createStyleSheet( href );
		}

		subDoc.body.style.backgroundColor='transparent';
		subDoc.body.style.border='none';
		subDoc.body.innerHTML = "<div id=scrollListDiv tabIndex=-10001  style='height:100%; padding-right:23px;'></div>";

		subFrame.attachEvent("onscroll", OnScrollHandler);
	
		div = subDoc.all.scrollListDiv;
		document.body.delegate = subDoc.body;

		var warn = new Array();
		var j=0;
		warn[j++] = "<table id=warningTable width=100% cellspacing=0 cellpadding=0 style='display:none'>";
		warn[j++] = "<tr width=100%>";
		warn[j++] = "<td valign=center>";
		warn[j++] = "<div style='position:relative;left:5px;margin:0 0 0 0;behavior:url(#default#alphaImageLoader);src:url(msntv:/Panels/Images/Icon_Info_ErrorPanels.png);width:40px;height:40px;'></div>";
		warn[j++] = "</td><td width=5></td>";
		warn[j++] = "<td id=warningCell style='font-size:18px;padding-top:5px'>";
		warn[j++] = "</td>";
		warn[j++] = "</tr>";
		warn[j++] = "</table>";
		div.innerHTML = warn.join("");

		warningCell = subDoc.all.warningCell;
		warningTable = subDoc.all.warningTable;
	} catch (ex) {
		TVShell.Message( "PhotosNavigate.js: CreateScrollingDiv: " + ex );
	}

	return div;
}

function BuildScrollArea(source)
{
	scrollListDiv = CreateScrollingDiv();
	TVShell.Message( "PhotosNavigate.js: Created scrolling div. " );

	ScrollArea.style.pixelHeight = document.body.clientHeight - ScrollArea.offsetTop;

	var selectCountVisible = true;
	if( fileOpen || nPhotos<=1 ) selectCountVisible = false;
	if ( selectCountVisible ) selectAllRow.style.display = "block";
		
	if(DMRItemArray && DMRItemArray.length>0 && (DifferentDatesList.length + (DirectoryArray != null && DirectoryArray.length>9 ? 1 : 0)) > 1)
	{
		selectAllRow.style.display = "block";
		DropdownRow.style.display = "block";
		JumpToRow.style.display = "block";
		
		var dropDownLength = DifferentDatesList.length;

		for(i=0; i<DifferentDatesList.length; i++)
		{
			dropDown.AppendItem(DifferentDatesList[i]);			
		}
		
		if(dropDownLength >=4)
			dropDown.size = 4;	
		else
			dropDown.size = dropDownLength;
	}
									
	if(!XMLFileURL && !fFlattenDirectories)
	{
		try {
			BuildTopLevelFolderDiv();
			BuildDirectoryList(scrollListDiv, source);
		} catch ( ex ) {
			TVShell.Message( "PhotosNavigate.js: failed to build dir list.ex: " + ex + " " + ex.description );
		}
	}

	TVShell.Message( "PhotosNavigate.js: Done building directories. " );
			
	BuildCompleteTable();
	if (nPhotos > 0)
	{
		OnScrollHandler();
	}
}

