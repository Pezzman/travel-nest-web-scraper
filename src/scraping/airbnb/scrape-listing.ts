import { Browser, Page } from "puppeteer";
import { getSelectorHtml } from "../../lib/helpers.js";

export type AirbnbListingData = {
  name: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  amenities: Amenity[];
};
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

async function getPropertyName(
  page: Page,
  selector: string
): Promise<string | null> {
  const html = await getSelectorHtml(page, `${selector} h1`);
  return html;
}

type PropertyDetails = {
  type: string;
  bedrooms: number;
  bathrooms: number;
};
async function getPropertyDetails(
  page: Page,
  selector: string
): Promise<PropertyDetails> {
  const type = await getSelectorHtml(page, `${selector} h2`);
  if (type === null) return null;

  const details = await getSelectorHtml(page, `${selector} ol`);

  const [bathroomHtml, bedroomHtml] = details
    .split(">")
    .filter(
      (string) => string.includes("bedroom") || string.includes("bathroom")
    )
    .sort();

  const bathrooms = bathroomHtml.split(" ")[0];
  const bedrooms = bedroomHtml.split(" ")[0];
  return {
    type: type.split(" hosted ")[0],
    bathrooms: Number.parseInt(bathrooms),
    bedrooms: Number.parseInt(bedrooms),
  };
}

type Amenity = { title: string; items: string[] };
async function getPropertyAmenities(
  page: Page,
  selector: string
): Promise<Amenity[]> {
  //Open dialog
  const buttonSelector = `${selector} button`;
  await page.waitForSelector(buttonSelector);
  const button = await page.$(buttonSelector);
  await button.evaluate((e) => e.innerHTML);
  await button.click();

  //Wait for dialog to open
  const dialogSelector =
    '[data-testid="modal-container"] [aria-label="What this place offers"]';
  await page.waitForSelector(dialogSelector);
  const dialog = await page.$(dialogSelector);

  //Get every amenity header
  const amenityHeadings = (
    await dialog.evaluate((e) => {
      let amenityHeadings = [];
      const amenityElements = e.querySelectorAll("h3");
      for (let i = 0; i < amenityElements.length; i++) {
        amenityHeadings.push(amenityElements[i].innerText);
      }
      return amenityHeadings;
    })
  ).filter((string) => !string.includes("Not included"));

  //Create ids from head text and grab amenity row titles
  const amenities = [];
  for (let heading of amenityHeadings) {
    const id = CreateIdFromHeading(heading);
    const amentity: Amenity = {
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

function CreateIdFromHeading(heading: string) {
  return heading.toLowerCase().replace(" and ", "_").replace(" ", "_");
}
