const { createServer } = require("http");
const { Server } = require("socket.io");
const admin = require("firebase-admin");
const cors = require("cors");
const express = require("express");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const port = process.env.PORT || 5000;
const connectDB = require("./src/db/connectDB.js");

// Initialize Firebase Admin
if (process.env.PROJECT_ID && process.env.CLIENT_EMAIL && process.env.PRIVATE_KEY) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                type: process.env.TYPE,
                project_id: process.env.PROJECT_ID,
                private_key_id: process.env.PRIVATE_KEY_ID,
                private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, "\n"),
                client_email: process.env.CLIENT_EMAIL,
                client_id: process.env.CLIENT_ID,
                auth_uri: process.env.AUTH_URI,
                token_uri: process.env.TOKEN_URI,
                auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_CERT_URL,
                client_x509_cert_url: process.env.CLIENT_CERT_URL,
                universe_domain: process.env.UNIVERSE_DOMAIN,
            }),
        });
        console.log("✅ Firebase Admin initialized with local serviceAccountKey.json");
    } catch (err) {
        console.error("❌ Failed to initialize Firebase Admin:", err);
    }
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
        admin.initializeApp();
        console.log("✅ Firebase Admin initialized using GOOGLE_APPLICATION_CREDENTIALS");
    } catch (err) {
        console.error("❌ Failed to initialize Firebase Admin:", err);
    }
} else {
    console.warn(
        "⚠️ Firebase service account not found and GOOGLE_APPLICATION_CREDENTIALS not set."
    );
}

// Socket.IO setup
const io = new Server(httpServer, { cors: { origin: "*" } });
let userSockets = []; // keep track of connected users

io.on("connection", (socket) => {
    console.log("🔹 New socket connected:", socket.id);

    // User registration
    socket.on("register", (userId) => {
        userSockets = userSockets.filter((user) => user.id !== userId);
        userSockets.push({ id: userId, socketId: socket.id });

        io.emit("users", userSockets.map(({ socketId, ...rest }) => rest));
    });

    // Guest calls a registered user
    socket.on("guest-call", async ({ from, to, roomName, fcmToken }) => {
        const target = userSockets.find((entry) => entry.id === to);

        if (target) {
            // Notify via Socket.IO
            io.to(target.socketId).emit("incoming-call", {
                from: { name: from, guest: true, socketId: socket.id },
                roomName,
            });

            // Send FCM notification
            if (fcmToken) {
                const message = {
                    token: fcmToken,
                    data: {
                        type: "incoming_call",
                        caller_name: String(from),
                        room_id: String(roomName),
                    },
                    android: {
                        notification: {
                            title: "Incoming Call",
                            body: `${from} is calling you`,
                            sound: "default",
                        },
                    },
                };

                try {
                    await admin.messaging().send(message);
                    console.log("✅ FCM Notification sent successfully");
                } catch (error) {
                    console.error("❌ FCM Error:", error);
                }
            }
        }
    });

    // Call accepted
    socket.on("call-accepted", ({ roomName, guestSocketId }) => {
        io.to(guestSocketId).emit("call-accepted", {
            roomName,
            peerSocketId: socket.id,
        });
    });

    // Call declined
    socket.on("call-declined", ({ guestSocketId }) => {
        io.to(guestSocketId).emit("call-declined");
    });

    // End call
    socket.on("end-call", ({ targetSocketId }) => {
        io.to(targetSocketId).emit("end-call");
        io.to(socket.id).emit("end-call");
    });

    // Cancel call
    socket.on("callCanceled", ({ userId }) => {
        const target = userSockets.find((entry) => entry.id === userId);
        if (target) {
            io.to(target.socketId).emit("callCanceled", { from: socket.id, success: true });
        }
    });

    // Disconnect
    socket.on("disconnect", () => {
        userSockets = userSockets.filter((entry) => entry.socketId !== socket.id);
        io.emit("users", userSockets.map(({ socketId, ...rest }) => rest));
        console.log("🔹 Socket disconnected:", socket.id);
    });
});

// API routes
const userRoutes = require("./src/routes/auth/index.js");
const liveKit = require("./src/routes/liveKit/index.js");
const users = require("./src/routes/users/index.js");
const paygic = require("./src/routes/paygic/index.js");
const adminRoutes = require("./src/routes/admin/index.js");

app.use("/v1/api/auth", userRoutes);
app.use("/v1/api/liveKit", liveKit);
app.use("/v1/api/users", users);
app.use("/v1/api/paygic", paygic);
app.use("/v1/api/admin", adminRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to the virtual callbell Call Backend");
});

// Start HTTP server with retry
const startServerWithRetry = (startPort, maxRetries = 5) => {
    let attempts = 0;

    const tryListen = (portToTry) => {
        httpServer.once("error", (err) => {
            if (err && err.code === "EADDRINUSE") {
                if (attempts < maxRetries) {
                    console.warn(`Port ${portToTry} in use, trying ${portToTry + 1}...`);
                    attempts++;
                    setTimeout(() => tryListen(portToTry + 1), 200);
                } else {
                    console.error(`Port ${startPort} and next ${maxRetries} ports in use. Exiting.`);
                    process.exit(1);
                }
            } else {
                console.error("Server error:", err);
                process.exit(1);
            }
        });

        httpServer.once("listening", () => {
            const addr = httpServer.address();
            const listeningPort = typeof addr === "object" ? addr.port : addr;
            console.log("✅ Listening on port", listeningPort);
        });

        httpServer.listen(portToTry);
    };

    tryListen(startPort);
};

// Main
const main = async () => {
    console.log("🔹 Connecting to database...");
    await connectDB();

    console.log("🔹 Starting server...");
    startServerWithRetry(port, 10);
};

main();
