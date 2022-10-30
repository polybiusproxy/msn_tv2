//
// EventLog.js
//

// Event Types

var EventType_Event_Trivia = 0;
var EventType_Event_Message = 1;
var EventType_Event_Important = 2;
var EventType_Event_Warning = 3;
var EventType_Event_Error = 4;
var EventType_Event_State = 5;
var EventType_Event_StartContext = 6;
var EventType_Event_EndContext = 7;
var EventType_Event_TransitionFrom = 8;
var EventType_Event_TransitionTo = 9;

// Event Log states

var SystemState_State_Shutdown = 0;
var SystemState_State_Bootup = 1;
var SystemState_State_PowerOff = 2;
var SystemState_State_PowerOn = 3;
var SystemState_State_LANConnect = 4;
var SystemState_State_LANDisconnect = 5;
var SystemState_State_WANConnect = 6;
var SystemState_State_WANDisconnect = 7;
var SystemState_State_ScreenSaverOn = 8;
var SystemState_State_ScreenSaverOff = 9;
var SystemState_State_Authenticated = 10;
var SystemState_State_Deauthenticated = 11;
var SystemState_State_Run = 12;

// Memory State
var MemoryState_Memory_Ok = 0;
var MemoryState_Memory_Warning = 1;
var MemoryState_Memory_Low = 2;
var MemoryState_Memory_Out = 3;

var EventLog_lastTime = new Date().getTime();
var EventLog_curTime;

var SHELL_TIMER_VALUE = 15000;

function Heartbeat()
{
	EventLog_curTime = new Date().getTime();
	if ( (EventLog_curTime - EventLog_lastTime) >= SHELL_TIMER_VALUE )
	{
		EventLog_lastTime = EventLog_curTime;
		TVShell.EventLog.State( SystemState_State_Run );
	}
}
