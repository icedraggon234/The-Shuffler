

import MasterShuffler9000 from "./MasterShuffler9000.mjs";
import { loadHeaderFooter } from "./utils.mjs";

// Load header and footer HTML into the page
loadHeaderFooter();

// YouTube IFrame API callback: initializes the YouTube player
window.onYouTubeIframeAPIReady = function () {
  window.youtubePlayer = new YT.Player("youtube-player", {
    // height: '390',
    // width: '640',
    // videoId: "M7lc1UVf-VE",
    playerVars: {
      playsinline: 1,
      origin: window.location.origin,
    },
    events: {
      onError: embedsNotAllowed,
    }
  });
};

window.embedsNotAllowed = function (e) {
  if (![101, 150].includes(e.data)) return;
  // console.error("Embed for this video is not allowed");
};

// Generate and cue a shuffled playlist when button is clicked
document.getElementById("generate-playlist").addEventListener("click", () => {
  // Retrieve pattern and playlists from localStorage
  const patternData = JSON.parse(localStorage.getItem("pattern"));
  const fullPattern = patternData.fullPattern;
  const playlists = JSON.parse(localStorage.getItem("playlists"));
  const masterShuffler9000 = new MasterShuffler9000();

  // Add each unique playlist to the shuffler
  patternData.uniquePlaylists.forEach(playlistId => {
    const playlist = playlists.find(playlist => playlist.id === playlistId);
    masterShuffler9000.addList(playlist.availableVideoIds, playlistId);
  });

  // Build the key array for shuffling based on the pattern
  const keyArray = fullPattern.map(pattern => {
    const key = {
      list: pattern.playlists.map(playlist => ({ key: playlist.id, count: playlist.count })),
      count: pattern.count
    };
    return key;
  });

  // Shuffle the video IDs according to the pattern
  const shuffledVideoIds = masterShuffler9000.shuffleTogether(
    masterShuffler9000.readKey(keyArray)
  );

  // Cue the shuffled playlist in the YouTube player
  youtubePlayer.cuePlaylist(shuffledVideoIds);
});
