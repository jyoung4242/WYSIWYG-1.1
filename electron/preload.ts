import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  ping: () => "pong",
  selectProject: (path: string) => ipcRenderer.send("project-selected", path),
  newProject: () => ipcRenderer.send("new-project"),
  exit: () => ipcRenderer.send("exit"),
});
