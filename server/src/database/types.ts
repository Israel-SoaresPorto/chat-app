export interface Room {
  id: number | bigint;
  name: string;
}

export interface Message {
  id: number | bigint;
  room_id: string;
  username: string;
  message: string;
  timestamp: Date;
}
