describe("Electron tests", () => {
  it("Renderer screenshot", async () => {
    await browser.url(
      `http://localhost:${process.env.KARAFRIENDS_DEV_PORT}/renderer/`,
    );
    await browser.saveScreenshot("renderer.png");
  });
});
