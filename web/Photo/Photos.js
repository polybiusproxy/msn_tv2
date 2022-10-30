var PhotoManager			= TVShell.PhotoManager;
var ThumbnailManager		= TVShell.ThumbnailManager;
var MediaHistory			= TVShell.MediaHistory;
var CurrentUser				= TVShell.UserManager.CurrentUser;
var Sink					= new ActiveXObject("MSNTV.MultipleEventSink");

var PhotoViewerMediaHistoryList = "PhotoViewerMediaHistory";
var PhotoStorePath="Photo\\Albums";
var PhotoSettingsPath="Photo\\Settings";
var scFileName = "ScreenSaver.txt";
var photoAreaHeight = 420;
var photoAreaWidth  = 560;
var MAX_PHOTOS_ON_LOCAL_STORAGE=100;

//MUST MATCH CONSTANT IN CPhotoManager.cpp
var kDefaultPhotoName="file:///web/photo/Assets/PhotoLoadingImageBig.jpg";
var kDefaultPhotoThumbName ="file:///web/photo/Assets/PhotoLoadingImageSmall.jpg";
var kUnavailablePhotoThumbName ="file:///web/photo/Assets/PhotoBadImageSmall.jpg";

function IsDefaultResizeFile( resizedImgURL )
{
  return resizedImgURL == kDefaultPhotoName;
}

function IsDefaultThumbnailFile( resizedImgURL )
{
  return resizedImgURL == kDefaultPhotoThumbName;
}

function IsSignedIn()
{
	return (CurrentUser && CurrentUser.IsAuthorized);
}

function IsOnlineStorageAvailable()
{
	return (CurrentUser && CurrentUser.IsAuthorized && CurrentUser.ServiceList("onlinestorage::root"));
}

function IsHighSpeed()
{
	return (TVShell.ConnectionManager.WANAdapter.RXSpeed >= 100000);
}

function SortNodes(node1, node2)
{
    var name1=node1.selectSingleNode(".//a:displayname").text.toLowerCase();
    var name2=node2.selectSingleNode(".//a:displayname").text.toLowerCase();

	if( name1 > name2 ) return 1;
	if( name1 == name2 ) return 0;
	return -1;
}

function IsMIMETypeSupported( MIMEIn)
{
	 
	var MIMELC = MIMEIn.toLowerCase();
	
	if(SupportedPhotoMIMETypes.indexOf(MIMELC)!=-1)
		return true;
	else
		return false;

}

var resizeRequests = null;

//WARNING: This will throw an exception if an error occurs
function ResizeAndGetURL(imageURL, fGetItNow)
{
	TVShell.Message( 'Calling ResizeAndGetURL('+imageURL+','+fGetItNow+')');
	if ( Sink == null )
		throw "You must create a Sink before calling Photos.js:ResizeAndGetURL";
	var func = ResizeAndGetURL;
	var cbFunc = (func.arguments.length > 2 ? func.arguments[2] : null);
	var cbData = (func.arguments.length > 3 ? func.arguments[3] : null);

	if ( fGetItNow != true && cbFunc == null && cbData == null )
		throw "You must provide a callback if fGetItNow is false";

	var retURL = "";
	if(imageURL)
	{	
		if(IsInRotatedImageList(imageURL))
		{
			retURL = FormatURL(GetRotatedImageURL(imageURL));
		}
		else if (location==1 || XMLFileURL)
		{
			retURL = FormatURL(imageURL);
		}
		else
		{
			// shrink by maintaining proportions
			if ( fGetItNow == false && resizeRequests == null )
			{
				resizeRequests = new Object();
				Sink.AttachEvent( PhotoManager, "OnResizedImageReady",
				                  ResizeAndGetURL_OnResizedImageReady );
			}
			var retURL = PhotoManager.RequestResizedImage(imageURL, fGetItNow);
			retURL = FormatURL(retURL);
			if ( IsDefaultResizeFile(retURL) ) 
			{
				TVShell.Message( "Adding callback for '" + imageURL + "'" );
				var requests = resizeRequests[imageURL];
				if ( requests == null )
					requests = new Array();
				var req = new Object();
				requests[requests.length++]=req;
				req.imageURL = imageURL;
				req.cbFunc = cbFunc;
				req.cbData = cbData;
				resizeRequests[imageURL] = requests;
			}
		}
	}

	TVShell.Message(" retURL " + retURL);
	return retURL;
}

