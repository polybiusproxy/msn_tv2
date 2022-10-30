

function OnMRGetVolume(hn)
{
	TVShell.Message("OnGetVolume");
	return "OK";
}

function OnMRSetVolume(hn, val)
{
	TVShell.Message("OnSetVolume");
	return "OK";
}

function OnMRPlay(hn, val)
{
	TVShell.Message("OnPlay");
	return "OK";
}

function OnMRStop(hn, val)
{
	TVShell.Message("OnStop");
	return "OK";
}

function OnMRPause(hn, val)
{
	TVShell.Message("OnPause");
	return "OK";
}

function OnMRGetLocation(hn)
{
	TVShell.Message("OnGetLocation");
	return "OK";
}

function OnMRSetLocation(hn, val)
{
	TVShell.Message("OnSetLocation");
	return "OK";
}

function OnMRSetURI(hn, val, mime)
{
	TVShell.Message("OnSetURI");
	return "OK";
}

function OnMRGetURI(hn)
{
	TVShell.Message("OnGetURI");
	return "OK";
}

function OnMRNext(hn, val)
{
	TVShell.Message("OnNext");
	return "OK";
}

function OnMRPrev(hn, val)
{
	TVShell.Message("OnPrev");
	return "OK";
}

function OnMRForwardNext(hn, val)
{
	TVShell.Message("OnForwardNext");
	return "OK";
}

function OnMRRewind(hn, val)
{
	TVShell.Message("");
	return "OK";
}

