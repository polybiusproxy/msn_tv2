
function getEscapedChar( s , n )
{
	var ch = s.charAt(n);	// return empty string if  n > length - 1
	if ( ch == '&' )
	{
		var str = s.substr( n , 7 );
		if ( str.lastIndexOf( "&lt;" , 0 ) == 0 ) return "&lt;";
		if ( str.lastIndexOf( "&gt;" , 0 ) == 0 ) return "&gt;";
		if ( str.lastIndexOf( "&amp;" , 0 ) == 0 ) return "&amp;";
		if ( str.lastIndexOf( "&quot;" , 0 ) == 0 ) return "&quot;";
		if ( str.lastIndexOf( "&nbsp;" , 0 ) == 0 ) return "&nbsp;";
	}
	return ch;
}


function AddEmoticon(s)
{
	var i = 0;
	var len = s.length;
	var htmlStr = '';
	var step = 1;
	var strObj = new Object();
	var c2,c3;
	while( i < len )
	{
		strObj.str = getEscapedChar( s , i );
		strObj.linkStr = '';
		switch ( strObj.str )
		{
			case '(':
				strObj = matchType1( s ,  i );
				break;
			case ':':
				strObj = matchType2( s , i );
				break;
			case ';':	// check single case ;-) or ;)
				c2 = s.charAt( i + 1 );
				if ( c2 == ')' )
				{
					strObj.linkStr = 'emwink';
					strObj.str = ";)";
				}
				else
				{
					if ( c2 == '-' && s.charAt( i + 2 ) == ')' )
					{
						strObj.linkStr = 'emwink';
						strObj.str = ";-)";
					}
				}
				break;
			case '8':		// 3 cases handled here
				c2 = s.charAt( i + 1 );
				c3 = s.charAt( i + 2 );
				if ( c2 == '-' )
				{
					if ( c3 == '|' )	// nerd
					{
						strObj.linkStr = 'unsupported';
						strObj.str = "8-|";
					}
					if ( c3 == ')' )
					{
						strObj.linkStr = 'unsupported';
						strObj.str = "8-)";
					}
				}
				if ( ( c2 == 'o' ) && ( c3 == '|' ) )
				{
						strObj.linkStr = 'unsupported';
						strObj.str = "8o|";
				}
				break;
			case '&lt;':	// check for one case
				if ( s.charAt( i+ 4) == ':' && s.charAt( i + 5 ) == 'o' && s.charAt( i + 6 ) == ')' )	// party
				{
						strObj.linkStr = 'unsupported';
						strObj.str = "&lt;:o)";
				}
				break;
			case '|':		// check for one case
				if ( s.charAt( i+ 1) == '-' && s.charAt( i + 2 ) == ')' )	// sleepy
				{
						strObj.linkStr = 'unsupported';
						strObj.str = "|-)";
				}
				break;
			case '*':		// check for one case
				if ( s.charAt( i+ 1) == '-' && s.charAt( i + 2 ) == ')' )	// thinking
				{
						strObj.linkStr = 'unsupported';
						strObj.str = "*-)";
				}
				break;
			case '+':	// check for one case
				if ( s.charAt( i+ 1) == 'o' && s.charAt( i + 2 ) == '(' )	// sick
				{
						strObj.linkStr = 'unsupported';
						strObj.str = "+o(";
				}
				
				break;
			case '^':		// check for one case
				if ( s.charAt( i+ 1) == 'o' && s.charAt( i + 2 ) == ')' )	// sarcastic
				{
						strObj.linkStr = 'unsupported';
						strObj.str = "^o)";
				}
				break;
			case '':
			default:
				break;
		}
		if(strObj.linkStr !='')
		{
			TVShell.Message( "Emoticon: " + strObj.linkStr + "  :  " + strObj.str );
			if ( strObj.linkStr == 'unsupported' )
				htmlStr += strObj.str;
			else
				htmlStr += '<img src="emoticon/'+ strObj.linkStr + '.gif" height=22 width=22 border=0>';
			i += strObj.str.length;
		} else
		{
			htmlStr += strObj.str;
			i  += strObj.str.length;
		}
	}
	return htmlStr;
}

