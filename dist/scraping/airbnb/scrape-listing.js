import { getPropertyDetails, getPropertyName, } from "./get-listing-information.js";
import { getPropertyAmenities } from "./get-property-amenities.js";
export async function scrapeListing(page, url) {
    await page.goto(url);
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
//# sourceMappingURL=scrape-listing.js.map