const redis = require("redis");
const redisURL = "redis://localhost:6379";
const client = redis.createClient(redisURL);

module.exports = async (req, res, next) => {
  await next();
  client.del(JSON.stringify(req.user.id));
};
