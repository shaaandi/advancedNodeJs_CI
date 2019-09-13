const puppeteer = require("puppeteer");
const sessionFactory = require("../factories/sessionFactory");
const userFactory = require("../factories/userFactory");

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: true
    });
    const page = await browser.newPage();
    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function(target, property) {
        return customPage[property] || browser[property] || page[property];
      }
    });
  }

  constructor(page) {
    this.page = page;
  }

  async login() {
    // creating a user in MongoDB
    const user = await userFactory();
    // we alreadt have the key  , so we will create the both session and session.sig values
    const { session, sig } = sessionFactory(user);
    // Setting the Chromium Browser Cookie
    await this.page.setCookie({ name: "session", value: session });
    await this.page.setCookie({ name: "session.sig", value: sig });
    // redirected back to the app page
    await this.page.goto("localhost:3000/blogs");
  }

  async getContentsOf(selector) {
    return await this.page.$eval(selector, el => el.innerHTML);
  }

  get(path) {
    return this.page.evaluate(_path => {
      return fetch(_path, {
        method: "get",
        credentials: "same-origin",
        headers: {
          "Content-type": "application/json"
        }
      }).then(res => res.json());
    }, path);
  }

  post(path, data) {
    return this.page.evaluate(
      (_path, _data) => {
        return fetch(_path, {
          method: "post",
          credentials: "same-origin",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify(_data)
        }).then(res => res.json());
      },
      path,
      data
    );
  }

  execAll(actions) {
    return Promise.all(
      actions.map(({ method, data, path }) => {
        return this[method](path, data || undefined);
      })
    );
  }
}

module.exports = CustomPage;
