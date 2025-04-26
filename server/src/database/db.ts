import Database from "better-sqlite3";
import { join } from "path";
import dotenv from "dotenv";

dotenv.config({ path: join(__dirname, "../../../", ".env") });

const db = new Database(join(__dirname, "../../../", process.env.DB_PATH!));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER NOT NULL,
        username TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms (id)
            ON DELETE CASCADE
            ON UPDATE NO ACTION
    );
`);

export default db;
