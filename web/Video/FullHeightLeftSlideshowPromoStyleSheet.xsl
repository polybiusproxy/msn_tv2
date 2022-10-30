<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:variable name='uniqueID' select='"@promo::uniqueID@"' />
<xsl:variable name='slides' select="items/item[@type='cinemanow']" />
<xsl:variable name='numSlides' select="count($slides)" />

<xsl:template match="/">
<slides>
<xsl:for-each select="$slides">
<xsl:if test="(position() mod 2) = 1" >
<div>
<table cellspacing='0' cellpadding='0'><tr><td>
<table cellspacing='0' cellpadding='0'>
<tr><td height='10px;' ></td></tr>
<tr><td colspan='2'><span style='behavior:url(#default#gradient); angle:90; startColor:#6e0002; endColor:transparent;width: 238px;height: 26px;'><table cellspacing='0' cellpadding='0'><tr><td style='height: 26px;vertical-align: middle;'><span style='font-family: Segoe TV; font-size: 18px; color: #ebb206;padding-left: 15px;'>Today on CinemaNow</span></td></tr></table></span></td></tr>
</table>
</td></tr>
<tr><td height='10px;' ></td></tr>
<tr><td><table cellspacing='0' cellpadding='0'>
<tr><td>
<xsl:call-template name="videoTemplate">
<xsl:with-param name="index" select="position()" />
<xsl:with-param name="col" select="1" />
</xsl:call-template>
</td><td>
<xsl:call-template name="videoTemplate">
<xsl:with-param name="index" select="(position()+1) mod ($numSlides + 1)" />
<xsl:with-param name="col" select="2" />
</xsl:call-template>
</td></tr>
<tr><td colspan='2' align='left'>
<table cellspacing='0' cellpadding='0'><tr><td><span style='width: 10px;'> </span></td><td><span id='nextBtn' onfocus='{$uniqueID}.hasFocus("nextBtn");' onblur='{$uniqueID}.lostFocus("nextBtn");' onclick='{$uniqueID}.ssInvoke("next");'><table cellspacing='0' cellpadding='0' height='20'><tr><td valign='middle' ><span style='width: 4px;'> </span></td><td><span style='behavior: url(#default#alphaImageLoader); src: url(../Music/Images/NextBtn.png);'></span></td><td valign='middle'><span style='font-family: Segoe TV; font-size: 14px; color: #f5f5f5;padding-left:4;width: 60;'>NEXT</span></td></tr></table></span></td></tr></table>
</td></tr>
</table>
</td></tr></table>
</div>
</xsl:if>
</xsl:for-each>
</slides>
</xsl:template>

<xsl:template name="videoTemplate" match="item">
<xsl:param name="index" />
<xsl:param name="col" />
<div>
  <table cellspacing='0' cellpadding='0' style='padding: 0 0 0 0;' width='115px' height='100%'>
	<tr >
	  <td valign='middle' style='overflow:hidden; height: 128px;width:115px;'
		><span style='padding-left: 15px;'
		><img  src="{$slides[$index]/image/@url}" style='width: 66px; height: 118px;' /></span></td>
	</tr>

    <tr ><td valign='top' align='left'>
	<span  style='height: 84px; width: 115px; overflow: hidden;padding-left: 15px;'
		><span id='promoImage{$col}' onfocus='{$uniqueID}.hasFocus("promoImage{$col}");' onblur='{$uniqueID}.lostFocus("promoImage{$col}");' onclick='{$uniqueID}.fireSlideEvent("GotoURL","{$slides[$index]/articleUrl}");' onreadystatechange='alert("loaded text");'
		><span id='promoTextSpan' style='font-family: Segoe TV; font-size: 18px; color: #c2c2c2;width: 114px;text-overflow: ellipsis;line-height: 18px; text-align: left;overflow: hidden;'
		  ><xsl:value-of select="$slides[$index]/headline" /></span></span></span
	></td>
    </tr>

  </table>
</div>
</xsl:template>


</xsl:stylesheet>


