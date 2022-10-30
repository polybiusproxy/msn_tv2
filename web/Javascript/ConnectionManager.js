//
// ConnectionManager.js
//

// Connection Manager states
var ConnectState_Disconnected = 0;
var ConnectState_Connecting = 1;
var ConnectState_Connected = 2;
var ConnectState_Disconnecting = 3;

// Service states
var Service_LoggedOff  = "LoggedOff";  // Service is not active
var Service_Authorized = "Authorized"; // Service is active (with or without a user)
var Service_ReSignIn   = "ReSignIn";   // Service wants the box to return to the Sign In page
var Service_GoToTarget = "GoToTarget"  // Service lets client decide where main panel should go.

// Connection Manager errors
var ConnectError_NoError = 0;
var ConnectError_NoAdapter = 1;
var ConnectError_NoCarrier = 2;
var ConnectError_NoDHCPResponse = 3;
var ConnectError_TimeOut = 4;
var ConnectError_ProxyServerInvalid = 5;
var ConnectError_ProxyServerNotFound = 6;
var ConnectError_DNSServerNotFound = 7;
var ConnectError_IPSettingsInvalid = 8;
var ConnectError_Reconnect = 9;
var ConnectError_NoProvider = 10;
var ConnectError_ConnectedTimeOut = 11;
var ConnectError_ProviderNotSet= 12;
var ConnectError_ProviderInvalid= 13;
var ConnectError_ProviderError= 14;
var ConnectError_DialSettingsInvalid= 15;
var ConnectError_DialSettingsStale = 16;
var ConnectError_RASError = 17;
var ConnectError_AuthFailure = 18;
var ConnectError_NoDialTone = 19;
var ConnectError_Busy = 20;
var ConnectError_PowerCycled = 21;
var ConnectError_NoHomeNumber = 22;
var ConnectError_ServiceUnreachable = 23;
var ConnectError_LoginError = 24;
var ConnectError_PhonebookEmpty = 25;
var ConnectError_NewPhoneBook = 26;
var ConnectError_BadHomeNumber = 27;
var ConnectError_ServerInvalid = 28;
var ConnectError_ServerNotFound = 29;
var ConnectError_ServerUnreachable = 30;
var ConnectError_ExtensionOffhook = 31;
var ConnectError_IncomingCall = 32;
var ConnectError_LineInUse = 33;
var ConnectError_LineReversal = 34;
var ConnectError_GatewayUnreachable = 35;
var ConnectError_NoLine = 36;
var ConnectError_NoAnswer = 37;
var ConnectError_AssociationFailed= 38;
var ConnectError_SSIDnotAvailable= 39;
var ConnectError_RequireWirelessSettings= 40;
var ConnectError_WepKeyIncorrect = 41;
var ConnectError_BYOA_10_Digit_Upgrade = 42;
var ConnectError_BYOADialSettingsInvalid = 43;

// Connection Manager adapter types
var AdapterType_NONE = 0;
var AdapterType_Modem = 1;
var AdapterType_Ethernet = 2;

// Connection Manager mode flags (for adapter Disconnect())
var ConnectionMode_WAN = 0;
var ConnectionMode_LAN = 1;

// Connection Manager call waiting modes
var CallWaitingEnabled = 0;
var CallWaitingDisabled = 1;
var CallWaitingNone = 2;
var CallWaitingNone1 = 3;

// MSNIA Manager constants
var SignUpConnectorName = "Signup";
var LocalConnectorName = "LocalPOP";
var BYOANBConnectorName = "BYOANB";

// WAN Provider name strings
var MSNIAModemProviderName = "MSNIANB";
var BYOAModemProviderName = "BYOANB";
var BYOAEthernetProviderName = "BYOAEN";

// LAN Provider name strings
var EthernetLANProviderName = "Ethernet";
var WirelessLANProviderName = "Wireless";
var AutoLANProviderName     = "Auto";

// MSNIA dial flags
var DIALFLAG_POPTIMIZENUMBER = 0x00000001;
var DIALFLAG_FOREVER = 0x00000002;
var DIALFLAG_TENDIGITDIALING = 0x00000004;
var DIALFLAG_LONGDISTANCE = 0x00000008;
var DIALFLAG_OUTSIDELINE = 0x00000010;
var DIALFLAG_CALLWAITING = 0x00000020;
var DIALFLAG_PULSE = 0x00000040;
var DIALFLAG_1800BILLABLE = 0x00000080;
var DIALFLAG_HIDDEN = 0x00000100;
var DIALFLAG_DONTUSENUMBER = 0x00000200;
var DIALFLAG_1800SIGNUP = 0x00000400;
var DIALFLAG_NOTUSERVERIFIED = 0x00000800;
var DIALFLAG_ISLOCAL = 0x00001000;
var DIALFLAG_CLIENTDISABLE = 0x2000;
var DIALFLAG_FORCEFLAGS = 0x4000;
var DIALFLAG_OVERRIDENUMBER = 0x8000;
var DIALFLAG_SPECIALPREFIX = 0x10000;
var DIALFLAG_BYOISP = 0x80000;

// POPVALIDITY
var POP_VALID		= 0;
var POP_UNVERIFIED	= 1;
var POP_NOUSEABLE	= 2;
var POP_NONUMBERS	= 3;

var Override_Auto = 0;
var Override_On = 1;
var Override_Off = 2;

var CONNECTION_SERVICE_ENTRY = "connect_to_service";

// The below variable and uses of it are for TEST ONLY and should be deleted before production
// It is used in AccessNumbers.html and PhoneBook.html.
var TEST_BACKGROUND_REPOPTIMIZATION = "Ignore";

function StripPhoneFormatting(phone)
{
	var unformattedString = "";

	// Removing non-digits char
	for(i = 0; i < phone.length; i++)	{
		var currentChar = phone.charAt(i);
		
		if (currentChar >= "0" && currentChar <= "9") {
			unformattedString += currentChar;			
		}
	}
	
	return unformattedString;	
}

// FormatPhoneByVal() is for msnia phone book entries
function FormatPhoneByVal(phone)
{
	if ( phone.length == 0 )
		return "";

	var i;
	var temp = "";
	var normalizedValue = "(";
	
	// Removing old non-digits char
	for(i = 0; i < phone.length; i++) {
		var currentChar = phone.charAt(i);
		
		if (!isNaN(currentChar) && currentChar != ' ') {
			temp += currentChar;			
		}
	}	
	
	// formatting to '(xxx) xxx-xxxx'
	for(i = 0; i < temp.length; i++) {
		var currentChar = temp.charAt(i);
		
		if (i != 3 && i != 6) {
			normalizedValue += currentChar;			
		} else {
			if (i == 3)
				normalizedValue += ") ";
			else if (i == 6)
				normalizedValue += "-";
				
			normalizedValue += currentChar;
		}
	}
	
	return normalizedValue;
}

