/* eslint-disable no-console */
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const socketIO = require("socket.io");
const generateId = require("./lib/id");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const games = new Map();
function findId() {
  let id = null;
  do {
    id = generateId();
  } while (games.has(id));
  return id;
}

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
    let host = false;

    // Creates a room, called by the host.
    socket.on("host", (_data, cb) => {
      // handle reconnects
      if (room) {
        cb(room);
        return;
      }

      const createRoom = findId();
      room = createRoom;
      host = true;
      log("host", room);

      socket.join(room);
      games.set(room, socket.id);
      cb(room);
    });

    // Joins the socket to a room, called by the client.
    socket.on("join", joinRoom => {
      // check invalid room
      if (!games.has(joinRoom)) {
        socket.emit("close");
        return;
      }

      room = joinRoom;
      host = false;
      log("join", room);

      socket.join(room);
    });

    // Checks if a room is valid.
    socket.on("check", (checkRoom, cb) => {
      if (games.has(checkRoom)) {
        cb({ valid: true });
      } else {
        cb({ valid: false });
      }
    });

    // Button click event, called by the client.
    socket.on("button", msg => {
      log("button", msg);
      io.to(room).emit("button", msg);
    });

    // Disconnect all clients by emitting "close" event
    socket.on("disconnect", () => {
      io.to(room).emit("close");
      if (host) {
        games.delete(room);
      }
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
