// ProjectTree.ts
export interface TreeNode {
  id: string;
  type: "project" | "section" | "element";
  title: string;
  icon?: string;
  children?: TreeNode[];
}

export interface ProjectTreeOptions {
  container: HTMLElement;
  projectName?: string;
  onOpenElement?: (node: HTMLElement) => void;
}

export class ProjectTree {
  private container: HTMLElement;
  private projectTree: TreeNode;
  private onOpenElement?: (node: HTMLElement) => void;
  private tree: HTMLElement | null = null;

  constructor(options: ProjectTreeOptions) {
    this.container = options.container;
    this.onOpenElement = options.onOpenElement;

    // Default tree structure
    this.projectTree = {
      id: "project-root",
      type: "project",
      icon: "./graphics/construction white.svg",
      title: options.projectName || "MyProject",
      children: [
        { id: "scenes", type: "section", title: "Scenes", children: [{ id: "root", type: "element", title: "Root" }] },
        { id: "actors", type: "section", title: "Actors", children: [{ id: "default", type: "element", title: "DefaultActor" }] },
        {
          id: "screen-elements",
          type: "section",
          title: "Screen-Elements",
          children: [{ id: "button", type: "element", title: "Button" }],
        },
        { id: "levels", type: "section", title: "Levels", children: [{ id: "level1", type: "element", title: "Level1" }] },
        { id: "camera", type: "section", title: "Camera", children: [] },
        { id: "post-processors", type: "section", title: "Post-Processors", children: [] },
        { id: "particles", type: "section", title: "Particles", children: [] },
      ],
    };

    this.renderTree();
    this.setupEvents();
  }

  private renderTreeNode(node: TreeNode, title: string): HTMLElement {
    const treeNode = document.createElement("div");

    treeNode.classList.add("tree-node");

    this.createNodeHeader(treeNode, node.title, true);

    const childContainerDiv = document.createElement("div");
    childContainerDiv.classList.add("node-children");
    childContainerDiv.setAttribute("data-children", title);

    // load children of project
    let childNodes = node.children;
    console.log(childNodes);

    if (childNodes) {
      childNodes.forEach(child => {
        const innerChildNode = document.createElement("div");
        innerChildNode.classList.add("child-item");
        innerChildNode.innerText = child.title;
        childContainerDiv.appendChild(innerChildNode);
      });
    }

    treeNode.appendChild(childContainerDiv);

    return treeNode;
  }

  renderTree() {
    this.container.innerHTML = "";
    const containerDiv = document.createElement("div");
    containerDiv.id = "projectTreeRoot";
    containerDiv.classList.add("project-tree");
    this.tree = containerDiv;

    const projectTreeRootNode = document.createElement("div");
    projectTreeRootNode.classList.add("tree-node");
    this.createNodeHeader(projectTreeRootNode, "Project", false, true);

    // add child container div

    const childContainerDiv = document.createElement("div");
    childContainerDiv.classList.add("node-children");
    childContainerDiv.classList.add("expanded");
    projectTreeRootNode.appendChild(childContainerDiv);
    containerDiv.appendChild(projectTreeRootNode);
    this.projectTree.children?.forEach(child => {
      childContainerDiv.appendChild(this.renderTreeNode(child, child.title));
    });
    this.container.appendChild(containerDiv);
  }

  private createNodeHeader(node: HTMLElement, title: string, icon: boolean = false, expanded: boolean = false) {
    const header = document.createElement("div");
    header.classList.add("node-header");
    header.setAttribute("data-node", title);

    const caret = document.createElement("span");
    caret.classList.add("caret");
    if (title === "Camera") caret.classList.add("no-children");
    else {
      if (expanded) caret.classList.add("expanded");
    }
    header.appendChild(caret);

    if (icon) {
      const _icon = document.createElement("span");

      _icon.classList.add("node-icon");
      let nodeTitle: string = `${title}-icon`;

      _icon.classList.add(nodeTitle);
      header.appendChild(_icon);
    }

    const label = document.createElement("span");
    label.classList.add("node-label");
    if (title === "Project") label.classList.add("project-label");
    label.textContent = title;
    header.appendChild(label);

    node.appendChild(header);
  }

  private setupEvents() {
    let tree = this.tree as HTMLElement;
    // Project Header click
    const projectHeader = tree.querySelector(".project-label");
    projectHeader?.addEventListener("click", e => {
      e.stopPropagation();
      if (this.onOpenElement) this.onOpenElement(projectHeader as HTMLElement);
    });

    // Expand/Collapse on click
    const nodeHeaders = tree.querySelectorAll(".node-header");
    nodeHeaders.forEach(header => {
      if (!header) return;
      header.addEventListener("click", e => {
        e.stopPropagation();

        const caret = header.querySelector(".caret");
        const nodeType = header.getAttribute("data-node");

        // Skip if this is the project root or camera (no children)
        if (nodeType === "project" || caret!.classList.contains("no-children")) {
          //Manage Clicking on Camera
          if (header && this.onOpenElement) this.onOpenElement(header as HTMLElement);
          return;
        }
        if (!header || !header.parentNode) return;
        const children = header.parentNode.querySelector(`[data-children="${nodeType}"]`);
        if (children) {
          const isExpanded = children.classList.contains("expanded");

          if (isExpanded && caret) {
            // Collapse
            children.classList.remove("expanded");
            caret.classList.remove("expanded");
            header.classList.remove("active");
          } else if (!isExpanded && caret) {
            // Expand
            children.classList.add("expanded");
            caret.classList.add("expanded");
            header.classList.add("active");
          }
        }
      });
    });

    // Leaf node click
    const nodeChildren = tree.querySelectorAll(".child-item");
    nodeChildren.forEach(child => {
      child.addEventListener("click", e => {
        e.stopPropagation();
        if (this.onOpenElement) this.onOpenElement(child as HTMLElement);
      });
    });
  }

  private findNodeById(id: string, node: TreeNode): TreeNode | null {
    if (node.id === id) return node;
    if (!node.children) return null;
    for (const child of node.children) {
      const found = this.findNodeById(id, child);
      if (found) return found;
    }
    return null;
  }

  // Example utility for adding a node
  addNode(parentId: string, newNode: TreeNode) {
    const parent = this.findNodeById(parentId, this.projectTree);
    if (!parent) return;
    if (!parent.children) parent.children = [];
    parent.children.push(newNode);
    this.renderTree();
  }
}
