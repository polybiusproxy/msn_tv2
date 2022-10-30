var videoie = PanelManager.Item("mediapanel").Document.parentWindow.videoie;
var persistentProperties = TVShell.Property("Persistent/");

function GetPlayingSongList()
{
	var playlist = videoie ? videoie.currentPlaylist : null;
	
	if (playlist && IsSameURL(videoie.URL, songListUrl)) {
		return playlist;
	}
	return null;
}

function GetSongList()
{
	var playlist = GetPlayingSongList();

	if (!playlist) {
		playlist = TVShell.PlaylistManager.createPlaylist("from Song List", songListUrl);

		if (!playlist.getItemInfo("Title")) {
			playlist.setItemInfo("Title", "Song List");
		}
	}
	
	return playlist;	
}

function IsLoopEnabled()
{
	return (persistentProperties("SongListLoop") == "ON");
}

function IsShuffleEnabled()
{
	return (persistentProperties("SongListShuffle") == "ON");
}
		
