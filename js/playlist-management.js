

// Import dependencies and utilities
import MasterShuffler9000 from "./MasterShuffler9000.mjs";
import Playlist from "./Playlist.mjs";
import { loadHeaderFooter, renderListWithTemplate } from "./utils.mjs";

// Load header and footer HTML into the page
loadHeaderFooter();

// Template function for rendering a playlist item as HTML
function templateFunction(playlist) {
    const id = playlist.id;
    const title = playlist.title;
    const imgSrc = playlist.thumbnails.default.url;
    const imgWidth = playlist.thumbnails.default.width;
    const imgHeight = playlist.thumbnails.default.height;

    return `
        <li data-id="${id}">
            <h4>${title}</h4>
            <img src="${imgSrc}" alt="${title}" width="${imgWidth}" height="${imgHeight}">
        </li>
    `;
}

// Select playlist ID input on click for easy editing
document.getElementById("playlist-id").addEventListener("click", e => e.target.select());

const playlists = [];
const ul = document.getElementById("loaded-playlists-pl");
const conjoinToggle = document.getElementById("conjoin-toggle");

// Toggle conjoin mode styling on the playlist list
if (conjoinToggle.checked) ul.classList.add("conjoin-toggle");
conjoinToggle.addEventListener("click", () => {
    if (conjoinToggle.checked) ul.classList.add("conjoin-toggle");
    else ul.classList.remove("conjoin-toggle");
});

// Add a playlist by ID when button is clicked
document.getElementById("get-playlist").addEventListener("click", async () => {
    const playlistIdInput = document.getElementById("playlist-id");
    const playlist = new Playlist(playlistIdInput.value);
    await playlist.init();

    playlists.push(playlist.lightPlaylistData);

    ul.insertAdjacentHTML("beforeend", templateFunction(playlist.lightPlaylistData));
});

// Handle conjoin selection and ordering in the playlist list
ul.addEventListener("click", e => {
    const li = e.target.closest("li");
    if (!conjoinToggle.checked || !li) return;

    li.classList.toggle("conjoin-toggle");

    if (li.classList.contains("conjoin-toggle")) {
        // Add order number for conjoining
        const conjoinOrder = document.createElement("h5");
        conjoinOrder.innerText = document.querySelectorAll("li.conjoin-toggle").length ;
        li.insertAdjacentElement("afterbegin", conjoinOrder);
    } else {
        // Remove order number and update others
        const removedH5 = li.querySelector("h5");
        removedH5.remove();

        e.currentTarget.querySelectorAll("h5").forEach(h5 => {
            if (Number(h5.textContent) < Number(removedH5.textContent)) return;
            h5.textContent = Number(h5.textContent) - 1;
        });
    }
});

// Conjoin selected playlists into a new combined playlist
document.getElementById("conjoin").addEventListener("click", () => {
    const listItemsToConjoin = [...document.querySelectorAll("li.conjoin-toggle")];

    // Sort by user-selected order
    listItemsToConjoin.sort((listA, listB) =>
        Number(listA.querySelector("h5").textContent) - Number(listB.querySelector("h5").textContent)
    );

    // Find the playlist objects for each selected item
    const listsToConjoin = listItemsToConjoin.map(li =>
        playlists.find(playlist => playlist.id === li.dataset.id)
    );

    // Create a new playlist object representing the conjoined list
    const conjoinedList = {
        thumbnails: listsToConjoin[0].thumbnails,
        id: listsToConjoin.map(list => list.id).join("|~|"),
        title:
            document.getElementById("conjoined-name").value ||
            listsToConjoin.map(list => list.title).join("-"),
        availableVideoIds: new MasterShuffler9000().conjoinLists(
            undefined,
            ...listsToConjoin.map(list => list.availableVideoIds)
        )
    };
    playlists.push(conjoinedList);
    [...ul.querySelectorAll("h5")].forEach(h5 => {
        h5.closest("li").classList.remove("conjoin-toggle");
        h5.remove();
    });
    ul.insertAdjacentHTML("beforeend", templateFunction(conjoinedList));
    // renderListWithTemplate(templateFunction, ul, playlists);
});

// Save playlists to localStorage
document.getElementById("save-playlists").addEventListener("click", () => {
    localStorage.setItem("playlists", JSON.stringify(playlists));
});

// Load playlists from localStorage
document.getElementById("load-stored-playlists").addEventListener("click", () => {
    playlists.length = 0;
    playlists.push(...(JSON.parse(localStorage.getItem("playlists")) || []));
    renderListWithTemplate(templateFunction, ul, playlists);
});
