
/**
 * Loads header and footer HTML from partials and injects them into the page,
 * highlights the active navigation link based on the current pathname,
 * and replaces the existing <header> and <footer> elements with the loaded content.
 */
export async function loadHeaderFooter() {
    const baseUrl = document.querySelector("base").href;
    const headerHtml = await fetch(`${baseUrl}partials/header.html`).then(res => res.text());
    const footerHtml = await fetch(`${baseUrl}partials/footer.html`).then(res => res.text());

    const headerTemplate = document.createElement("template");
    const footerTemplate = document.createElement("template");

    headerTemplate.innerHTML = headerHtml;
    footerTemplate.innerHTML = footerHtml;

    [...headerTemplate.content.querySelectorAll("a")].find(a =>a.href === window.location.href)?.classList.add("active");
    
    document.querySelector("header").replaceWith(headerTemplate.content.firstElementChild);
    document.querySelector("footer").replaceWith(footerTemplate.content.firstElementChild);

}


/**
 * Renders a list of items into a list element using a template function.
 * @param {Function} templateFunction - Function that returns the html for an item as a string.
 * @param {Element} listElement - The list element to render the list into.
 * @param {Array} items - The array of items to render.
 * @param {boolean} [clear=true] - Whether to clear the listElement before rendering.
 */
export function renderListWithTemplate(templateFunction, listElement, items, clear = true) {
    if (clear) listElement.innerHTML = "";
    listElement.insertAdjacentHTML("beforeend", items.map(templateFunction).join(""));
}


/**
 * Pushes multiple copies of an item into an array.
 * @param {Array} array - The array to push items into.
 * @param {*} item - The item to copy and push.
 * @param {number} [count=1] - The number of copies to push.
 */
export function pushCopies(array, item, count = 1) {
    array.push(...Array(count).fill(item));
}


/**
 * Selects a random item from a list, and optionally removes it from the list.
 * @param {Array} list - The list to select from.
 * @param {boolean} [remove=false] - Whether to remove the selected item from the list.
 * @returns {*} The randomly selected item.
 */
export function selectRandomItemFromList(list, remove = false) {
    const randomIndex = Math.floor(Math.random() * list.length);
    if (remove) return list.splice(randomIndex, 1)[0];
    return list[randomIndex];
}
