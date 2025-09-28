import { log } from "console";
import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import dotenv from "dotenv";

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
  console.log("project-selected", arg);
  if (splash) {
    splash.close();
    createWindow();
  }
});

ipcMain.on("exit", (event, arg) => {
  console.log("exit");
  app.quit();
});

ipcMain.on("new-project", (event, arg) => {
  console.log("new-project");
  if (splash) {
    splash.close();
    createWindow();
  }
});
