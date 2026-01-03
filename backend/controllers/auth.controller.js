const crypto = require("crypto");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GithubStrategy = require("passport-github2").Strategy;

const db = require("../models");
const asyncHandler = require("../middleware/asyncHandler");

const redisClient = require("../database/redis");

const {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
} = require("../utils/errors.utils");
const {
  getMetaData,
  createAccessToken,
  createRefreshToken,
  sanitizeUser,
  decodeRefreshToken,
} = require("../utils/auth.utils");

const User = db.user;

exports.getProfile = asyncHandler(async (req, res) => {
  res.status(200).send({
    user: sanitizeUser(req.user),
    message: "User Profile Sent",
    type: "success",
  });
});

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    throw new ValidationError("Enter Valid Input");
  }

  // Check if user already exists to prevent duplicate registrations
  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new AuthenticationError("User does not exist. Please Register");
  }

  // Extract request metadata (IP, user agent, etc) for security tracking
  const metadata = getMetaData(req);

  // Create new user with local provider
  // Password will be hashed by pre-save hook in User model
  const newUser = await User.create({
    email,
    name,
    password,
    providers: ["local"],
    activity: {
      totalLogins: [
        {
          metadata,
        },
      ],
    },
  });

  // Generate JWT Tokens for immediate authentication
  const accessToken = createAccessToken({ id: newUser._id });
  const refreshToken = createRefreshToken({ id: newUser._id });

  // Store refresh token for session management
  await newUser.saveToken(refreshToken, metadata);

  res.status(200).send({
    message: "User registered successfully",
    type: "success",
    user: sanitizeUser(newUser), // Remove sensitive fields before sending
    accessToken,
    refreshToken,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError("Enter Valid Input");
  }

  const metadata = getMetaData(req);

  // Explicitly select password field (excluded by default in schema)
  const userExists = await User.findOne({ email }).select("+password");

  if (!userExists) {
    throw new AuthenticationError("User does not exist. Please Register");
  }

  // Check if account is locked due to failed login attempts
  if (userExists.isLocked()) {
    const minutesLeft = Math.ceil(
      (userExists.security.lockUntil - Date.now()) / (1000 * 60)
    );
    throw new AuthenticationError(
      `Account is Locked, \nDue to Repeated Incorrect Login Attempts,\nTry after ${minutesLeft} minutes`
    );
  }

  const passwordsMatch = await userExists.passwordsMatch(password);

  if (!passwordsMatch) {
    // Track failed login attempt (may trigger account lock)
    await userExists.inSuccessfulLogin();
    throw new AuthenticationError("Passwords do not match");
  }

  // Generate Tokens for authenticated session
  const accessToken = createAccessToken({
    id: userExists._id,
  });
  const refreshToken = createRefreshToken({
    id: userExists._id,
  });

  // Update login tracking and store refresh token
  await userExists.successfulLogin(metadata);
  await userExists.saveToken(refreshToken, metadata);

  res.status(200).send({
    message: "User Logged In Successfully",
    type: "success",
    user: sanitizeUser(userExists),
    accessToken,
    refreshToken,
  });
});

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AuthorizationError();
  }

  const decoded = decodeRefreshToken(refreshToken);

  const user = await User.findById(decoded.id);

  if (!userExists) {
    throw new AuthenticationError("User does not exist. Please Register");
  }

  const tokenExists = user.refreshTokens.some(
    (tokenObj) => tokenObj.token === refreshToken
  );

  if (!tokenExists) {
    throw new AuthenticationError("Session Expired, Login Again");
  }

  const accessToken = createAccessToken({ id: user._id });

  res.status(200).json({
    message: "Token Changed",
    type: "success",
    accessToken,
  });
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({
          $or: [{ googleID: profile.id }, { email }],
        });

        if (user) {
          if (!user.googleID) {
            user.googleID = profile.id;
            if (!user.providers.includes("google")) {
              user.providers.push("google");
            }
            await user.save();
          }

          return done(null, user);
        }

        const newUser = await User.create({
          email,
          googleID: profile.id,
          avatar: profile._json.picture,
          name: profile._json.given_name,
          providers: ["google"],
        });

        return done(null, newUser);
      } catch (error) {
        console.error("Google OAuth Error", error);
        return done(error, null);
      }
    }
  )
);