// FormatDialedNumber() is for formatting numbers as dialed
function FormatDialedNumber(phone)
{
	var i;
	var temp = "";

	if ( phone.length == 0 )
		return "";

	var Splits = phone.split(",");

	phone = Splits[Splits.length - 1];  // strip off dialing prefixes

	// Removing non-digits char
	for(i = 0; i < phone.length; i++) {
		var currentChar = phone.charAt(i);
		
		if (!isNaN(currentChar) && currentChar != ' ') {
			temp += currentChar;
		}
	}

	phone = temp;

	var normalizedValue = "";

	switch (phone.length) {
		case 8:
			if ("1" != phone.charAt(0)) {
				break;  // don't try to format the number
			}

			normalizedValue = "1-";

			phone = phone.substring(1, phone.length);
			// fall through

		case 7:
			// formatting to 'xxx-xxxx'
			for(i = 0; i < phone.length; i++) {
				var currentChar = phone.charAt(i);
				
				if (i != 3) {
					normalizedValue += currentChar;
				} else {
					normalizedValue += "-";
					normalizedValue += currentChar;
				}
			}

			phone = normalizedValue;
			break;

		case 11:
			if ("1" != phone.charAt(0)) {
				break;  // don't try to format the number
			}

			normalizedValue = "1-";

			phone = phone.substring(1, phone.length);
			// fall through

		case 10:
			// formatting to '(xxx) xxx-xxxx'
			normalizedValue += "(";
			
			for(i = 0; i < phone.length; i++) {
				var currentChar = phone.charAt(i);
				
				if (i != 3 && i != 6) {
					normalizedValue += currentChar;
				} else {
					if (i == 3) {
						normalizedValue += ")-";
					} else if (i == 6) {
						normalizedValue += "-";
					}

					normalizedValue += currentChar;
				}
			}

			phone = normalizedValue;
			break;

		default:
			// don't try to format the number
			break;
	}

	return phone;
}

//
// Constructor for MSNTVService object
//
function MSNTVService(Name, Number, BackupNumber, User, Password, ServerEnv, URL)
{
	this.Name = Name;
	this.Number = Number;
	this.BackupNumber = BackupNumber;
	this.User = User;
	this.Password = Password;
	this.URL = URL;
	this.ServerEnv = ServerEnv;
}

//
// This is called by the service selection menu code when we want to reset the
// service that we point to.
//
function SetMSNTVService(service)
{
	TVShell.Message("ConnectionManager::SetMSNTVService("+service.Name+")");

	SetMSNIANBSignUpConnector(service);
}

// Init object boot mode values
var	BootMode_Cold = 0;
var	BootMode_Reboot = 1;
var	BootMode_Crash = 2;

function InitializeConnectionManager()
{
	var NeedsSave = false;
	
	TVShell.Message("ConnectionManager::InitializeConnectionManager()");
	TVShell.ConnectionManager.Restore();

	//
	// If this is the first time we have been started on a cold boot, then set the
	// power cycle flag on each adapter.  This may be used later to prompt the user
	// to re-verify some of their settings (e.g., "Are you still dialing from...").
	//
	if (TVShell.Init.StartCount == 0 && TVShell.Init.BootMode == BootMode_Cold) {
		if ( TVShell.ConnectionManager.EthernetAdapter != null )
			TVShell.ConnectionManager.EthernetAdapter.Settings.PowerCycled = true;
		if ( TVShell.ConnectionManager.ModemAdapter != null )
			TVShell.ConnectionManager.ModemAdapter.Settings.PowerCycled = true;
		NeedsSave = true;
	}

	if (!TVShell.ConnectionManager.WANProvider || TVShell.ConnectionManager.WANProvider == "")
		TVShell.ConnectionManager.WANProvider = BYOAEthernetProviderName;

	if (!TVShell.ConnectionManager.LANProvider || TVShell.ConnectionManager.LANProvider == "") {
		TVShell.ConnectionManager.LANProvider = AutoLANProviderName;
		NeedsSave = true;
	}

	VerifyLANProviderSetup();

	//
	// Make sure that there are no anonymous or extra connectors
	//
	var MSNIAManager = TVShell.ConnectionManager.MSNIAManager;
	if (MSNIAManager) {
		var Connectors = MSNIAManager.Connectors;
		var FoundLocal = false;
		var i;

		for (i = Connectors.Count-1; i >= 0; i--)
			if (Connectors.Item(i).Name  == "") {
				TVShell.Message("Removing anonymous connector");
				Connectors.Remove(i);
			} else if (Connectors.Item(i).Name == LocalConnectorName) {
				if (!FoundLocal) {
					FoundLocal = true;
					
					//
					// Initialize the current connector at startup to work around a bug in
					// the MSNIA code where it will not set up events correctly if the current
					// connector is set during object creation.
					//

					TVShell.ConnectionManager.MSNIAManager.CurrentConnector = Connectors.Item(i);
				} else {
					TVShell.Message("Removing extra local connector");
					Connectors.Remove(i);
				}
			}
	}

	if(NeedsSave) {
		TVShell.ConnectionManager.Save();
	}
}

//
// Look for a connector with the matching name and delete it
//
function DeleteMSNIAConnector(ConnectorName)
{
	TVShell.Message("ConnectionManager::DeleteMSNIAConnector(" + ConnectorName + ")");

	var Connectors = TVShell.ConnectionManager.MSNIAManager.Connectors;

	for (i = 0; i < Connectors.Count; i++)
		if (Connectors.Item(i).Name == ConnectorName) {
			Connectors.Remove(i);
			return true;
		}

	return false;
}

