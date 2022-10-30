/* -----------------------------------------------------
/	Filename:	MsnTvUIValidation.js
/	Pupose	:	Shared Service UI client-side validation
/	Author	:	Stephane Karoubi (stekar)
/	Created	:   01/01/2002
/	Modified:	07/02/2003
/
/	Copyright (c) 2002 Microsoft Corporation
/  -----------------------------------------------------
*/


/* ----------------------------
/	Error Codes
/  ---------------------------*/

// Note: 0 and 1 are reserved for false and true

var EMPTY					=	2;
var EMPTY_DATE				=	3;
var EMPTY_NUMBER			=	4;
var EMPTY_EMAILADDRESS		=	5;
var EMPTY_USERNAME			=	6;
var EMPTY_DOMAIN			=	7;
var EMPTY_YEAR				=	8;
var INVALID					=	9;
var INVALID_MONTH			=	10;
var INVALID_YEAR			=	11;
var INVALID_DAY				=	12;
var FORBIDDEN				=	13;
var FORBIDDEN_DOMAIN		=	14;
var FORBIDDEN_FIRSTNAME		=	15;
var FORBIDDEN_LASTNAME		=	16;
var FORBIDDEN_USERNAME		=	17;
var FORBIDDEN_PASSWORD		=	18;
var ILLEGAL					=	19;
var ILLEGAL_DATE			=	20;
var TOO_SHORT				=	21;
var TOO_LONG				=	22;
var TOLLFREE				=	23;
var DIRECTORY_ASSISTANCE	=	24;
var _911					=	25;
var UNDER_AGE				=	26;
var NOMATCH					=	27;
var AMEX_INCOMPLETE			=	28;
var AMEX_INVALID			=	29;
var DISCOVER_INCOMPLETE		=	30;
var DISCOVER_INVALID		=	31;
var MC_INCOMPLETE			=	32;
var MC_INVALID				=	33;
var VISA_INCOMPLETE			=	34;
var VISA_INVALID			=	35;
var CC_EXPIRED				=	36;
var INVALID_YEAR_FUTURE		=	37;
var MIGRATION_DOMAIN		=	38;
var  EMPTY_FIELD_1			=	39;
var  EMPTY_FIELD_2			=	40;
var GIFTCARD_EMPTY				= 41;
var GIFTCARD_VALID				= 42;
var GIFTCARD_SHORT		 = 43;
var GIFTCARD_LONG			= 44;
var GIFTCARD_INVALID_FORMAT = 45;


var KeyCodes = new Object();
KeyCodes.Tab		= 9;
KeyCodes.Pageup		= 33;
KeyCodes.Pagedown	= 34;
KeyCodes.End		= 35;
KeyCodes.Home		= 36;
KeyCodes.Left		= 37;
KeyCodes.Up			= 38;
KeyCodes.Right		= 39;
KeyCodes.Down		= 40;

/* ---------------------------------------------------------
/	Functions - to support UI navigation (and more to come)
/  ---------------------------------------------------------*/

function doGoBack(pageName)
{
	var href = document.location.href;
	href = href.substr(0, href.lastIndexOf("/")+1);
	history.go(href + pageName);
}

/* ---------------------------------------------------------
/	RemapObj constructs a Remap Object which has two properties:
/		keys (an array of keycodes to remap)/
/		destination (a string containing the id of the field to navigate to) 
/  ---------------------------------------------------------*/
function RemapObj(mykeys,mydestination) 
{ 
	this.keys = mykeys;
	this.destination = mydestination; 
}

