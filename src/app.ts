export function initApp() {
  //const titleEl = document.getElementById("title")!;
  //const pingEl = document.getElementById("ping")!;

  //titleEl.textContent = "Hello from Electron + Vite + TypeScript 🚀";

  // Example: use preload API
  if (window.api) {
    // pingEl.textContent = `IPC says: ${window.api.ping()}`;
  } else {
    // pingEl.textContent = "IPC not available";
  }

  // Example: simple DOM manipulation
  /* const button = document.createElement("button");
  button.textContent = "Click me";
  button.addEventListener("click", () => {
    alert("Button clicked!");
  });
  document.body.appendChild(button); */
}
