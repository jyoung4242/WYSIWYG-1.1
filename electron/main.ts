import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import dotenv from "dotenv";
import { ProjectState } from "./projectState";

dotenv.config();

let mainWindow: BrowserWindow | null = null;
let splash: BrowserWindow | null = null;

async function createWindow() {
  const iconPath = path.join(process.cwd(), "public", "graphics", "ex-logo.png");
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: iconPath, // ✅ window + taskbar icon
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // compiled JS path
    },
  });

  console.log("loading main - process.env.NODE_ENV", process.env.NODE_ENV);

  if (process.env.NODE_ENV === "development") {
    await mainWindow.loadURL("http://localhost:5173");
  } else {
    // Production: load built Vite index.html
    await mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
  // mainWindow.webContents.openDevTools(); // for debugging
}

async function createSplash() {
  const iconPath = path.join(process.cwd(), "public", "graphics", "ex-logo.png");
  splash = new BrowserWindow({
    width: 600,
    height: 400,
    type: "splash",
    frame: false,
    icon: iconPath, // ✅ window + taskbar icon
    resizable: false, // <- disables resizing
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true, // required for contextBridge
      nodeIntegration: false, // should be false for security
    },
  });
  console.log("loading splash");

  if (process.env.NODE_ENV === "development") {
    await splash.loadURL("http://localhost:5173/splash.html"); // root-relative paths work
  } else {
    console.log("production splash");

    await splash.loadFile(path.join(__dirname, "../dist/splash.html"));
  }
  // splash.webContents.openDevTools(); // for debugging
}

app.on("ready", createSplash);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// *************
// IPC
// *************
ipcMain.on("project-selected", (event, arg) => {
  //load the project
  let dir = path.dirname(arg);
  let fname = path.basename(arg);
  console.log("dir", dir, "fname", fname);

  if (splash) {
    splash.close();
    ProjectState.setProjectRoot(dir);
    ProjectState.setProjectFileName(fname);
    ProjectState.load();
    createWindow();
  }
});

ipcMain.on("exit", (event, arg) => {
  app.quit();
});

ipcMain.on("new-project", (event, arg) => {
  console.log("new project path", arg);
  //arg is a path to a file, split
  let dir = path.dirname(arg);
  let fname = path.basename(arg);
  console.log("dir", dir, "fname", fname);

  if (splash) {
    splash.close();
    ProjectState.setProjectRoot(dir);
    ProjectState.setProjectFileName(fname);
    ProjectState.setupNewProjectDefaults();
    ProjectState.save();

    createWindow();
  }
});

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
    properties: ["openFile"], // ✅ single file, not a folder
    filters: [
      { name: "Excalibur Project", extensions: ["exProj"] }, // ✅ only .exProj
      { name: "All Files", extensions: ["*"] }, // optional fallback
    ],
  });

  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0]; // full path to the .exProj file
});

ipcMain.handle("project:newFile", async () => {
  const result = await dialog.showSaveDialog({
    title: "Create New Project",
    defaultPath: "MyProject.exProj", // suggested default name
    filters: [{ name: "Excalibur Project", extensions: ["exProj"] }],
  });

  console.log("main - result", result);

  if (result.canceled || !result.filePath) return null;
  console.log("main 2 - result.filePath", result.filePath);

  return result.filePath; // full path the user entered, e.g. /chosen/dir/Game.exProj
});
