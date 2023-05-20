describe("Electron tests", () => {
  it("Remocon screenshot", async () => {
    await browser.url("http://localhost:3000/remocon/");
    await browser.waitUntil(browser.isAlertOpen);
    await browser.sendAlertText("wdio");
    await browser.acceptAlert();
    await browser.saveScreenshot("remocon.png");
  });
});
