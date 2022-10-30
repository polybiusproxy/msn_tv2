<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:variable name='uniqueID' select='"@promo::uniqueID@"' />

<xsl:template match="/">
<slides>
<xsl:for-each select="items/item">

<xsl:if test="@type='MSNVideo'">
<div focusId="promoLink" onclick="{$uniqueID}.fireSlideEvent('ShowVideo','{@videoGuid}');">
  <table cellspacing='0' cellpadding='0' style='padding: 0 0 0 0;' width='100%' height='100%'>
	<tr width='100%'>
	  <td colspan='3' style='width: 100%;' align='center'
	   ><span style='font-family: Segoe TV; font-size: 18px; color: #c2c2c5;'
	   >Today on MSN Video</span></td>
	</tr>
    <tr><td colspan='3' style='height: 8px;' > </td></tr>
	<tr>
	  <td style='width: 107px;' align='center' valign='top'
	   ><span style='padding-left: 15px;
		   font-family: Segoe TV; font-size: 18px; color: #f5f5f5;'
	    ><img src="{image/@url}" /></span></td>
	  <td><span style='width: 6px;'></span></td>
	  <td align='left' style='width: 127px;'  valign='top'
	    ><xsl:value-of select="headline" /></td>
	</tr>
  </table>
</div>
</xsl:if>

<!-- Offline format -->
<xsl:if test="@type='video'">
<div focusId="promoLink" onclick="{$uniqueID}.fireSlideEvent('ShowVideo','{@videoGuid}');">
  <table cellspacing='0' cellpadding='0' style='padding: 0 0 0 0;' width='100%' height='100%'>
	<tr width='100%'>
	  <td colspan='3' style='width: 100%;' align='center'
	   ><span style='font-family: Segoe TV; font-size: 18px; color: #c2c2c5;'
	   >Today on MSN Video</span></td>
	</tr>
    <tr><td colspan='3' style='height: 8px;' > </td></tr>
	<tr>
	  <td style='width: 107px;' align='center' valign='top'
	   ><span style='padding-left: 15px;
		   font-family: Segoe TV; font-size: 18px; color: #f5f5f5;'
	    ><img src="{image/@url}" /></span></td>
	  <td><span style='width: 6px;'></span></td>
	  <td align='left' style='width: 127px;'  valign='top'
	    ><xsl:value-of select="headline" /></td>
	</tr>
  </table>
</div>
</xsl:if>

</xsl:for-each>
</slides>
</xsl:template>

</xsl:stylesheet>

