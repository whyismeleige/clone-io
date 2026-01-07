/**
 * Database Seed Script
 *
 * This script creates dummy users and projects with real frontend code.
 * All files are uploaded to AWS S3 and projects are made public.
 *
 * Run: node scripts/seed-database.js
 */

require("dotenv").config();
const { dummyResponses, dummyUsers, dummyPrompts } = require("./response.data"); // Adjust path if needed
const connectDB = require("../database/mongoDB"); // Adjust path if needed
const { reactJSBasePrompt } = require("../utils/prompts/defaults/react"); // Adjust path if needed
const { uploadS3File } = require("../utils/s3.utils"); // Adjust path if needed
const db = require("../models"); // Adjust path if needed
const { parseXml, mergeFileLists } = require("./conversion.utils"); // Adjust path if needed

connectDB();

const User = db.user;
const Chat = db.chat;

(async function seedDatabase() {
  try {
    console.log("\n🌱 Starting database seeding...\n");

    // 1. Clean existing data
    await User.deleteMany({});
    await Chat.deleteMany({});
    console.log("   ✓ Cleared existing Users and Chats");

    // 2. Create users
    console.log("\n👥 Creating users...");
    const createdUsers = [];
    for (const userData of dummyUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`   ✓ Created user: ${user.name} (${user.email})`);
    }

    // 3. Parse the Base UI Template (React + Vite)
    console.log("\n📂 Parsing Base Template...");
    const [initialFiles] = parseXml(reactJSBasePrompt);

    // 4. Create Projects for each dummy prompt
    console.log("\n🚀 Generating Projects...");
    
    for (let i = 0; i < dummyPrompts.length; i++) {
      const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const userPrompt = dummyPrompts[i];
      const assistantResponse = dummyResponses[i];

      console.log(`\n   Processing Prompt: "${userPrompt.substring(0, 40)}..."`);

      // Parse the AI response (which might contain TypeScript files)
      const [newFiles, artifactTitle] = parseXml(assistantResponse);

      // --- CRITICAL FIX: Merge files to remove duplicates (JS vs TS) ---
      const finalProjectFiles = mergeFileLists(initialFiles, newFiles);
      
      console.log(`     - Base files: ${initialFiles.length}`);
      console.log(`     - New files: ${newFiles.length}`);
      console.log(`     - Final merged count: ${finalProjectFiles.length} (Conflicts resolved)`);

      // Create Chat Record
      const chat = await Chat.create({
        projectName: artifactTitle,
        model: "claude-sonnet-4-5-20250929",
        createdBy: user._id,
        visibilityStatus: "public",
      });

      // Save History
      await chat.saveConversation("user", userPrompt);
      await chat.saveConversation("assistant", reactJSBasePrompt); // Hidden system prompt
      await chat.saveConversation("assistant", assistantResponse); // Visible AI response

      // Upload CLEANED file list to S3
      const uploadPromises = finalProjectFiles.map(async (file) => {
        const key = `users/${user._id}/chats/${chat._id}/${file.path}`;
        const metadata = {
          chatId: chat._id.toString(),
          userId: user._id.toString(),
          timestamp: new Date().toISOString(),
        };
        
        const url = await uploadS3File(key, file, metadata);
        return { key, url }; // Return format expected by your schema
      });

      const projectFiles = await Promise.all(uploadPromises);

      // Save S3 references to DB
      await chat.saveProjectFiles(projectFiles);
      await user.saveChat(chat._id);
      
      console.log(`     ✓ Project created & uploaded: ${artifactTitle}`);
    }

    console.log("\n✅ Database seeding completed successfully!");
    process.exit(0);

  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  }
})();