//
// Create a new SignUp connector with the given parameters.  Reset any local
// number information, even if the signup parameters are the same.
//
function SetMSNIANBSignUpConnector(service)
{
	TVShell.Message("ConnectionManagers::SetMSNIANBSignUpConnector(" + service.Number + ", " + service.User + ", " + service.Password + ", " + service.ServerEnv+")");

	var MSNIAManager = TVShell.ConnectionManager.MSNIAManager;

	if (!MSNIAManager)
		return;

	//
	// Delete local #s and previous signup connector
	//
	DeleteMSNIAConnector(LocalConnectorName);
	DeleteMSNIAConnector(SignUpConnectorName);
	DeleteMSNIAConnector(BYOANBConnectorName);

	//
	// Clear power cycle flag
	//
	var SignUpConnector = null;
	TVShell.ConnectionManager.ModemAdapter.Settings.PowerCycled = false;

	//
	// Create a new signup connector
	//
	var SignUpConnector = MSNIAManager.Connectors.Add("modem");

	SignUpConnector.AreaCode = "";
	SignUpConnector.Exchange = "";
	SignUpConnector.DialingFlags =  DIALFLAG_TENDIGITDIALING |
									DIALFLAG_1800SIGNUP |
									DIALFLAG_LONGDISTANCE;

	if (service.User && service.Password)
		SignUpConnector.StoreUserCredentials(service.User, service.Password);

	SignUpConnector.PhoneNumber = service.Number;
	SignUpConnector.LocationName = SignUpConnectorName;
	SignUpConnector.DeviceName = TVShell.ConnectionManager.ModemAdapter.Name;
	SignUpConnector.Name = SignUpConnectorName;

	var Phonebook = SignUpConnector.Phonebook;

	Phonebook.Clear();

	var PhonebookEntry = Phonebook.Add();

	PhonebookEntry.Flags = SignUpConnector.DialingFlags;
	PhonebookEntry.Location = SignUpConnector.Name;
	PhonebookEntry.Number = SignUpConnector.PhoneNumber;	

	if (service.BackupNumber != "") {
		PhonebookEntry = Phonebook.Add();
	
		PhonebookEntry.Flags = SignUpConnector.DialingFlags;
		PhonebookEntry.Location = SignUpConnector.Name;
		PhonebookEntry.Number = service.BackupNumber;
	}

	//
	// Set this as the current connector
	//
	MSNIAManager.CurrentConnector = SignUpConnector;			

	//
	// Set ServerEnvironment
	//
	TVShell.ConnectionManager.MSNIASettings.ServerEnvironment = service.ServerEnv;

	//
	// Save any changes
	//
	TVShell.ConnectionManager.Save();
}

function MSNIAIsValidPhonebook(Connector)
{
	var Phonebook = Connector.Phonebook;
	var Count = Phonebook.Count;
	var Dialable = 0;

	//
	// Phone book is empty?
	//
	if (Count == 0) {
			TVShell.Message("ConnectionManager.js: MSNIAIsValidPhonebook - no entries");
		return ConnectError_PhonebookEmpty;
	}
	
	//
	// Is the phone book new?
	//
	// If the phone book ID does not match the last known good phone book ID then force
	// the user to reverify the numbers.
	if(Phonebook.LocationID != TVShell.ConnectionManager.MSNIASettings.PhonebookID &&
		TVShell.ConnectionManager.MSNIASettings.PhonebookID != "Ignore") {
		TVShell.Message("ConnectionManager.js: MSNIAIsValidPhonebook - new phone book");		
		return ConnectError_NewPhoneBook;
	}

	//
	// Are all numbers verified?
	//
	var NotVerified = false;
	TVShell.Message("MSNIAIsValidPhonebook(): " + Count + " numbers in the phone book");
	for (i = 0; i < Count; i++) {
		var Entry = Phonebook.Item(i);

		// Note: in this case we may want to highlight the not verified numbers somehow or only display
		//		the not verified numbers.
		if (Entry.NotUserVerified) {
			TVShell.Message("ConnectionManager.js: MSNIAIsValidPhonebook - entry NOT VERIFIED (" + FormatPhoneByVal(Entry.Number) + ")");
			NotVerified = true;
		} else {
			TVShell.Message("ConnectionManager.js: MSNIAIsValidPhonebook - entry verified (" + FormatPhoneByVal(Entry.Number) + ")");
		}

		if (Entry.IsDialable())
			Dialable++;
	}

	if (NotVerified) {
		TVShell.Message("MSNIAIsValidPhonebook(): Returning ConnectError_DialSettingsStale because not all numbers are verified");
		return ConnectError_DialSettingsStale;
	}

	//
	// User has disabled all numbers?
	//
	if (Dialable == 0) {
		TVShell.Message("ConnectionManager.js: MSNIAIsValidPhonebook - no dialable numbers");
		return ConnectError_DialSettingsStale;
	}

	return ConnectError_NoError;
}

