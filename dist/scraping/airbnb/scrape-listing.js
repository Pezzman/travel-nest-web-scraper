import { getSelectorHtml } from "../../lib/helpers.js";
export async function scrapeListing(page, url) {
    await page.goto(url);
    await page.screenshot({
        path: "./src/screenshots/screenshot.png",
        fullPage: true,
    });
    const [name, details] = await Promise.all([
        await getPropertyName(page, `[data-section-id="TITLE_DEFAULT"]`),
        await getPropertyDetails(page, `[data-section-id="OVERVIEW_DEFAULT"]`),
    ]);
    if (name === null || details === null) {
        return null;
    }
    const amenities = await getPropertyAmenities(page, `[data-section-id="AMENITIES_DEFAULT"]`);
    const listingData = {
        name,
        type: details.type,
        bedrooms: details.bedrooms,
        bathrooms: details.bathrooms,
        amenities,
    };
    return listingData;
}
async function getPropertyName(page, selector) {
    const html = await getSelectorHtml(page, `${selector} h1`);
    return html;
}
async function getPropertyDetails(page, selector) {
    const type = await getSelectorHtml(page, `${selector} h2`);
    if (type === null)
        return null;
    const details = await getSelectorHtml(page, `${selector} ol`);
    const [bathroomHtml, bedroomHtml] = details
        .split(">")
        .filter((string) => string.includes("bedroom") || string.includes("bathroom"))
        .sort();
    const bathrooms = bathroomHtml.split(" ")[0];
    const bedrooms = bedroomHtml.split(" ")[0];
    return {
        type: type.split(" hosted ")[0],
        bathrooms: Number.parseInt(bathrooms),
        bedrooms: Number.parseInt(bedrooms),
    };
}
async function getPropertyAmenities(page, selector) {
    //Open dialog
    const buttonSelector = `${selector} button`;
    await page.waitForSelector(buttonSelector);
    const button = await page.$(buttonSelector);
    await button.evaluate((e) => e.innerHTML);
    await button.click();
    //Wait for dialog to open
    const dialogSelector = '[data-testid="modal-container"] [aria-label="What this place offers"]';
    await page.waitForSelector(dialogSelector);
    const dialog = await page.$(dialogSelector);
    //Get every amenity header
    const amenityHeadings = (await dialog.evaluate((e) => {
        let amenityHeadings = [];
        const amenityElements = e.querySelectorAll("h3");
        for (let i = 0; i < amenityElements.length; i++) {
            amenityHeadings.push(amenityElements[i].innerText);
        }
        return amenityHeadings;
    })).filter((string) => !string.includes("Not included"));
    //Create ids from head text and grab amenity row titles
    const amenities = [];
    for (let heading of amenityHeadings) {
        const id = CreateId(heading);
        const amentity = {
            title: heading,
            items: [],
        };
        let elements = await page.$$(`[id*='${id}'][id*='row-title']`);
        for (const element of elements) {
            const text = await element.evaluate((el) => el.textContent);
            amentity.items.push(text);
        }
        amenities.push(amentity);
    }
    return amenities;
}
function CreateId(heading) {
    return heading.toLowerCase().replace(" and ", "_").replace(" ", "_");
}
//# sourceMappingURL=scrape-listing.js.map