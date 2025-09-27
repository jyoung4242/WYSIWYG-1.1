import { log } from "console";
import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

let mainWindow: BrowserWindow | null = null;
let splash: BrowserWindow | null = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
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
}

async function createSplash() {
  splash = new BrowserWindow({
    width: 600,
    height: 400,
    type: "splash",
    frame: false,
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
