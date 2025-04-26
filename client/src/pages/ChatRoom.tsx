import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { io } from "socket.io-client";

type Message = {
  username: string;
  message: string;
  timestamp: string;
};

const socket = io("http://localhost:3000", {
  withCredentials: true,
  autoConnect: false,
});

export default function ChatRoom() {
  const { room } = useParams<{ room: string }>();
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username");
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!room || !username) return;

    socket.connect();

    socket.emit("joinRoom", {
      room,
      username,
    });

    const handlePreviousMessages = (previousMessages: Message[]) => {
      setMessages(previousMessages);
    };

    const handleNewMessage = (data: Message) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          username: data.username,
          message: data.message,
          timestamp: data.timestamp,
        },
      ]);
    };

    socket.on("messages", handlePreviousMessages);
    socket.on("response", handleNewMessage);

    return () => {
      socket.emit("leaveRoom", room);
      socket.off("messages", handlePreviousMessages);
      socket.off("response", handleNewMessage);
      socket.disconnect();
    };
  }, [room, username]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    socket.emit("message", { room, username, message });
    setMessage("");
  };

  const handleExitRoom = () => {
    socket.emit("leaveRoom", { room, username });
    socket.disconnect();
    navigate("/");
  };

  if (!room) {
    return <div>Erro: sala não encontrada</div>;
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-xl flex flex-col gap-6 p-4 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h3>Nome da sala: {room}</h3>
            <h3>Usuário: {username}</h3>
          </div>
          <button
            className="bg-blue-500 text-white rounded-md py-2 px-4 cursor-pointer"
            onClick={handleExitRoom}
          >
            Sair
          </button>
        </div>
        <div className="flex flex-col overflow-y-auto h-80 bg-gray-100 rounded-md">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col p-2 rounded-md  m-2 ${
                username === msg.username
                  ? "bg-green-400 self-end rounded-br-none"
                  : "bg-blue-400 self-start rounded-bl-none"
              }`}
            >
              <span className="flex justify-between gap-4">
                <span className="font-bold">{msg.username}</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
              </span>
              <span>{msg.message}</span>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            placeholder="Digite sua mensagem"
            className="border-2 border-r-0 border-gray-300 rounded-md rounded-r-none p-2 w-full"
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-md rounded-l-none p-2 cursor-pointer "
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
