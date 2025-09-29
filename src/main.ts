import { initApp } from "./app";
import { ProjectTree, TreeNode } from "./content/projectTree";
import { contentLayout } from "./initiallayout";

declare var GoldenLayout: any;
var myLayout = new GoldenLayout(contentLayout);

myLayout.registerComponent("testComponent", function (container: any, componentState: any) {
  container.getElement().html("<h2>" + componentState.label + "</h2>");
});
/* myLayout.registerComponent("Project Tree", function (container: any, componentState: any) {
  container.getElement().html("<h2>" + componentState.label + "</h2>");
}); */

myLayout.registerComponent("Project Tree", function (container: any, componentState: any) {
  const treeContainer = document.createElement("div");
  treeContainer.style.height = "100%";
  treeContainer.style.overflowY = "auto";
  container.getElement().append(treeContainer);

  const tree = new ProjectTree({
    container: treeContainer,
    projectName: componentState.projectName,
    onOpenElement: (node: HTMLElement) => {
      window.alert("Opening: " + node.innerText);
      // Dispatch custom event for your inspector panel
      const event = new CustomEvent("openElementInInspector", { detail: node });
      document.dispatchEvent(event);
    },
    onCreateNew: (parentNode: TreeNode, parentElement: HTMLElement) => {
      window.alert("Creating new element under: " + parentNode.title);
    },
    onDeleteElement: (node: TreeNode, element: HTMLElement) => {
      window.alert("Deleting element: " + node.title);
    },
  });
});

myLayout.registerComponent("Project Inspector", function (container: any, componentState: any) {
  container.getElement().html("<h2>" + componentState.label + "</h2>");
});
myLayout.registerComponent("Scene Inspector", function (container: any, componentState: any) {
  container.getElement().html("<h2>" + componentState.label + "</h2>");
});
myLayout.registerComponent("Scene Viewer", function (container: any, componentState: any) {
  container.getElement().html("<h2>" + componentState.label + "</h2>");
});
myLayout.registerComponent("Script Editor", function (container: any, componentState: any) {
  container.getElement().html("<h2>" + componentState.label + "</h2>");
});

myLayout.registerComponent("Level Editor", function (container: any, componentState: any) {
  container.getElement().html("<h2>" + componentState.label + "</h2>");
});
myLayout.registerComponent("Asset Manager", function (container: any, componentState: any) {
  container.getElement().html("<h2>" + componentState.label + "</h2>");
});
myLayout.registerComponent("Graphics Manager", function (container: any, componentState: any) {
  container.getElement().html("<h2>" + componentState.label + "</h2>");
});

myLayout.init();

// Initialize the app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

document.addEventListener("click", e => {
  const target = e.target as HTMLElement;

  if (!target.classList.contains("node-title")) return;
  console.log("click", target);

  const node = target.parentElement as HTMLElement;

  // Toggle collapse for section nodes
  if (node.classList.contains("section-node")) {
    node.classList.toggle("expanded");
  }

  // Leaf node click → trigger opening in project inspector
  if (node.classList.contains("leaf-node")) {
    const nodeId = node.dataset.id;
    const nodeTitle = target.textContent;
    const nodeIcon = target.querySelector("img")?.getAttribute("src");

    // Trigger event to open element in inspector
    const event = new CustomEvent("openElementInInspector", { detail: { nodeId, nodeTitle, nodeIcon } });
    document.dispatchEvent(event);
  }
});