//
// SetMSNIANBCurrentConnector - Called when we are going to connect using the MSNIA provider
//
function SetMSNIANBCurrentConnector()
{
	TVShell.Message("ConnectionManager::SetMSNIANBCurrentConnector()");

	var MSNIAManager = TVShell.ConnectionManager.MSNIAManager;

	// Use the modem to connect
	TVShell.ConnectionManager.WANAdapter = TVShell.ConnectionManager.ModemAdapter;

	TVShell.ConnectionManager.HTTPProxy.Enabled = false;
	
	//
	// If the system Mute is on, then force audible dialing off, otherwise leave it
	// however the user set it.  Later, we will force it on if we don't think the box is
	// registered.
	//
	if (TVShell.DeviceControl.PlayMute)
		TVShell.ConnectionManager.WANAdapter.Settings.AudibleDialingOverride = Override_Off;
	else
		TVShell.ConnectionManager.WANAdapter.Settings.AudibleDialingOverride = Override_Auto;
	
	//
	// Set the MSNIA MachineID value for logging
	//
	TVShell.ConnectionManager.MSNIASettings.MachineID = "MSNTV."+TVShell.SystemInfo.BoxIDService;

	var ModemSettings = TVShell.ConnectionManager.ModemAdapter.Settings;

	//
	// Check for the existence of the "connection::login" service as an indication
	// of whether or not we are registered.
	//
	if (TVShell.ServiceList("connection::login")) {

		//
		// Make sure that we still know the user's home phone number before we connect
		//
		if (ModemSettings.DialingAreaCode == "" || ModemSettings.DialingExchange == "") {
			TVShell.ConnectionManager.WANAdapter.ErrorCode = ConnectError_NoHomeNumber;
			return;
		}

		//
		// If the box has been power cycled, then we can't trust our local phone number
		// or address book.  Normally, they should have already been asked to confirm whether
		// or not they have moved before we attempt to connect, but we'll catch it either way.
		//
		if (ModemSettings.PowerCycled) {
			TVShell.ConnectionManager.WANAdapter.ErrorCode = ConnectError_PowerCycled;
			return;
		}

		//
		// Try not to touch the Connectors collection since doing so will reset our
		// phone book index.
		//
		if (MSNIAManager.CurrentConnector &&
			MSNIAManager.CurrentConnector.Name == LocalConnectorName) {
			//
			// If credentials are not present they will not be detected below and the sign up
			// connector will be used instead
			//
			if(MSNIAManager.CurrentConnector.CredsPresent) {
				TVShell.ConnectionManager.WANAdapter.ErrorCode = 
					MSNIAIsValidPhonebook(MSNIAManager.CurrentConnector);
				return;
			}
		}

		//
		// look for a local connector
		//
		var Connectors = MSNIAManager.Connectors;

		for (i = 0; i < Connectors.Count; i++) {
			var Connector = Connectors.Item(i);
			//
			// If the connector has no name, then call it the local connector.  This
			// is a temporary workaround for the login service which doesn't set the name
			// when it re-poptimizes. 9/26/03
			//
			if (Connector.Name == "") {
				TVShell.Message("Using anonymous connector as local");
				Connector.Name = LocalConnectorName;
				Connector.LocationName = LocalConnectorName;
			}

			if (Connector.Name  == LocalConnectorName) {

				if (!Connector.CredsPresent) {
					// connector does not have credentials so delete it and use the signup connector
					TVShell.Message("ConnectionManager::SetMSNIANBCurrentConnector - Local connector lacks credentials");
					DeleteMSNIAConnector(LocalConnectorName);	
					break;
				}

				MSNIAManager.CurrentConnector = Connector;

				TVShell.Message("ConnectionManager::SetMSNIANBCurrentConnector(): Setting CurrentConnector to local connector " + MSNIAManager.CurrentConnector.Name);
				//
				// Always use our stored area code and exchange values
				//
				Connector.AreaCode = ModemSettings.DialingAreaCode;
				Connector.Exchange = ModemSettings.DialingExchange;
				Connector.DeviceName = TVShell.ConnectionManager.ModemAdapter.Name;

				TVShell.ConnectionManager.WANAdapter.ErrorCode =
												MSNIAIsValidPhonebook(MSNIAManager.CurrentConnector);
				TVShell.ConnectionManager.Save();
				return;
			}
		}
	} else {
		//
		// By default turn on audible dialing during registration
		//
		TVShell.ConnectionManager.WANAdapter.Settings.AudibleDialingOverride = Override_On;
	}

	//
	// Whenever we connect with the sign up connector, then there's no further
	// point in keeping track of the power cycled status.
	//
	ModemSettings.PowerCycled = false;

	//
	// Look for a signup connector next
	//
	var Connectors = MSNIAManager.Connectors;
	for (i = 0; i < Connectors.Count; i++)
		if (Connectors.Item(i).Name  == SignUpConnectorName) {
			if (Connectors.Item(i).CredsPresent) {
				MSNIAManager.CurrentConnector = Connectors.Item(i);
				TVShell.Message("ConnectionManager::SetMSNIANBCurrentConnector(): Setting CurrentConnector to Signup" + MSNIAManager.CurrentConnector.Name);
				TVShell.ConnectionManager.Save();
				return;
			} else {
				// Delete the signup connector and recreate it below
				Connectors.Remove(i)
				TVShell.Message("ConnectionManager::SetMSNIANBCurrentConnector - Signup connector lacks credentials");				
				break;
			}
		}
	
	//
	// Create a default signup connector and use it.  SetMSNIANBSignUpConnector() does a ConnectionManager.Save().
	//
	SetMSNIANBSignUpConnector(MSNTVServiceList[0]);

	TVShell.Message("ConnectionManager::SetMSNIANBCurrentConnector(): Setting CurrentConnector to NEW Signup" + MSNIAManager.CurrentConnector.Name);
}

//
// SetBYOANBCurrentConnector - Called when we are going to initiate a BYOA NB call
//
// This code deletes and re-adds the BYOA NB connector at the start of each call.
//
function SetBYOANBCurrentConnector()
{
	TVShell.Message("ConnectionManager::SetBYOANBCurrentConnector()");

	var MSNIAManager = TVShell.ConnectionManager.MSNIAManager;

 	if (TVShell.ConnectionManager.BYOASettings.SettingsVersion <= 0) {
		var strippedNumberPrimary = StripPhoneFormatting(TVShell.ConnectionManager.BYOASettings.PrimaryNumber);
		var strippedNumberSecondary = StripPhoneFormatting(TVShell.ConnectionManager.BYOASettings.SecondaryNumber);
		
		if (10 == strippedNumberPrimary.length || 10 == strippedNumberSecondary.length) {
			TVShell.ConnectionManager.WANAdapter.ErrorCode = ConnectError_BYOA_10_Digit_Upgrade;
			return;
		}
	}

	// Use the modem to connect
	TVShell.ConnectionManager.WANAdapter = TVShell.ConnectionManager.ModemAdapter;

	//
	// If the system Mute is on, then force audible dialing off, otherwise leave it
	// however the user set it.
	//
	if (TVShell.DeviceControl.PlayMute)
		TVShell.ConnectionManager.WANAdapter.Settings.AudibleDialingOverride = Override_Off;
	else
		TVShell.ConnectionManager.WANAdapter.Settings.AudibleDialingOverride = Override_Auto;
	
	TVShell.ConnectionManager.HTTPProxy.Enabled = false;

	// Verify that we have BYOA NB settings
	var BYOASettings = TVShell.ConnectionManager.BYOASettings;

	if (!BYOASettings.PrimaryNumber || BYOASettings.PrimaryNumber == "" ||
		!BYOASettings.UserName      || BYOASettings.UserName == "") {
		TVShell.ConnectionManager.WANAdapter.ErrorCode = ConnectError_BYOADialSettingsInvalid;
		return;
	}

	// If the current connector is the BYOANB connector then use it otherwise
	// create a new BYOANB connector
	var CurrentConnector = MSNIAManager.CurrentConnector;
	var BYOANBConnector;

	// Always create a new BYOANB connector
	BYOANBConnector = MSNIAManager.Connectors.Add("modem");

	// Assign the new unnamed connector to the CurrentConnector first 
	// to deref the existing current connector before (potentially) deleting
	// it in the next steps below.
	MSNIAManager.CurrentConnector = BYOANBConnector;			
	
	// Delete local #s and previous BYOANB connector, if present
	DeleteMSNIAConnector(LocalConnectorName);
	DeleteMSNIAConnector(BYOANBConnectorName);		

	BYOANBConnector.AreaCode = "";
	BYOANBConnector.Exchange = "";
	BYOANBConnector.LocationName = BYOANBConnectorName;
	BYOANBConnector.Name = BYOANBConnectorName;
	BYOANBConnector.DeviceName = TVShell.ConnectionManager.ModemAdapter.Name;
	BYOANBConnector.DialingFlags = DIALFLAG_1800BILLABLE | DIALFLAG_BYOISP | DIALFLAG_TENDIGITDIALING;
	BYOANBConnector.StoreUserCredentials(BYOASettings.UserName, BYOASettings.Password);

	var StrippedPhoneNumber = StripPhoneFormatting(BYOASettings.PrimaryNumber);
	BYOANBConnector.PhoneNumber = StrippedPhoneNumber;
	var BYOANBPhonebook = BYOANBConnector.Phonebook;

	if (!BYOANBPhonebook.Count) {
		TVShell.Message("ConnectionManager::SetBYOANBCurrentConnector(): BYOANB phonebook is empty");

		var BYOANBPhonebookEntry = BYOANBPhonebook.Add();
		
		BYOANBPhonebookEntry.Location = BYOANBConnectorName;
		
		BYOANBPhonebookEntry.Number = StrippedPhoneNumber;
		BYOANBPhonebookEntry.Flags = BYOANBConnector.DialingFlags;
		
		if (BYOASettings.SecondaryNumber != "") {
			BYOANBPhonebookEntry = BYOANBPhonebook.Add();			
			BYOANBPhonebookEntry.Location = BYOANBConnectorName;
			StrippedPhoneNumber = StripPhoneFormatting(BYOASettings.SecondaryNumber);
			BYOANBPhonebookEntry.Flags = BYOANBConnector.DialingFlags;
			BYOANBPhonebookEntry.Number = StrippedPhoneNumber;
		}
	}else {
		TVShell.Message("ConnectionManager::SetBYOANBCurrentConnector(): Using existing BYOANB phonebook");
	}

	// Set this as the current connector
	MSNIAManager.CurrentConnector = BYOANBConnector;			
	TVShell.Message("ConnectionManager::SetBYOANBCurrentConnector(): Setting CurrentConnector to BYOA " + MSNIAManager.CurrentConnector.Name);	
}

