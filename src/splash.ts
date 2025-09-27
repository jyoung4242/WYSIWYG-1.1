console.log("splash");

const openProjectButton = document.getElementById("open-project");
const exitButton = document.getElementById("exit");
const newProjectButton = document.getElementById("new-project");

//@ts-ignore
console.log(window.api, openProjectButton);

if (openProjectButton && exitButton && newProjectButton && window.api) {
  openProjectButton.addEventListener("click", () => {
    console.log("open project clicked");
    //@ts-ignore
    window.api.selectProject("/path/to/project");
  });

  exitButton.addEventListener("click", () => {
    console.log("exit clicked");
    //@ts-ignore
    window.api.exit();
  });

  newProjectButton.addEventListener("click", () => {
    console.log("new project clicked");
    //@ts-ignore
    window.api.newProject();
  });
}
