const { Anthropic } = require("@anthropic-ai/sdk");
const { sanitizeUser } = require("../utils/auth.utils");
const { BASE_PROMPT, getSystemPrompt } = require("../utils/prompts/index");
const { reactJSBasePrompt } = require("../utils/prompts/defaults/react");
const { nodeJSBasePrompt } = require("../utils/prompts/defaults/node");
const asyncHandler = require("../middleware/asyncHandler");
const db = require("../models");
const { ValidationError, ExternalAPIError } = require("../utils/errors.utils");
const { dummyPromptData } = require("../utils/dummyData");
const { uploadS3File } = require("../utils/s3.utils");
const anthropic = new Anthropic();

const User = db.user;
const Chat = db.chat;

const handleClaudeErrors = (error) => {
  if (error.status === 401) {
    throw new ExternalAPIError("Invalid API Key", error);
  }
  if (error.status === 429) {
    throw new ExternalAPIError(
      "Rate limit exceeded. Please try again later",
      error
    );
  }
  if (error.status === 500) {
    throw new ExternalAPIError("Claude API is currently unavailable", error);
  }
  throw new ExternalAPIError("Failed to process prompt with Claude API", error);
};

exports.getChats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("chats");

  const chats = user.chats.map((chat) => ({
    _id: chat._id,
    projectName: chat.projectName,
    isStarred: chat.isStarred,
    timestamp: chat.createdAt,
  }));

  res.status(200).send({
    message: "Chats retrieved successfully",
    type: "success",
    chats,
  });
});

exports.sendPrompt = asyncHandler(async (req, res) => {
  const { messages, chatId } = req.body;

  if (
    !messages ||
    !chatId ||
    !Array.isArray(messages) ||
    messages.length === 0
  ) {
    throw new ValidationError(
      "Messages and Chat are required and cannot be empty"
    );
  }

  const isValidMessages = messages.every(
    (msg) => msg.role && msg.content && ["user", "assistant"].includes(msg.role)
  );

  if (!isValidMessages) {
    throw new ValidationError(
      "Invalid Message format. Each message should consist 'role' and 'content'"
    );
  }

  const chat = await Chat.findById(chatId);

  await chat.saveConversation("user", messages[messages.length - 1].content);

  if (!chat) {
    throw new ValidationError("Chat not found");
  }

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const MAX_TOKENS = process.env.NODE_ENV === "production" ? 16000 : 200;

    if (process.env.NODE_ENV !== "production") {
      // Dummy response data
      const dummyResponse = dummyPromptData;

      const fullText = dummyResponse.content[0].text;

      // Simulate message_start
      res.write(
        `data: ${JSON.stringify({
          type: "message_start",
          message: dummyResponse,
        })}\n\n`
      );

      // Simulate streaming text in chunks
      const chunkSize = 50;
      for (let i = 0; i < fullText.length; i += chunkSize) {
        const length = Math.min(fullText.length - 1, i + chunkSize);
        const chunk = fullText.slice(i, length);

        res.write(
          `data: ${JSON.stringify({
            type: "text_block",
            delta: chunk,
          })}\n\n`
        );

        // Add small delay to simulate streaming
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // Save conversation
      await chat.saveConversation("assistant", fullText);

      // Send final message
      res.write(
        `data: ${JSON.stringify({
          type: "done",
          message: dummyResponse,
          fullText,
          truncated: dummyResponse.stop_reason === "max_tokens",
        })}\n\n`
      );

      console.log(
        `Tokens used (dummy): ${dummyResponse.usage.output_tokens}/${MAX_TOKENS}`
      );

      res.end();
      return;
    }

    const stream = await anthropic.messages.stream({
      messages,
      model: "claude-3-5-haiku-latest",
      max_tokens: MAX_TOKENS,
    });

    let fullText = "";

    stream.on("connect", (message) => {
      res.write(
        `data: ${JSON.stringify({
          type: "message_start",
          message,
        })}`
      );
    });

    stream.on("text", (text) => {
      fullText += text;

      res.write(
        `data: ${JSON.stringify({
          type: "text_block",
          delta: text,
        })}\n\n`
      );
    });

    stream.on("end", async () => {
      const finalMessage = await stream.finalMessage();

      // Log if response was truncated
      if (finalMessage.stop_reason === "max_tokens") {
        console.warn("⚠️  Response truncated due to max_tokens limit");
      }

      await chat.saveConversation("assistant", finalMessage.content[0].text);

      res.write(
        `data: ${JSON.stringify({
          type: "done",
          message: finalMessage,
          fullText,
          truncated: finalMessage.stop_reason === "max_tokens",
        })}\n\n`
      );

      console.log(
        `Tokens used: ${finalMessage.usage.output_tokens}/${MAX_TOKENS}`
      );

      res.end();
    });

    stream.on("error", (error) => {
      console.error("Stream error:", error);
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          error: error.message,
        })}\n\n`
      );
      res.end();
    });
  } catch (error) {
    if (!res.headersSent) {
      handleClaudeErrors(error);
    } else {
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          error: error.message,
        })}\n\n`
      );
      res.end();
    }
  }
});