/* ---------------------------------------------------------
/	RemapKeysToFocus
/		Remaps one or more sets of keycodes, 
/		where each set of keycodes gets remapped to move the focus to a particular field.
/	Args: RemapArr is the only argument.  It's an array of RemapObj objects.
/	Returns: true or false (and cancels event bubling if it actually does anything.)
/	Example:
/		The following stament builds an array of RemapObj objects:
/			var RemapLastRadioArr = [new RemapObj([KeyCodes.Down,KeyCodes.Tab],"ucimagesubmitbutton1"),new RemapObj([KeyCodes.Up,KeyCodes.Pageup],"help")];
/		If used in the following field (MyField), it will remap "Down" and "Tab" to navigate to the item: "ucimagesubmitbutton1" and "Up" and "Pageup" to the item: "help".
/			<input type="text" id="MyField" onkeydown="RemapKeysToFocus(RemapLastRadioArr)">
/  ---------------------------------------------------------*/
function RemapKeysToFocus(RemapArr)
{
	var handled = false;
	outerloop: for (var i=0; i<RemapArr.length; i++)
	{
			MyRemap = RemapArr[i];
			for (var j=0; j<MyRemap.keys.length; j++)
			{
			//alert("Debug Message: checking if " + event.keyCode + " == " + MyRemap.keys[j]);
			if (event.keyCode == MyRemap.keys[j])
			{
				document.all[MyRemap.destination].focus();
				handled = true;
				break outerloop;
			}
			}
	}
	
	if (handled)
	{
		event.returnValue=false;
		event.cancelBubble=true;
		return false;
	}				
	return true;
}

/* ------------------------------------------------
/	Functions - that support UI validation(s)
/  ------------------------------------------------*/
	
function IsRadioButtonChecked(radioButtons)
{
	var result = false;
	
	// if we only have 1 radio button
	if ( radioButtons.length == null )
	{
		if ( radioButtons.checked )
		{
			result = true
			return result;
		}
	}
	
	for ( var i = 0; i < radioButtons.length; i++ )
	{
		if ( radioButtons[i].checked )
		{
			result = true;
			break;
		}		
	}
	
	return result;
}

function SetRadioButtonFocus(radioButtons, id)
{
	// if we only have 1 radio button
	if ( radioButtons.length == null )
		return;
	
	for ( var i = 0; i < radioButtons.length; i++ )
	{
		if ( radioButtons[i].id == id )
		{
			radioButtons[i].focus();
			return;
		}		
	}
}

function CheckRadioButton(radioButtons, id)
{
	// if we only have 1 radio button
	if ( radioButtons.length == null )
		radioButtons.checked = true;
	
	for ( var i = 0; i < radioButtons.length; i++ )
	{
		if ( radioButtons[i].id == id )
		{
			radioButtons[i].checked = true;
			return;
		}		
	}
}

function GetCheckedRadioButton(radioButtons)
{
	var result = -1;
	
	// if we only have 1 radio button
	if ( radioButtons.length == null )
	{
		if ( radioButtons.checked )
		{
			result = 0;
			return result;
		}
	}
	
	for ( var i = 0; i < radioButtons.length; i++ )
	{
		if ( radioButtons[i].checked )
		{
			result = i;
			break;
		}		
	}
	
	return result;
}

function ClearRadioButtons(name)
{
	for ( var i = 0; i < name.length; i++ )
	{
		name[i].checked = false;			
	}
}
             
function IsFieldEmpty(fieldName)
{
	if ( fieldName == null || fieldName == "" )
		return true;

	// Removing leading spaces
	var re = /^\s*(\S*)/;
	fieldName.value = fieldName.value.replace(re, "$1");
	
	// Removing trailing spaces
	var re = /(\S*)\s*$/;
	fieldName.value = fieldName.value.replace(re, "$1");
	
	if ( fieldName.value == "" )
		return true;
	else
		return false;
}

function IsFieldLegal(fieldValue, re)
{
	var result;

	if ( re == null )
		result = true;
	else if( re.test(fieldValue) )
		result = true;
	else
		result = false;
		
	return result;
}

function IsFieldTooShort(fieldValue, min)
{
	var result;
	
	if ( min == null )
		result = false;
	else if( fieldValue.length < min )
		result = true;
	else
		result = false;
		
	return result;		
}

function NumDigitsWithLimit(fieldValue, treshold)
{
	var numDigits = 0;
	for(i = 0; i < fieldValue.length; i++)
	{
		if (treshold != -1 && numDigits > treshold) break;
		
		var currentChar = fieldValue.charAt(i);		
		if (!isNaN(currentChar) && currentChar != ' ')
		{
			numDigits++;			
		}
	}

	return numDigits;	
}

