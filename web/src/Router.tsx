import { createBrowserRouter } from "react-router";
import { ChatScreen } from "./screens/ChatScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ChatScreen />,
  },
]);
