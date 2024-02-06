import puppeteer from "puppeteer";
import { toMatchImageSnapshot } from "jest-image-snapshot";

expect.extend({ toMatchImageSnapshot });

describe("on page load", () => {
  it("h1 loads correctly", async () => {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Navigate the page to a URL
    await page.goto("http://localhost:8000/");

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    // Type into search box
    // await page.type(".devsite-search-field", "automate beyond recorder");

    // // Wait and click on first result
    // const searchResultSelector = ".devsite-result-item-link";
    // await page.waitForSelector(searchResultSelector);
    // await page.click(searchResultSelector);

    // // Locate the full title with a unique string
    // const textSelector = await page.waitForSelector(
    //   "text/Customize and automate"
    // );
    // const fullTitle = await textSelector?.evaluate((el) => el.textContent);

    // // Print the full title
    // console.log('The title of this blog post is "%s".', fullTitle);
    const image = await page.screenshot();

    expect(image).toMatchImageSnapshot({
      failureThreshold: "0.10",

      failureThresholdType: "percent",
    });

    await browser.close();
  }, 50000);
});
