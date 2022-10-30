//
// Connection error text
//
var LANErrorMode = 0;
var WANErrorMode = 1;

var UsingBroadband;
var UsingWireless;
var UsingProxy;
var ErrorCode;
var ErrorMode;

var ErrorModeSet = false;

function SetErrorMode(Mode)
{
	var ErrorAdapter;

	ErrorMode = Mode;

	UsingProxy = TVShell.ConnectionManager.HTTPProxy.Enabled;

	if (ErrorMode == LANErrorMode)
		ErrorAdapter = TVShell.ConnectionManager.LANAdapter;
	else
		ErrorAdapter = TVShell.ConnectionManager.WANAdapter;

	ErrorCode = ErrorAdapter.ErrorCode;

	if (ErrorAdapter != TVShell.ConnectionManager.ModemAdapter)
		UsingBroadband = true;
	else
		UsingBroadband = false;

	if (ErrorAdapter == TVShell.ConnectionManager.WirelessAdapter)
		UsingWireless = true;
	else
		UsingWireless = false;

	if (ErrorMode == LANErrorMode) {
		NetworkFullName = "home network";
		NetworkShortName = "your home network";
	} else {
		NetworkFullName = TVShell.SystemInfo.ServiceFullName;
		NetworkShortName = TVShell.SystemInfo.ServiceShortName;
	}

	ErrorModeSet = true;
}

function SetErrorCode(EC)
{
	ErrorCode = EC * 1;
}

function FriendlyErrorTitle()
{	
	var output = "";

	if (!ErrorModeSet)
		SetErrorMode(WANErrorMode);

	if (!UsingBroadband)
	{
		switch (ErrorCode)
		{
			case ConnectError_NoLine:
				output = "No phone line detected";
				break;
			case ConnectError_NoCarrier:
				output = "No Modem answer";
				break;
			case ConnectError_NoAnswer:
				output = "No answer";
				break;
			case ConnectError_NoDialTone:
				output = "No dial tone detected";
				break;
			case ConnectError_LineInUse:
				output = "Line in use";
				break;
			case ConnectError_IncomingCall:
				output = "Incoming phone call";
				break;
			case ConnectError_Busy:
				output = "Line busy";
				break;
			case ConnectError_ExtensionOffhook:
				output = "Phone off hook";
				break;
			case ConnectError_AuthFailure:
				if (TVShell.ConnectionManager.WANProvider == BYOAModemProviderName) {
					output = "Incorrect ISP user name or password";
					break;
				} else {	// if received for MSNIA, change it into a RAS error and continue
					ErrorCode = ConnectError_RASError;
				}
				break;
			default:
				output = "Unable to connect to "+NetworkShortName+"";
				break;
		}
	}
	else
	{
		switch (ErrorCode)
		{
			case ConnectError_NoLine:
				if (UsingWireless)
					output = "No wireless network detected";
				else
					output = "No broadband cable detected";
				break;
			case ConnectError_NoDHCPResponse:
				output = "Unable to determine IP address";
				break;
			case ConnectError_GatewayUnreachable:
				output = "Network router not responding";
				break;
			case ConnectError_AssociationFailed:
				output = "Wireless connection failed";
				break;
			case ConnectError_SSIDnotAvailable:
				output = "Wireless network not found";
				break;
			case ConnectError_RequireWirelessSettings:
				output = "Set up wireless";
				break;
			case ConnectError_WepKeyIncorrect:
				output = "Wireless connection denied";
				break;
			default:
				output = "Unable to connect to "+NetworkShortName+"";
				break;
		}
	}
	return (output);
}


