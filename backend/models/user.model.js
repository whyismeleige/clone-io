const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const MetadataSchema = new mongoose.Schema({
  ipAddress: String,
  userAgent: String,
  browser: {
    name: String,
    version: String,
    major: String,
  },
  os: {
    name: String,
    version: String,
  },
  device: {
    vendor: String,
    model: String,
    type: String,
  },
  location: {
    country: String,
    region: String,
    city: String,
    latitude: Number,
    longitude: Number,
    timezone: String,
  },
});

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is Required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    name: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
      index: true,
    },
    googleID: {
      type: String,
      unique: true,
      sparse: true,
    },
    githubId: {
      type: String,
      unique: true,
      sparse: true,
    },
    providers: {
      type: [String],
      required: true,
      enum: {
        values: ["github", "google", "local"],
        message: "Invalid authentication provider",
      },
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "At least one provider is required",
      },
    },
    avatar: {
      type: String,
      default: function () {
        const seed = crypto.randomUUID();
        const styles = [
          "adventurer",
          "bigSmile",
          "funEmoji",
          "lorelei",
          "micah",
          "notionists",
          "pixelArt",
          "croodles",
        ];
        const style = styles[Math.floor(Math.random() * styles.length)];
        return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
      },
    },
    chats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
      },
    ],
    activity: {
      lastLogin: {
        type: Date,
        default: Date.now,
      },
      totalLogins: [
        {
          loginTime: {
            type: Date,
            default: Date.now,
          },
          attemptsReached: {
            type: Number,
            max: [5, "Attempts cannot be more than 5"],
            default: 0,
          },
          maxAttemptsReached: {
            type: Boolean,
            default: false,
          },
          metadata: MetadataSchema,
        },
      ],
    },
    security: {
      loginAttempts: {
        type: Number,
        default: 0,
        max: 5,
      },
      lockUntil: Date,
    },
    refreshTokens: [
      {
        token: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
          expires: 604800,
        },
        metadata: MetadataSchema,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.__v;
        return ret;
      },
    },
  }
);

UserSchema.methods.isLocked = function () {
  return Date.now() < this.security.lockUntil;
};

UserSchema.methods.passwordsMatch = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.inSuccessfulLogin = async function () {
  this.security.loginAttempts++;
  await this.save();
};

UserSchema.methods.saveToken = async function (token, metadata) {
  this.refreshTokens = [...this.refreshTokens, { token, metadata }];
  return await this.save();
};

UserSchema.methods.saveChat = async function (chatId) {
  this.chats.push(chatId);
  return await this.save();
};

UserSchema.methods.successfulLogin = async function (metadata) {
  this.activity.lastLogin = Date.now();
  this.activity.totalLogins = [
    ...this.activity.totalLogins,
    {
      loginTime: Date.now(),
      attemptsReached: this.security.loginAttempts,
      maxAttemptsReached: this.security.loginAttempts === 5,
      metadata,
    },
  ];
  this.security.loginAttempts = 0;
  this.security.lockUntil = null;
  await this.save();
};

UserSchema.pre("save", async function () {
  if (this.security.lockUntil < Date.now()) {
    this.security.lockUntil = null;
  }
  if (this.isModified("password"))
    this.password = await bcrypt.hash(this.password, 12);
  if (this.security.loginAttempts === 5) {
    this.security.loginAttempts = 0;
    this.security.lockUntil = Date.now() + 5 * 60 * 1000;
  }
});

module.exports = mongoose.model("User", UserSchema);
