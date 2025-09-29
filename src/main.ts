import { ProjectTree, TreeNode } from "./content/projectTree";
import { addHeaderControls } from "./content/RunHeaderControls";
import { contentLayout } from "./initiallayout";

declare var GoldenLayout: any;
var myLayout = new GoldenLayout(contentLayout);

myLayout.on("stackCreated", function (stack: any) {
  console.log("stackCreated", stack);
  if (stack.config.id != "mainStack") return;
  addHeaderControls(stack);
});

myLayout.registerComponent("testComponent", function (container: any, componentState: any) {
  container.getElement().html("<h2>" + componentState.label + "</h2>");
});

myLayout.registerComponent("Project Tree", function (container: any, componentState: any) {
  const treeContainer = document.createElement("div");
  treeContainer.style.height = "100%";
  treeContainer.style.overflowY = "auto";
  container.getElement().append(treeContainer);

  const tree = new ProjectTree({
    container: treeContainer,
    projectName: componentState.projectName,
    onOpenElement: (node: HTMLElement) => {
      // Dispatch custom event for your inspector panel
      const parent = node.parentElement;
      const nodeTitle = node.innerText;
      const nodeId = node.getAttribute("data-node-id");
      const nodeType = parent!.innerText;

      const event = new CustomEvent("inspector:select", { detail: { nodeId } });
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
  const root = document.createElement("div");
  root.className = "inspector-panel";
  root.textContent = "Select an item from the Project Tree";
  container.getElement().append(root);

  // Reusable function to render forms
  async function renderInspector(detail: { nodeId: string }) {
    root.innerHTML = ""; // clear old content

    // call an IPC handler to get data of element id
    //@ts-ignore
    let data = await window.api?.getDataByID(detail.nodeId);
    console.log("retrieved data", data);

    //TODO left off here

    /* switch (detail.nodeType) {
      case "Scene":
        //@ts-ignore
        renderSceneForm(root, detail.data);
        break;
      case "Actor":
        //@ts-ignore
        renderActorForm(root, detail.data);
        break;
      case "Camera":
        //@ts-ignore
        renderCameraForm(root, detail.data);
        break;
      default:
        root.textContent = "No form for this type yet.";
    } */
  }

  // Listen for selections
  document.addEventListener("inspector:select", (e: Event) => {
    const custom = e as CustomEvent;
    renderInspector(custom.detail);
  });
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

myLayout.registerComponent("TileMap Editor", function (container: any, componentState: any) {
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
document.addEventListener("DOMContentLoaded", () => {});

document.addEventListener("click", e => {
  const target = e.target as HTMLElement;

  if (!target.classList.contains("node-title")) return;

  const node = target.parentElement as HTMLElement;

  // Toggle collapse for section nodes
  if (node.classList.contains("section-node")) {
    node.classList.toggle("expanded");
  }

  // Leaf node click → trigger opening in project inspector
  if (node.classList.contains("leaf-node")) {
    const nodeId = node.dataset.id;
    const nodeTitle = target.textContent;
    const nodeType = node.dataset.type;
    // Trigger event to open element in inspector

    const event = new CustomEvent("inspector:select", { detail: { nodeId, nodeTitle, nodeType } });
    document.dispatchEvent(event);
  }
});
