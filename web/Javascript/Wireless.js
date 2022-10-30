//
// Wireless.js
//
var PanelManager = TVShell.PanelManager;

var WirelessSignal_None=0;
var WirelessSignal_VeryLow=1;
var WirelessSignal_Low=2;
var WirelessSignal_Medium=3;
var WirelessSignal_MediumHigh=4;
var WirelessSignal_High=5;
var WirelessSignal_VeryHigh=6;

var WirelessAuth_Ndis802_11AuthModeOpen = 0;
var WirelessAuth_Ndis802_11AuthModeShared = 1;
var WirelessAuth_Ndis802_11AuthModeAutoSwitch = 2;
var WirelessAuth_Ndis802_11AuthModeWPAPSK = 3;

var WirelessMode_Ndis802_11IBSS = 0;
var WirelessMode_Ndis802_11Infrastructure = 1;
	
	
var Wireless_WEPEnable = 0;
var Wireless_WEPDisable = 1;
var Wireless_WEPUnknown = 2;
var Wireless_WPAEnable = 3;
	

function Message(dbg)
{
	TVShell.Message(dbg);
}

function WSAlert(msg)
{
	WSDialog(msg,"","Done",0,"",0x30,1);
}


function WSPopUp(msg,anim,snd,timeOut)
{
	PanelManager.AnimationMessageBox(msg,anim,snd,timeOut,true);	
}


function WSDialog(msg,title,buttons,defBut,errMsg,iconType,size)
{
	TVShell.ScreenSaver.UserActive(); // Wakeup screen saver
		
	return PanelManager.CustomMessageBox(msg,title,buttons,defBut,errMsg,true,iconType,size);
}

function
RemoveBars(str)
{
//	var re = new RegExp("\x7c","g");//re = new RegExp("|","g");
//	return str.replace(re,"*");

	var i;
	var res = "";
	var s = str;
	while ( 1 ) {
		i = s.indexOf("|");
		if ( i == -1 ) {
			res += s;
			return res;
		} else {
			res += s.substring(0,i);
			res += "&#124;";
			s = s.substring(i+1,s.length);
		}
	}
}


function
EscapePanelString(str)
{

	
	if ( str.indexOf("|") > -1 ) {
		// panels strings use | as a seperator between message and icon. Convert to I's for display
		str = RemoveBars(str);
	}
	
	return str;
}


// load settings from a wireless network SmartKey file
// http://download.microsoft.com/download/5/b/5/5b5bec17-ea71-4653-9539-204a672f11cf/_Toc70496901

var WCF_Error;
var WCF_ConfigID;
var WCF_SSID;

function LoadWCFFile(fileName)
{
	
	var xml_doc = new ActiveXObject("Msxml2.DOMDocument");
	xml_doc.async = false;
	WCF_Error = "";
	WCF_ConfigID = "";
	WCF_SSID = "";
	var WirelessAdapter = TVShell.ConnectionManager.WirelessAdapter;
	var WirelessSettings = null;
	if (WirelessAdapter) {
		WirelessSettings = WirelessAdapter.Settings;
	}
	
	if ( xml_doc.load(fileName) ) {
		var config = xml_doc.selectNodes("wirelessProfile");
		
		if ( config.length == 1 ) {
			var theConfig = config.nextNode;
			WCF_ConfigID = theConfig.selectNodes("config").nextNode.selectNodes("configId").nextNode.text;
		
			Message("Wireless config id : " +  WCF_ConfigID);
			
			WCF_SSID = theConfig.selectNodes("ssid").nextNode.text;
			var connectionType = theConfig.selectNodes("connectionType").nextNode.text;
			var profile = theConfig.selectNodes("primaryProfile").nextNode;
			var authentication = profile.selectNodes("authentication").nextNode.text;
			var encryption = profile.selectNodes("encryption").nextNode.text;
			var networkKey = profile.selectNodes("networkKey").nextNode.text;
			var keyIndex = 1;
			if ( profile.selectNodes("keyIndex") && profile.selectNodes("keyIndex").nextNode ) {
				keyIndex = profile.selectNodes("keyIndex").nextNode.text;
			}
			var keyProvidedAutomatically = profile.selectNodes("keyProvidedAutomatically").nextNode.text;
			var ieee802Dot1xEnabled = profile.selectNodes("ieee802Dot1xEnabled").nextNode.text;


			Message("ssid:" + WCF_SSID);
			Message("connectionType:" + connectionType);
			Message("authentication:" + authentication);
			Message("encryption:" + encryption);
			Message("networkKey:" + networkKey);
			Message("keyIndex:" + keyIndex);
			Message("keyProvidedAutomatically:" + keyProvidedAutomatically);
			Message("ieee802Dot1xEnabled:" + ieee802Dot1xEnabled);
			

			if ( encryption == "WEP" ) {
				WirelessSettings.WEPEnable = true;
				if ( networkKey == "" ) {
					WCF_Error = "WEP specified, but no key present";
					Message(WCF_Error);
					return false;
				} else {
					WirelessSettings.KeyMaterial1 = networkKey;
				}
			} else if ( encryption == "none" ) {
				WirelessSettings.WEPEnable = false;
			} else { 
				WCF_Error = "Unsupported encryption format: " + encryption;
				Message(WCF_Error);
				return false;
			}

			
			if ( WCF_SSID != "" ) {
				WirelessSettings.SSID = WCF_SSID;
			}
			if ( authentication == "open" ) {
				WirelessSettings.AuthenticationMode	= WirelessAuth_Ndis802_11AuthModeOpen;		
			} else if ( authentication == "shared" ) {
				WirelessSettings.AuthenticationMode	= WirelessAuth_Ndis802_11AuthModeShared;		
			} else { 
				WCF_Error = "Unsupported authentication format: " + authentication;
				Message(WCF_Error);
				return false;
			}
			return true;
		}
		
	}
	return false;
}

