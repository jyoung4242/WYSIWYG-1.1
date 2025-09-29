const openProjectButton = document.getElementById("open-project");
const exitButton = document.getElementById("exit");
const newProjectButton = document.getElementById("new-project");

//@ts-ignore
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
    //@ts-ignore
    window.api.exit();
  });

  newProjectButton.addEventListener("click", async () => {
    //@ts-ignore
    const newFilePath = await window.api.createNewProjectFile();

    if (!newFilePath) return; // user cancelled

    // optional: ensure .exProj extension if user didn’t type it
    let finalPath = newFilePath.endsWith(".exProj") ? newFilePath : `${newFilePath}.exProj`;

    //@ts-ignore
    window.api.newProject(finalPath); // you can adapt your existing IPC to accept a path
  });
}
