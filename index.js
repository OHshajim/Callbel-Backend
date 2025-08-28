const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const express = require("express");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
const httpServer = createServer(app);
const port = process.env.PORT || 5000;
const connectDB = require("./src/db/connectDB.js");

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

let userSockets = []; // Move outside, so it's shared across all connections

io.on("connection", (socket) => {
  socket.on("register", (userId) => {
    // Remove any previous socket entry for this user
    userSockets = userSockets.filter((user) => user.id !== userId);
    // Add new socket
    userSockets.push({ id: userId, socketId: socket.id });
    // Broadcast updated users (without socketId exposed)
    io.emit(
      "users",
      userSockets.map(({ socketId, ...rest }) => rest)
    );
  });

  // Guest calls registered user
  socket.on("guest-call", ({ from, to, roomName }) => {
    const target = userSockets.find((entry) => entry.id === to);

    if (target) {
      // Notify registered user about incoming call
      io.to(target.socketId).emit("incoming-call", {
        from: { name: from, guest: true, socketId: socket.id }, // include guest socketId
        roomName,
      });
    }
  });

  // Registered user accepts the call
  socket.on("call-accepted", ({ roomName, guestSocketId }) => {
    io.to(guestSocketId).emit("call-accepted", {
      roomName,
      peerSocketId: socket.id,
    });
  });

  // Registered user declines call
  socket.on("call-declined", ({ guestSocketId }) => {
    // Send decline event back to the guest
    io.to(guestSocketId).emit("call-declined");
  });

  // When a user ends the call
  socket.on("end-call", ({ targetSocketId }) => {
    // Notify the other peer
    io.to(targetSocketId).emit("end-call");
    // Also notify the sender (so both clean up at once)
    io.to(socket.id).emit("end-call");
  });

  // When the caller cancels the call
  socket.on("callCanceled", ({ userId }) => {
    const target = userSockets.find((entry) => entry.id === userId);
    if (target) {
      io.to(target.socketId).emit("callCanceled", {
        from: socket.id,
        success: true,
      });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    const index = userSockets.findIndex(
      (entry) => entry.socketId === socket.id
    );
    if (index !== -1) userSockets.splice(index, 1);

    io.emit(
      "users",
      userSockets.map(({ socketId, ...rest }) => rest)
    );
  });
});

const userRoutes = require("./src/routes/auth/index.js");
const liveKit = require("./src/routes/liveKit/index.js");
const users = require("./src/routes/users/index.js");
const paygic = require("./src/routes/paygic/index.js");
const admin = require("./src/routes/admin/index.js");

app.use("/v1/api/auth", userRoutes);
app.use("/v1/api/liveKit", liveKit);
app.use("/v1/api/users", users);
app.use("/v1/api/paygic", paygic);
app.use("/v1/api/admin", admin);

app.get("/", (req, res) => {
  res.send("Welcome to the virtual callbell Call Backend");
});

const main = async () => {
  console.log("Called");
  await connectDB();

  httpServer.listen(port, () => {
    console.log("listening to port ", port);
  });
};

main();