function WriteWCFResult(path)
{

	var xmldoc = TVShell.CreateXmlDocument();

	Message("Write result file to : " + path);
	var WirelessAdapter = TVShell.ConnectionManager.WirelessAdapter;
	if (WirelessAdapter == null ) {
		Message("no adapter");
		return false;
	}
	var macAddress = WirelessAdapter.MacID;
	Message("Adapter is " + macAddress);
	var colonectomy = new RegExp(":","gi");
	macAddress = macAddress.replace(colonectomy,"");
	macAddress = macAddress.toUpperCase();
	var macIDString = macAddress.substring(4,12);

	var fileName = path +  macIDString + ".WFC";

	var res = xmldoc.loadXML("<?xml version=\"1.0\"?>\n<device></device>\n");
	if ( !res ) {
		Message("loadXML failed");
		return false;
	}
	
	xmldoc.async = false;
	xmldoc.preserveWhiteSpace = true;
	var dev = xmldoc.documentElement;
	if ( dev == null ) {
		Message("loadXML failed");
		return false;
	}
	
	
	
	var elem = xmldoc.createElement("configId");
	elem.text = WCF_ConfigID;
	dev.appendChild(elem);
	
	elem = xmldoc.createElement("manufacturer");
	elem.text = "Microsoft";
	dev.appendChild(elem);
		
	elem = xmldoc.createElement("modelName");
	elem.text = TVShell.SystemInfo.ProductFullName;
	dev.appendChild(elem);
	
	elem = xmldoc.createElement("serialNumber");
	elem.text = TVShell.SystemInfo.BoxIDUI;
	dev.appendChild(elem);
	
	elem = xmldoc.createElement("firmwareVersion");
	elem.text = TVShell.SystemInfo.OSVersion + "."
				+ TVShell.SystemInfo.Version + "." 
				+ TVShell.SystemInfo.BuildNumber;
	dev.appendChild(elem);
	
	
	elem = xmldoc.createElement("macAddress");
	elem.text = macAddress;
	dev.appendChild(elem);

	
	if ( WCF_Error != "" ) {
		elem = xmldoc.createElement("configError");
		elem.text = WCF_Error;
		dev.appendChild(elem);
	}


	dev.setAttribute("xmlns","http://www.microsoft.com/provisioning/DeviceProfile/2004");
	
	Message("result file is: " + fileName);

	
	xmldoc.save(fileName);
}

