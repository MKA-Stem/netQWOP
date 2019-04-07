const generate = require("nanoid/generate");

module.exports = function id() {
  // removed l/i, o/0
  return generate("abcdefghjkmnpqrstuvwxyz23456789", 6);
};