// emoticons of the form (x) or (xx)
// called if s[i] == '('
function matchType1( s  , i )
{
	var strObj = new Object();
	strObj.str = '(';
	strObj.linkStr = '';
	var b = getEscapedChar( s , i + 1 );
	if ( b == '' ) return strObj;
	var c = getEscapedChar( s , i + 1 + b.length );
	if ( c == '' ) return strObj;
	var match;

	if ( c == ')' )		// of the form (x)
	{
	switch(b) {
		case 'Y':
		case 'y':
			 strObj.linkStr='emthup';
			 break;
		case 'N':
		case 'n':
			 strObj.linkStr='emthdown';
			 break;
		case 'B':
		case 'b':
			 strObj.linkStr='embeer';
			 break;
		case 'D':
		case 'd':
			 strObj.linkStr='emcocktl';
			 break;
		case 'X':
		case 'x':
			 strObj.linkStr='emgirl';
			 break;
		case 'Z':
		case 'z':
			 strObj.linkStr='emboy';
			 break;
		case '6':
			 strObj.linkStr='emdevil';
			 break;
		case '}':
			 strObj.linkStr='emhugr';
			 break;
		case '{':
			 strObj.linkStr='emhugl';
			 break;
		case 'H':
		case 'h':
			 strObj.linkStr='emshades';
			 break;
		case 'A':
		case 'a':
			 strObj.linkStr='emangel';
			 break;
		case 'L':
		case 'l':
			 strObj.linkStr='emlove';
			 break;
		case 'U':
		case 'u':
			 strObj.linkStr='emunlove';
			 break;
		case 'K':
		case 'k':
			 strObj.linkStr='emlips';
			 break;
		case 'G':
		case 'g':
			 strObj.linkStr='emgift';
			 break;
		case 'F':
		case 'f':
			 strObj.linkStr='emrose';
			 break;
		case 'W':
		case 'w':
			 strObj.linkStr='emwilt';
			 break;
		case 'P':
		case 'p':
			 strObj.linkStr='emphoto';
			 break;
		case '~':
			 strObj.linkStr='emfilm';
			 break;
		case 'T':
		case 't':
			 strObj.linkStr='emphone';
			 break;
		case '@':
			 strObj.linkStr='emcat';
			 break;
		case '&amp;':
			 strObj.linkStr='emdog';
			 break;
		case 'C':
		case 'c':
			 strObj.linkStr='emcup';
			 break;
		case 'I':
		case 'i':
			 strObj.linkStr='embulb';
			 break;
		case 'S':
			 strObj.linkStr='emsleep';
			 break;
		case '*':
			 strObj.linkStr='emstar';
			 break;
		case '8':
			 strObj.linkStr='emnote';
			 break;
		case 'E':
		case 'e':
			 strObj.linkStr='ememail';
			 break;
		case '^':
			 strObj.linkStr='emcake';
			 break;
		case 'O':
		case 'o':
			 strObj.linkStr='emclock';
			 break;
		case 'M':
		case 'm':
			 strObj.linkStr='emmessag';
			 break;
		default:
			 strObj.linkStr = '';
			 break;
		}
		if ( strObj.linkStr == '' )
			strObj.str = '(';
		else
			strObj.str = '(' + b + ')';
		return strObj;
	}

	// check for the form (xx)
	var d = getEscapedChar( s , i + 1 + b.length + c.length );
	if ( d == ')' )
	{
	 match = b + c;
	switch( match )
	{
		case 'sn':	// snail
		case 'pl':		// plate
		case 'pi':		// pizza
		case 'au':	// auto
		case 'um':	// umbrella
		case 'co':	// computer
		case 'st':		// stormy
		case 'mo':	// money
		case '||':	// bowl
		case 'so':	// soccer ball
		case 'ap':	// airplane
		case 'ip':		// island 
		case 'mp':	// mobile phone
		case 'li':		// lightning
			strObj.linkStr = 'unsupported';
			break;
		default:
			strObj.linkStr = '';
			break;
	}

	if ( strObj.linkStr == '' )
		strObj.str = '(';
	else
		strObj.str = '(' + match + ')';

	return strObj;
	}

	var e = getEscapedChar( s , i + 1 + b.length + c.length + d.length );
	if ( e == ')' )
	{
		match = b + c + d;
		switch ( match )
		{
			case 'bah':		// sheep
				strObj.linkStr = 'unsupported';
				break;
			default:
				strObj.linkStr = '';
				break;
		}
	}

	if ( strObj.linkStr == '' )
		strObj.str = '(';
	else
		strObj.str = '(' + match + ')';
	return strObj;
	
}


// these emoticons start with ':'
function matchType2( s , i )
{
	var strObj = new Object();
	strObj.str = ':';
	strObj.linkStr = '';
	var b = getEscapedChar( s , i + 1 );
	var match;
	if ( b == '' ) return strObj;

	// first check 2 character versions :x
	switch( b )
	{
		case '[':
			strObj.linkStr = 'emvamp';
			break;
		case ')':
			strObj.linkStr = 'emsmile';
			break;
		case 'd':
		case 'D':
			strObj.linkStr = 'emsmiled';
			break;
		case 'o':
		case 'O':
			strObj.linkStr = 'emsmileo';
			break;
		case 'p':
		case 'P':
			strObj.linkStr = 'emsmilep';
			break;
		case '(':
			strObj.linkStr = 'emsad';
			break;
		case 's':
		case 'S':
			strObj.linkStr = 'emconfused';
			break;
		case '|':
			strObj.linkStr = 'emdgust';
			break;
		case '$':
			strObj.linkStr = 'emblush';
			break;
		case '@':
			strObj.linkStr = 'emangry';
			break;
		default:
			break;
	}

	if ( strObj.linkStr != '' )
	{
		strObj.str = ':' + b;
		return strObj;
	}

	// check 3 character versions
	var c = getEscapedChar( s , i + 2 );
	if ( c == '' ) return strObj;
	match = b + c;
	switch( match )
	{
		case '-[':
			strObj.linkStr = 'emvamp';
			break;
		case '-)':
			strObj.linkStr = 'emsmile';
			break;
		case '-D':
		case '-d':
			strObj.linkStr = 'emsmiled';
			break;
		case '-O':
		case '-o':
			strObj.linkStr = 'emsmileo';
			break;
		case '-P':
		case '-p':
			strObj.linkStr = 'emsmilep';
			break;
		case '-(':
			strObj.linkStr = 'emsad';
			break;
		case '-S':
		case '-s':
			strObj.linkStr = 'emconfused';
			break;
		case '-|':
			strObj.linkStr = 'emdgust';
			break;
		case '-$':
			strObj.linkStr = 'emblush';
			break;
		case '-@':
			strObj.linkStr = 'emangry';
			break;
		case "'(":
			strObj.linkStr = 'emcry';
			break;
		case "-#":	// don't tell
		case "-*":	// secret
		case "^)":	// don't know
			strObj.linkStr = 'unsupported';
			break;
		default:
			break;
	
	}
	
	if ( strObj.linkStr != '' )	strObj.str = ':' + match;
	return strObj;

}