function NumDigits(fieldValue)
{
	return NumDigitsWithLimit(fieldValue, -1);
}

function IsFieldTooLong(fieldValue, max)
{
	var result;
	
	if ( max == null )
		result = false;		
	else if ( fieldValue.length > max )
		result = true;
	else
		result = false;
		
	return result;
}

function IsFieldForbidden(fieldValue, forbiddenField)
{
	if ( forbiddenField == null )
		return false;
	
	if ( fieldValue.indexOf(forbiddenField) != -1 )
		return true;
	else
		return false;
}

function IsFieldValid(fieldName, forbiddenField, regExp, min, max)
{
	var result;
	
	if ( IsFieldEmpty(fieldName) == true )
		result = EMPTY;
	else if ( IsFieldLegal(fieldName.value, regExp) == false )
		result = ILLEGAL;
	else if ( IsFieldTooShort(fieldName.value, min) == true )
		result = TOO_SHORT;
	else if ( IsFieldTooLong(fieldName.value, max) == true )
		result = TOO_LONG;
	else if ( IsFieldForbidden(fieldName.value, forbiddenField) == true )
		result = FORBIDDEN;
	else
		result = true;
		
	return result;
}

function IsZipValid(fieldName, regExp, min, max)
{
	var result;
	
	if ( IsFieldEmpty(fieldName) == true )
		result = EMPTY;
	else if ( IsFieldTooShort(fieldName.value, min) == true )
		result = TOO_SHORT;
	else if ( IsFieldTooLong(fieldName.value, max) == true )
		result = TOO_LONG;
	else if ( IsFieldLegal(fieldName.value, regExp) == false )
		result = ILLEGAL;
	else
		result = true;
		
	return result;
}

function IsTollFree(fieldValue)
{
	var result;
	var regExpArea800 = /^[(]800[)]\s{1}[0-9]{3}-[0-9]{4}$/;
	var regExpArea866 = /^[(]866[)]\s{1}[0-9]{3}-[0-9]{4}$/;
	var regExpArea877 = /^[(]877[)]\s{1}[0-9]{3}-[0-9]{4}$/;
	var regExpArea888 = /^[(]888[)]\s{1}[0-9]{3}-[0-9]{4}$/;
	var regExpExchange800 = /^[(][0-9]{3}[)]\s{1}800-[0-9]{4}$/;
	var regExpExchange877 = /^[(][0-9]{3}[)]\s{1}877-[0-9]{4}$/;
	var regExpExchange888 = /^[(][0-9]{3}[)]\s{1}888-[0-9]{4}$/;
	
	if( regExpArea800.test(fieldValue) )
		result = true;
	else if( regExpArea866.test(fieldValue) )
		result = true
	else if( regExpArea877.test(fieldValue) )
		result = true
	else if( regExpArea888.test(fieldValue) )
		result = true
	else if( regExpExchange800.test(fieldValue) )
		result = true
	else if( regExpExchange877.test(fieldValue) )
		result = true
	else if( regExpExchange888.test(fieldValue) )
		result = true
	else
		result = false;
		
	return result;
}