function IsWCFFile(fileName)
{
	Message("IsWCFFile: " + fileName);
	var xml_doc = new ActiveXObject("Msxml2.DOMDocument");
	xml_doc.async = false;
	
	if ( xml_doc.load(fileName) ) {
		var config = xml_doc.selectNodes("wirelessProfile");
		if ( config.length == 1 ) {
			var theConfig = config.nextNode;
			WCF_ConfigID = theConfig.selectNodes("config").nextNode.selectNodes("configId").nextNode.text;
		
			Message("config id : " +  WCF_ConfigID);
			
			WCF_SSID = theConfig.selectNodes("ssid").nextNode.text;
			
			Message("File is wireless config : " + fileName + WCF_SSID);
			return true;
			
		}
	}
	return false;
}

function FindSmartNetKeyFile()
{
	// look for directory called "SMRTNTKY" and in it find file called "WSETTING.WFC"
	
	var i;
	
	for ( i=0; i < TVShell.StorageManager.Count; i++ ) {
		var StorageDevice = TVShell.StorageManager.Item(i);
		if (StorageDevice.Removable && !StorageDevice.IsNetwork && StorageDevice.Mounted)  {
			Message("FindSmartNetKeyFile check : " + StorageDevice.PartitionName + " " +  StorageDevice.DeviceName);
			
			var devName = StorageDevice.VolumeName;
			var pathName = "file://" + "\\" + devName + "\\SMRTNTKY\\WSETTING.WFC";
	
			if ( IsWCFFile(pathName) ) {
				Message("Settings file is: " + pathName);
				return pathName;
			}
		}
	}
	return "";
}

function ReadSmartNetKey()
{		
	var i;
	if (TVShell.ConnectionManager.WirelessAdapter &&
		TVShell.ConnectionManager.WirelessAdapter.CheckStatus() != ConnectError_NoAdapter) {
		
		var settingsFileName = FindSmartNetKeyFile();
	
		if ( settingsFileName != "" ) {
			var netName = WCF_SSID;
			if ( netName != "" ) {
				netName = "for '" + TVShell.Utilities.EscapeHTML(netName) + "' ";
			}
			var quest = "A Windows Smart Network Key " + netName + "was found. Do you want to use the settings from this key?";
			var result = WSDialog(quest,"Network settings key", "Cancel; Use settings", 1,"",true,MGX_ICON_INFO,MGX_SIZE_LARGE);
			if (result) {
				if ( LoadWCFFile(settingsFileName) ) {
					//WSAlert("The wireless network settings were applied");		
				} else {
					WSAlert("The wireless network settings settings could not be used.");		
				}
				var end = settingsFileName.indexOf("WSETTING.WFC");
				Message("WSETTING.WFC found at " + end);
				if ( end < 0 ) {
					end = settingsFileName.length;
				}
				var resultFileName = settingsFileName.substring(0,end);
				
				
				resultFileName =  resultFileName + "DEVICE\\";
				Message("resultFileName " + resultFileName);
				
			
				WriteWCFResult(resultFileName);
			}
			return true;
		}
		return false;
	} else {
		Message("No wireless adapter present, not looking for SmartNetKey");
		return false;
	}		
}

function CheckKey(theKey, bitLength)
{
	var bits;
	var canonicalHexKey;
	bits =  IsValidHexNumber(theKey);
	
	if ( bits == bitLength ) {
		var re = new RegExp(" ","gi");
		nospKey = theKey.replace(re,"");
		var pl = HexPrefixLength(nospKey);
		canonicalHexKey = nospKey.substring(pl,(bits/4)+pl);
	} else {
		bits = theKey.length * 8;
		canonicalHexKey = ASCIIToHex(theKey);
	}
	if ( bits == bitLength ) {
		return canonicalHexKey.toUpperCase();	
	} else {
		return "";
	}
}

var showedLongKeyWarning = false;

