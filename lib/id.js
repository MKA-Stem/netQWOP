import generate from "nanoid/generate";

export default function id() {
  // removed l/i, o/0
  return generate("abcdefghjkmnpqrstuvwxyz23456789", 6);
}