function FriendlyErrorBody(fromRegistration)
{	
	var output = "";

	if (!ErrorModeSet)
		SetErrorMode(WANErrorMode);

	var SingleStepText = "To help your "+ProductShortName+" connect to the "+NetworkFullName+", follow this step:</P><UL>";
	
	var MultipleStepText = "To help your "+ProductShortName+" connect to the "+NetworkFullName+", follow these steps:</P><UL>";
	
	var SuggestMoreNumbersText = "<LI><SPAN class=li>You may want to select additional phone numbers \
								on the <EM>"+ NetworkShortName + " access numbers</EM> page under <EM>Settings</EM>.</SPAN>";
								
	var SuggestPrefixText = "<LI><SPAN class=li>You may need to dial a number, such as 9, to make calls on your phone line. \
							This number is called a dialing prefix. To specify a dialing prefix, choose <EM>Settings</EM>. </SPAN>";

	var SuggestCheckBYOANumberText = "<LI><SPAN class=li>Check to make sure that you entered the correct telephone number \
									for your Internet Service Provider. Choose <EM>Settings</EM> and enter the number exactly \
									as you would dial it on your telephone. </SPAN>";

	var SuggestUsingAdditionalBYOANumbersText = "<LI><SPAN class=li>Your Internet Service Provider may have given you \
											additional numbers to use. You can choose <EM>Settings</EM> to try one of \
											these other numbers. </SPAN>";


	var SuggestLiveLineTestText = "<LI><SPAN class=li>Connect a telephone to the phone line you're using to be sure the line is active. You should hear a dial tone when you pick up the phone. </SPAN>";

	var SuggestTryAgainLaterText = "<LI><SPAN class=li>You may want to try connecting later.</SPAN>";


	if (!UsingBroadband) {
		switch (ErrorCode) {
			case ConnectError_NoCarrier:  
				if (TVShell.ConnectionManager.WANProvider == BYOAModemProviderName) {		
					output = "<P>Your "+ProductShortName+" could not connect to the "+NetworkFullName+ 
						" because a modem did not answer the call.  " + 
						MultipleStepText + 
						SuggestCheckBYOANumberText + 
						SuggestUsingAdditionalBYOANumbersText +
						"</UL>";
				} else {
					var Phonebook = TVShell.ConnectionManager.MSNIAManager.CurrentConnector.Phonebook;
					var SuggestMoreNumbers = ShouldTryMorePhoneBookEntries(Phonebook);
					output = "<P>Your "+ProductShortName+" could not connect to the "+NetworkFullName+" because a modem did not answer the call.  ";

					if (fromRegistration || SuggestMoreNumbers) {
						output += SingleStepText;
					} else {
						output += "</P>";
					}
					
					if (SuggestMoreNumbers) {
						output += SuggestMoreNumbersText;
					}

					if (fromRegistration) {
						output += SuggestPrefixText;
					}

					if (fromRegistration || SuggestMoreNumbers) {
						output += "</UL>";
					}
				}
				break;
			case ConnectError_NoAnswer:
				if (TVShell.ConnectionManager.WANProvider == BYOAModemProviderName) {		
					output = "<P>Your "+ProductShortName+" could not connect to the "+NetworkFullName+" because the call was not answered.  " +
						MultipleStepText +
						SuggestCheckBYOANumberText + 
						SuggestUsingAdditionalBYOANumbersText +
						"</UL>";
				} else {
					var Phonebook = TVShell.ConnectionManager.MSNIAManager.CurrentConnector.Phonebook;
					var SuggestMoreNumbers = ShouldTryMorePhoneBookEntries(Phonebook);
					output = "<P>Your "+ProductShortName+" could not connect to the "+NetworkFullName+" because the call was not answered.  ";

					if (fromRegistration || SuggestMoreNumbers) {
						output += SingleStepText;
					} else {
						output += "</P>";
					}
					
					if (SuggestMoreNumbers) {
						output += SuggestMoreNumbersText;
					}

					if (fromRegistration) {
						output += SuggestPrefixText;
					}

					if (fromRegistration || SuggestMoreNumbers) {
						output += "</UL>";
					}
				}
				break;
			case ConnectError_NoLine:
			case ConnectError_LineReversal:
				output = "<P>Your "+ProductShortName+" could not connect to the "+NetworkFullName+" because it did not detect a phone line.  " + 
					MultipleStepText + 
					"<UL>" +
						SuggestLiveLineTestText + 
						"<LI><SPAN class=li>Make sure you connect the phone line to the phone jack on the back of your "+ProductShortName+", and make sure the line is connected securely. </SPAN>\
					</UL>";
				break;
			case ConnectError_LineInUse:
				output = "<P>Your "+ProductShortName+" was unable to connect to "+NetworkShortName+" because another phone on the same line is in use.</P>\
						<P>Make sure none of the phones on this line are currently in use or off the hook, and then choose <EM>Try Again</EM>.</P>";
				break;
			case ConnectError_NoDialTone:
				output = "<P>Your "+ProductShortName+" could not connect to the "+NetworkFullName+" because it did not detect a dial tone on your phone line.  " +
					MultipleStepText +
					"<UL>" +
						SuggestLiveLineTestText + 
						"<LI><SPAN class=li>If you have voice mail service on your phone line, select <EM>Don't wait for dial tone</EM> under <EM>Other dialing options</EM> in <EM>Settings</EM>. </SPAN>\
						</UL>";
				break;
			case ConnectError_Busy:
				output = "<P>Your "+ProductShortName+" could not connect to the "+NetworkFullName+" because the called number was busy.  ";

				if (TVShell.ConnectionManager.WANProvider == MSNIAModemProviderName) {
					var Phonebook = TVShell.ConnectionManager.MSNIAManager.CurrentConnector.Phonebook;
					var SuggestMoreNumbers = ShouldTryMorePhoneBookEntries(Phonebook);
					
					if (fromRegistration || SuggestMoreNumbers) {
						output += MultipleStepText;
					} else {
						output += SingleStepText;
					}

					if (SuggestMoreNumbers) {
						output += SuggestMoreNumbersText;
					}

					if (fromRegistration) {
						output += SuggestPrefixText;
					}

					output += SuggestTryAgainLaterText + "</UL>";
				} else if (TVShell.ConnectionManager.WANProvider == BYOAModemProviderName) {
					output += MultipleStepText +
							SuggestUsingAdditionalBYOANumbersText +
							SuggestTryAgainLaterText +
							"</UL>";
				}
				break;
			case ConnectError_IncomingCall:
				output = "<P>Your "+ProductShortName+" was disconnected from the "+NetworkFullName+" because of an incoming phone call.</P>" +
					"<P>If you feel that you have received this notification in error, choose <EM>Sensitivity</EM> and decrease the Call Waiting sensitivity.</P>";
				break;
			case ConnectError_ExtensionOffhook:
				output = "<P>A telephone in your home was picked up on the phone line.</P>" +
					"<P>If you feel that you have received this notification in error, choose <EM>Off-Hook Detection</EM> and turn the feature off.</P>";
				break;
			case ConnectError_AuthFailure:
				if (TVShell.ConnectionManager.WANProvider == BYOAModemProviderName)
				{
					output = "<P>Your "+ProductShortName+" was unable to connect to the "+NetworkFullName+" because your Internet service provider (ISP) did not recognize your ISP user name or password.</P> \
							<P>To check or change your ISP user name or password, choose <EM>Settings</EM>. If you don't remember your ISP user name or password, or if you have other ISP-related questions, contact your ISP directly.</P>";
					break;
				}
				else // if received for MSNIA, change it into a RAS error and continue
					ErrorCode = ConnectError_RASError;
				break;
			case ConnectError_BYOADialSettingsInvalid:
				output = "<P>The details of how you connect to " + NetworkShortName + " have been lost. Please choose <EM>Settings</EM> " +
				"and type in the account information for your Internet Service Provider (ISP).</P>" + 
				"<P>If you set up special dialing options, these also may have been lost. When you are done entering information about " + 
				"your ISP account, choose <EM>Save Changes</EM>. You will be returned to the Connection settings page. You can " +
				"edit dialing options from there.</P>"
				break;
			default:
				output = //"<P>" + ShortErrorMessage() + "</P> \
						"<P>Your "+ProductShortName+" could not connect to the "+NetworkFullName+". To help your " +ProductShortName+ " connect, use these troubleshooting tips:</P> \
						<UL> \
							<LI><SPAN class=li>Try connecting to "+NetworkShortName+" later; there may be a problem with the "+NetworkFullName+" right now. </SPAN>\
							<LI><SPAN class=li>You may need to dial a number, such as 9, to make calls on your phone line. This number is called a dialing prefix. To specify a dialing prefix, choose <EM>Settings</EM>. </SPAN>\
						</UL>";
				break;
		}
	}
	else
	{
		switch (ErrorCode)
		{
			case ConnectError_NoLine:
				if (UsingWireless)
				output = "<P>Your "+ProductShortName+" could not connect to the "+NetworkFullName+" because it did not detect a wireless network. "+MultipleStepText+"</P> \
							<LI><SPAN class=li>Make sure your wireless access point or router is turned on. </SPAN>\
							<LI><SPAN class=li>Check your wireless security settings.</SPAN>\
						</UL>";
				else
				output = "<P>Your "+ProductShortName+" could not connect to the "+NetworkFullName+" because it did not detect a broadband cable. "+MultipleStepText+"</P> \
							<LI><SPAN class=li>Make sure you connect your broadband cable to the Ethernet jack on the back of your "+ProductShortName+", and that the cable is connected securely. </SPAN>\
							<LI><SPAN class=li>Make sure your broadband modem or router is turned on. </SPAN>\
						</UL>";
				break;
			case ConnectError_NoDHCPResponse:
				output = "<P>Your "+ProductShortName+" could not connect to \
						the "+NetworkFullName+" because DHCP did not assign it an IP address. An IP \
						address allows your " +ProductShortName+ " to connect to "+NetworkShortName+" using your \
						ISP (Internet service provider). To help your " +ProductShortName+ " connect, \
						follow these steps:</P> \
						<UL> \
							<LI><SPAN class=li>Check your home network documentation to verify that it uses DHCP to assign IP addresses.</SPAN>\
							<LI><SPAN class=li>If your ISP has given you an IP address, choose <EM>Settings</EM> to enter it manually. </SPAN>\
						</UL>";
				break;
			case ConnectError_ServerInvalid:
			case ConnectError_ServerNotFound:
			case ConnectError_ServerUnreachable:
				output = "<P>Your "+ProductShortName+" could not connect to \
						the "+NetworkFullName+". ";
				if (UsingProxy)
					output += "Please verify that the proxy server name and port number settings are correct.";
				else
					output += "Please verify that your router's connection to the Internet is working correctly.";
				break;
			case ConnectError_ProxyServerInvalid:
			case ConnectError_ProxyServerNotFound:
				output = "<P>Your "+ProductShortName+" could not connect to \
						the "+NetworkFullName+" because the proxy server is set incorrectly.  Please verify the \
						proxy server name and port.";
				break;
			case ConnectError_IPSettingsInvalid:
				output = "<P>Your "+ProductShortName+" could not connect to \
						the "+NetworkFullName+" because the IP address setting is incorrect.  Please verify the \
						manual IP address setting.";
				break;
			case ConnectError_GatewayUnreachable:
				output = "<P>Your "+ProductShortName+" could not connect to \
						the "+NetworkFullName+" because the gateway IP setting is incorrect.  Please verify the \
						gateway IP setting.";
				break;				
			case ConnectError_SSIDnotAvailable:
				output = "<P>Your "+ProductShortName+" could not connect to \
						the "+NetworkFullName+" because the prefered wireless network was not \
						available.  Please verify the wireless network settings.";
				break;
			case ConnectError_RequireWirelessSettings:
				output = "<P>Your "+ProductShortName+" could not connect to \
						the "+NetworkFullName+" because additional wireless settings \
						are required.";
				break;
			case ConnectError_WepKeyIncorrect:
				output = "<P>Your "+ProductShortName+" could not connect to \
						the "+NetworkFullName+" because the wireless security key \
						was not accepted.  Please verify that you've entered the right key.";
				break;
			default:
				//if (!fromRegistration)
				//	output = "<P>" + ShortErrorMessage() + "</P>";
				
				output += "<P>Your "+ProductShortName+" could not connect to the "+NetworkFullName+". "+MultipleStepText+"</P> \
							<LI><SPAN class=li>Make sure your broadband router is properly connected to the Internet. </SPAN>\
							<LI><SPAN class=li>Test your broadband connection on a computer. </SPAN>";
				if (ErrorMode != LANErrorMode)
					output += "<LI><SPAN class=li>Contact your ISP to see if it is experiencing technical difficulties. </SPAN>" +
							"<LI><SPAN class=li>Try connecting to "+NetworkShortName+" later; there may be a problem with the "+NetworkFullName+" right now. </SPAN>";

				output += "</UL>";
				break;
		}
	}
	return (output);
}


