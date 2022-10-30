	var xmlFileURL; 
	var xmlQSVersionString = "/msntvUpdate/String[@Id='L_DemoVersion_TEXT']";
	var xmlQSDescString = "/msntvUpdate/String[@Id='L_DemoDescription_TEXT']";
	var xmlQSAlreadyInstalled = "/msntvUpdate/String[@Id='L_Demo_W_AlreadyInstalled_TEXT']";
	var xmlQSCopyError = "/msntvUpdate/String[@Id='L_Demo_E_CopyError_TEXT']";
	var xmlQSSuccess = "/msntvUpdate/String[@Id='L_DemoSuccess_TEXT']";
	var xmlQSNoRoom = "/msntvUpdate/String[@Id='L_Demo_E_NoRoom_TEXT']";
		
	var descriptionDefaultString = "<p><p>This update should take about 5 minutes to install.<p> Would you like to install the update?";
	var AlreadyInstalledDefaultString = "Would you like to install over the previous update?";
	var CopyErrorDefaultString = "There was a problem with the install";
	var SuccessDefaultString = "Please unplug the memory card.<p><p>The system will reboot to finish updating.";
	var NoRoomDefaultString = "No room for the update.<p><p>Please unplug the memory card. ";
	
	function ValidXML(file)
	{
		var d = new ActiveXObject("MSXML2.DOMDocument");
			
		d.async = false;
		
		d.load(file);

		if (d.parseError.errorCode != 0 )
			return false;
		var node = d.selectSingleNode("/msntvUpdate");
		if(!node)
			return false;
		return true;
	}
	
	function GetXMLText(file,term)
	{
		var d = new ActiveXObject("MSXML2.DOMDocument");
			
		d.async = false;
		
		d.load(file);

		if (d.parseError.errorCode != 0 ) {
    		TVShell.Message("Error: " + d.parseError.reason + " \r\n");
    		return 0;
		}
		else {
   			var node = d.selectSingleNode(term);
			//var node = nodes.item(0);
    		
		}
		if(node)
			return node.text;
		else
			return 0;
	}

	
	function doPatch(src,dest)
	{
		xmlFileURL = "file:" + TVShell.Patcher.AutoUpdateXMLPath;


		if(!TVShell.Patcher.CopyPatch(src,dest))
		{ 
			var copyErrString = GetXMLText(xmlFileURL,xmlQSCopyError);
			if(!copyErrString)
				copyErrString = CopyErrorDefaultString;
				
			TVShell.Message("Error in Copy");
			PanelManager.CustomMessageBox(copyErrString,"Error","ok",0,"",false,0x30,0);
			TVShell.Patcher.ErrorCleanUp(dest);
			return false;
		}
		else
		{
			var versionString = GetXMLText(xmlFileURL,xmlQSVersionString);
			if(!versionString)
				versionString = "";
				
			var successString = GetXMLText(xmlFileURL,xmlQSSuccess);
			
			if(!successString)
				successString = SuccessDefaultString;
			
			strBody = versionString +"\n\n" + successString;
				
			PanelManager.CustomMessageBox(strBody,"Update Successfully Installed","ok",0,"",false,0x30,0);
			TVShell.Reboot();
			return true;
		}
	}
	
	function checkSpaceForPatch(src,dest)
	{
		xmlFileURL = "file:" + TVShell.Patcher.AutoUpdateXMLPath;

		if(TVShell.Patcher.CheckSpace(src,dest))
			return true;
		else
		{
			var errmsg = GetXMLText(xmlFileURL,xmlQSNoRoom);
			if(!errmsg)
				errmsg = NoRoomDefaultString;
			PanelManager.CustomMessageBox(errmsg,"Error","ok",0,"",false,0x30,0);
			//TVShell.StorageManager.Remove(StorageDevice);
			return false;
		}
	}
function InitPatch(StorageDevice)
{	
	TVShell.Message("This is a patch");
	
	xmlFileURL = "file:" + TVShell.Patcher.AutoUpdateXMLPath;

	var ver = GetXMLText(xmlFileURL,xmlQSVersionString);
	if(!ver)
		ver = TVShell.Patcher.Version;
	var desc = GetXMLText(xmlFileURL,xmlQSDescString);
	if(!desc)
		desc = descriptionDefaultString; 
	ver += desc;
	if(!PanelManager.CustomMessageBox(ver,"Update Detected","Yes;No",0,"",false,0x30,0))
	{
		TVShell.Message("Doing the patch");
		
		if(TVShell.Patcher.IsSameUpdate(StorageDevice.VolumeName,TVShell.Patcher.UpdatePath))
		{
			// We will be blowing away any old patches so there is no need to put up this
			// alert box.
			/*
			var alreadyInstalledString = GetXMLText(xmlFileURL,xmlQSAlreadyInstalled);
			if(!alreadyInstalledString)
				alreadyInstalledString = AlreadyInstalledDefaultString;
	
			if(!PanelManager.CustomMessageBox(alreadyInstalledString,"Warning","yes;no",0,"",false,0x30,0))
			{
				TVShell.Patcher.ErrorCleanUp(TVShell.Patcher.UpdatePath);
				if(checkSpaceForPatch(StorageDevice.VolumeName,"\\hd2"))
				setTimeout(doPatch(StorageDevice.VolumeName,TVShell.Patcher.UpdatePath),5*10000);			 
			}
			*/
			TVShell.Patcher.ErrorCleanUp(TVShell.Patcher.UpdatePath);
			if(checkSpaceForPatch(StorageDevice.VolumeName,"\\hd2"))
				setTimeout(doPatch(StorageDevice.VolumeName,TVShell.Patcher.UpdatePath),5*10000);
		
		}
		else if(checkSpaceForPatch(StorageDevice.VolumeName,"\\hd2"))
		{ 
		
			doPatch(StorageDevice.VolumeName,TVShell.Patcher.UpdatePath)
		}
	}
	else
	{
	//TVShell.Message("Removing the device from list");
	//TVShell.StorageManager.Remove(StorageDevice);
	
	}
	return true;
}
