//+--------------------------------------------------
//
//  Find dialog header file. This file contains functions
//  common to the find.htm
//
//---------------------------------------------------


var targetWindowOfDocument;
var targetDocument;
var txtFindText;
var g_countFound=0;    

//+----------------------------------------------------------------------
//
//  Synopsis:   Returns a range based on elm
//
//  Arguments:  elm     An element
//
//  Returns:    a text range
//
//-----------------------------------------------------------------------

function getTextRange(elm)
{
    var r = elm.parentTextEdit.createTextRange();
    r.moveToElementText(elm);
    return r;
}   //  getTextRange


//+-------------------------------------------------------------------
//
//  Synopsis:   Turns off error messages in dialogs
//
//  Arguments:  none
//
//  returns:    true (tells browser not to handle message)
//
//--------------------------------------------------------------------

function HandleError(message, url, line)
{
    var str = L_Dialog_ErrorMessage + "\n\n" 
        + L_ErrorNumber_Text + line + "\n"
        + message;

    alert (str);

    return true;
}



//
//  global variables
//
var g_docLastFound;  // the document we last searched through
var g_fFrameset = false;    // Are we in a frameset?
var g_arrFrames = new Array();  // Array of path through framesets
var g_fSearchTopFrame = false;   // Should we search the doc of
                                // the top frame? 
var g_fFollowIframes = true;     // Should we walk down iframes?
var g_fError = false;   // Has a handled error occured?

var g_docSearch ; 
    
var g_rngWorking;          //  The range we're going to search
var g_rngFoundText;        //  The found text
var g_fFoundText = false;  //  If the text has already been found
var g_intDirection;        //  What direction to search
var MAX_SHOW_LENGTH=25;
//+-------------------------------------------------------------------
//
//  Synopsis:   Turns off error messages in dialogs
//
//  Arguments:  none
//
//  returns:    true (tells browser not to handle message)
//
//--------------------------------------------------------------------

function FindHandleError(message, url, line)
{
    //  NOTE TO LOCALIZERS! (krisma) The next two strings must exactly match
    //  the error text that appears if you comment out the 
    //  "window.onerror = FindHandleError;" line in loadBdy() and
    //  show the find dialog.

    var L_Find_DIALOG_NoAction_ErrorMessage = "Object doesn't support this action";
    var L_Find_DIALOG_NoProperty_ErrorMessage = "Object doesn't support this property or method";

    if (message != L_Find_DIALOG_NoProperty_ErrorMessage)
    {
        if (message != L_Find_DIALOG_NoAction_ErrorMessage)
        {
            var str = L_Dialog_ErrorMessage + "\n\n" 
                + L_ErrorNumber_Text + line + "\n"
                + message;

            alert (str);
        }
        else // We've got an iframe without trident.
        {
            g_fError = true;
            g_fFrameset = false;
        }
    }
    return true;
}

//
//  Frameset navigation functions
//

//+---------------------------------------------------------------------
//
//  Synopsis:   Follows the path in g_arrFrames
//
//  Arguments:  none
//
//  Returns:    document of frame object at end of frameset path
//
//----------------------------------------------------------------------

function CrawlPath()
{
    var doc = targetDocument;
    var i = 0;

    //
    //  Special case if top doc has iframe
    //
    if (g_fSearchTopFrame)
    {
        return doc;
    }

    while (g_arrFrames[i] >= 0)
    {
        doc = TVShell.PanelManager.GetChildFrameDoc(doc,g_arrFrames[i]);
        i++;
    }
    return doc;
}   //  CrawlPath


//+---------------------------------------------------------------------
//
//  Synopsis:   Whether or not the end of the current path is
//              at another frameset
//
//  Arguments:  none
//
//  Returns:    0 if false, non-zero if true
//
//----------------------------------------------------------------------

function AtFrameset()
{
    var doc = CrawlPath();
    if(doc)
       return doc.frames.length;
	else return 0;
}   //  AtFrameset


//+---------------------------------------------------------------------
//
//  Synopsis:   Whether or not the end of the current path is
//              at a document with iframes
//
//  Arguments:  none
//
//  Returns:    0 if false, non-zero if true
//
//----------------------------------------------------------------------

function AtIframe()
{
    var doc = CrawlPath();
	if(doc)
      return doc.all.tags("IFRAME").length;
	else 
	  return 0;
}   //  AtIFrame