exports.createTemplate = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    throw new ValidationError("Prompt is required");
  }

  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    throw new ValidationError("Prompt must be a non empty string");
  }

  if (prompt.length > 5000) {
    throw new Error("Prompt is too long. Maximum 5000 characters are allowed");
  }

  let response;

  try {
    response = await anthropic.messages.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "claude-3-haiku-20240307",
      max_tokens: 200,
      system:
        "Based on the user's prompt, return two things separated by a pipe character (|):\n1. Either 'node' or 'react' based on what you think this project should be\n2. A suitable title for the project\n\nFormat: node|Project Title\nor: react|Project Title\n\nDo not return anything extra.",
    });
  } catch (error) {
    handleClaudeErrors(error);
  }

  const [projectType, projectTitle] = response.content[0].text.split("|"); // react or node and the project title is sent

  const newChat = await Chat.create({
    projectName: projectTitle,
    model: "claude-sonnet-4-20250514",
    createdBy: req.user._id,
  });

  await req.user.saveChat(newChat._id);

  if (projectType === "react") {
    return res.status(200).send({
      message: "React Template created successfully",
      type: "success",
      newChat,
      prompts: [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactJSBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [reactJSBasePrompt],
    });
  }

  if (projectType === "node") {
    return res.status(200).send({
      message: "Node Template created successfully",
      type: "success",
      newChat,
      prompts: [
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeJSBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [reactJSBasePrompt],
    });
  }

  throw new ExternalAPIError(`Unexpected Response. Please Try Again`);
});

exports.fetchChat = asyncHandler(async (req, res) => {
  const chatId = req.query.id;

  const chat = await Chat.findById(chatId).populate({
    path: "createdBy",
    transform: (doc) => {
      if (!doc) return;
      sanitizeUser(doc);
    },
  });

  if (!chat) {
    throw new ValidationError("Chat does not exist");
  }

  res.status(200).send({
    message: "Chat retrieved successfully",
    type: "success",
    chat,
  });
});

exports.uploadProjectToS3 = asyncHandler(async (req, res) => {
  const chatId = req.query.id;
  const { files } = req.body;
  const userId = req.user._id;

  if (!files || !chatId || !Array.isArray(files)) {
    throw new ValidationError("Chat and Project Files are required for upload");
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    throw new ValidationError("Chat does not exist");
  }

  const uploadPromises = files.map(async (file) => {
    const key = `users/${userId}/chats/${chatId}/${file.path}`;
    const metadata = { chatId, userId, timestamp: new Date().toISOString() };
    const url = await uploadS3File(key, file, metadata);

    return { key, url };
  });

  const projectFiles = await Promise.all(uploadPromises);

  await chat.saveProjectFiles(projectFiles);

  res.status(200).send({
    message: "Project Files saved successfully",
    type: "success",
    projectFiles
  });
});
