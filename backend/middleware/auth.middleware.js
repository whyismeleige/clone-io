const { decodeAccessToken } = require("../utils/auth.utils");
const { AuthorizationError } = require("../utils/errors.utils");
const asyncHandler = require("./asyncHandler");
const redisClient = require("../database/redis");
const User = require("../models").user;

exports.authenticateToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    throw new AuthorizationError("Unauthorized Access");
  }

  const { id } = decodeAccessToken(token);

  let user = await redisClient.get(id);

  if (!user) {
    user = await User.findById(id);
    await redisClient.setEx(id, 300, JSON.stringify(user));
  } else {
    user = User.hydrate(JSON.parse(user));
  }

  if (!user) {
    throw new AuthorizationError("Unauthorized Access");
  }

  req.user = user;

  next();
});
