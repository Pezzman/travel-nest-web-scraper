export async function getSelectorHtml(page, selector) {
    try {
        await page.waitForSelector(selector, { timeout: 3000 });
        const element = await page.$(selector);
        return await element.evaluate((e) => e.innerHTML);
    }
    catch (error) {
        return null;
    }
}
//# sourceMappingURL=helpers.js.map