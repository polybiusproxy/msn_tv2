function goToPageAndPassNewOrigin(which)
{
	document.location = which + "?retURL=" + encodeURIComponent(window.location.href);
}

function ReturnToReferrer()
{
	var URLargs = getURLargs();

 	if (URLargs.retURL && URLargs.retURL != "")
	{
		//	argument retURL (the return path) is specified and is not empty
		//	Go back to the page that originally called Pane Help
		history.go(URLargs.retURL);
	}
	else
	{
		history.back();
	}
}

//	Put all URL arguments into an object named args. Values are unescaped
//
//	Example: Get the value of the argument named myargname (if it exists)
//		var myargs = getURLargs();
//		if (myargs.myargname) myargvalue = myargs.myargname;

function getURLargs()
{
var s = "";
	var args = new Object();
	var query = location.search.substring(1);// Get arguments after the "?"
	var pairs = query.split("&");
	for (var i = 0; i < pairs.length; i++)
	{
		var pos = pairs[i].indexOf("=");
		if (pos == -1) continue;
		var argname = pairs[i].substring(0, pos);
		s += argname + "=";
		var value = pairs[i].substring(pos + 1);
		s += value + ";";
		args[argname] = decodeURIComponent(value);
	}

	//alert("getURLargs args.H_TOPIC="+args.H_TOPIC);
	return args;
}



