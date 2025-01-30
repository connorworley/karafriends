const { setupBrowser } = require("@testing-library/webdriverio");

describe("Electron tests", () => {
  it("Renderer screenshot", async () => {
    const { getByText } = setupBrowser(browser);
    await browser.url(
      `http://localhost:${process.env.KARAFRIENDS_DEV_PORT}/renderer/`,
    );
    await browser.waitUntil(
      async () => {
        try {
          await getByText("Queue");
          return true;
        } catch {
          return false;
        }
      },
      { timeout: 60 * 1000 },
    );
    await browser.saveScreenshot("renderer.png");
  });
});