function CheckKeyEntry(t)
{
	var isCandidate = false;
	var ok64 = CheckKey(t,64-24);
	var ok128 = CheckKey(t,128-24);
	if ( ok128 != ""  ) {
		Message("CheckKeyEntry: Valid 128-bit key  : " + ok128);
	} else if ( ok64 != "" ) {
		Message("CheckKeyEntry: Valid 64-bit key  : " + ok64);
	}
	var numChars = t.length;
	if ( IsValidHexNumber(t) > 0 ) {
		numChars -= HexPrefixLength(t);
		if ( t.indexOf(' ') >= 0 ) {
			numChars = 0;
			for ( var i=HexPrefixLength(t); i < t.length; i++ ) {
				if ( t.charAt(i) != ' ' ) 
					numChars++;
			}
		}
		if ( numChars == 10 || numChars == 26 ) { 
			isCandidate = true;
		}
		showedLongKeyWarning = false;
	} else if ( numChars > 13 ) {
		if ( !showedLongKeyWarning ) {
			WSAlert("The key you entered is longer than 13 characters, but has characters other than 0-9 and A-F. Please confirm that the key you are entering is correct.");
			showedLongKeyWarning = true;
		}
	} else {
		showedLongKeyWarning = false;
	}
	if ( numChars == 5 || numChars == 13 ) { 
		isCandidate = true;
	}
	var hint = "(" + numChars + "&nbsp;characters)";
	if ( isCandidate ) {
		hint = "<font color=#408020><b>" + hint + "</b></font>";
	}
	document.all.KeyCharCountHint.innerHTML = hint;
	
	
}

var maskChar = "*";
var origKey = "";

function DisplayKey(key)
{
	var maskedKey = "";
	var i;
	for ( i=0; i < key.length; i++ ) {
		maskedKey += maskChar;
	}
	document.all.Key.value = maskedKey;
	origKey = key;
}

function IsMasked(key)
{
	var i;
	if ( key.length > 0 ) {
		for ( i=0; i < key.length; i++ ) {
			if ( key.substring(i,i+1) != maskChar )
				break;
		}
	}
	return i == key.length;
}

function GetEnteredKey()
{
	var key = document.all.Key.value;
	if (IsMasked(key) && origKey.length != 0  ) {
		if ( key.length == origKey.length ) {
			TVShell.Message("Key not changed");
			return origKey;
		}
	}
	return document.all.Key.value;
}

function OnKeyEntryChanged(isWPA)
{	
	var key = document.all.Key.value;

	if ( IsMasked(key) && origKey.length != 0 ) {
		if ( origKey.length > key.length ) {
			document.all.Key.value = "";
			origKey = "";
			key = "";
		} else {
			key = "";
		}
	}
	if ( isWPA ) {
		var hint = "(" + key.length + "&nbsp;characters)";
		document.all.KeyCharCountHint.innerHTML = hint;
	} else {
		CheckKeyEntry(key)
	}
}

function CheckSSIDEntry(ssid)
{
	if ( ssid.length > 32  ) {
		WSAlert("A wireless network identifier (SSID) can not be longer than 32 characters.");
		return false;
	}
	//*** need to check for disallowed characters
	return true;
}

function ASCIIToHex(asciiString)
{
	var hexString = "";
	for (i=0;i<asciiString.length;i++)
		hexString += asciiString.charCodeAt(i).toString(16);
	return hexString;
}


function HexPrefixLength(hexString)
{
	if ( hexString.length < 1 ) {
		return 0;
	}
	if ( hexString.charAt(0) == '$' ) {
		return 1;
	}
	if ( hexString.substring(0,2) == "0x" || hexString.substring(0,2) == "0X" ) {
		return 2;
	}
	return 0;
}

function IsValidHexNumber(hexString)
{		
	var i = 0;
	var bits = 0;
	
	if ( hexString.length < 1 ) {
		return 0;
	}
	i = HexPrefixLength(hexString);
	for ( ; i < hexString.length; i++ ) {
		var c = hexString.charAt(i,i+1);
		if ( c == ' ' ) {
			// allow spaces ( maybe should only allow at fixed intervals ? )
			continue;
		}
		
		if ( c >= '0' && c <= '9' ) {
			bits += 4;
			continue;
		}
		if ( c >= 'A' && c <= 'F' ) {
			bits += 4;
			continue;
		}
		if ( c>= 'a' && c<= 'f' ) {
			bits += 4;
			continue;
		}
		return 0;
	}
	return bits;
}

var WirelessStatusPanel;
var WirelessConnectOnSuccess;
var WirelessConnectOnFailure;
var PreviousLANAdapter = TVShell.ConnectionManager.LANAdapter;
var WaitForDisconnect;
var WaitForConnect;
var WaitForConnecting;
var WirelessConnectCheckInProgress = false;
var WirelessTimeout = null;