//
// SetBYOAENCurrentConnector - Called when we are going to initiate a broadband connection
//
function SetBYOAENCurrentConnector()
{
	TVShell.Message("ConnectionManager::SetBYOAENCurrentConnector()");
	// If there is a LAN Adapter already, use it.  Otherwise fallback to Ethernet
	if (TVShell.ConnectionManager.LANAdapter)
	{
		TVShell.ConnectionManager.WANAdapter = TVShell.ConnectionManager.LANAdapter;
	}
	else if (TVShell.ConnectionManager.EthernetAdapter)
	{
		TVShell.ConnectionManager.WANAdapter = TVShell.ConnectionManager.EthernetAdapter;
	}

	VerifyLANProviderSetup();

	if (TVShell.ConnectionManager.MSNIAManager) {
		//
		// Delete local #s and BYOANB connector, if present.  This is not really necessary,
		// but it may keep us from using stale information if we were to switch WANProvider
		// back to BYOANB or MSNIA.
		//
		DeleteMSNIAConnector(LocalConnectorName);
		DeleteMSNIAConnector(BYOANBConnectorName);
	}
}

//
// This is called when the WANConnect event fires.  Its purpose is to ensure
// that the WAN Provider (e.g. MSNIA) is configured correctly.
//
function VerifyProviderSetup()
{
	// Set correct connector
	switch (TVShell.ConnectionManager.WANProvider) {
		case BYOAModemProviderName:
			SetBYOANBCurrentConnector();
			break;

		case BYOAEthernetProviderName:
			SetBYOAENCurrentConnector();
			break;

		default:
			// This shouldn't happen but if it does default to MSNIA.  It would be even better to fail with 
			// a new error code that causes a "how do you want to connect" page to be displayed.
			TVShell.Message("ERROR: Invalid WANProvider: " + TVShell.ConnectionManager.WANProvider + " defaulting to " + MSNIAModemProviderName);
			TVShell.ConnectionManager.WANProvider = MSNIAModemProviderName;
			// fall through

		case MSNIAModemProviderName:
			SetMSNIANBCurrentConnector();
			break;
	}
}

function VerifyLANProviderSetup()
{
	var UseWireless = false;

	switch (TVShell.ConnectionManager.LANProvider) {
		case EthernetLANProviderName:
			break;

		case WirelessLANProviderName:
			UseWireless = true;
			break;

		default:
		case AutoLANProviderName:
			if (TVShell.ConnectionManager.WirelessAdapter) {
				var ErrorCode = TVShell.ConnectionManager.WirelessAdapter.CheckStatus();
				if (ErrorCode != ConnectError_NoAdapter)
					UseWireless = true;
			}
			break;
	}

	if (UseWireless ) {
		if (TVShell.ConnectionManager.LANAdapter != TVShell.ConnectionManager.WirelessAdapter) {
			TVShell.ConnectionManager.LANAdapter = TVShell.ConnectionManager.WirelessAdapter;

			if (TVShell.ConnectionManager.WirelessAdapter)
				TVShell.ConnectionManager.WirelessAdapter.Enabled = true;
			if (TVShell.ConnectionManager.EthernetAdapter)
				TVShell.ConnectionManager.EthernetAdapter.Enabled = false;

			TVShell.Message("LAN Adapter switched to Wireless");

			// try using current settings, if not connected,
			// for supporting dynamic adapter insertion.
			if (ErrorCode != ConnectError_NoError) { 
				TVShell.ConnectionManager.WirelessAdapter.Settings.IsDirty = true;
			}
		}
	} else {
		if (TVShell.ConnectionManager.LANAdapter != TVShell.ConnectionManager.EthernetAdapter) {
			TVShell.ConnectionManager.LANAdapter = TVShell.ConnectionManager.EthernetAdapter;

			if (TVShell.ConnectionManager.WirelessAdapter)
				TVShell.ConnectionManager.WirelessAdapter.Enabled = false;
			if (TVShell.ConnectionManager.EthernetAdapter)
				TVShell.ConnectionManager.EthernetAdapter.Enabled = true;

			TVShell.ConnectionManager.EthernetAdapter.Settings.IsDirty = true;

			TVShell.Message("LAN Adapter switched to Ethernet");
		}
	}

	if ( TVShell.ConnectionManager.EthernetAdapter ) {
		if (TVShell.ConnectionManager.LANAdapter != TVShell.ConnectionManager.WANAdapter) {
			TVShell.ConnectionManager.EthernetAdapter.Settings.AutoIPEnabled = true;
			TVShell.ConnectionManager.EthernetAdapter.Settings.IsDirty = true;
		} else {
			TVShell.ConnectionManager.EthernetAdapter.Settings.AutoIPEnabled = false;
			TVShell.ConnectionManager.EthernetAdapter.Settings.IsDirty = true;
		}
	}
}

