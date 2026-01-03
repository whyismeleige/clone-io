const geoip = require("geoip-lite");
const ua = require("ua-parser-js");
const jwt = require("jsonwebtoken");

// Meta-Data Utils
const getMetaData = (req) => {
  const ipAddress =
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);

  const userAgent = req.headers["user-agent"];

  const geo = geoip.lookup(ipAddress);

  const parser = new ua(userAgent);

  return {
    ipAddress,
    userAgent,
    browser: parser.getBrowser(),
    os: parser.getOS(),
    device: parser.getDevice(),
    location: geo
      ? {
          country: geo.country,
          region: geo.region,
          city: geo.city,
          latitude: geo.ll[0],
          longitude: geo.ll[1],
          timezone: geo.timezone,
        }
      : null,
  };
};

// Authorization Token Utils
const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
  });
};

const decodeAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const decodeRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

// User Data Utils
const sanitizeUser = (user) => {
  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    activity: {
      lastLogin: user.activity?.lastLogin,
    },
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  getMetaData,
  decodeAccessToken,
  decodeRefreshToken,
  sanitizeUser,
};
