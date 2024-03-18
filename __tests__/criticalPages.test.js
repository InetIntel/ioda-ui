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

  beforeEach(async () => {
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });
    await page.goto(homePage);
  }, 30000);

  afterEach(async () => {
    await browser.close();
  });

  it("ensure home page display properly", async () => {
    await page.waitForSelector(".leaflet-zoom-animated");
    await page.waitForTimeout(2000);

    const homeImage = await page.screenshot();

    expect(homeImage).toMatchImageSnapshot({
      customSnapshotIdentifier: "home-page",
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
    const dateStart = await page.$(".ant-picker-input");
    await dateStart.click({ clickCount: 3 });
    await page.keyboard.type("Mar 10 2024 6:35pm UTC");

    // 4 tabs to get to the date end input field
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press("Tab");
    }

    // The next day after the start date
    await page.keyboard.type("Mar 11 2024 6:34pm UTC");

    await page.keyboard.press("Enter");

    await page.waitForSelector(".leaflet-zoom-animated");
    await page.waitForTimeout(2000);

    const dashboardImage = await page.screenshot();

    expect(dashboardImage).toMatchImageSnapshot({
      customSnapshotIdentifier: "dashboard-main-view",
      failureThreshold: "0.10",
      failureThresholdType: "percent",
    });

    const regionView = await page.waitForSelector("text/Region View");
    await regionView.click();

    await page.waitForSelector(".leaflet-zoom-animated");
    await page.waitForTimeout(2000);

    const regionViewImage = await page.screenshot();

    expect(regionViewImage).toMatchImageSnapshot({
      customSnapshotIdentifier: "dashboard-region-view",
      failureThreshold: "0.10",
      failureThresholdType: "percent",
    });

    const asnISPView = await page.waitForSelector("text/ASN/ISP View");
    await asnISPView.click();

    await page.waitForSelector("#horizon-chart");
    await page.waitForTimeout(4000);

    const asnISPViewImage = await page.screenshot();

    expect(asnISPViewImage).toMatchImageSnapshot({
      customSnapshotIdentifier: "dashboard-asn-isp-view",
      failureThreshold: "0.10",
      failureThresholdType: "percent",
    });
  }, 30000);

  it.only("allows search by country", async () => {
    const country = "Iran";
    await page.waitForSelector("input#rc_select_2");

    page.$eval("input#rc_select_2", (el) => el.click());
    await page.keyboard.type(country);

    await page.waitForTimeout(4000);

    const homeImage = await page.screenshot();

    expect(homeImage).toMatchImageSnapshot({
      customSnapshotIdentifier: "iran-page-view",
      failureThreshold: "0.10",
      failureThresholdType: "percent",
    });
  }, 30000);
});
