import { useState } from "react";
import { useNavigate } from "react-router";

function App() {
  const [room, setRoom] = useState<string>("");
  const [name, setName] = useState<string>("");

  const navigate = useNavigate();

  const handleJoinRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (room.trim()) {
      navigate(`/chat/${room}?username=${name}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 h-screen">
      <div className="flex flex-col items-center gap-2">
        <h1 className="mb-2">Chat App</h1>
        <p>Digite o nome da sala e clique em entrar</p>
        <p>Se a sala não existir, ela será criada automaticamente</p>
        <p>Se a sala já existir, você será redirecionado para ela</p>
      </div>
      <form onSubmit={handleJoinRoom} className="flex flex-col gap-2">
        <input
          id="room"
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="digite o nome da sala"
          className="border-2 border-gray-300 rounded-md p-2"
        />
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="digite seu nome"
          className="border-2 border-gray-300 rounded-md p-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white rounded-md p-2 cursor-pointer"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}

export default App;
