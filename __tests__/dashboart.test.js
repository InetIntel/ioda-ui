/**
 * @jest-environment node
 * @jest-timeout 30000
 */

/*
Yusuf, in general I think some users will go to the dashboard and look at the
outage maps at the country, region, and AS level for the past 24 hours. If
there is an country, region, or AS of interest they will click on the link to
see the signals on that page.


Others will go directly to a page of interest. For example, some users are
only interested in the Internet in Iran and go straight there (or maybe go
to the dashboard and search Iran). And look for outages by inspecting the
signal, regional outage map and raw signals, and AS-level outage table and
raw signals
*/

import puppeteer from "puppeteer";
import { toMatchImageSnapshot } from "jest-image-snapshot";

expect.extend({ toMatchImageSnapshot });

describe("Crawling critical pages", () => {
  let browser, page;
  const homePage = "http://localhost:8000/";

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });
    await page.goto(homePage);
  }, 30000);

  afterAll(async () => {
    await browser.close();
  });

  it("ensure home page display properly", async () => {
    await page.waitForSelector(".leaflet-zoom-animated");
    await page.waitForTimeout(2000);

    const homeImage = await page.screenshot();

    expect(homeImage).toMatchImageSnapshot({
      failureThreshold: "0.10",

      failureThresholdType: "percent",
    });
  }, 30000);

  it("ensures the dashboard page display properly", async () => {
    const [dashboardLink] = await page.$x("//a[contains(text(), 'Dashboard')]");
    await dashboardLink.click();

    await page.waitForSelector(".leaflet-zoom-animated");
    await page.waitForTimeout(2000);

    // Select the date and time
    await page.click(".ant-picker-input");
    await page.keyboard.down("Control");
    await page.keyboard.down("Shift");
    await page.keyboard.press("A");
    await page.keyboard.up("Control");
    await page.keyboard.up("Shift");

    // Delete the selected text
    await page.keyboard.press("Backspace");

    await page.click(".ant-picker-input");
    // await page.keyboard.type("Mar 10 2024 6:35pm UTC");

    const dashboardImage = await page.screenshot();

    expect(dashboardImage).toMatchImageSnapshot({
      failureThreshold: "0.10",

      failureThresholdType: "percent",
    });
  }, 30000);
});