exports.googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
});

exports.googleCallback = (req, res, next) => {
  passport.authenticate("google", { session: false }, async (err, user) => {
    try {
      if (err) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/auth/error?message=Authentication-Failed`
        );
      }

      if (!user) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/auth/error?message=User-not-found`
        );
      }

      await handleOAuthSuccess(req, res, user);
    } catch (error) {
      throw new AuthenticationError("Error in Google Authentication");
    }
  })(req, res, next);
};

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/api/auth/github/callback",
      scope: ["user:email", "repo", "admin:repo_hook"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const emails = profile.emails || [];
        const primaryEmail =
          emails.find((email) => email.primary)?.value ||
          emails[0]?.value ||
          profile._json.email;

        if (!primaryEmail) {
          return done(new Error("No email found in GitHub profile"), null);
        }

        let user = await User.findOne({
          $or: [{ githubId: profile.id }, { email: primaryEmail }],
        });

        if (user) {
          if (!user.githubId) {
            user.githubId = profile.id;
            if (!user.providers.includes("github")) {
              user.providers.push("github");
            }
            if (!user.avatar && profile._json.avatar_url) {
              user.avatar = profile._json.avatar_url;
            }
            await user.save();
          }
          return done(null, user);
        }

        const newUser = await User.create({
          email: primaryEmail,
          githubId: profile.id,
          avatar: profile._json.avatar_url,
          name: profile._json.name || profile.username || profile.displayName,
          providers: ["github"],
        });

        return done(null, newUser);
      } catch (error) {
        console.error("GitHub OAuth Error", error);
        return done(error, null);
      }
    }
  )
);

exports.githubAuth = passport.authenticate("github", {
  scope: ["user:email", "repo", "admin:repo_hook"],
  session: false,
});

exports.githubCallback = (req, res, next) => {
  passport.authenticate("github", { session: false }, async (err, user) => {
    try {
      if (err) {
        console.error("GitHub auth error:", err);
        return res.redirect(
          `${process.env.FRONTEND_URL}/auth/error?message=Authentication-Failed`
        );
      }

      if (!user) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/auth/error?message=User-not-found`
        );
      }

      await handleOAuthSuccess(req, res, user);
    } catch (error) {
      console.error("GitHub callback error:", error);
      return res.redirect(
        `${process.env.FRONTEND_URL}/auth/error?message=Authentication-Failed`
      );
    }
  })(req, res, next);
};

async function handleOAuthSuccess(req, res, user) {
  try {
    const metadata = getMetaData(req);

    const accessToken = createAccessToken({ id: user._id });
    const refreshToken = createRefreshToken({ id: user._id });

    await user.successfulLogin(metadata);
    await user.saveToken(refreshToken, metadata);

    const tempCode = crypto.randomBytes(32).toString("hex");

    const authData = {
      accessToken,
      refreshToken,
      user: sanitizeUser(user),
    };

    await redisClient.setEx(
      `auth:${tempCode}`,
      300, // 5 minutes
      JSON.stringify(authData)
    );

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?code=${tempCode}`);
  } catch (error) {
    throw error;
  }
}

exports.exchangeCode = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    throw new AuthenticationError("Exchange Code is required");
  }

  const dataString = await redisClient.get(`auth:${code}`);

  if (!dataString) {
    throw new AuthenticationError(
      "Authentication Session Expired, Try Again Later"
    );
  }

  const authData = JSON.parse(dataString);

  await redisClient.del(`auth:${code}`);

  res.status(200).send({
    message: "Successful Login",
    type: "success",
    user: authData.user,
    accessToken: authData.accessToken,
    refreshToken: authData.refreshToken,
  });
};
