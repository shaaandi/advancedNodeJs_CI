const CustomPage = require("./helpers/customPage");

let page;

beforeEach(async () => {
  page = await CustomPage.build();
  await page.goto("localhost:3000");
});

afterEach(async () => {
  await page.close();
});

test("Header Brand Name rendered correctly", async () => {
  let brandText = await page.getContentsOf("a.brand-logo");

  expect(brandText).toEqual("Blogster");
});

test("User correctly get kicked into Auth Flow", async () => {
  await page.click(".right a");
  const url = await page.url();
  expect(url).toMatch("/accounts.google.com/");
});

test("The app shows the logout button after the user logged in", async () => {
  await page.login();
  // Waiting for the content to load properly
  await page.waitFor('a[href="/auth/logout"]');
  const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);

  expect(text).toEqual("Logout");
}, 30000);