function IsDirectoryAssistance(fieldValue)
{
	var result;
	var regExpArea411 = /^[(]411[)]\s{1}[0-9]{3}-[0-9]{4}$/;
	var regExpArea555 = /^[(]555[)]\s{1}[0-9]{3}-[0-9]{4}$/;
	var regExpArea900 = /^[(]900[)]\s{1}[0-9]{3}-[0-9]{4}$/;
	var regExpArea911 = /^[(]911[)]\s{1}[0-9]{3}-[0-9]{4}$/;
	var regExpExchange411 = /^[(][0-9]{3}[)]\s{1}411-[0-9]{4}$/;
	var regExpExchange900 = /^[(][0-9]{3}[)]\s{1}900-[0-9]{4}$/;
	var regExpExchange911 = /^[(][0-9]{3}[)]\s{1}911-[0-9]{4}$/;
	var regExpExchange555 = /^[(][0-9]{3}[)]\s{1}555-[0-9]{4}$/;
	
	if( regExpArea411.test(fieldValue) )
		result = true;	
	else if( regExpArea555.test(fieldValue) )
		result = true;
	else if( regExpArea900.test(fieldValue) )
		result = true;
	else if( regExpArea911.test(fieldValue) )
		result = true;
	else if( regExpExchange411.test(fieldValue) )
		result = true;
	else if( regExpExchange555.test(fieldValue) )
		result = true;
	else if( regExpExchange900.test(fieldValue) )
		result = true;
	else if( regExpExchange911.test(fieldValue) )
		result = true;
	else
		result = false;
		
	return result;
}

function Is911(fieldValue)
{
	var result;
	var regExp = /^[(]911[)]\s{1}[0-9]{3}-[0-9]{4}$/;
		
	if( regExp.test(fieldValue) )
		result = true;
	else
		result = false;
		
	return result;

}

function FormatPhone(oPhone)
{
	if ( oPhone.value.length == 0 )
		return "";
		
	var temp = "";
	var normalizedValue = "(";
	
	// Do we have exactly 10 digits?
	var numDigits = NumDigitsWithLimit(oPhone.value, 10);
	if (numDigits != 10) return;
	
	// Removing old non-digits char
	RemoveAllNonDigitChars(oPhone);
	temp = oPhone.value;
	
	// formatting to '(xxx) xxx-xxxx'
	for(i = 0; i < temp.length; i++)
	{
		currentChar = temp.charAt(i);
		
		if ( i != 3 && i != 6 )
		{
			normalizedValue += currentChar;			
		}
		else
		{
			if ( i == 3 )
				normalizedValue += ") ";
			else if ( i == 6 )
				normalizedValue += "-";
				
			normalizedValue += currentChar;
		}
	}
	
	if ( normalizedValue != "(" )
		oPhone.value = normalizedValue;
}

function FormatPhoneByVal(phone)
{
	if ( phone.length == 0 )
		return "";
		
	var temp = "";
	var normalizedValue = "(";
	
	// Removing old non-digits char
	for(i = 0; i < phone.length; i++)
	{
		var currentChar = phone.charAt(i);
		
		if ( !isNaN(currentChar) && currentChar != ' ' )
		{
			temp += currentChar;			
		}
	}	
	
	// formatting to '(xxx) xxx-xxxx'
	for(i = 0; i < temp.length; i++)
	{
		currentChar = temp.charAt(i);
		
		if ( i != 3 && i != 6 )
		{
			normalizedValue += currentChar;			
		}
		else
		{
			if ( i == 3 )
				normalizedValue += ") ";
			else if ( i == 6 )
				normalizedValue += "-";
				
			normalizedValue += currentChar;
		}
	}
	
	return normalizedValue;
}


function IsPhoneValid(fieldName, min, max)
{
	var result;

	FormatPhone(fieldName);
		
	if ( IsFieldEmpty(fieldName) == true )
		result = EMPTY;	
	else if ( IsTollFree(fieldName.value) == true )
		result = TOLLFREE;
	else if ( Is911(fieldName.value) == true )
		result = 911;
	else if ( IsDirectoryAssistance(fieldName.value) == true )
		result = DIRECTORY_ASSISTANCE;
	else if ( IsFieldTooShort(fieldName.value, min) == true )
		result = TOO_SHORT;
	else if ( NumDigits(fieldName.value) != 10 )
		result = TOO_SHORT;
	else if ( IsFieldTooLong(fieldName.value, max) == true )
		result = TOO_LONG;
	else	
		result = true;
			
	return result;
}

