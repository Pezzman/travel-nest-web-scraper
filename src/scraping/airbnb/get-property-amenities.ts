import { ElementHandle, Page } from "puppeteer";
import { Amenity } from "./scrape-listing.js";

export async function getPropertyAmenities(
  page: Page,
  selector: string
): Promise<Amenity[]> {
  await clickAmenitiesButton(page, selector);
  const dialog = await getAmenitiesDialog(page);
  const headers = await getAmenityHeaders(dialog);
  const amenities = await getAmenityDetails(page, headers);
  return amenities;
}

async function clickAmenitiesButton(page: Page, selector: string) {
  const buttonSelector = `${selector} button`;
  await page.waitForSelector(buttonSelector);
  const button = await page.$(buttonSelector);
  await button.evaluate((e) => e.innerHTML);
  await button.click();
}

async function getAmenitiesDialog(page: Page) {
  const dialogSelector =
    '[data-testid="modal-container"] [aria-label="What this place offers"]';
  await page.waitForSelector(dialogSelector);
  return await page.$(dialogSelector);
}

async function getAmenityHeaders(dialog: ElementHandle<Element>) {
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
  return amenityHeadings;
}

async function getAmenityDetails(page: Page, headers: string[]) {
  const amenities = [];
  for (let heading of headers) {
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
