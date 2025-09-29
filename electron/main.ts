import { app, BrowserWindow } from "electron";
import path from "path";
import { registerIpcHandlers } from "./ipcHandlers";

let mainWindow: BrowserWindow | null = null;
let splash: BrowserWindow | null = null;

async function createWindow() {
  const iconPath = path.join(process.cwd(), "public", "graphics", "ex-logo.png");
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  await mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  mainWindow.webContents.openDevTools();
}

async function createSplash() {
  const iconPath = path.join(process.cwd(), "public", "graphics", "ex-logo.png");
  splash = new BrowserWindow({
    width: 600,
    height: 400,
    type: "splash",
    frame: false,
    icon: iconPath,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  await splash.loadFile(path.join(__dirname, "../dist/splash.html"));
  //splash.webContents.openDevTools();
}

function closeSplash() {
  if (splash) {
    splash.close();
    splash = null;
  }
}

// Register IPC handlers with necessary context
registerIpcHandlers({
  createWindow,
  closeSplash,
});

app.on("ready", createSplash);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