function IsUnderAge(fieldValue, age)
{
	var result;
	
	var yearEntered = fieldValue.substring( fieldValue.lastIndexOf("/") + 1, fieldValue.length);
	var mmddEntered = fieldValue.substring( 0, fieldValue.lastIndexOf("/") + 1);
	var today = new Date();
	var dob = new Date(fieldValue);
	var currentYear = today.getFullYear();		
	var dateLimit = new Date((today.getMonth()+1) + "/" + today.getDate() + "/" + (currentYear-age));
	
	if ( fieldValue.length == 10 && (dob.getTime() > dateLimit.getTime()))
		result = true;
	else
		result = false;
		
	return result;
}


function IsDateValid(fieldValue)
{
	var mm = fieldValue.substring(0, 2);
	var dd = fieldValue.substring(3, 5);
	var yyyy = fieldValue.substring(6, fieldValue.length);	
	var d = new Date(mm + "/" + dd + "/" + yyyy);

	if (fieldValue.length != 10 || isNaN(d.getMonth()) || isNaN(d.getDay()) || isNaN(d.getFullYear()) ) 
		result = INVALID;
	else if ( yyyy == "" )
		result = EMPTY_YEAR;
	else if ( d.getDate() != dd )
		result = INVALID_DAY;
	else if ( d.getMonth() + 1 != mm )
		result = INVALID_MONTH;	
	else if ( yyyy.substring(0,2) != "19" && yyyy.substring(0,2) != "20" )
		result = INVALID_YEAR;
	else if ( d.getFullYear() != yyyy || yyyy.length > 4 )
		result = INVALID_YEAR;
	else 
		result = true;
	
	return result;
}

function NormalizeDate(fieldName, minDigits)
{ 
	var temp = "";
	var normalizedValue = "";
	var mm, dd;		
	
	RemoveAllNonDigitCharsExcept(fieldName, "/.-");
		
	// Replacing every '-' and '.' by '/'
	var regexp = /[-\.]+/;
	while(regexp.test(fieldName.value))
	{
		fieldName.value = fieldName.value.replace(regexp, "/");
	}
	
	// Removing the last slash
	if (fieldName.value.charAt(fieldName.value.length -1) == '/')
	{
		fieldName.value = fieldName.value.substring(0, fieldName.value.length -1);
	}
	
	temp = fieldName.value;
	
	var dobArray = fieldName.value.split("/");		
	
	if ( minDigits == 8 ) // mm/dd/yyyy
	{				
		// no "/" found, trying to normalize the best way possible
		if (dobArray.length == 1)
		{
			// m/d/yyyy	
			if ( temp.length == 6 )
			{
				mm = "0" + temp.substring(0,1);
				dd = "0" + temp.substring(1,2);	
				
				temp = mm + dd + temp.substring(2,6);	
			}			
			// mm/d/yyyy or m/dd/yyyy
			else if ( temp.length == 7 )
			{
				var mm, dd;
				
				// mm/d/yyyy
				if ( temp.charAt(0) == '0' )
				{
					mm = temp.substring(0,2);
					dd = "0" + temp.substring(2,3);
					
					temp = mm + dd + temp.substring(3,7);
				}
				else
				{
					//  m/dd/yyyy
					mm = "0" + temp.substring(0,1);
					dd = temp.substring(1,3);
					
					temp = mm + dd + temp.substring(3,7);				
				}
			}	
			else if ( temp.length != 8 ) // mm/dd/yyyy
				return;
			
			// formatting to 'xx/xx/xxxx'
			for(i = 0; i < temp.length; i++)
			{
				var currentChar = temp.charAt(i);
				
				if ( i != 2 && i != 4 )
				{
					normalizedValue += currentChar;			
				}
				else
				{
					normalizedValue += "/";
					normalizedValue += currentChar;
				}
			}				
		}
		else
		{				
			// invalid date
			if (dobArray.length != 3) return;
			
			// month
			if (dobArray[0].length == 1) 
				normalizedValue += "0" + dobArray[0] + "/";
			else
				normalizedValue += dobArray[0] + "/";
				
			// day
			if (dobArray[1].length == 1) 
				normalizedValue += "0" + dobArray[1] + "/";
			else
				normalizedValue += dobArray[1] + "/";
			
			// year
			if (dobArray[2].length == 2) 
				normalizedValue += "19" + dobArray[2];		
			else
				normalizedValue += dobArray[2];	
		}			
	}		
	else // mm/yyyy
	{
		// no "/" found, trying to normalize the best way possible
		if (dobArray.length == 1)
		{
			// m/yyyy
			if ( temp.length == 5 )
			{
				//  m/dd/yyyy
				mm = "0" + temp.substring(0,1);
				temp = mm + temp.substring(1,5);
			}			
			// mm/yyyy
			else if ( temp.length == 6 )
			{
				//  m/dd/yyyy
				mm = temp.substring(0,2);
				temp = mm + temp.substring(2,6);
			}		
			else
				return;		
			
			
			// formatting to 'xx/xxxx'
			for(i = 0; i < temp.length; i++)
			{
				var currentChar = temp.charAt(i);
				
				if ( i != 2 )
				{
					normalizedValue += currentChar;			
				}
				else
				{
					normalizedValue += "/";
					normalizedValue += currentChar;
				}
			}	
		}
		else
		{		
			// invalid date
			if (dobArray.length != 2) return;
			
			// month
			if (dobArray[0].length == 1) 
				normalizedValue += "0" + dobArray[0] + "/";
			else
				normalizedValue += dobArray[0] + "/";			
			
			// year
			if (dobArray[1].length == 2) 
				normalizedValue += "20" + dobArray[1];		
			else
				normalizedValue += dobArray[1];			
		}		
	}	

	fieldName.value = normalizedValue;	
}

