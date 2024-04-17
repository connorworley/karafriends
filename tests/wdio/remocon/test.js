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
    await browser.url(
      `http://localhost:${process.env.KARAFRIENDS_DEV_PORT}/remocon/`,
    );
    await browser.waitUntil(
      browser.isAlertOpen || (() => isAlertOpenSafari(browser)),
      { timeout: 60 * 1000 },
    );
    await browser.sendAlertText("wdio");
    await browser.acceptAlert();
    await browser.saveScreenshot(
      `remocon-${browser.capabilities.browserName}.png`,
    );
  });
});