function 
WirelessConnectFailed(errorCode)
{
	TVShell.Message("Wireless LAN Connect failed error: " + ConnectionFailureName(errorCode));
		
	var ssid = WirelessSettings.SSID;
		
	ssid = TVShell.Utilities.EscapeHTML(ssid);
	if ( WirelessSettings.WEPEnable ) {

		var msg = "Unable to connect to wireless network <em>" + ssid + "</em>. ";
		if ( errorCode == ConnectError_NoDHCPResponse ) {
			msg += "Could not get response from DHCP server.";
		}
		msg += "Please check the key is entered correctly.";
		var title = "Unable to connect";
		var buttons = "Done";
		var defBut = 0;
		var errMsg = "";
		var iconType = MGX_ICON_INFO;
		var size  = 1;	// 1 = small, 0 = large
		WSDialog(msg,title,buttons,defBut,errMsg,true,iconType,size);
	} else {
		var anim = "msntv:/Images/WirelessConnectFailedAnim.gif";
		var msg = "Unable to connect to wireless network <em>" + ssid + "</em>. ";
		if ( errorCode == ConnectError_NoDHCPResponse ) {
			msg += "Could not get response from DHCP server.";
		}
		var snd = "Error";
		var timeOut = 5000;
		WSPopUp(msg,anim,snd,timeOut);
	}
	
	if ( WirelessConnectOnFailure != "" ) {
		TVShell.Message("Wireless Failure: " + WirelessConnectOnFailure);
		eval(WirelessConnectOnFailure);
	}

}

function ApplyWirelessSettings()
{
	WirelessSettings.IsDirty = true;
	//ConnectionManagerSave();
	//if ( TVShell.ConnectionManager.WirelessAdapter != TVShell.ConnectionManager.LANAdapter ) {
	//	TVShell.Message("Not applying settings since LAN not set to wireless");
	//} else {
	//	TVShell.ConnectionManager.WirelessAdapter.ApplySettings();
	//}
}

function CheckWirelessConnection(onSuccess, onFailure)
{
	ConnectionManagerSave();

	ApplyLANSettings(onSuccess);
}	

function IsMostlyHex(str)
{
	var i;
	var numHexDigs = 0;
	var numMistypedDigs = 0;
	var numBogus = 0;

	TVShell.Message("IsMostlyHex: " + str);
	
	if ( str.length < 4 ) 
		return false;
	i = 0;
	if ( str.charAt(0) == "0" && str.charAt(1).toLower() == "x" ) {
		i += 2;
	}
	if ( str.charAt(0) == "$" ) {
		i += 1;
	}
	for ( ; i < str.length; i++ ) {
		var c = str.charAt(i);
		if ( parseInt(c,10) >= 0 && parseInt(c,10) < 9 ) {
			numHexDigs += 1;
			continue;
		}
		if ( parseInt(c,16) >= 0xa && parseInt(c,16) <= 0xf ) {
			numHexDigs += 1;
			continue;
		}
		if ( c == "o" || c == "O" ) {
			numMistypedDigs += 1;
			continue;
		}
		if ( c == "l" || c == "I" ) {
			numMistypedDigs += 1;
			continue;
		}
		numBogus += 1;
	}
	if ( numBogus  == 0 )
		return true;
	if ( numHexDigs +  numMistypedDigs > str.length * 0.8 ) {
		return true;
	}
	return false;
}

function ShowWEPKeyError(key)
{
	var msg = "";
	if ( key.length < 4 ) {
		msg = "The key you entered is too short. "; 
	} 
	else if ( key.length == 4 || key.length == 9 || key.length == 12 || key.length == 25 ) {
		msg = "The key you entered may be missing a character. ";
	}
	else if ( key.length == 6 || key.length == 11 || key.length == 14 || key.length > 26 ) {
		msg = "The key you entered may have an extra character. ";
	}
	else if ( ( (key.length == 10 || key.length == 26) && !IsValidHexNumber(key) ) 
	          || ( (key.length > 9 && key.legnth != 13) && IsMostlyHex(key) ) 
	         ) {
		msg = "The key you entered has characters other than 0-9 and A-F. "; 
	}
	else if ( key.length > 14 && !IsValidHexNumber(key) ) {
		msg = "The key you are entering has too many characters. A passphrase cannot be used. ";
	}
	else {
		msg = "The key you entered is not a valid key. ";
	} 
	msg +=  "Please re-enter a proper key to use for this network, or choose Cancel.";
	WSAlert(msg);
}
