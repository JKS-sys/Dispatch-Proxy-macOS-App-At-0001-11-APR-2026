const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path"); // <-- must be at top
const { spawn } = require("child_process");
const fs = require("fs");

// Adjust these to your setup
const DISPATCH_PATH = "/Users/nome/.cargo/bin/dispatch";
const SCRIPTS_DIR = path.resolve(__dirname, "..", "scripts");
const LOG_PATH = path.resolve("/Users/nome/dispatch.log");

function readLogFile() {
  if (!fs.existsSync(LOG_PATH)) {
    return ["No log file yet."];
  }
  const data = fs.readFileSync(LOG_PATH, "utf8");
  return data.split("\n").slice(-100);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:3000");
  } else {
    // This is the path that must match your ASAR layout
    win.loadFile(
      path.join(app.getAppPath(), "frontend", "build", "index.html"),
    );
  }

  win.on("ready-to-show", () => win.show());
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.on("start-dispatch", () => {
  const child = spawn(DISPATCH_PATH, ["start", "en0", "en5"], {
    cwd: SCRIPTS_DIR,
  });

  child.stdout.on("data", (data) => {
    console.log("dispatch stdout:", data.toString());
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      win.webContents.send("dispatch-log", readLogFile());
    }
  });

  child.stderr.on("data", (data) => {
    console.log("dispatch stderr:", data.toString());
  });

  child.on("exit", (code) => {
    console.log("dispatch exited", code);
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      win.webContents.send("dispatch-stopped");
    }
  });

  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    win.webContents.send("dispatch-started");
  }
});

ipcMain.on("stop-dispatch", () => {
  spawn("pkill", ["-f", "dispatch"]);
});

ipcMain.on("read-log", () => {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    win.webContents.send("dispatch-log", readLogFile());
  }
});

ipcMain.on("enable-proxy", () => {
  spawn("bash", [path.resolve(SCRIPTS_DIR, "enable_sock5.sh")]);
});

ipcMain.on("disable-proxy", () => {
  spawn("bash", [path.resolve(SCRIPTS_DIR, "disable_sock5.sh")]);
});