//
// Pop-up - Have you moved?
//

function HaveYouMovedPopup()
{
	var settings = TVShell.ConnectionManager.ModemAdapter.Settings;
	var areaCode = settings.DialingAreaCode ? settings.DialingAreaCode : "999";
	var exchange = settings.DialingExchange ? settings.DialingExchange : "999";
	var phone = areaCode + "-" + exchange + "-XXXX";

	var str = "<P>If your " + ProductShortName + " is still connected to the phone line " + phone +
		", choose <EM>Use Same Numbers</EM>.</P>" +
		"<P>If connected to a phone line other than " + phone + 
		", choose <EM>Get New Numbers</EM> to select new access numbers.</P>";
	
	var result = TVShell.PanelManager.CustomMessageBox( 
				str , "" , "Use Same Numbers;Get New Numbers", 0, "Error!",
				false, MGX_ICON_WARNING, MGX_SIZE_LARGE );
	
	if ( result == 1 )
	{
		var ModemSettings = TVShell.ConnectionManager.ModemAdapter.Settings;
		//
		// Drop saved phone numbers if they say they've moved.
		//
		ModemSettings.DialingAreaCode == "";
		ModemSettings.DialingExchange == "";
		//
		// Now ask for their new number.  This should clear the PowerCycled flag
		// as a side-effect.
		//
		TVShell.URL = "msntv:/Settings/GetHomeNumber.html";
	}
	else
	if (result == 0) {
		TVShell.ConnectionManager.ModemAdapter.Settings.PowerCycled = false;
		TVShell.ConnectionManager.Save();
		if (TVShell.ConnectionManager.WANAdapter.ErrorCode == ConnectError_PowerCycled)
		{
			GotoSignOn();
			LoginToService();
		}
	}
}

//
// MSNIA provider has additional special error handling
//
function MSNIAError(ErrorCode)
{
	switch (ErrorCode) {
		case ConnectError_Reconnect:
			// 
			// If we have a PhonebookID that doesn't match and the service has asked us to reconnect
			// then go to the NewPhoneBook page.
			if (TVShell.ConnectionManager.MSNIASettings.PhonebookID && 
				TVShell.ConnectionManager.MSNIASettings.PhonebookID != "" &&
				TVShell.ConnectionManager.MSNIASettings.PhonebookID != 
				TVShell.ConnectionManager.MSNIAManager.CurrentConnector.Phonebook.LocationID )  {
				var Connector = null;
				
				if (TVShell.ConnectionManager.MSNIAManager.CurrentConnector.Name == SignUpConnectorName) {
					// Look for localPOP connector.  This code should always be executed for case ConnectError_Reconnect.
					Connector = GetConnectorByName(LocalConnectorName); 
				} else if (TVShell.ConnectionManager.MSNIAManager.CurrentConnector.Name == LocalConnectorName) {
					Connector = TVShell.ConnectionManager.MSNIAManager.CurrentConnector;
				}
					
				if (Connector != null && Connector.CredsPresent) {
					TVShell.URL = "msntv:/Settings/NewPhoneBook.html";
				} else {
					return false;
				}
			}
			return true;

		case ConnectError_NewPhoneBook:
			if (TVShell.ConnectionManager.MSNIAManager.CurrentConnector.Name != SignUpConnectorName &&
				TVShell.ConnectionManager.MSNIAManager.CurrentConnector.CredsPresent) {
				TVShell.URL = "msntv:/Settings/NewPhoneBook.html";
			}
			return true;
			   
		case ConnectError_PowerCycled:
			//
			// Normally, this will be handled before we get this far 
			//
			HaveYouMovedPopup();
			return true;

		case ConnectError_NoHomeNumber:
			//
			// We need to know the user's home phone number before we connect
			// as MSNIANB, unless they're registering.
			//
			TVShell.URL = "msntv:/Settings/GetHomeNumber.html";
			return true;

		case ConnectError_BadHomeNumber:
			//
			// MSNIA has no number for this area code and exchange
			//
			TVShell.URL = "msntv:/Settings/GetHomeNumber.html";
			return true;

		case ConnectError_AuthFailure:
			//
			// If we get an authorization failure, then something is wrong
			// with our credentials.
			//
			TVShell.Message("ConnectionManager.js - MSNIA authorization failure");
			if (DeleteMSNIAConnector(LocalConnectorName)) {
				TVShell.ConnectionManager.WANAdapter.ErrorCode = ConnectError_NoError;
				setTimeout("TVShell.ConnectionManager.WANConnect(TVShell.ConnectionManager.WANCause);", 600);
			}
			return false;

		case ConnectError_PhonebookEmpty:
			if (DeleteMSNIAConnector(LocalConnectorName)) {
				TVShell.ConnectionManager.WANAdapter.ErrorCode = ConnectError_NoError;
				setTimeout("TVShell.ConnectionManager.WANConnect(TVShell.ConnectionManager.WANCause);", 600);
			}
			return true;

		case ConnectError_DialSettingsStale:
			TVShell.URL = "msntv:/Settings/AccessNumbers.html?AutoNavigated=true";
			return true;
	}

	return false;
}

//
// BYOA NB Error handling
//
function BYOANBError(ErrorCode)
{
	if (ConnectError_BYOA_10_Digit_Upgrade == ErrorCode) {
		TVShell.URL="msntv:/Settings/BYOA_10_Digit_Upgrade.html";
		return true;
	}
	
	return false;
}

//
// BYOA Ethernet error handling
//
function BYOAENError(ErrorCode)
{
	return false;
}

//
// If we get an error, then check with the current WAN provider to
// see if it requires special handling.
//
function ProviderError(ErrorCode)
{
	var handled = false;

	switch (TVShell.ConnectionManager.WANProvider) {

		case MSNIAModemProviderName:
			handled = MSNIAError(ErrorCode);
			break;

		case BYOAModemProviderName:
			handled = BYOANBError(ErrorCode);
			break;

		case BYOAEthernetProviderName:
			handled = BYOAENError(ErrorCode);
			break;
	}

	return handled;
}

