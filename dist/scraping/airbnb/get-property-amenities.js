export async function getPropertyAmenities(page, selector) {
    await ClickAmenitiesButton(page, selector);
    const dialog = await GetAmenitiesDialog(page);
    const headers = await GetAmenityHeaders(dialog);
    const amenities = await GetAmenityDetails(page, headers);
    return amenities;
}
async function ClickAmenitiesButton(page, selector) {
    const buttonSelector = `${selector} button`;
    await page.waitForSelector(buttonSelector);
    const button = await page.$(buttonSelector);
    await button.evaluate((e) => e.innerHTML);
    await button.click();
}
async function GetAmenitiesDialog(page) {
    const dialogSelector = '[data-testid="modal-container"] [aria-label="What this place offers"]';
    await page.waitForSelector(dialogSelector);
    return await page.$(dialogSelector);
}
async function GetAmenityHeaders(dialog) {
    const amenityHeadings = (await dialog.evaluate((e) => {
        let amenityHeadings = [];
        const amenityElements = e.querySelectorAll("h3");
        for (let i = 0; i < amenityElements.length; i++) {
            amenityHeadings.push(amenityElements[i].innerText);
        }
        return amenityHeadings;
    })).filter((string) => !string.includes("Not included"));
    return amenityHeadings;
}
async function GetAmenityDetails(page, headers) {
    const amenities = [];
    for (let heading of headers) {
        const id = CreateIdFromHeading(heading);
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
function CreateIdFromHeading(heading) {
    return heading.toLowerCase().replace(" and ", "_").replace(" ", "_");
}
//# sourceMappingURL=get-property-amenities.js.map