import { contextBridge, ipcRenderer } from "electron";
import { ProjectData } from "./types";
import { UUID } from "./UUID";

contextBridge.exposeInMainWorld("api", {
  ping: () => "pong",
  selectProject: (path: string) => ipcRenderer.send("project-selected", path),
  newProject: (path: string) => ipcRenderer.send("new-project", path),
  exit: () => ipcRenderer.send("exit"),
  get: () => ipcRenderer.invoke("project:get"),
  update: (partial: Partial<ProjectData>) => ipcRenderer.invoke("project:update", partial),
  load: () => ipcRenderer.invoke("project:load"),
  getProjectTreeData: () => ipcRenderer.invoke("project:getProjectTreeData"),
  selectProjectDirectory: () => ipcRenderer.invoke("project:openDirectory"),
  createNewProjectFile: () => ipcRenderer.invoke("project:newFile"),
  getDataByID: (id: UUID) => ipcRenderer.invoke("project:getDataByID", id),
});
