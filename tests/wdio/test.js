describe("Electron tests", () => {
  it("Renderer should load", async () => {
    await browser.url("http://localhost:3000/renderer/");
    const root = await $("#root");
    await expect(root).toHaveTextContaining("karafriends");
    await expect(root).toHaveTextContaining("LOGIN");
  });
});
