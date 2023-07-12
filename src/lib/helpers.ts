import { Page } from "puppeteer";

export async function getSelectorHtml(
  page: Page,
  selector: string
): Promise<string | null> {
  try {
    await page.waitForSelector(selector, { timeout: 3000 });
    const element = await page.$(selector);
    return await element.evaluate((e) => e.innerHTML);
  } catch (error) {
    return null;
  }
}
