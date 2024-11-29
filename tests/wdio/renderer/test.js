describe("Electron tests", () => {
  it("Renderer screenshot", async () => {
    await browser.url(
      `http://localhost:${process.env.KARAFRIENDS_DEV_PORT}/renderer/`,
    );
    await new Promise((resolve) => setTimeout(resolve, 10 * 1000));
    await browser.saveScreenshot("renderer.png");
  });
});
