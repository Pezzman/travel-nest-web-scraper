import { getSelectorHtml } from "../../lib/helpers.js";
export async function getPropertyName(page, selector) {
    const html = await getSelectorHtml(page, `${selector} h1`);
    return html;
}
export async function getPropertyDetails(page, selector) {
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
//# sourceMappingURL=get-listing-information.js.map