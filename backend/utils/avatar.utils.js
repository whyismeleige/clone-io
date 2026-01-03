const { createAvatar } = require("@dicebear/core");
const {
  adventurer,
  bigSmile,
  funEmoji,
  lorelei,
  micah,
  notionists,
  pixelArt,
  croodles,
} = require("@dicebear/collection");

const styles = [
  adventurer,
  bigSmile,
  funEmoji,
  lorelei,
  micah,
  notionists,
  pixelArt,
  croodles,
];

const createRandomAvatar = () => {
  const style = styles[Math.floor(Math.random() * styles.length)];
  const seed = crypto.randomUUID();

  return createAvatar(style, { seed }).toDataUri();
};

module.exports = createRandomAvatar;