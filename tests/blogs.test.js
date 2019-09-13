const CustomPage = require("./helpers/customPage");
let page;
describe("When user is loged in", async () => {
  beforeEach(async () => {
    page = await CustomPage.build();
    await page.goto("http://localhost:3000/");
    await page.login();
  });

  afterEach(async () => {
    await page.close();
  });

  test("And ,  Add form button works Properly", async () => {
    await page.waitFor("a.btn-floating");
    await page.click("a.btn-floating");
    let newBlogFormTitle = await page.getContentsOf("div.title label");
    let newBlogFormContent = await page.getContentsOf("div.content label");
    expect(newBlogFormTitle).toEqual("Blog Title");
    expect(newBlogFormContent).toEqual("Content");
  });

  describe("And, Using validated inputs", async () => {
    beforeEach(async () => {
      // adding some dummy text to the form to test the later situations;
      await page.waitFor("a.btn-floating");
      await page.click("a.btn-floating");
      await page.type("div.title input", "My Testing Blog");
      await page.type("div.content input", "Testing Blog Content");
    });

    test("Upon Clicking Next button, User see the confirmation Screen", async () => {
      //   Navigating to the confirmation screen by clicking the next button
      await page.click("form button");
      //   Checking for the confirmation Screen
      let confirmationHeader = await page.getContentsOf("form h5");
      expect(confirmationHeader).toEqual("Please confirm your entries");
    });

    test("Upon Clicking the Save Button , after the confirmation , the user sees a new Blog on /blogs route", async () => {
      await page.click("form button");
      await page.click("form button.green");
      await page.waitFor("div.card-content");
      let blogTitle = await page.getContentsOf("div.card-content span");
      let blogContent = await page.getContentsOf("div.card-content p");
      expect(blogTitle).toEqual("My Testing Blog");
      expect(blogContent).toEqual("Testing Blog Content");
    });
  });
});

describe("When User is not logged in", async () => {
  beforeEach(async () => {
    page = await CustomPage.build();
    await page.goto("localhost:3000/");
  });

  const actions = [
    {
      method: "post",
      path: "/api/blogs",
      data: {
        title: "T",
        content: "C"
      }
    },
    {
      method: "get",
      path: "/api/blogs"
    }
  ];

  test("User cannot create a new Blog Post", async () => {
    const result = await page.post("/api/blogs", { title: "T", content: "C" });

    expect(result).toEqual({ error: "You must log in!" });
  });

  test("Any request to blogs without loggin in results in error", async () => {
    const results = await page.execAll(actions);
    await results.forEach(result => {
      expect(result).toEqual({ error: "You must log in!" });
    });
  });
});
