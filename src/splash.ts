console.log("splash");

const openProjectButton = document.getElementById("open-project");
const exitButton = document.getElementById("exit");
const newProjectButton = document.getElementById("new-project");

if (openProjectButton && exitButton && newProjectButton && window.api) {
  openProjectButton.addEventListener("click", async () => {
    //@ts-ignore
    const folderPath = await window.api.selectProjectDirectory();
    if (!folderPath) return; // user cancelled

    // send the chosen path to main so it can continue loading the project
    //@ts-ignore
    window.api.selectProject(folderPath); // assuming you already expose this
  });

  exitButton.addEventListener("click", () => {
    console.log("exit clicked");
    //@ts-ignore
    window.api.exit();
  });

  newProjectButton.addEventListener("click", async () => {
    //@ts-ignore
    const newFilePath = await window.api.createNewProjectFile();
    console.log("splash screennewFilePath", newFilePath);

    if (!newFilePath) return; // user cancelled

    // optional: ensure .exProj extension if user didn’t type it
    let finalPath = newFilePath.endsWith(".exProj") ? newFilePath : `${newFilePath}.exProj`;
    console.log("splash screenfinalPath", finalPath);

    //@ts-ignore
    window.api.newProject(finalPath); // you can adapt your existing IPC to accept a path
  });
}
