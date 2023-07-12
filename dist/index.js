import puppeteer from "puppeteer";
import { scrapeListing, } from "./scraping/airbnb/scrape-listing.js";
import util from "util";
/* Known Issues
- Privacy policy modal can appear and break tests
- Amenity Header 'Location Features' doesnt match the element id rule "location", there could be more cases
*/
async function start() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const propertyIds = ["20669368", "50633275", "33571268"];
    const data = [];
    for (let id of propertyIds) {
        console.log(`scraping property listing ${id}`);
        const listingData = await scrapeListing(page, `https://www.airbnb.co.uk/rooms/${id}`);
        if (listingData)
            data.push(listingData);
    }
    console.log(util.inspect(data, { showHidden: false, depth: null, colors: true }));
    await browser.close();
}
start();
//# sourceMappingURL=index.js.map