const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");
const keys = require("../config/keys");
const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);

// mongoose prototype functions patching;

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}) {
  this.isCache = true;
  this.hashKey = JSON.stringify(options.key || "");
  return this;
};

mongoose.Query.prototype.exec = async function() {
  // check if there is the data already in the cache
  if (!this.isCache) {
    return exec.apply(this, arguments);
  }

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name
    })
  );
  const cacheValue = await client.hget(this.hashKey, key);
  if (cacheValue) {
    const doc = JSON.parse(cacheValue);
    console.log("returning data from Cache");
    return Array.isArray(doc)
      ? doc.map(data => this.model(data))
      : this.model(doc);
  }

  // The query is not cached in redis , so we will make a request to mongoDB server
  const fetchedData = await exec.apply(this, arguments);
  // caching the data in the redis server,
  client.hset(this.hashKey, key, JSON.stringify(fetchedData));
  // returning the fetched Data back to the user;
  console.log("Returning Data from MongoDB server");
  return fetchedData;
};
