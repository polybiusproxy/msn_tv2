function IsFieldEmpty(fieldValue)
{
	if ( fieldValue == null || fieldValue == "" )
		return "true";
	
	// Removing leading spaces
	var re = /^\s*(\S*)/;
	fieldValue = fieldValue.replace(re, "$1");
	
	// Removing trailing spaces
	var re = /(\S*)\s*$/;
	fieldValue = fieldValue.replace(re, "$1");
	
	if ( fieldValue == "" )
		return "true";
	else
		return "false";
}

function IsFieldTooShort(fieldValue, min)
{
	var result;
	
	if ( min == null )
		result = "false";
	else if( fieldValue.length < min )
		result = "true";
	else
		result = "false";
		
	return result;		
}

function IsFieldTooLong(fieldValue, max)
{
	var result;
	
	if ( max == null )
		result = "false";		
	else if ( fieldValue.length > max )
		result = "true";
	else
		result = "false";
		
	return result;
}

function IsTollFree(fieldValue)
{
	var result;
	var regExp800 = /^800-[0-9]{3}-[0-9]{4}$/;
	var regExp888 = /^888-[0-9]{3}-[0-9]{4}$/;
	var regExp877 = /^877-[0-9]{3}-[0-9]{4}$/;
	var regExp866 = /^866-[0-9]{3}-[0-9]{4}$/;
	
	if( regExp800.test(fieldValue) )
		result = "true";
	else if( regExp888.test(fieldValue) )
		result = "true"
	else if( regExp877.test(fieldValue) )
		result = "true"
	else if( regExp866.test(fieldValue) )
		result = "true"
	else
		result = "false";
		
	return result;
}

function IsDirectoryAssistance(fieldValue)
{
	var result;
	var regExp = /^[0-9]{3}-555-1212$/;
		
	if( regExp.test(fieldValue) )
		result = "true";
	else
		result = "false";
		
	return result;

}

function Is911(fieldValue)
{
	return (fieldValue.indexOf("911") == 0);
}

function NormalizePhone(fieldName)
{
	var temp = "";
	var normalizedValue = "";
	var i;
	var remaining;
	
	// Removing old non-digits char
	for(i = 0; i < fieldName.value.length; i++)
	{
		var currentChar = fieldName.value.charAt(i);
		
		if ( !isNaN(currentChar) && currentChar != ' ' )
		{
			temp += currentChar;			
		}
	}	
	
	// formatting to 'xxx-xxx-xxxx'
	for(i = 0, remaining=temp.length; i < temp.length; i++, remaining--)
	{
		var currentChar = temp.charAt(i);
		
		if (i== 0 || (remaining != 4 && remaining != 7 ))
		{
			normalizedValue += currentChar;			
		}
		else
		{
			normalizedValue += "-";
			normalizedValue += currentChar;
		}
	}
	
	fieldName.value = normalizedValue;	
}

function IsPhoneValid(fieldName, min, max)
{
	var result;
	
	NormalizePhone(fieldName);
		
	if ( IsFieldEmpty(fieldName.value) == "true" )
		result = "empty";	
	else if ( IsTollFree(fieldName.value) == "true" )
		result = "tollfree";
	else if ( IsDirectoryAssistance(fieldName.value) == "true" )
		result = "directoryassistance";
	else if ( IsFieldTooShort(fieldName.value, min) == "true" )
		result = "tooshort";
	else if ( IsFieldTooLong(fieldName.value, max) == "true" )
		result = "toolong";
	else if ( fieldName.value.length > min && fieldName.value.length < max )   // has to be exactly min or max
		result = "toolong";
	else if ( Is911(fieldName.value) )
		result = "911";
	else	
		result = "true";
			
	return result;
}

