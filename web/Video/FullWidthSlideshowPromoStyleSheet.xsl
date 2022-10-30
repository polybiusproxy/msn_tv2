<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
<slides>
<xsl:for-each select="items/item">
<xsl:if test="@type='html'">
<div>
     <xsl:apply-templates select="*"/>
</div>
</xsl:if>
<xsl:if test="@type='cinemannow'">
<div >
  <table cellspacing='0' cellpadding='0' style='padding: 0 0 0 0; width: 100%' >
	<tr width='100%'>
	  <td id='pssImg' valign='top' align='center'  style='width: 100%'> 
		<img style='height: 180; width: 240;' src="{image/@url}" />
	  </td>
	</tr>
	<tr  width='100%'>
	  <td id='pssHdr' valign='center' class='promoSlideShowHeader' 
	      style='width: 100%;'>
		<span class='source'><xsl:value-of select="source" /></span><br/>
		 <xsl:value-of select="headline" />
	  </td>
	</tr>
	<tr width='100%'>
	  <td id='pssCaption' style='font-size: 12px; width: 100%;' > 
		Missing the UI spec for the slideshow port.
	  </td>
	</tr>
  </table>
</div>
</xsl:if>
</xsl:for-each>
</slides>
</xsl:template>

<xsl:template match="*">
	<xsl:copy-of select='current()'/>
</xsl:template>

</xsl:stylesheet>

