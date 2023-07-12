import { Page } from "puppeteer";
import {
  PropertyDetails,
  getPropertyDetails,
  getPropertyName,
} from "./get-listing-information.js";
import { getPropertyAmenities } from "./get-property-amenities.js";

export type AirbnbListingData = {
  name: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  amenities: Amenity[];
};
export type Amenity = { title: string; items: string[] };

export async function scrapeListing(page: Page, url: string) {
  await page.goto(url);

  const [name, details]: [string, PropertyDetails] = await Promise.all([
    await getPropertyName(page, `[data-section-id="TITLE_DEFAULT"]`),
    await getPropertyDetails(page, `[data-section-id="OVERVIEW_DEFAULT"]`),
  ]);

  if (name === null || details === null) {
    return null;
  }

  const amenities = await getPropertyAmenities(
    page,
    `[data-section-id="AMENITIES_DEFAULT"]`
  );

  const listingData: AirbnbListingData = {
    name,
    type: details.type,
    bedrooms: details.bedrooms,
    bathrooms: details.bathrooms,
    amenities,
  };
  return listingData;
}
