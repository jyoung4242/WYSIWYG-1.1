console.log("splash");

const openProjectButton = document.getElementById("open-project");

//@ts-ignore
console.log(window.api, openProjectButton);

if (openProjectButton && window.api) {
  openProjectButton.addEventListener("click", () => {
    console.log("open project clicked");
    //@ts-ignore
    window.api.selectProject("/path/to/project");
  });
}