//
// When we connect to the service, it may set the "ServiceState" to indicate
// that the client has been successfully logged into the service.
//
function ProviderServiceState(NewState)
{
	// TVShell.Message("ProviderServiceState: "+NewState);
	//
	// If Authorized (XXX or ReSignIn) and if connected by dial-up to a 
	// non-registration number, write the successful phone number 
	// and credentials to the BootRom object.
	//
	if (NewState == Service_Authorized) {

		var UserName = "";
		var Password = "";
		var CalledNumber = "";

		switch (TVShell.ConnectionManager.WANProvider) {

			case MSNIAModemProviderName:
			case BYOAModemProviderName:
				var CurrentConnector = TVShell.ConnectionManager.MSNIAManager.CurrentConnector;
				var DialingFlags = CurrentConnector.DialingFlags;

				// TVShell.Message("DialingFlags: "+DialingFlags);

				if (TVShell.ConnectionManager.WANProvider == BYOAModemProviderName || 
					(DialingFlags & DIALFLAG_ISLOCAL) && !(DialingFlags & (DIALFLAG_1800SIGNUP|DIALFLAG_POPTIMIZENUMBER))) {

					var ModemSettings = TVShell.ConnectionManager.ModemAdapter.Settings;
					CalledNumber = CurrentConnector.FormattedPhoneNumber;

					// Strip off dial prefix, plus ","
					if (ModemSettings.DialPrefix.length > 0)
						CalledNumber = CalledNumber.substr(ModemSettings.DialPrefix.length+1);

					// Strip off call waiting prefix, if enabled
					if (ModemSettings.CallWaitingMode == CallWaitingDisabled)
						CalledNumber = CalledNumber.substr(ModemSettings.CallWaitingPrefix.length);
					
					// Get PPP username / password
					if (TVShell.ConnectionManager.WANProvider == BYOAModemProviderName) {
						var BYOASettings = TVShell.ConnectionManager.BYOASettings;

						UserName = BYOASettings.UserName;
						Password = BYOASettings.Password;

					} else
					if (TVShell.ConnectionManager.WANProvider == MSNIAModemProviderName) {
						var MSNIASettings = TVShell.ConnectionManager.MSNIASettings;

						UserName = MSNIASettings.UserName(CurrentConnector);
						Password = MSNIASettings.Password(CurrentConnector);
					}

					TVShell.Message("Saving local calling information for bootrom");
				}
				break;

			case BYOAEthernetProviderName:
				break;
		}

		var BootROM = new ActiveXObject("MSNTV.BootRom");

		if (BootROM) {
			BootROM.Read();
			BootROM.AccessNumber = CalledNumber;
			BootROM.Username = UserName;
			BootROM.Password = Password;
			BootROM.Flush();
		}
	}
}

//
// Find a connector with the given name.
//
function GetConnectorByName(name)
{
	TVShell.Message("ConnectionManager::GetConnectorByName(" + name + ")");

	var Connectors = TVShell.ConnectionManager.MSNIAManager.Connectors;

	for (var i = Connectors.Count-1; i >= 0; --i)
	{
		if (Connectors.Item(i).Name == name) {
			
			TVShell.Message("ConnectionManager::GetConnectorByName(): Found connector " + Connectors.Item(i).Name);
				
			return Connectors.Item(i);
		}
	}

	TVShell.Message("ConnectionManager::GetConnectorByName(): Failed to find connector " + name);
	
	return null;
}

function LoginToService(serviceEntryName)
{
	TVShell.Message("ConnectionManager::LoginToService( " + serviceEntryName + ")")
	if ( TVShell.ConnectionManager.WANCause == "FullUpdate" ) {
		TVShell.Message("Ignoring LoginToService because in full update"); 
		return;
	}


	// If there's no serviceEntryName, don't destroy the last one; treat this as a possible "try again" condition
	if (serviceEntryName && serviceEntryName != "")
	{
		var se = TVShell.ActiveServiceList.Item(serviceEntryName);
		if (se && se.URL != "")
		{
			var entry = TVShell.BuiltinServiceList.Add(CONNECTION_SERVICE_ENTRY);
			entry.URL = se.URL;
			entry.Description = se.Description;
		}
	}

	if (!serviceEntryName || serviceEntryName == "")
		serviceEntryName = TVShell.ConnectionManager.WANCause;

	TVShell.ConnectionManager.WANConnect(serviceEntryName);
}

function ApplyLANSettings(onSuccess)
{

	var ConnectionManager = TVShell.ConnectionManager;

	var cause = "LAN::ApplySettings";
	
	if (onSuccess && onSuccess != "") {
		var entry = TVShell.BuiltinServiceList.Add(cause);
		entry.URL = onSuccess;
	}

	if (ConnectionManager.LANState == ConnectState_Disconnected)
		ConnectionManager.LANConnect(cause);
	else {
		ConnectionManager.LANCause = cause;
		ConnectionManager.LANAdapter.Disconnect(ConnectError_Reconnect, ConnectionMode_LAN);
	}
}

//
// This is intended to be the high-ish level interface for changing the basic connection type.
// The argument is one of the "Provider name strings" above.
//
function SetConnectionType(providerName)
{
	TVShell.Message("ConnectionManager::SetConnectionType(" + providerName + ")");

	if(providerName != TVShell.ConnectionManager.WANProvider) {
		ClearHTTPProxySettings();
		TVShell.ConnectionManager.WANProvider = providerName;

		if (TVShell.ConnectionManager.WANState != ConnectState_Disconnected) {
			TVShell.ConnectionManager.WANDisconnect();
		}
	}

	VerifyProviderSetup();
}

function DisplayConnectorInfo()
{
/*
	var Connectors = TVShell.ConnectionManager.MSNIAManager.Connectors;
	var connector = TVShell.ConnectionManager.MSNIAManager.CurrentConnector;

	TVShell.Message("There are " + Connectors.Count + " connectors");
	TVShell.Message("CurrentConnector");
	TVShell.Message("Location Name: " + connector.LocationName);
	TVShell.Message("Name: " + connector.Name);
	TVShell.Message("Device Name: " + connector.DeviceName);
	TVShell.Message("PhoneNumber: " + connector.PhoneNumber);

	for (var i = Connectors.Count-1; i >= 0; --i) {
		connector = Connectors.Item(i);
		TVShell.Message("");
		TVShell.Message("Connector #" + i);
		TVShell.Message("Location Name: " + connector.LocationName);
		TVShell.Message("Name: " + connector.Name);
		TVShell.Message("Device Name: " + connector.DeviceName);
		TVShell.Message("PhoneNumber: " + connector.PhoneNumber);
		TVShell.Message("");
	}
*/
}

