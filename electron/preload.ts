import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  ping: () => "pong",
  selectProject: (path: string) => ipcRenderer.send("project-selected", path),
});
