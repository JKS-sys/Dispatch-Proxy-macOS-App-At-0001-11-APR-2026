import React, { useState, useEffect } from "react";
const { ipcRenderer } = window.require ? window.require("electron") : {};

const API_PATHS = {
  START_DISPATCH: "start-dispatch",
  STOP_DISPATCH: "stop-dispatch",
  READ_LOG: "read-log",
  ENABLE_PROXY: "enable-proxy",
  DISABLE_PROXY: "disable-proxy",
};

function callMain(action) {
  if (!ipcRenderer) return;
  ipcRenderer.send(action);
}

function useMainListener(channel, handler) {
  useEffect(() => {
    if (!ipcRenderer) return;
    ipcRenderer.on(channel, handler);
    return () => ipcRenderer.removeListener(channel, handler);
  }, [handler]);
}

function App() {
  const [log, setLog] = useState(["No log yet..."]);
  const [status, setStatus] = useState("stopped");

  useMainListener("dispatch-started", () => setStatus("running"));
  useMainListener("dispatch-stopped", () => setStatus("stopped"));
  useMainListener("dispatch-log", (_, data) => setLog(data || ["No log"]));
  useMainListener("proxy-enabled", () => console.log("proxy enabled"));
  useMainListener("proxy-disabled", () => console.log("proxy disabled"));

  const fetchLog = () => callMain(API_PATHS.READ_LOG);
  const startDispatch = () => callMain(API_PATHS.START_DISPATCH);
  const stopDispatch = () => callMain(API_PATHS.STOP_DISPATCH);
  const enableProxy = () => callMain(API_PATHS.ENABLE_PROXY);
  const disableProxy = () => callMain(API_PATHS.DISABLE_PROXY);

  useEffect(() => {
    fetchLog();
    const interval = setInterval(fetchLog, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>Dispatch Proxy macOS App</h1>

      <div style={{ marginBottom: 20 }}>
        <p>
          Status: <strong>{status}</strong>
        </p>
        <button onClick={startDispatch} style={{ marginRight: 10 }}>
          Start dispatch (en0 + en5)
        </button>
        <button onClick={stopDispatch} style={{ marginRight: 10 }}>
          Stop dispatch
        </button>
        <button onClick={enableProxy} style={{ marginRight: 10 }}>
          Enable SOCKS5
        </button>
        <button onClick={disableProxy}>Disable SOCKS5</button>
      </div>

      <h3>Last 100 lines of dispatch.log:</h3>
      <pre
        style={{
          maxHeight: 400,
          overflowY: "auto",
          fontSize: 12,
          background: "#eee",
          padding: 10,
        }}
      >
        {log.join("\n")}
      </pre>
    </div>
  );
}

export default App;
