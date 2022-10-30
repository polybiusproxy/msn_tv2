<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:variable name='uniqueID' select='"@promo::uniqueID@"' />

<xsl:template match="/">
<slides>
<xsl:for-each select="items/itemgroup">
	<xsl:if test="@type='feed'">
		<div style="height:100%; overflow:hidden; background-image:url(msntv:/Music/Images/MusicQuickPlayMusicVideos.jpg); background-position:-15px -15px;" promoHeadingLabel="Music News">
			<div class="promoHeading">
				Music News
			</div>
			<xsl:for-each select="item">
				<xsl:variable name="url"><xsl:value-of select="url" /></xsl:variable>
				<div class="promoText" style="height:36px; margin:0px 15px 12px 0px; overflow:hidden;" id='promoLink' onfocus='{$uniqueID}.hasFocus("promoLink");' onblur='{$uniqueID}.lostFocus("promoLink");' onclick="GotoURL('{$url}');">
					<xsl:value-of select="title" />
				</div>
			</xsl:for-each>
		</div>
	</xsl:if>
	<xsl:if test="@type='MSNVideo'">
		<div style="height:100%; overflow:hidden; background-image:url(msntv:/Music/Images/MusicQuickPlayMusicVideos.jpg); background-position:-15px -15px;" promoHeadingLabel="Music Videos">
			<div class="promoHeading">
				Music Videos
			</div>
			<xsl:for-each select="item">
				<xsl:variable name="topic"><xsl:value-of select="Topic" /></xsl:variable>
				<xsl:variable name="category"><xsl:value-of select="Category" /></xsl:variable>
				<div style="height:69px; margin:0px 6px 5px 0px; overflow:hidden;" id='promoLink' onfocus='{$uniqueID}.hasFocus("promoLink");' onblur='{$uniqueID}.lostFocus("promoLink");' onclick="ShowVideo('{@videoGuid}', '{$topic}', '{$category}');">
					<table cellspacing="0" cellpadding="0">
						<tr>
							<td style="vertical-align:top;"> 
								<img style="width:92px; height:69px;" src="{image/@url}" />
							</td>
							<td class="promoText" style="width:100%; vertical-align:top; padding-left:11px;">
								<div style="width:100%; height:54px; overflow:hidden;" >
									<xsl:value-of select="headline" />
								</div>
							</td>
						</tr>
					</table>
				</div>
			</xsl:for-each>
		</div>
	</xsl:if>
</xsl:for-each>
</slides>
</xsl:template>

</xsl:stylesheet>