function IsBirthdateValid(fieldName, ageLimit)
{
	var result, validDate;
		
	NormalizeDate(fieldName, 8);

	// Checking if the DOB is in the future.
    var DOB = new Date(fieldName.value);
    var today = new Date();

	if ( IsFieldEmpty(fieldName) == true )
		result = EMPTY;
	else if ( (validDate = IsDateValid(fieldName.value)) != true )
		result = validDate;
    else if ( DOB.getTime() > today.getTime() )
        result = INVALID_YEAR_FUTURE;
	else if ( IsUnderAge(fieldName.value, ageLimit) == true )
		result = UNDER_AGE;
	else	
		result = true;			
			
	return result;
}


function IsMatching(fieldValue1, fieldValue2)
{
	// Removing leading spaces
	/*var re = /^\s*(\S*)/;
	fieldValue2 = fieldValue2.replace(re, "$1");
	
	// Removing trailing spaces
	var re = /(\S*)\s*$/;
	fieldValue2 = fieldValue2.replace(re, "$1");*/
	
	if ( fieldValue1 == fieldValue2 )
		return true;
	else
	{
		fieldValue1 = "";
		fieldValue2.value = "";
		return false;
	}
}

function IsPasswordValid(field1, field2, userName, firstName, lastName, regExp, min)
{
	var result;	
	
	if ( field1.value == "" )
		result = EMPTY_FIELD_1;		
	else if ( field2.value == "" )
		result = EMPTY_FIELD_2;	
	else if ( IsFieldTooShort(field1.value, min) == true )
		result = TOO_SHORT;
	else if ( IsMatching(field1.value, field2.value) == false)
		result = NOMATCH;
	else if ( IsFieldLegal(field1.value, regExp) == false )
		result = ILLEGAL;
	else if ( IsFieldForbidden(field1.value, userName) == true )
		result = FORBIDDEN_USERNAME;
	else if ( IsFieldForbidden(field1.value, firstName) == true )
		result = FORBIDDEN_FIRSTNAME;
	else if ( IsFieldForbidden(field1.value, lastName) == true )
		result = FORBIDDEN_LASTNAME;
	else	
		result = true;
			
	return result;
}

/* -------------------------
*	Credit Card Validation
*  -------------------------
*/

