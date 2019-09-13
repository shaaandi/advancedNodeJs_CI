const Buffer = require("safe-buffer").Buffer;
const Keygrip = require("keygrip");
const keys = require("../../config/keys");
const keygrip = new Keygrip([keys.cookieKey]);

module.exports = user => {
  const sessionObject = {
    passport: {
      user: user._id.toString()
    }
  };
  const session = Buffer.from(JSON.stringify(sessionObject)).toString("base64");
  // using keygrip to signing the cookie exactly the same as signed by our backend Api

  const sig = keygrip.sign("session=" + session);
  return { session, sig };
};
