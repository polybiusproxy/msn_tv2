MLIST_CONTACT                       = 0;
MLIST_ALLOW                         = 1;
MLIST_BLOCK                         = 2;
MLIST_REVERSE                       = 3;
MMSGTYPE_NO_RESULT                	= 0;
MMSGTYPE_ERRORS_ONLY           		= 1;
MMSGTYPE_ALL_RESULTS             	= 2;
MSTATE_UNKNOWN						= 0;
MSTATE_OFFLINE						= 0x1;
MSTATE_ONLINE						= 0x2;
MSTATE_INVISIBLE					= 0x6;
MSTATE_BUSY							= 0xa;
MSTATE_BE_RIGHT_BACK				= 0xe;
MSTATE_IDLE							= 0x12;
MSTATE_AWAY							= 0x22;
MSTATE_ON_THE_PHONE					= 0x32;
MSTATE_OUT_TO_LUNCH					= 0x42;
MSTATE_LOCAL_FINDING_SERVER			= 0x100;
MSTATE_LOCAL_CONNECTING_TO_SERVER		= 0x200;
MSTATE_LOCAL_SYNCHRONIZING_WITH_SERVER	= 0x300;
MSTATE_LOCAL_DISCONNECTING_FROM_SERVER	= 0x400;
SSTATE_DISCONNECTED					= 0;
SSTATE_CONNECTING					= 1;
SSTATE_CONNECTED					= 2;
SSTATE_DISCONNECTING				= 3;
SSTATE_ERROR						= 4;
MFOLDER_INBOX 						= 0;
MFOLDER_ALL_OTHER_FOLDERS 			= 1;
MMSGPRIVACY_BLOCK_LIST_EXCLUDED     = 0;
MMSGPRIVACY_ALLOW_LIST_ONLY         = 1;

ERR_USER_NOT_FOUND					= 0x000A;
MSGR_E_TOO_MANY_SESSIONS			= 0x0021;
MSGR_E_REMOTE_LOGIN					= 0x0023;

MALERT_BUDDYREQUEST				= 0x00000001;
MALERT_INVITATION				= 0x00000002;
MALERT_BUDDYONLINE				= 0x00000004;
MALERT_NEWMESSAGE				= 0x00000008;
MALERT_SUPPRESS_ALERTS_IN_FULLSCREEN = 0x00000010;

function MatchFriendlyName(friendlyName)
{
	if(friendlyName==null)
		return friendlyName;
	var index=friendlyName.indexOf('@hotmail.com');
	if(index>0)
		return friendlyName.substr(0,index);
	index=friendlyName.indexOf('@webtv.com');
	if(index>0)
		return friendlyName.substr(0,index);
	index=friendlyName.indexOf('@msn.com');
	if(index>0)
		return friendlyName.substr(0,index);
	index=friendlyName.indexOf('@passport.com');
	if(index>0)
		return friendlyName.substr(0,index);
	index=friendlyName.indexOf('@microsoft.com');
	if(index>0)
		return friendlyName.substr(0,index);
	index=friendlyName.indexOf('@hotmail-int.com');
	if(index>0)
		return friendlyName.substr(0,index);
	index=friendlyName.indexOf('@msn-int.com');
	if(index>0)
		return friendlyName.substr(0,index);
	return friendlyName;
}