const { setupBrowser } = require("@testing-library/webdriverio");

async function isAlertOpenSafari(browser) {
  try {
    await browser.getAlertText();
    return true;
  } catch (e) {
    return false;
  }
}

describe("Electron tests", () => {
  it("Remocon screenshot", async () => {
    const { getByText } = setupBrowser(browser);
    await browser.url(
      `http://localhost:${process.env.KARAFRIENDS_REMOCON_PORT}/#/search/song/Lemon`,
    );
    await browser.waitUntil(
      browser.isAlertOpen || (() => isAlertOpenSafari(browser)),
      { timeout: 60 * 1000 },
    );
    await browser.sendAlertText("wdio");
    await browser.acceptAlert();
    await browser.waitUntil(
      async () => {
        try {
          await getByText("yonezukenshi");
          return true;
        } catch {
          return false;
        }
      },
      { timeout: 60 * 1000 },
    );
    await browser.saveScreenshot(
      `remocon-${browser.capabilities.browserName}.png`,
    );
  });
});
