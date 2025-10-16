

import { selectRandomItemFromList } from "./utils.mjs";

// YouTube Data API key
const apiKey = "AIzaSyBatW8pONugOg_NS9MNkOAdygKT3w2nF-0";

// Playlist class for fetching and managing YouTube playlist data
export default class Playlist {
    constructor(playlistId) {
        // Store the playlist ID
        this.playlistId = playlistId;
    }

    // Initialize the playlist: fetch all data and prepare a lightweight object
    async init() {
        await this.getFullPlaylist(); // Fetch all pages of playlist data
        this.filterVideoList(); // Filter out unavailable/private videos
        this.availableVideoIds = this.availableVideoData.map(
            video => video.snippet.resourceId.videoId
        );
        // Fetch playlist metadata
        this.playlistMetaData = await fetch(
            `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${this.playlistId}&key=${apiKey}`
        ).then(res => res.json());
        // Prepare a lightweight object for UI and storage
        this.lightPlaylistData = {
            availableVideoIds: this.availableVideoIds,
            thumbnails: this.playlistMetaData.items[0].snippet.thumbnails,
            id: this.playlistId,
            title: this.playlistMetaData.items[0].snippet.localized.title
        };
    }

    // Fetch a page of playlist items from the YouTube API
    async getPlaylistData({ parts, maxResults, pageToken }) {
        parts = [
            ...new Set([
                "status",
                "snippet",
                ...(typeof parts === "string"
                    ? [parts]
                    : parts || this.workingData?.parts || [])
            ])
        ];
        maxResults = maxResults ?? this.workingData?.maxResults ?? 50;
        pageToken = pageToken ?? this.workingData?.pageToken ?? "";

        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=${parts.join()}&pageToken=${pageToken}&maxResults=${maxResults}&playlistId=${this.playlistId}&key=${apiKey}`;
        const promise = await fetch(url);
        const data = await promise.json();

        if (promise.ok) {
            // Attach request info to the data for later use
            data.parts = parts;
            data.maxResults = maxResults;
            data.pageToken = pageToken;
            this.workingData = data;
        } else {
            // Log error if fetch fails
            // console.error(
            //     "Something went wrong with fetching the data",
            //     promise,
            //     data
            // );
        }
    }

    // Filter out videos that are not public or unlisted
    filterVideoList(videoStatuses = ["public", "unlisted"]) {
        this.availableVideoData = this.fullPlaylistData.items.filter(video =>
            videoStatuses.includes(video.status.privacyStatus)
        );
    }

    // Navigate to the next or previous page of playlist data
    async pageNavigator(pageDirection) {
        let pageToken;
        switch (pageDirection) {
            case "next": {
                pageToken = this.workingData.nextPageToken;
                break;
            }
            case "prev": {
                pageToken = this.workingData.prevPageToken;
                break;
            }
            default:
                // console.error("Invalid pageDirection");
                break;
        }
        await this.getPlaylistData({ pageToken: pageToken });
    }

    // Fetch all pages of the playlist and combine them into one array
    async getFullPlaylist() {
        await this.getPlaylistData({ pageToken: "" });
        const initialData = structuredClone(this.workingData);
        let counter = 0;
        while (this.workingData.nextPageToken) {
            // Uncomment to add a delay between requests if needed
            // await new Promise(r => setTimeout(r, 300));
            await this.pageNavigator("next");
            initialData.items.push(...this.workingData.items);
            if (++counter >= 30) {
                // Prevent infinite loops
                // console.error("Code for fetching full playlist data is looping too much");
                break;
            }
        }
        this.fullPlaylistData = initialData;
    }

    // Pick a random video from the available list and cue it in the YouTube player
    setRandomVideo(youtubePlayer) {
        const randomVideo = selectRandomItemFromList(this.availableVideoData);
        youtubePlayer.cueVideoById(randomVideo.snippet.resourceId.videoId);
    }
}


