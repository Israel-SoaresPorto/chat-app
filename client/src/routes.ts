import { createBrowserRouter } from "react-router";
import App from "./App";
import ChatRoom from "./pages/ChatRoom";

const routes = createBrowserRouter([
  {
    path: "/",
    Component: App,
  },
  {
    path: "/chat/:room",
    Component: ChatRoom,
  },
]);

export default routes;