// LUHN Formula for validation of credit card numbers.
function MOD10( cardNumber ) 
{ 
	var ar = new Array( cardNumber.length );
	var i = 0,sum = 0;

    for( i = 0; i < cardNumber.length; ++i ) 
    {
    	ar[i] = parseInt(cardNumber.charAt(i));
    }
    for( i = ar.length -2; i >= 0; i-=2 ) 
    {	// you have to start from the right, and work back.
    	ar[i] *= 2;							 // every second digit starting with the right most (check digit)
    	if( ar[i] > 9 ) ar[i]-=9;			 // will be doubled, and summed with the skipped digits.
    }										 // if the double digit is > 9, add those individual digits together 


    for( i = 0; i < ar.length; ++i ) 
    {
        sum += ar[i];						 // if the sum is divisible by 10 mod10 succeeds
    }
    
    return ( ( (sum%10) == 0 ) ? true : INVALID );	 	
}

function IsCardNumberValid(cardNumber, cardType) 
{
    var result = true;		

	RemoveAllNonDigitChars(cardNumber);

	if ( IsFieldEmpty(cardNumber) == true )
		return EMPTY_NUMBER;

    var length = cardNumber.value.length;	
	for( var i = 0; i < cardNumber.value.length; ++i ) 
	{	
		// make sure the number is all digits.. (by design)
        var c = cardNumber.value.charAt(i);

        if( c < '0' || c > '9' ) 
            return INVALID;            
    }
    
    switch( cardType ) 
    {
        case "Amex":
			if( length != 15 ) 
            {
                result = AMEX_INCOMPLETE;
            }
            var prefix = parseInt( cardNumber.value.substring(0,2));
            if( prefix != 34 && prefix != 37 ) 
            {
                result = AMEX_INVALID;
            }
            break;
        case "Discover":
            if( length != 16 ) 
            {
                result = DISCOVER_INCOMPLETE;
            }
            var prefix = parseInt( cardNumber.value.substring(0,4));
            if( prefix != 6011 ) 
            {
                result = DISCOVER_INVALID;
            }
            break;
		case "MC":
            if( length != 16 ) 
            {
                result = MC_INCOMPLETE;
            }
            var prefix = parseInt( cardNumber.value.substring(0,2));

            if( prefix < 51 || prefix > 55) 
            {
                result = MC_INVALID;
            }
            break;
        case "Visa":
            if( length != 16 && length != 13 ) 
            {
                result = VISA_INCOMPLETE;
            }
            var prefix = parseInt( cardNumber.value.substring(0,1));
            if( prefix != 4 ) 
            {
                result = VISA_INVALID;
            }                        
            break;
    }
    
    if ( result == true )
		result = MOD10(cardNumber.value);
		
    return result;
     
 }

function RemoveAllNonDigitCharsExcept(oField, keepChars)
{
	var temp = "";
	
	// Removing all non-digit chars
	for(i = 0; i < oField.value.length; i++)
	{
		var currentChar = oField.value.charAt(i);
		
		for(j = 0; j < keepChars.length; j++)
		{
			if ( (!isNaN(currentChar) || currentChar == keepChars.charAt(j)) && currentChar != ' ' )
			{
				temp += currentChar;	
				break;		
			}
		}
	}	
	
	oField.value = temp;		
}

function RemoveAllNonDigitChars(oField)
{
	var temp = "";
	
	// Removing all non-digit chars
	for(i = 0; i < oField.value.length; i++)
	{
		var currentChar = oField.value.charAt(i);
		
		if ( !isNaN(currentChar) && currentChar != ' ' )
		{
			temp += currentChar;			
		}
	}	
	
	oField.value = temp;		
}

