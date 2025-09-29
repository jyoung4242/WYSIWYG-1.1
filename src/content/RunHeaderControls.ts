import { BuildStyles } from "../../electron/enums";

export let currentBuildStyle: BuildStyles = BuildStyles.Expanded;

export function addHeaderControls(stack: any) {
  const header = stack.header;
  const controlsContainer = header.controlsContainer;

  // Create build style selector

  const buildSelect = document.createElement("select");
  buildSelect.className = "custom-build-select";
  buildSelect.innerHTML = `
    <option value="Expanded" selected >Expanded</option>
    <option value="Minified">Minified</option>
  `;
  buildSelect.value = currentBuildStyle;

  buildSelect.addEventListener("change", (e: Event) => {
    e.stopPropagation();
    currentBuildStyle = buildSelect.value as BuildStyles;
  });

  // Create run button
  const runButton = document.createElement("button");
  runButton.className = "custom-run-button";
  runButton.title = "Run";
  runButton.innerHTML = `
    <img src="./graphics/play-button.svg"  width="22" height="22" alt="Run" class="run-icon"/>
  `;

  runButton.addEventListener("click", (e: Event) => {
    e.stopPropagation();
    console.log("Run clicked! Build style:", currentBuildStyle);
    executeRun();
  });

  console.log("controls added: ", controlsContainer);

  controlsContainer.prepend(buildSelect);
  controlsContainer.prepend(runButton);
}

function executeRun() {
  //set currentBuildStyle
  window.alert("Run clicked! Build style: " + currentBuildStyle);
}
