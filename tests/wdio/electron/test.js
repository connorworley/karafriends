describe("Electron tests", () => {
  it("Renderer screenshot", async () => {
    await browser.url("http://localhost:3000/renderer/");
    await browser.saveScreenshot("renderer.png");
  });
});