function IsCardExpired(cardDate, dateRegExp) 
{
    NormalizeDate(cardDate, 6);
        
    var result = false; 
    var mm = cardDate.value.substring(0, 2);
	var yyyy = cardDate.value.substring(3, cardDate.value.length);	
	var d = new Date(mm + "/" + "01/" + yyyy);    

    if ( IsFieldEmpty(cardDate) == true )
		result = EMPTY_DATE;	
	else if (cardDate.value.length != 7 || cardDate.value.indexOf("/") == -1 || isNaN(d.getMonth()) || isNaN(d.getDay()) || isNaN(d.getFullYear()) ) 
		result = ILLEGAL_DATE;
	else
	{		
		var now = new Date();							// this function is designed to be Y2K compliant.
		var year = cardDate.value.substring(3,7);
		var month = cardDate.value.substring(0,2);

		if ( month > 12 || month <= 0 )
			result = INVALID_MONTH;
		else if ( year < 4 )
			result = INVALID_YEAR;
		else if ( year > (now.getFullYear() + 9) )
			result = INVALID_YEAR_FUTURE;
		else
		{
			var expiresIn = new Date( year, month, 0, 0, 0);// create an expired on date object with valid thru expiration date
		    
			expiresIn.setMonth( expiresIn.getMonth() + 1 );	// adjust the month, to first day, hour, minute & second of expired month
		    
			if( expiresIn.getTime() < now.getTime() ) 
				result = CC_EXPIRED;
		}
	}    

	return result;									
}

function IsCreditCardValid(number, date, numRegExp, dateRegExp, cardType)
{
	var result, exp;
	
	if ( (result = IsCardNumberValid(number, cardType)) == true )
	{
		if ( (exp = IsCardExpired(date, dateRegExp)) == false )
			result = true;
		else 
			result = exp; 
	}
			
	return result;
}


function IsEmpty(val)
{
	if ( val == null || val == "" )
		return true;

	// Removing leading spaces
	var re = /^\s*(\S*)/;
	val = val.replace(re, "$1");
	
	// Removing trailing spaces
	var re = /(\S*)\s*$/;
	val = val.replace(re, "$1");
	
	if ( val == "" )
		return true;
	else
		return false;
}



function IsGiftNumberValid(field, regExp, min, max)
{
	var result;
	var fieldValue = field.value;
	
	if ( IsEmpty(fieldValue) )
		result = GIFTCARD_EMPTY;
	else if ( fieldValue.length < min )
		result = GIFTCARD_SHORT;
	else if ( fieldValue.length > max )
		result = GIFTCARD_LONG;
	else if ( regExp.test(fieldValue) )
		result = GIFTCARD_INVALID_FORMAT;
	else
		result = true;
		
	return result;
}


function IsEmailAddressValid(emailAddress, username, domain, validDomainList, migrationDomain)
{
	var result = true;	

	if ( IsFieldEmpty(emailAddress) == true )		
		result = EMPTY_EMAILADDRESS;
	else if ( IsEmpty(username) == true ) 
		result = EMPTY_USERNAME;
	else if ( IsEmpty(domain) == true )
		result = EMPTY_DOMAIN;	
	else if (migrationDomain != null && migrationDomain != "")
	{	
		if (domain.toLowerCase() == migrationDomain.toLowerCase())
			result = MIGRATION_DOMAIN;
		else if ( (domain != validDomainList[0]) && (domain != validDomainList[1]) )
			result = FORBIDDEN_DOMAIN;
	}
	else if ( (domain != validDomainList[0]) && (domain != validDomainList[1]) )
		result = FORBIDDEN_DOMAIN;
		
	return result;
}

function IsDomainFound(fieldValue)
{
	var userNameParts = fieldValue.split("@");
	
	if (userNameParts.length == 1) return false;	
	if (userNameParts[1].length >= 1) return true;
	
	return false;
}

function IsUserNameValid(fieldName, forbiddenField, regExp, min, max)
{
	var result;
	
	if ( IsFieldEmpty(fieldName) == true )
		result = EMPTY;
	else if (IsDomainFound(fieldName.value) == true)
		result = FORBIDDEN_DOMAIN;
	else if ( IsFieldLegal(fieldName.value, regExp) == false )
		result = ILLEGAL;
	else if ( IsFieldTooShort(fieldName.value, min) == true )
		result = TOO_SHORT;
	else if ( IsFieldTooLong(fieldName.value, max) == true )
		result = TOO_LONG;
	else if ( IsFieldForbidden(fieldName.value, forbiddenField) == true )
		result = FORBIDDEN;
	else
		result = true;
		
	return result;
}