function ResizeAndGetURL_OnResizedImageReady(imgSrcURL, opStatus)
{
	TVShell.Message( 'Calling ResizeAndGetURL_OnResizedImageReady('+imgSrcURL+','+opStatus+')');

	var requests = resizeRequests[imgSrcURL];
	resizeRequests[imgSrcURL] = null;
	var okayToDelete = true;
	for (var i = 0; i < resizeRequests.length; i++)
	{
		if ( resizeRequests[i]!=null )
		{
			okayToDelete = false;
			break;
		}
	}
	if (okayToDelete)
		resizeRequests = new Object();
	if ( requests != null )
	{
		TVShell.Message( "Invoking " + requests.length + " callbacks " );
		for ( var i = 0; i < requests.length; i++) 
		{
			requests[i].cbFunc(requests[i].cbData, imgSrcURL, opStatus);
		}
	}
	else
	{
		TVShell.Message( "No callbacks found for image " + imgSrcURL );
	}
}
			
function ChangeForwardToBackwardSlash( element ) 
{
	if(element)
	{
		var re = /[/]/g; 
		return element.replace(re, '\\');
	}
}

function ChangeBackwardToForwardSlash( element ) 
{
	if(element)
	{
		var re = /[\\]/g; 
		return element.replace(re, '/');
	}
}

function IsInRotatedImageList(srcURL)
{
	return srcURL != null 
	  && (srcURL.indexOf("\\temp\\photo\\rotated\\") == 0 
	      || PhotoManager.IsInRotatedImageList(srcURL));
}

function GetRotatedImageURL(fileName)
{
	var fileName = ( fileName.indexOf("\\temp\\photo\\rotated\\") == 0 ? fileName : PhotoManager.GetRotatedImageURL(fileName));

	return fileName;
}

var PhotosBadImages = new Object();
function IsBadImage(srcURL)
{
	return PhotosBadImages[srcURL] != null;
}

function MarkAsBadImage(srcURL)
{
	PhotosBadImages[srcURL] = true;
}

function MarkAsGoodImage(srcURL)
{
	PhotosBadImages[srcURL] = null;
}

function GetImageHREFNodes(StorageDevice, path, flatten, maxSearchCnt, maxResultCnt )
{
	var result="";
		
	if (StorageDevice) 
	{
		var maxDepth = ( flatten ? -1 : 1 );
		var maxResultCount = maxResultCnt ? maxResultCnt : -1;
		var maxSearchCount = maxSearchCnt ? maxSearchCnt : -1;
		
		var xmlStr;
		if( maxResultCount == -1) 
			xmlStr = StorageDevice.EnumerateItems(path, SupportedPhotoMIMETypes, maxDepth, maxSearchCount, maxResultCount);
		else
			xmlStr = StorageDevice.EnumerateFilesOnly(path, SupportedPhotoMIMETypes, maxDepth, maxSearchCount, maxResultCount);
		
		if (xmlStr) 
		{
			var xmlDoc = new ActiveXObject("Msxml2.DOMDocument");
			xmlDoc.async = false;

			if (xmlDoc.loadXML(xmlStr)) 
			{
				var nodes = xmlDoc.selectNodes("//a:response[a:propstat/a:prop/a:iscollection = 0]");
				if (nodes && nodes.length > 0) 
				{
					var i;
					for (i = 0; i < nodes.length; i++)
					{
						var node= nodes.item(i);
						var hrefNodeText    = node.selectSingleNode(".//a:href").text;
						
						result+=hrefNodeText;
						result+="\n";
					}
				}
			}
		}
	}
	return result;						
}

var dwnLoadQueue = null;
var dwnLoadQueueCurrentRequest = null;

function DownloadToCache( callbackFunc, callbackData, fileURL )
{
	if ( dwnLoadQueue == null )
	{
		Sink.AttachEvent( PhotoManager, "OnDownloadComplete", OnDownloadComplete );
		dwnLoadQueue = new Array();
	}
	var req = new Object();
	req.fileURL = fileURL;
	req.callbackFunc = callbackFunc;
	req.callbackData = callbackData;
	dwnLoadQueue[dwnLoadQueue.length++]=req;

	if ( dwnLoadQueue.length == 1 )
		setTimeout(DownloadToCacheProcessItem,1);
}

function DownloadToCacheProcessItem()
{
	var req = dwnLoadQueue.pop();
	if (req)
	{
		dwnLoadQueueCurrentRequest = req;
		try
		{
			PhotoManager.DownloadToCache( req.fileURL );
		} catch (ex) {
			TVShell.Message( "asynchronous DownloadToCache exception: " +
							req.fileURL +
							ex + " " + ex.description);
			setTimeout(DownloadToCacheProcessItem,1);
		}
	}
}

function OnDownloadComplete(localPath)
{
	var req = dwnLoadQueueCurrentRequest;
	if (req)
	{
		req.callbackFunc( req.callbackData, req.fileURL, localPath );
	}
	if ( dwnLoadQueue.length > 0 )
		setTimeout(DownloadToCacheProcessItem,1);
}