function ShortErrorMessage()
{
	var errmsg;

	if (!ErrorModeSet)
		SetErrorMode(WANErrorMode);

	var ProductShortName = TVShell.SystemInfo.ProductShortName;

	switch (ErrorCode)
	{
		case ConnectError_NoError:
			errmsg = "No Error";
			break;
		case ConnectError_NoAdapter:
			errmsg = "No network adapter was available. Check your hardware.";
			break;
		case ConnectError_NoAnswer:
			if (UsingBroadband)  // broadband doesn't return this error
				errmsg = "No broadband connection was detected. Check your broadband cable.";
			else 
				errmsg = "No telephone answer was detected. Check your phone line and test the dialed number with your telephone.";
			break;
		case ConnectError_NoLine:
			if (UsingWireless)
				errmsg = "No wireless network was detected. Check your wireless settings.";
			else
			if (UsingBroadband)  // broadband doesn't return this error
				errmsg = "No broadband connection was detected. Check your broadband cable.";
			else 
				errmsg = "No telephone connection was detected. Check your phone line.";
			break;
		case ConnectError_NoCarrier:
			if (UsingWireless)
				errmsg = "No wireless network was detected. Check your wireless settings.";
			else
			if (UsingBroadband)
				errmsg = "No broadband connection was detected. Check your broadband cable.";
			else
				errmsg = "A modem didn't answer your call. Check your dialing prefix.";
			break;
		case ConnectError_NoDHCPResponse:
			errmsg = "No local network address was configured. Check your router or DHCP server.";
			break;
		case ConnectError_TimeOut:
			errmsg = "It took too long to connect. Try again later.";
			break;
		case ConnectError_ServerInvalid:
		case ConnectError_ServerNotFound:
		case ConnectError_ServerUnreachable:
			errmsg = "The "+NetworkFullName+" could not be reached from your network. Check your router or Internet connection.";
			break;
		case ConnectError_ProxyServerInvalid:
			errmsg = "The network proxy server was not specified correctly.";
			break;
		case ConnectError_ProxyServerNotFound:
			errmsg = "The network proxy server was not available.";
			break;
		case ConnectError_DNSServerNotFound:
			errmsg = "The DNS server was not found.";
			break;
		case ConnectError_IPSettingsInvalid:
			errmsg = "The manual IP address settings are not valid.";
			break;
		case ConnectError_Reconnect:
			errmsg = "The connection settings have changed requiring a re-connect.";
			break;
		case ConnectError_NoProvider:
			errmsg = "The wide-area network provider is not installed.";
			break;
		case ConnectError_ConnectedTimeOut:
			errmsg = "The connection has timed out.";
			break;
		case ConnectError_ProviderNotSet:
			errmsg = "The wide-area network provider has not been set.";
			break;
		case ConnectError_ProviderInvalid:
			errmsg = "The wide-area network provider is not configured.";
			break;
		case ConnectError_ProviderError:
			errmsg = "The wide-area network provider had an error.";
			break;
		case ConnectError_DialSettingsInvalid:
			errmsg = "The dialing settings are not correct.";
			break;
		case ConnectError_DialSettingsStale:
			errmsg = "The dialing settings need to be checked.";
			break;
		case ConnectError_RASError:
			errmsg = "An error occurred while connecting.";
			break;
		case ConnectError_AuthFailure:
			errmsg = "Your password or username was not accepted.";
			break;
		case ConnectError_NoDialTone:
			errmsg = "No dial tone was heard on the phone line.";
			break;
		case ConnectError_Busy:
			errmsg = "The dial-in number was busy.";
			break;
		case ConnectError_PowerCycled:
			errmsg = "There has been a power failure since the last connection.";
			break;
		case ConnectError_NoHomeNumber:
			errmsg = "Your home phone number is not known.";
			break;
		case ConnectError_ServiceUnreachable:
			errmsg = "The "+NetworkFullName+" is currently unavailable. Please try connecting again later.";
			break;
		case ConnectError_LoginError:
			errmsg = "There was an error while authenticating to the service.";
			break;
		case ConnectError_PhonebookEmpty:
			errmsg = "There are no phone numbers available to dial.";
			break;
		case ConnectError_ExtensionOffhook:
			errmsg = "A telephone was picked up on the phone line.";
			break;
		case ConnectError_LineInUse:
			errmsg = "Cannot dial because a telephone call is already taking place on this phone line.";
			break;
		case ConnectError_LineReversal:
			errmsg = "The phone line was disconnected during the call.";
			break;	
		case ConnectError_IncomingCall:
			errmsg = "Your "+ProductShortName+" was disconnected from the "+NetworkFullName+" because of an incoming phone call.";
			break;	
		case ConnectError_GatewayUnreachable:
			errmsg = "The router specified as the default gateway is not responding.";
			break;
		case ConnectError_SSIDnotAvailable:
			errmsg = "The prefered wireless network is not available.";
			break;
		case ConnectError_RequireWirelessSettings:
			errmsg = "Additional wireless settings are required."
			break;
		case ConnectError_WepKeyIncorrect:
			errmsg = "The wireless security key was not accepted.";
			break;
		case ConnectError_AssociationFailed:
			errmsg = "The wireless network did not accept our connection.";
			break;
		default:
			errmsg = "Error code "+ErrorCode;
			break;
	}
	return (errmsg);
}
