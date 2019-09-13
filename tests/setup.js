jest.setTimeout(30000);
// We need to connect to the mongodb server in the test enviroment too
require("../models/User");
const mongoose = require("mongoose");
const keys = require("../config/keys");

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI);
