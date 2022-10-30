<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:variable name='uniqueID' select='"@promo::uniqueID@"' />

<xsl:template match="/">
<slides>
<xsl:for-each select="items/item">

<xsl:if test="@type='cinemanow'">
<div>
<table cellspacing='0' cellpadding='0' width='240px;'>
    <tr><td colspan='2'><span style='behavior:url(#default#gradient); angle:90; startColor:#6e0002; endColor:transparent;width: 238px;height: 26px;'><table cellspacing='0' cellpadding='0'><tr><td style='height: 26px;vertical-align: middle;'><span style='font-family: Segoe TV; font-size: 18px; color: #ebb602;padding-left: 15px;'>Today on CinemaNow</span></td></tr></table></span></td></tr>
	<tr><td colspan='2' style='height: 6.5px;'> </td></tr>
	<tr>
	  <td valign='top' border='0'  style='height: 120;'
		> <span style='padding-left: 15px;'
		><img src="{image/@url}" style='border: 0; margin: 0; width: 66px; height: 118px;' /></span></td>
	  <td valign='center'>
	  <table cellspacing='0' cellpadding='0' 
     	style='padding: 0 0 0 0; width: 142px;
	           height: 148px;' 
		 >
      <tr><td style='height: 3;' ></td></tr>
	  <tr><td valign='top' align='left' style='height: 80px;'><span id='promoImage' style='width: 148px; overflow:none;' onfocus='{$uniqueID}.hasFocus("promoImage");' onblur='{$uniqueID}.lostFocus("promoImage");' onclick='{$uniqueID}.fireSlideEvent("GotoURL","{articleUrl}");' 
		><span  id='promoTextSpan' style='font-family: Segoe TV; font-size: 18px; color: #f5f5f5;text-overflow: ellipsis;line-height: 18px; text-align: left;overflow: hidden;'
		 ><xsl:value-of select="headline" /></span></span></td></tr>
      <tr><td style='height: 10;' ></td></tr>
	  <tr><td valign='top' align='left' 
		><span id='nextBtn'  onfocus='{$uniqueID}.hasFocus("nextBtn");' onblur='{$uniqueID}.lostFocus("nextBtn");' onclick='{$uniqueID}.ssInvoke("next");'><table cellspacing='0' cellpadding='0' height='20'><tr><td  valign='middle' ><span style='behavior: url(#default#alphaImageLoader); src: url(../Music/Images/NextBtn.png);'></span></td><td valign='middle'><span style='font-family: Segoe TV; font-size: 14px; color: #f5f5f5;padding-left:4;width: 50;'>NEXT</span></td></tr></table></span></td></tr>
	  </table>
	  </td>
	</tr>
  </table>
</div>
</xsl:if>

</xsl:for-each>
</slides>
</xsl:template>

</xsl:stylesheet>

