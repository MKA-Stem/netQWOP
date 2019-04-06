/* eslint-disable no-console */

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const socketIO = require("socket.io");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

async function main() {
  await app.prepare();

  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = socketIO(server);

  io.on("connection", socket => {
    const log = (...text) => console.log(`[${socket.id}] `, ...text);
    log("connected");

    let room = null;
    socket.on("join", joinRoom => {
      room = joinRoom;
      log("join", room);
      socket.join(room);
    });

    socket.on("button", msg => {
      log("button", msg);
      io.to(room).emit("button", msg);
    });
  });

  server.listen(port, err => {
    if (err) {
      throw err;
    }
    console.log(`[ listening on http://localhost:${port} ]`);
  });
}

main().catch(e => console.error(e));