//+---------------------------------------------------------------------
//
//  Synopsis:   checks the extension of the current file against 
//              a list of file types we should search into
//
//  Arguments:  the window that contains the file we're checkin
//
//  Returns:    true if we can search it, false if we can't.
//
//----------------------------------------------------------------------

function IsLegalPage(win)
{
/*    var arrBadFileTypes = new Array(".doc", ".xls", ".pdf");
    var strHref = win.location.href;

    for (i=0; i < arrBadFileTypes.length; i++)
    {
        if (strHref.lastIndexOf(arrBadFileTypes[i]) == (strHref.length  - 4))
        {
            return false;
        }
    }*/
    return true;
}


//+---------------------------------------------------------------------
//
//  Synopsis:   gets the position in the current frameset
//
//  Arguments:  none
//
//  Returns:    0-based integer representing position
//
//----------------------------------------------------------------------

function GetCurrentPos()
{
    var i = GetCurrentDepth();

    return g_arrFrames[i];
}   //  GetCurrentPos


//+---------------------------------------------------------------------
//
//  Synopsis:   Tells how many frames deep we're currently at
//
//  Arguments:  none
//
//  Returns:    0-based integer representing depth
//
//----------------------------------------------------------------------

function GetCurrentDepth()
{
    var i = 0;

    while (g_arrFrames[i] >= 0)
    {
        i++;
    }

    return i-1;

}   //  GetCurrentDepth


//+---------------------------------------------------------------------
//
//  Synopsis:   Can we move forward in the current frameset?
//
//  Arguments:  fForward    Whether we're trying to move forwards or
//                          backwards
//
//  Returns:    0 if false, non-zero if true
//
//----------------------------------------------------------------------

function MovePossible(fForward)
{
    var intCurPos = GetCurrentPos();
    var doc = CrawlPath();
    if(!doc)
	   return false;
	  
	var winParent = doc.parentWindow.parent;

    if (fForward)
    {
        if ((winParent.frames.length - intCurPos - 1)
         //   && (IsLegalPage(TVShell.PanelManager.GetChildFrameDoc(winParent.document,intCurPos + 1)))
			)
        {
            return true;
        }
        else
        {
            return false;
        }
    }
    else
    {
        return (intCurPos != 0);
    }

}   //  MovePossible


//+---------------------------------------------------------------------
//
//  Synopsis:   Moves up in the frameset
//
//  Arguments:  none
//
//  Returns:    nothing
//
//----------------------------------------------------------------------

function MoveUpFrameset()
{
    var i = GetCurrentDepth();
    g_arrFrames[i] = -1;
}   //  MoveUpFrameset


//+---------------------------------------------------------------------
//
//  Synopsis:   Moves down in the frameset
//
//  Arguments:  fForward    Whether we're trying to move forwards or 
//                          backwards
//
//  Returns:    nothing
//
//----------------------------------------------------------------------

function MoveDownFrameset(fForward)
{
    var i = GetCurrentDepth();
    var doc = CrawlPath();

    g_arrFrames[i+1] = fForward ? 0 : doc.frames.length - 1;
    g_arrFrames[i+2] = -1;

}   //  MoveDownFrameset


//+---------------------------------------------------------------------
//
//  Synopsis:   moves one window in the current frameset
//
//  Arguments:  fForward    Whether we're trying to move forwards or
//                          backwards
//
//  Returns:    nothing
//
//----------------------------------------------------------------------

function MoveWin(fForward)
{
    var intDepth = GetCurrentDepth();
    var intPos = GetCurrentPos();

    g_arrFrames[intDepth] = fForward ? ++intPos : --intPos;

}   //  MoveWin


//+---------------------------------------------------------------------
//
//  Synopsis:   Moves to the next document
//
//  Arguments:  fForward    Whether we're trying to move forwards or
//                          backwards
//
//  Returns:    true if sucessful or false if fails
//
//----------------------------------------------------------------------

