import express from "express";
import http, { get, STATUS_CODES } from "http";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { join } from "path";
import {
  createRoom,
  getAllRooms,
  getMessagesByRoomId,
  deleteRoom,
  createMessage,
  getRoomByName,
} from "./database/queries";
import { Message } from "./database/types";

const app = express();
const server = http.createServer(app);

const envFile =
  process.env.NODE_ENV === "production" ? ".env" : ".env.development";

dotenv.config({ path: join(__dirname, "../../", envFile) });

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  connectionStateRecovery: {},
});

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.get("/rooms", (req, res) => {
  try {
    const rooms = getAllRooms();
    res.status(200).json({ data: rooms });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

io.on("connection", (socket) => {
  console.log("Um usuário se conectou ao servidor");

  socket.on("joinRoom", ({ room, username }) => {
    console.log(`Usuário ${username} entrou na sala: ${room}`);

    const roomExists = getRoomByName(room);
    const roomCreated = roomExists ? roomExists : createRoom(room);

    let messages: Message[] = [];

    if (roomExists) {
      socket.join(roomCreated?.name as string);
      messages = getMessagesByRoomId(roomCreated?.id as unknown as number);
    }

    if (roomCreated) {
      socket.join(roomCreated?.name as string);
      messages = getMessagesByRoomId(roomCreated?.id as unknown as number);
    }

    const roomInfo = io.sockets.adapter.rooms.get(room);
    console.log(`Usuários na sala ${room}:`, roomInfo?.size);

    if (messages) {
      io.to(room).emit("messages", messages);
      console.log(`Mensagens enviadas para a sala ${room}:`, messages);
    }
  });

  socket.on("leaveRoom", ({ room, username }) => {
    socket.leave(room);
    console.log(`Usuário ${username} saiu da sala: ${room}`);

    const roomInfo = io.sockets.adapter.rooms.get(room);

    console.log(`Usuários na sala ${room}:`, roomInfo?.size);

    if (!roomInfo || roomInfo?.size === 0) {
      console.log(`A sala ${room} está vazia. Deletando...`);
      deleteRoom(room);
    }
  });

  socket.on("message", ({ room, username, message }) => {
    console.log(`mensagem recebida na sala: ${room} : ${message}`);

    const roomExists = getRoomByName(room);
    if (!roomExists) {
      console.log(`A sala ${room} não existe.`);
      socket.emit("error", {
        message: `A sala ${room} não existe.`,
      });
      return;
    }

    const createMessageResult = createMessage(roomExists.id, username, message);

    if (createMessageResult) {
      io.to(room).emit("response", {
        username: createMessageResult.username,
        message: createMessageResult.message,
        timestamp: createMessageResult.timestamp,
      } as Message);
    }
  });

  socket.on("disconnect", () => {
    console.log(`O usuário ${socket.id} se desconectou`);

    for (const [room, sockets] of io.sockets.adapter.rooms.entries()) {
      if (sockets.has(socket.id)) {
        console.log(`Usuário saiu da sala: ${room}`);
        socket.leave(room);

        const roomInfo = io.sockets.adapter.rooms.get(room);

        if (!roomInfo || roomInfo?.size === 0) {
          console.log(`A sala ${room} está vazia. Deletando...`);
          deleteRoom(room);
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
