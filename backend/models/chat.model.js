const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      index: true,
    },
    projectS3Url: {
      type: String,
      trim: true,
    },
    projectFiles: [
      {
        key: {
          type: String,
          trim: true,
          required: true,
        },
        url: {
          type: String,
          trim: true,
          required: true,
        },
      },
    ],
    snapshot: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
      required: true,
    },
    conversations: [
      {
        role: {
          type: String,
          enum: {
            values: ["user", "assistant"],
            message: "{VALUE} is not a valid role",
          },
          required: [true, "Role is Required"],
        },
        content: {
          type: String,
          required: [true, "Content is Required"],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    githubRepo: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true; // Optional field
          return /^https:\/\/github\.com\/[\w-]+\/[\w-]+$/.test(v);
        },
        message: "Invalid GitHub repository URL",
      },
    },
    deploymentLink: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^https?:\/\/.+/.test(v);
        },
        message: "Invalid deployment URL",
      },
    },
    views: {
      type: Number,
      default: 0,
    },
    visibilityStatus: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    isDeployed: {
      type: Boolean,
      default: false,
      index: true,
    },
    deployedAt: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A Project Owner is required"],
      index: true,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "archived", "deleted"],
      default: "active",
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ChatSchema.index({ createdBy: 1, createdAt: -1 });
ChatSchema.index({ projectName: "text" });

ChatSchema.methods.modifyChat = async function (data) {
  if (data.toggleStarStatus) this.isStarred = !this.isStarred;
  this.visibilityStatus = data?.visibilityStatus || this.visibilityStatus;
  this.projectName = data?.projectName || this.projectName;
  return await this.save();
};

ChatSchema.methods.saveSnapshot = async function (cdnUrl) {
  this.snapshot = cdnUrl;
  await this.save();
}

ChatSchema.methods.saveConversation = async function (role, content) {
  this.conversations.push({ role, content });
  await this.save();
};

ChatSchema.methods.saveProjectFiles = async function (files) {
  this.projectFiles = files;
  return await this.save();
};

ChatSchema.methods.softDelete = async function (userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  this.status = "deleted";
  return await this.save();
};

ChatSchema.pre("save", function () {
  if (this.isModified("conversation")) {
    this.lastActivity = new Date();
  }
});

ChatSchema.virtual("messageCount").get(function () {
  return this.conversation.length;
});

module.exports = mongoose.model("Chat", ChatSchema);