function MoveDoc(fForward)
{
    //
    //  Special case of top document contains an iframe.
    //

    if (g_fSearchTopFrame)  // special case forward
    { 
        if (fForward)
        {
            g_fSearchTopFrame = false;
		//	g_fFrameset=false;
            return true;
        }
        else
        {
            return false;
        }
    }
    //  special case backwards
    if (!fForward && (g_arrFrames[0] == 0) && (g_arrFrames[1] < 0)
        && targetDocument.all.tags("IFRAME").length)
    {
        g_fSearchTopFrame = true;
        return true;
    }

    if (g_fFollowIframes && AtIframe())
    {

        MoveDownFrameset(fForward);

        while (!AtIframe() && AtFrameset())
        {
            MoveDownFrameset(fForward);
            return true;
        }

        return false;
    }
    
	if (MovePossible(fForward))
    {
	    
		MoveWin(fForward);
        g_fFollowIframes = true;
        
        while (!AtIframe() && AtFrameset())
        {
            MoveDownFrameset(fForward);
        }

        return true;
    }
    else
    {
	    if (GetCurrentDepth() > 0)
        {
            MoveUpFrameset();

            while (AtIframe() && !MovePossible(fForward)
                && (GetCurrentDepth() >= 0))
            {
                MoveUpFrameset();
            }

            if (AtIframe() && MovePossible(fForward))
            {
                g_fFollowIframes = false;
            }

            return MoveDoc(fForward);
        }
    }

    return false;

}   //  MoveDoc


//+---------------------------------------------------------------------
//
//  Synopsis:   walks to first document
//
//  Arguments:  none
//
//  Returns:    document object
//
//----------------------------------------------------------------------

function GetFirstDoc()
{
    var doc = targetDocument;

    //
    //  If the main document conttains an iframe, we need to special
    //  case it.
    //
    if (doc.all.tags("IFRAME").length)
    {
        g_fSearchTopFrame = true;
        return doc;
    }

    while (!AtIframe() && AtFrameset())
    {
        MoveDownFrameset(true);
    }

    doc = CrawlPath();
    return doc;

}   //  GetFirstDoc


//+---------------------------------------------------------------------
//  
//  Set the initial range to the entire document or the selection
//
//  Arguments:  none
//
//  Returns:    nothing
//
//-----------------------------------------------------------------------

function setInitSearchRng()
{
    //
    // Determine starting location
    //
    findStartPoint();
    //
    //  Are we in a frameset?
    //

    if (g_fFrameset)
    {
        var doc;
        //
        //  Check to see if we're still in a frameset. 
        //  (This could happen if there's a frameset in an 
        //  inline frame.)
        //
        if (!AtIframe() && AtFrameset())
        {
            MoveDownFrameset(!radDirection[0].checked);

            while (!AtIframe() && AtFrameset())
            {
                MoveDownFrameset(!radDirection[0].checked);
            }
        }
        
        doc = CrawlPath();
        g_docSearch  = doc;
    }
    else
    {
        g_docSearch  = targetDocument;
    }
    
	if(!g_docSearch)
	   g_docSearch  = targetDocument;
    //
    //  If we're in browse mode and nothing is selected, 
    //  set the range to the entire body.
    //

    if (g_docSearch .queryCommandState("BrowseMode")
        && g_docSearch .selection.type != "Text")
    {
        if (g_docSearch .body == null)
            return;
         g_rngWorking = g_docSearch .body.createTextRange();
    }
    else
    {
        try
		{  
		  g_rngWorking = g_docSearch .selection.createRange();
		}
		catch(exception)
		{
           return false;
		}
    }

	return true;
}   // setInitSearchRng

//+---------------------------------------------------------------------
//
//  Set direction and adjust range
//
//  Arguments:  none
//
//  Returns:    nothing
//
//-----------------------------------------------------------------------

function directionAdjust()
{
    //
    //  If there's a current selection, we'll start from the 
    //  selection
    //
    g_fFoundText = (g_docSearch .selection.type == "Text");

    //
    //  rngWorking starts as the entire body, and is then narrowed
    //  down by the 'set direction' code.
    //

    //
    //  Set direction
    //
    if (radDirection[0].checked)    //  Search backwards
    {
        //
        //  set range to search
        //
        if (g_fFoundText)
        {
            //
            //  Search from the end of the current selection
            //  minus 1 so we don't find the text we just found
            //
            g_rngWorking.moveEnd("character" , -1);
        }
        //
        //  Move the beginning of the range to the beginning 
        //  of the document
        //
        //  This use to move one character at a time, but since it 
        //  will move as many characters as possible, it is more 
        //  efficient to move in big jumps.
        //
        while (0 != g_rngWorking.moveStart("textedit", -10000))
        {
        }
                
        g_intDirection = -1000000000;
    }
    else                            //  Search forwards
    {
        //
        //  set range to search
        //
        if (g_fFoundText)
        {
            //
            //  Search from the start of the current selection plus
            //  one so we don't find the text we just found
            //
            g_rngWorking.moveStart("character", 1);
        }

        //
        //  Move the end of the range to the end
        //  of the document
        //
        //
        //  This use to move one character at a time, but since it 
        //  will move as many characters as possible, it is more 
        //  efficient to move in big jumps.
        //
        while (0 != g_rngWorking.moveEnd("textedit", 10000))
        {
        }

        g_intDirection = 1000000000; 
    }
}

