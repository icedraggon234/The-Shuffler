

// Import utilities for header/footer and rendering lists
import { loadHeaderFooter, renderListWithTemplate } from "./utils.mjs";

// Load header and footer HTML into the page
loadHeaderFooter();

// DOM elements and state arrays
const loadedPlaylistsUl = document.getElementById("loaded-playlists-sh");
const shufflerUl = document.getElementById("shuffle-pattern");
const playlists = JSON.parse(localStorage.getItem("playlists"));
const shufflerPattern = [];
const fullPattern = [];
const fullPatternUl = document.getElementById("current-pattern");

// Template for a single pattern section of playlists
function shufflerUlTemplate(playlist) {
    const title = playlist.title;
    const id = playlist.id;
    const imgSrc = playlist.thumbnails.default.url;
    const imgWidth = playlist.thumbnails.default.width;
    const imgHeight = playlist.thumbnails.default.height;

    return `
        <li data-id="${id}">
            <h3>${title}</h3>
            <img src="${imgSrc}" alt="${title}" width="${imgWidth}" height="${imgHeight}">
            <p>Count: <span>${playlist.count}</span></p>
        </li>
    `;
}

// Template for a full pattern made up of the smaller pattern sections
function fullPatternUlTemplate(pattern) {
    return `
        <li>
            <h3>Repeat Count: ${pattern.count}</h3>
            <ul>
                ${pattern.playlists.map(playlist => {
                    const title = playlist.title;
                    const id = playlist.id;
                    const imgSrc = playlist.thumbnails.default.url;
                    const imgWidth = playlist.thumbnails.default.width;
                    const imgHeight = playlist.thumbnails.default.height;

                    return `
                        <li data-id="${id}">
                            <h4>${title}</h4>
                            <img src="${imgSrc}" alt="${title}" width="${imgWidth}" height="${imgHeight}">
                            <p>Count: ${playlist.count}</p>
                        </li>
                    `;
                }).join("")}
            </ul>
        </li>
    `;
}

// Render the loaded playlists in the UI
renderListWithTemplate(
    playlist => {
        const title = playlist.title;
        const id = playlist.id;
        const imgSrc = playlist.thumbnails.default.url;
        const imgWidth = playlist.thumbnails.default.width;
        const imgHeight = playlist.thumbnails.default.height;

        return `
            <li data-id="${id}">
                <h3>${title}</h3>
                <img src="${imgSrc}" alt="${title}" width="${imgWidth}" height="${imgHeight}">
            </li>
        `;
    },
    loadedPlaylistsUl,
    playlists
);

// Handle clicks on loaded playlists to build the shuffler pattern
loadedPlaylistsUl.addEventListener("click", e => {
    const li = e.target.closest("li");
    if (!li) return;

    const playlist = playlists.find(playlist => playlist.id == li.dataset.id);

    if (shufflerPattern.at(-1)?.id !== playlist.id) {
        // Add a new playlist to the pattern if it doesn't match the last playlist in the pattern
        shufflerPattern.push({ ...playlist, count: 1 });
        shufflerUl.insertAdjacentHTML("beforeend", shufflerUlTemplate(shufflerPattern.at(-1)));
    } else {
        // Increment the count for the last playlist in the pattern instead if playlist to add and last playlist in pattern is the same
        shufflerPattern.at(-1).count += 1;
        const pCount = [...shufflerUl.querySelectorAll("li p span")].at(-1);
        pCount.textContent = Number(pCount.textContent) + 1;
        // Restart the animation for visual feedback
        pCount.classList.remove("bounce");
        void pCount.offsetWidth;
        pCount.classList.add("bounce");
    }
});

// Add the current shuffler pattern to the full pattern list
document.getElementById("add-pattern").addEventListener("click", () => {
    fullPattern.push({
        playlists: [...shufflerPattern],
        count: document.getElementById("repeat-count").valueAsNumber || 1
    });

    shufflerPattern.length = 0;

    renderListWithTemplate(shufflerUlTemplate, shufflerUl, shufflerPattern);
    fullPatternUl.insertAdjacentHTML("beforeend", fullPatternUlTemplate(fullPattern.at(-1)));
});

// Save the full pattern to localStorage
document.getElementById("save-pattern").addEventListener("click", () => {
    const patternData = {
        fullPattern: fullPattern,
        uniquePlaylists: [
            ...new Set(fullPattern.flatMap(pattern => pattern.playlists.map(playlist => playlist.id)))
        ]
    };
    localStorage.setItem("pattern", JSON.stringify(patternData));
});

// Load a saved pattern from localStorage
document.getElementById("load-pattern").addEventListener("click", () => {
    fullPattern.length = 0;

    const loadedPattern = JSON.parse(localStorage.getItem("pattern"));
    fullPattern.push(...loadedPattern.fullPattern);

    renderListWithTemplate(fullPatternUlTemplate, fullPatternUl, fullPattern);
});

