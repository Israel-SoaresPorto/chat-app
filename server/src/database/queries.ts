import db from "./db";
import { Message } from "./types";
import { Room } from "./types";

export function getAllRooms(): Room[] {
  const rooms = db.prepare<[], Room>("SELECT * FROM rooms").all();
  return rooms;
}

export function getRoomByName(roomName: string): Room | undefined {
  const room = db
    .prepare<[string], Room>("SELECT * FROM rooms WHERE name = ?")
    .get(roomName);

  return room;
}

export function getRoomById(roomId: number): Room | undefined {
  const room = db
    .prepare<[number], Room>("SELECT * FROM rooms WHERE id = ?")
    .get(roomId);

  return room;
}

export function createRoom(roomName: string): Room | undefined {
  const roomIdCreated = db
    .prepare("INSERT INTO rooms (name) VALUES (?)")
    .run(roomName).lastInsertRowid;

  const room = db
    .prepare<[number | bigint], Room>("SELECT * FROM rooms WHERE id = ?")
    .get(roomIdCreated);
  return room;
}

export function getMessagesByRoomId(roomId: number): Message[] {
  const messages = db
    .prepare<[number], Message>(
      "SELECT * FROM messages WHERE room_id = ? ORDER BY timestamp DESC"
    )
    .all(roomId);
  return messages;
}

export function createMessage(
  roomId: number | bigint,
  username: string,
  message: string
): Message | undefined {
  const messageIDCreated = db
    .prepare(
      "INSERT INTO messages (room_id, username, message) VALUES (?, ?, ?)"
    )
    .run(roomId, username, message).lastInsertRowid;

  const messageCreated = db
    .prepare<[number | bigint], Message>(
      "SELECT * FROM messages WHERE id = ? ORDER BY timestamp DESC"
    )
    .get(messageIDCreated);

  return messageCreated;
}

export function deleteRoom(roomName: string): number | bigint {
  const deletedIdroom = db
    .prepare("DELETE FROM rooms WHERE name = ?")
    .run(roomName).lastInsertRowid;
  return deletedIdroom;
}
