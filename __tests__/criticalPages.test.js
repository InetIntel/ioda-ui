/**
 * @jest-environment node
 * @jest-timeout 30000
 */

/*
!! These tests are not written with maintenance in mind. They are written to ease
the process of creating visual regression tests for the critical pages during the
upgrade.

The tests are based on comments from Amanda below:

In general I think some users will go to the dashboard and look at the
outage maps at the country, region, and AS level for the past 24 hours. If
there is a country, region, or AS of interest they will click on the link to
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
  // Set an unrealistic max wait time to avoid long running tests from timing out
  // since the tests are not modular enough
  const MAX_WAIT_TIME = 30000;

  beforeEach(async () => {
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });
    await page.goto(homePage);
  }, MAX_WAIT_TIME);

  afterEach(async () => {
    await browser.close();
  });

  const chooseDefinedDateRange = async (currentPage) => {
    // Select the date and time
    const dateStart = await currentPage.$(".ant-picker-input");
    await dateStart.click({ clickCount: 3 });
    await currentPage.keyboard.type("Mar 10 2024 6:35pm UTC");

    // 4 tabs to get to the date end input field
    for (let i = 0; i < 4; i++) {
      await currentPage.keyboard.press("Tab");
    }

    // The next day after the start date
    await currentPage.keyboard.type("Mar 11 2024 6:34pm UTC");

    await currentPage.keyboard.press("Enter");

    await currentPage.waitForSelector(".leaflet-zoom-animated");
    await currentPage.waitForTimeout(2000);
  };

  it(
    "ensure home page display properly",
    async () => {
      await page.waitForSelector(".leaflet-zoom-animated");
      await page.waitForTimeout(2000);

      const homeImage = await page.screenshot();

      expect(homeImage).toMatchImageSnapshot({
        customSnapshotIdentifier: "home-page",
        failureThreshold: "0.10",
        failureThresholdType: "percent",
      });
    },
    MAX_WAIT_TIME
  );

  it(
    "ensures the dashboard page display properly",
    async () => {
      const [dashboardLink] = await page.$x(
        "//a[contains(text(), 'Dashboard')]"
      );
      await dashboardLink.click();

      await page.waitForSelector(".leaflet-zoom-animated");
      await page.waitForTimeout(2000);

      await chooseDefinedDateRange(page);

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
    },
    MAX_WAIT_TIME
  );

  it(
    "allows search by country",
    async () => {
      const country = "Iran";
      const countrySearch = await page.waitForSelector(
        ".ant-select-selection-placeholder"
      );

      // Hacky way to click on the search input which is not properly accessible
      countrySearch.click();
      countrySearch.focus();

      await page.waitForTimeout(1000);
      await page.keyboard.type(country);
      await page.waitForTimeout(1000);

      await page.keyboard.press("Enter");
      await page.waitForTimeout(1000);

      await chooseDefinedDateRange(page);
      await page.waitForSelector(".leaflet-zoom-animated");
      await page.waitForTimeout(2000);

      const homeImage = await page.screenshot();

      expect(homeImage).toMatchImageSnapshot({
        customSnapshotIdentifier: "iran-page-view",
        failureThreshold: "0.10",
        failureThresholdType: "percent",
      });
    },
    MAX_WAIT_TIME
  );
});
