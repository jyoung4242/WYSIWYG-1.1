import { ipcMain, dialog, app } from "electron";
import path from "path";
import { ProjectState } from "./projectState";
import { UUID } from "./UUID";

interface IpcHandlerContext {
  createWindow: () => Promise<void>;
  closeSplash: () => void;
}

export function registerIpcHandlers(context: IpcHandlerContext) {
  const { createWindow, closeSplash } = context;

  // Event handlers (one-way communication)
  ipcMain.on("project-selected", (event, arg) => {
    const dir = path.dirname(arg);
    const fname = path.basename(arg);
    closeSplash();
    ProjectState.setProjectRoot(dir);
    ProjectState.setProjectFileName(fname);
    ProjectState.load();
    createWindow();
  });

  ipcMain.on("exit", () => {
    app.quit();
  });

  ipcMain.on("new-project", (event, arg) => {
    const dir = path.dirname(arg);
    const fname = path.basename(arg);
    closeSplash();
    ProjectState.setProjectRoot(dir);
    ProjectState.setProjectFileName(fname);
    ProjectState.setupNewProjectDefaults();
    ProjectState.save();
    createWindow();
  });

  // Async handlers (with return values)
  ipcMain.handle("project:get", async () => {
    return ProjectState.data;
  });

  ipcMain.handle("project:update", async (_event, partial) => {
    await ProjectState.update(partial);
    return ProjectState.data;
  });

  ipcMain.handle("project:load", async () => {
    await ProjectState.load();
    return ProjectState.data;
  });

  ipcMain.handle("project:getProjectTreeData", async () => {
    return ProjectState.getProjectTreeData();
  });

  ipcMain.handle("project:openDirectory", async () => {
    const result = await dialog.showOpenDialog({
      title: "Select an Excalibur Project File",
      properties: ["openFile"],
      filters: [
        { name: "Excalibur Project", extensions: ["exProj"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  ipcMain.handle("project:newFile", async () => {
    const result = await dialog.showSaveDialog({
      title: "Create New Project",
      defaultPath: "MyProject.exProj",
      filters: [{ name: "Excalibur Project", extensions: ["exProj"] }],
    });
    if (result.canceled || !result.filePath) return null;
    return result.filePath;
  });

  ipcMain.handle("project:getDataByID", async (_event, id: UUID) => {
    return ProjectState.findById(id);
  });
}

// Optional: cleanup function to remove all handlers
export function unregisterIpcHandlers() {
  ipcMain.removeAllListeners("project-selected");
  ipcMain.removeAllListeners("exit");
  ipcMain.removeAllListeners("new-project");
  ipcMain.removeHandler("project:get");
  ipcMain.removeHandler("project:update");
  ipcMain.removeHandler("project:load");
  ipcMain.removeHandler("project:getProjectTreeData");
  ipcMain.removeHandler("project:openDirectory");
  ipcMain.removeHandler("project:newFile");
  ipcMain.removeHandler("project:getDataByID");
}