// CheckFor911() returns true if the input string filtered for digits and * could result in
// dialing 911.
function CheckFor911(prefix)
{
	var digits = "0123456789*";
	var filteredPrefix = "";

	for (var i=0; i<=prefix.length; i++) {
		if (digits.indexOf(prefix.charAt(i)) != -1) {			//	Is this character a digit?
			filteredPrefix = filteredPrefix + prefix.charAt(i);		//	Yes! Copy it to the stripped string
		}
	}
			
	if ((filteredPrefix.length == 2 && filteredPrefix.substr(0,2) == "91") ||
		(filteredPrefix.length == 3 && 
			((filteredPrefix.substr(0,3) == "911") ||
			(filteredPrefix.substr(0,3) == "991") ||
			(filteredPrefix.substr(0,3) == "891"))) ||
		(filteredPrefix.length > 3 && 
			((filteredPrefix.substr(0,3) == "911") ||
			(filteredPrefix.substr(0,4) == "8911") ||
			(filteredPrefix.substr(0,4) == "9911")))) {			
		return true;
	}

	return false;
}

function AllLongDistance(Phonebook)
{	
	if (!Phonebook.Count) {
		return false;
	}

	for (var i = 0; i < Phonebook.Count; i++) {
		var pbEntry = Phonebook.Item(i);

		if (pbEntry.IsLocal == true) {
			return false;
		}
	}

	return true;
}

function SomeLongDistance(Phonebook)
{	
	if (!Phonebook.Count) {
		return false;
	}
	
	for (var i = 0; i < Phonebook.Count; i++) {
		var pbEntry = Phonebook.Item(i);

		if (pbEntry.IsLocal == false) {
			return true;
		}
	}

	return false;
}

function ShouldTryMorePhoneBookEntries(Phonebook)
{
	// how many numbers have been selected and how many local numbers are unselected
	var selectedNumbers = 0;
	var unselectedLocalNumbers = 0;
	for (var i = 0; i < Phonebook.Count; i++) {
		if (!Phonebook.Item(i).DontUseNumber) {
			selectedNumbers++;
		}

		if (Phonebook.Item(i).DontUseNumber && Phonebook.Item(i).IsLocal) {
			unselectedLocalNumbers++;
		}
	}

	if (selectedNumbers < 3 && unselectedLocalNumbers > 0) {
		return true;
	}

	return false;
}

function NumberOfLocalPhoneBookEntries(Phonebook)
{
	var localNumbers = 0;
	for (var i = 0; i < Phonebook.Count; i++) {
		if (Phonebook.Item(i).IsLocal) {
			localNumbers++;
		}
	}

	return localNumbers;
}

function GetDialedPhoneNumber()
{
	if (!TVShell.ConnectionManager.MSNIAManager.CurrentConnector)
		return "";
	
	var modem = TVShell.ConnectionManager.MSNIAManager.CurrentConnector;
	var FormattedPhoneNumber = modem.FormattedPhoneNumber;

	if (FormattedPhoneNumber.Length <= 0) 
		return "";

	if (modem.DialingFlags & DIALFLAG_1800SIGNUP)
		return "the " + ServiceShortName + " toll-free number";

	return FormattedPhoneNumber;
}

function ClearBootromAccessNumber()
{
	var BootROM = new ActiveXObject("MSNTV.BootRom");

	TVShell.Message("ConnectionManager::ClearBootromAccessNumber()");	
	
	if (BootROM) {
		BootROM.Read();
		BootROM.AccessNumber = "";
		BootROM.Username = "";
		BootROM.Password = "";
		BootROM.Flush();
	}
}

function ClearHTTPProxySettings()
{
	var proxy = TVShell.ConnectionManager.HTTPProxy;
	proxy.Enabled = false;
	proxy.Server = "";
	proxy.Port = 0;
	proxy.ApplySettings();				
}

function ClearLocalPopPhoneBook()
{
	for(var i = 0; i < TVShell.ConnectionManager.MSNIAManager.Connectors.Count; i++) {
		var connector = TVShell.ConnectionManager.MSNIAManager.Connectors.Item(i);
		if(connector.Name == LocalConnectorName) {
			connector.Phonebook.Clear();
		}
	}

	TVShell.ConnectionManager.Save();
}

function ConnectionManagerSave()
{
	TVShell.ConnectionManager.Save();
	
	var rom = new ActiveXObject("MSNTV.BootRom");

	if (!rom)
		return;
	
	if (TVShell.ConnectionManager.ModemAdapter) {
		rom.Read();

		var ModemSettings = TVShell.ConnectionManager.ModemAdapter.Settings;

		rom.DialPrefix = ModemSettings.DialPrefix;
		rom.PulseDial = ModemSettings.Pulse;
		rom.CallWaitingPrefix = ModemSettings.CallWaitingPrefix;
		rom.WaitForDialTone = ModemSettings.WaitForDialTone;
		rom.AudibleDialing = ModemSettings.AudibleDialing;
		rom.DisableOffHookDetect = ModemSettings.OffHookDetect;
	}

	if (TVShell.ConnectionManager.EthernetAdapter) {
		var EthernetSettings =
			TVShell.ConnectionManager.EthernetAdapter.Settings;
		rom.DHCPEnabled = EthernetSettings.DHCPEnabled;
		rom.IPAddress = EthernetSettings.IPAddress;
		rom.Netmask = EthernetSettings.NetMask;
		rom.Gateway = EthernetSettings.Gateway;
		rom.PrimaryDNS = EthernetSettings.PrimaryDNS;
		rom.SecondaryDNS = EthernetSettings.SecondaryDNS;
	}

	if ( TVShell.ConnectionManager.HTTPProxy.Enabled ) {
		var port = TVShell.ConnectionManager.HTTPProxy.Port;
		var server = TVShell.ConnectionManager.HTTPProxy.Server;
		if ( port != 0 && server.indexOf(":") < 0 ) {
			server = server + ":" + port;
		}
		rom.Proxy = server;
	} else {
		rom.Proxy = 0;
	}

	var BYOASettings = TVShell.ConnectionManager.BYOASettings;
	if (TVShell.ConnectionManager.WANProvider != BYOAEthernetProviderName) {
		rom.UseLAN = false;
	}
	else {
		rom.UseLAN = true;
	}

	rom.Flush();
}

function GoBackOnceConnected()
{
	TVShell.Message( "GoBackOnceConnected()");

	if (TVShell.ConnectionManager.WANState == ConnectState_Connected) {
		history.go(-1);
	} else {
		setTimeout( 'GoBackOnceConnected();' , 1000);
	}
}

function ServiceConnected()
{
	if (TVShell.ConnectionManager.ServiceState == Service_GoToTarget)
		return true;
	
	return false
}
