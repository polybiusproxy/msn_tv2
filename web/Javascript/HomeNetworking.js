//
// state / events from homenetworking object
//

var HOST_STATE_NEW 			= 0;
var HOST_STATE_OFFLINE 		= 1;
var HOST_STATE_BRINGONLINE 	= 2;
var HOST_STATE_ONLINE		= 3;

var SHARE_STATE_UNMOUNTED	= 1;
var SHARE_STATE_MOUNTING	= 2;
var SHARE_STATE_MOUNTED		= 3;
var SHARE_STATE_UNMOUNTING	= 4;

var HN_RESOURCE_UNKNOWN = 0;
var HN_RESOURCE_STORAGE = 1;
var HN_RESOURCE_PRINT = 2;

var HN_EVT_NEWHOST = 1;
var HN_EVT_ONLINE = 2;
var HN_EVT_OFFLINE = 3;
var HN_EVT_BRINGONLINE = 4;
var HN_EVT_MOUNTED = 5;
var HN_EVT_UNMOUNTED = 6;
var HN_EVT_NEWSERVICE = 7;
var HN_EVT_ENDSERVICESCAN = 8;
var HN_EVT_ENDHOSTSCAN = 9;
var HN_EVT_HOSTSCANPROGRESS = 10;


// Mount errors
var HRESULT_ERROR_ACCESS_DENIED = -2147024891;
var HRESULT_ERROR_ALREADY_ASSIGNED = -2147024812;
var HRESULT_ERROR_BAD_DEVICE = -2147023696;
var HRESULT_ERROR_BAD_NET_NAME = -2147024829;
var HRESULT_ERROR_BUSY = -2147024726;
var HRESULT_ERROR_CANCELLED = -2147023673;
var HRESULT_ERROR_DEVICE_ALREADY_REMEMBERED = -2147023694;
var HRESULT_ERROR_INVALID_PASSWORD = -2147023680;
var HRESULT_ERROR_NO_NET_OR_BAD_PATH = -2147023693;
var HRESULT_ERROR_BAD_NETPATH = -2147024843;
var HRESULT_ERROR_NO_NETWORK = -2147023674;
var HRESULT_ERROR_VC_DISCONNECTED = -2147024656;


function ShareUnavailableMessageBox( he, se, status, isPanel )
{
	TVShell.Message("ShareUnavailableMessageBox - status: " + status);

	if (!TVShell.IsOn)
		return;

	var AltError;
	
	switch (status) {
		case HRESULT_ERROR_ACCESS_DENIED:
			AltError = "Access denied";
			break;

		case HRESULT_ERROR_INVALID_PASSWORD:
			AltError = "Invalid password";
			break;

		case HRESULT_ERROR_BAD_NET_NAME:
			AltError = "Folder not shared";
			break;

		case HRESULT_ERROR_NO_NET_OR_BAD_PATH:
			AltError = "Invalid folder";
			break;

		case HRESULT_ERROR_BAD_NETPATH:
			AltError = "No such folder";
			break;

		case HRESULT_ERROR_VC_DISCONNECTED:
		case HRESULT_ERROR_NO_NETWORK:
			AltError = "Network unavailable";
			break;

		default:
			AltError = status;
			break;
	}

	switch (status) {
		case HRESULT_ERROR_ACCESS_DENIED:
		case HRESULT_ERROR_INVALID_PASSWORD:
			var ret = TVShell.PanelManager.CustomMessageBox(
			"<P>You may have typed the wrong user name or password.</P><P>Check the information and try again.</P><P>To troubleshoot, choose <EM>More Info</EM>",
			"Incorrect information", "More Info;Continue", 1, AltError, false, MGX_ICON_WARNING , MGX_SIZE_LARGE ); 
			switch (ret) {
				default:
					break;
				case 0:
					TVShell.URL = "msntv:/Help/MSNTV_OFFLINE_TOC_main.htm";
					if (isPanel) {
						TVShell.PanelManager.Remove(window.name);
					}
					break;
			}
			break;

		default:
		case HRESULT_ERROR_BAD_NET_NAME:
		case HRESULT_ERROR_NO_NET_OR_BAD_PATH:
		case HRESULT_ERROR_BAD_NETPATH:
		case HRESULT_ERROR_VC_DISCONNECTED:
			var ret = TVShell.PanelManager.CustomMessageBox(
			"<P>Please check the status of the shared folder on your computer</P><P>To troubleshoot, choose <EM>More Info</EM>",
			"Folder not found", "More Info;Continue", 1, AltError, false, MGX_ICON_WARNING , MGX_SIZE_LARGE ); 
			switch (ret) {
				default:
					break;
				case 0:
					TVShell.URL = "msntv:/Help/MSNTV_OFFLINE_TOC_main.htm";
					if (isPanel) {
						TVShell.PanelManager.Remove(window.name);
					}
					break;
			}
			break;

		case HRESULT_ERROR_NO_NETWORK:
			GotoLANPage("javascript:history.go(-1);");
			break;
	}
}
