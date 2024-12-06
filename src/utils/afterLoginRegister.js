import io from "socket.io-client";
import { getBackendURL } from "./getBackendURL";

const socket = io(getBackendURL(), {
  autoConnect: false,
  transports: ["websocket"],
  extraHeaders: {
    "ngrok-skip-browser-warning": "1234",
  },
});

export const afterLoginRegister = (data) => {
  // socket.connect();
  // socket.emit("user-login", data.id);
  localStorage.setItem("token", JSON.stringify(data));
};
