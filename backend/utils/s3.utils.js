require("dotenv").config();
const { GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = require("../config/s3.config");

const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const AWS_REGION = process.env.AWS_REGION;

async function uploadS3File(key, file, metadata) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file.content,
    ContentType: getContentType(file.path),
    Metadata: { ...metadata },
  });

  await s3Client.send(command);

  const s3URL = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;

  return s3URL;
}

function getContentType(filename) {
  const ext = filename.split(".").pop()?.toLowerCase();
  const contentTypes = {
    // Text files
    txt: "text/plain",
    md: "text/markdown",
    json: "application/json",
    xml: "application/xml",
    csv: "text/csv",

    // Web files
    html: "text/html",
    css: "text/css",
    js: "application/javascript",
    jsx: "application/javascript",
    ts: "application/typescript",
    tsx: "application/typescript",

    // Programming languages
    py: "text/x-python",
    java: "text/x-java",
    cpp: "text/x-c++src",
    c: "text/x-csrc",
    go: "text/x-go",
    rs: "text/x-rust",
    php: "text/x-php",
    rb: "text/x-ruby",

    // Config files
    yml: "text/yaml",
    yaml: "text/yaml",
    toml: "text/plain",
    ini: "text/plain",
    env: "text/plain",

    // Images
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    webp: "image/webp",

    // Documents
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };

  return contentTypes[ext] || "application/octet-stream";
}

module.exports = { uploadS3File };