//+---------------------------------------------------------------------
//
//  Synopsis:   Three steps:
//              1. Make sure there's something to find.
//              2. Determine the direction and how far to search.
//              3. Find and select the text.
//
//  Arguments:  none
//
//  Returns:    nothing
//
//-----------------------------------------------------------------------
function DoSearchAgain()
{
  DoSearch();
}

function DoSearch()
{
    var fDone = false;
    var L_FinishedDocument_Text = "Finished searching the document.";

    var index;

    //
    // Initial range is the entire document or the selection
    //
    if(setInitSearchRng())
    {
		//
		// Set direction and adjust range based on direction
		//
		directionAdjust();
      
		//
		// We have to loop, because findText includes text that may be hidden.
		//
 
		g_rngFoundText = g_rngWorking.duplicate();
    
		success = g_rngFoundText.findText(txtFindText.value, 
										  g_intDirection, 
										  findFlags());
	}
	else
	    success=false;

    while ((!fDone) && success)
    {
        fDone = true;
       
        //
        // Using try catch on select, because selecting invisible text 
        // results in an exception.
        //
        
        try
        {
           g_rngFoundText.select();
		   btnFind.label="Find Next";
           CheckForLink();

        }
        catch (exception)
        {        
            if (g_intDirection == 1000000000) // forward
            {
                g_rngFoundText.moveStart("character" , 1);
             
                while (0 != g_rngFoundText.moveEnd("textedit", 10000))
                {
				}                                           
            }
            else
            {
                g_rngFoundText.moveEnd("character" , -1);
             
                while (0 != g_rngFoundText.moveStart("textedit", -10000))
                {
				}
            }

           fDone = false;
           
           success = g_rngFoundText.findText(txtFindText.value, 
                                             g_intDirection, 
                                             findFlags());
        }
       
    }
   
 
    if (!success)   //  Text was not found
    {

        if (g_fFrameset)
        {   
            if (MoveDoc(!radDirection[0].checked))
            {

                DoSearchAgain();

                return;
            }

        }
       

		TVShell.DeviceControl.PlaySound("Word_NotFound",1); //SND_ASYNC  =    0x00000001

		btnFind.label="Continue";
		btnFind.style.display="none";
   
		if(g_fFoundText && g_targetChanged==false){	
	      messageTD.innerHTML="Finished searching the page. Choose <b>New word</b> to look for another word or phrase."
		  if(document.all.radDirectionUp.checked){
		      btnPrevious.style.display="none";
		      if(g_countFound>1){
				  btnFind.style.display="inline-block";
				  btnFind.label="Find Next";
			  }
			  else{
				  btnFind.style.display="none";
			  }
		  }
		  else{
			  if(g_countFound>1){		      
				  btnPrevious.style.display="inline-block";
			  }
			  else{
				  btnPrevious.style.display="none";
			  }
		  	  btnFind.style.display="none";
		  }
		}
		else{

		  if(g_countFound>=1){
		   	   messageTD.innerHTML="Finished searching the page.  Choose <b>New word</b> to look for another word or phrase."

		  }
		  else {
			  messageTD.innerHTML="\"<span id=searchedText ></span>\" was not found on this page. To try again or look for a different word, choose <b>New word<b> ."
			  var txtShown=txtFindText.value;
			 
			  
			  if(txtShown.length>MAX_SHOW_LENGTH)
			  {
			   txtShown=txtShown.substr(0,MAX_SHOW_LENGTH);
			   txtShown=txtShown+"...";
			  }


			  searchedText.innerText=txtShown;

   

		  }



		  if(g_docLastFound)
		     g_docLastFound.selection.empty();
		  if(g_docSearch)
		     g_docSearch.selection.empty();
		  g_targetChanged=false;
		  btnPrevious.style.display="None";

		}
		 
 		txtFindText.style.display="none";

		btnNewWord.style.display="inline-block";

        btnNewWord.focus();
		btnCancel.label="Done";

    }
    else                        //  Text was found
    {
		TVShell.DeviceControl.PlaySound("Word_Found",1); //SND_ASYNC  =    0x00000001
        //
        //  If we're in a frameset, we have to unselect 
        //  the previously searched document
        //

        if (g_fFrameset)
        {
            g_docLastFound.selection.empty();
            g_docLastFound = g_docSearch ;
        }


        g_rngFoundText.select();
        g_rngFoundText.scrollIntoView(true);
		CheckForLink();
		
		if(document.all.radDirectionUp.checked){ //for searching up
			 if(g_targetChanged)
			 {
			   //first time found the text
			   btnFind.style.display="none";
			   btnPrevious.style.display="inline-block";
			   g_countFound=1;
			 }
			 else{
			   btnPrevious.style.display="inline-block";
			   btnFind.style.display="inline-block";
			   btnFind.label="Find Next";
			   g_countFound++;
			 }
			 btnPrevious.focus();

		}
		else{ // for searching down

			 if(g_targetChanged)
			 {
			   //first time found the text
			   btnPrevious.style.display="none";
			   g_countFound=1;
			 }
			 else{
			   btnPrevious.style.display="inline-block";
			   g_countFound++;
			 }
		 
			 btnFind.style.display="inline-block";
			 btnFind.label="Find Next";
			 btnFind.focus();
		}

        btnCancel.label="Done";
		btnNewWord.style.display="inline-block";
		txtFindText.style.display="none";
		messageTD.innerHTML="\"<span id=searchedText ></span>\" is highlighted above. Choose <b>Find next</b> to continue looking on this page."
        var txtShown=txtFindText.value;
		if(txtShown.length>MAX_SHOW_LENGTH)
		{
		   txtShown=txtShown.substr(0,MAX_SHOW_LENGTH);
		   txtShown=txtShown+"...";
		}
		searchedText.innerText=txtShown;
		g_targetChanged=false;
    }


}   //  DoSearch



