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
    await browser.url("http://localhost:3000/remocon/");
    await browser.waitUntil(
      browser.isAlertOpen || (() => isAlertOpenSafari(browser))
    );
    await browser.sendAlertText("wdio");
    await browser.acceptAlert();
    await browser.saveScreenshot(
      `remocon-${browser.capabilities.browserName}.png`
    );
  });
});