//+---------------------------------------------------------------------
//
//  Synopsis:   Checks the status of the appropriate checkboxes and
//              sets the flags for the findText method.
//
//  Arguments:  none
//
//  returns:    a number representing the flags for the findText
//              method. (See OM spec for more info.)
//
//----------------------------------------------------------------------

function findFlags()
{
    var htmlMatchWord = 2;
    var htmlMatchCase = 4;
    var htmlMatchDiacritic =  536870912; // 0x20000000 FR_MATCHDIAC
    var htmlMatchKashida =   1073741824; // 0x40000000 FR_MATCHKASHIDA
    var htmlMatchAlefHamza = 2147483648; // 0x80000000 FR_MATCHALEFHAMZA

 
    return (htmlMatchWord * document.all.chkWholeWord.checked)|(htmlMatchCase * document.all.chkMatchCase.checked)| htmlMatchDiacritic | htmlMatchKashida | htmlMatchAlefHamza;
} // findFlags


//+---------------------------------------------------------------------
//
//  Synopsis:   Sets the focus to the find button. Also determines
//              whether something is selected in the document.
//
//  Arguments:  none
//
//  Returns:    nothing
//
//-----------------------------------------------------------------------


function findStartPoint()
{

    if (g_fFindStartPoint)
    {

        g_fFindStartPoint = false;

    	var win = targetWindowOfDocument;
    	var doc = targetDocument;

        //
        //  Are we in a frameset?
        //

        if (!g_fError && win.frames.length)
        {
            var doc2;

            g_fFrameset = true;
            g_arrFrames[0] = 0;
            g_arrFrames[1] = -1;

            //
            //  Search through the frameset for a selection
            //
            doc2 = CrawlPath();
            
			// the find dialog gets it's own error handler
            // until while we're not sure if the iframe
            // is hosting trident. (It could host Word, 
            // explorer, etc.)
            window.onerror = FindHandleError;

            window.onerror = HandleError;
               
            while (doc2 && doc2.selection.type == "None")
            {
                if (MoveDoc(true))
                {
                    doc2 = CrawlPath();
                }
                else    // no selection. reset search
                {
                    g_arrFrames[0] = 0;
                    g_arrFrames[1] = -1;
                    break;
                }
            }
            doc = GetFirstDoc();
            g_docLastFound = doc;
        }

        //
        //  if a control is selected, select it as a text range
		
        //
        if (doc.selection.type == "Control")
        {
           var r = doc.selection.createRange();
            r = getTextRange(r(0));
            r.select();
        }
    }
} //  findStartPoint


function CheckForLink()
{
   
   
   var parent=g_rngFoundText.parentElement();
   while(parent)
   {
     if(parent.tagName=="a"||parent.tagName=="A")
	 {
         parent.setActive();
		 break;
	 }
	 parent=parent.parentElement;
   }

}