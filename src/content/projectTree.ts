import { ipcRenderer } from "electron";

// ProjectTree.ts
export interface TreeNode {
  id: string;
  type: "project" | "section" | "element";
  title: string;

  children?: TreeNode[];
}

export interface ProjectTreeOptions {
  container: HTMLElement;
  projectName?: string;
  onOpenElement?: (node: HTMLElement) => void;
  onCreateNew?: (parentNode: TreeNode, parentElement: HTMLElement) => void;
  onDeleteElement?: (node: TreeNode, element: HTMLElement) => void;
}

export class ProjectTree {
  private container: HTMLElement;
  private projectTree: TreeNode;
  private onOpenElement?: (node: HTMLElement) => void;
  private onCreateNew?: (parentNode: TreeNode, parentElement: HTMLElement) => void;
  private onDeleteElement?: (node: TreeNode, element: HTMLElement) => void;
  private tree: HTMLElement | null = null;
  private contextMenu: HTMLElement | null = null;
  private confirmDialog: HTMLElement | null = null;

  constructor(options: ProjectTreeOptions) {
    this.container = options.container;
    this.onOpenElement = options.onOpenElement;
    this.onCreateNew = options.onCreateNew;
    this.onDeleteElement = options.onDeleteElement;

    // Default tree structure
    this.projectTree = {
      id: "project-root",
      type: "project",
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
        { id: "components", type: "section", title: "Components", children: [] },
        { id: "systems", type: "section", title: "Systems", children: [] },
        { id: "camera", type: "section", title: "Camera", children: [] },
        { id: "post-processors", type: "section", title: "Post-Processors", children: [] },
        { id: "particles", type: "section", title: "Particles", children: [] },
      ],
    };
    if (window.api)
      window.api.getProjectTreeData().then(data => {
        console.log("data", data);
        this.projectTree = data;
        this.renderTree();
        this.setupEvents();
      });

    this.createContextMenu();
    this.createConfirmDialog();
    this.renderTree();
    this.setupEvents();
  }

  private createContextMenu() {
    this.contextMenu = document.createElement("div");
    this.contextMenu.className = "context-menu";
    this.contextMenu.style.cssText = `
      position: fixed;
      background: #2d2d2d;
      border: 1px solid #444;
      border-radius: 8px;
      padding: 4px 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      display: none;
      min-width: 140px;
      font-family: "ExcaliburFont";
    `;

    document.body.appendChild(this.contextMenu);
  }

  private createConfirmDialog() {
    // Create backdrop
    const backdrop = document.createElement("div");
    backdrop.className = "confirm-backdrop";
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.6);
      z-index: 2000;
      display: none;
      justify-content: center;
      align-items: center;
      font-family: "ExcaliburFont";
    `;

    // Create dialog
    const dialog = document.createElement("div");
    dialog.className = "confirm-dialog";
    dialog.style.cssText = `
      background: #2d2d2d;
      border: 1px solid #444;
      border-radius: 8px;
      padding: 20px;
      min-width: 320px;
      color: #e0e0e0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;

    const title = document.createElement("h3");
    title.style.cssText = `
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
      color: #ff6b6b;
    `;
    title.textContent = "Confirm Delete";

    const message = document.createElement("p");
    message.style.cssText = `
      margin: 0 0 20px 0;
      font-size: 14px;
      line-height: 1.4;
      color: #b0b0b0;
    `;
    message.textContent = "Are you sure you want to delete this item? This action cannot be undone.";

    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    `;

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.cssText = `
      padding: 8px 16px;
      background: #3a3a3a;
      border: 1px solid #444;
      border-radius: 4px;
      color: #e0e0e0;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      font-family: "ExcaliburFont";
      transition: all 0.2s ease;
    `;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.style.cssText = `
      padding: 8px 16px;
      background: #ff6b6b;
      border: 1px solid #ff5252;
      border-radius: 4px;
      color: #fff;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      font-family: "ExcaliburFont";
      transition: all 0.2s ease;
    `;

    // Hover effects
    cancelBtn.addEventListener("mouseenter", () => {
      cancelBtn.style.backgroundColor = "#404040";
      cancelBtn.style.borderColor = "#4fc3f7";
    });
    cancelBtn.addEventListener("mouseleave", () => {
      cancelBtn.style.backgroundColor = "#3a3a3a";
      cancelBtn.style.borderColor = "#444";
    });

    deleteBtn.addEventListener("mouseenter", () => {
      deleteBtn.style.backgroundColor = "#ff5252";
    });
    deleteBtn.addEventListener("mouseleave", () => {
      deleteBtn.style.backgroundColor = "#ff6b6b";
    });

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(deleteBtn);
    dialog.appendChild(title);
    dialog.appendChild(message);
    dialog.appendChild(buttonContainer);
    backdrop.appendChild(dialog);

    this.confirmDialog = backdrop;
    document.body.appendChild(this.confirmDialog);

    // Event listeners for dialog
    cancelBtn.addEventListener("click", () => this.hideConfirmDialog());
    backdrop.addEventListener("click", e => {
      if (e.target === backdrop) this.hideConfirmDialog();
    });

    // Hide dialog on escape key
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && this.confirmDialog?.style.display === "flex") {
        this.hideConfirmDialog();
      }
    });
  }

  private showContextMenu(x: number, y: number, targetElement: HTMLElement, menuType: "create" | "delete", nodeData?: TreeNode) {
    if (!this.contextMenu) return;

    // Position the menu
    this.contextMenu.style.left = `${x}px`;
    this.contextMenu.style.top = `${y}px`;
    this.contextMenu.style.display = "block";

    // Clear existing menu items
    this.contextMenu.innerHTML = "";

    if (menuType === "create") {
      const menuItem = this.createMenuItem("Create New", () => {
        this.handleCreateNew(targetElement);
        this.hideContextMenu();
      });
      this.contextMenu.appendChild(menuItem);
    } else if (menuType === "delete" && nodeData) {
      const menuItem = this.createMenuItem("Delete Item", () => {
        this.hideContextMenu();
        this.showConfirmDialog(targetElement, nodeData);
      });
      this.contextMenu.appendChild(menuItem);
    }
  }

  private createMenuItem(text: string, onClick: () => void): HTMLElement {
    const menuItem = document.createElement("div");
    menuItem.className = "context-menu-item";
    menuItem.style.cssText = `
      padding: 8px 16px;
      cursor: pointer;
      color: #e0e0e0;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
    `;
    menuItem.textContent = text;

    // Hover effect
    menuItem.addEventListener("mouseenter", () => {
      menuItem.style.backgroundColor = "#3a3a3a";
      menuItem.style.color = "#4fc3f7";
    });
    menuItem.addEventListener("mouseleave", () => {
      menuItem.style.backgroundColor = "transparent";
      menuItem.style.color = "#e0e0e0";
    });

    menuItem.addEventListener("click", onClick);

    return menuItem;
  }

  private showConfirmDialog(targetElement: HTMLElement, nodeData: TreeNode) {
    if (!this.confirmDialog) return;

    this.confirmDialog.style.display = "flex";

    // Update message with specific item name
    const message = this.confirmDialog.querySelector("p");
    if (message) {
      message.textContent = `Are you sure you want to delete "${nodeData.title}"? This action cannot be undone.`;
    }

    // Add delete handler
    const deleteBtn = this.confirmDialog.querySelector("button:last-child");
    if (deleteBtn) {
      deleteBtn.replaceWith(deleteBtn.cloneNode(true)); // Remove existing listeners
      const newDeleteBtn = this.confirmDialog.querySelector("button:last-child");

      newDeleteBtn?.addEventListener("click", () => {
        this.handleDelete(targetElement, nodeData);
        this.hideConfirmDialog();
      });
    }
  }

  private hideContextMenu() {
    if (this.contextMenu) {
      this.contextMenu.style.display = "none";
    }
  }

  private hideConfirmDialog() {
    if (this.confirmDialog) {
      this.confirmDialog.style.display = "none";
    }
  }

  private handleCreateNew(targetElement: HTMLElement) {
    const nodeTitle = targetElement.getAttribute("data-node");
    if (!nodeTitle) return;

    const parentNode = this.findNodeByTitle(nodeTitle, this.projectTree);
    if (parentNode && this.onCreateNew) {
      this.onCreateNew(parentNode, targetElement);
    }
  }

  private handleDelete(targetElement: HTMLElement, nodeData: TreeNode) {
    if (this.onDeleteElement) {
      this.onDeleteElement(nodeData, targetElement);
    }

    // Remove from tree structure
    this.removeNodeFromTree(nodeData.id);
    this.renderTree();
    this.setupEvents();
  }

  private removeNodeFromTree(nodeId: string) {
    const removeFromNode = (node: TreeNode): boolean => {
      if (!node.children) return false;

      const index = node.children.findIndex(child => child.id === nodeId);
      if (index !== -1) {
        node.children.splice(index, 1);
        return true;
      }

      return node.children.some(child => removeFromNode(child));
    };

    removeFromNode(this.projectTree);
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

    if (childNodes) {
      childNodes.forEach(child => {
        const innerChildNode = document.createElement("div");
        innerChildNode.classList.add("child-item");
        innerChildNode.innerText = child.title;
        innerChildNode.setAttribute("data-node-id", child.id);
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
    if (expanded) caret.classList.add("expanded");
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

    // Hide context menu when clicking elsewhere or pressing escape
    document.addEventListener("click", e => {
      if (!this.contextMenu?.contains(e.target as Node)) {
        this.hideContextMenu();
      }
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        this.hideContextMenu();
        this.hideConfirmDialog();
      }
    });

    // Hide context menu on scroll or window resize
    document.addEventListener(
      "scroll",
      () => {
        this.hideContextMenu();
      },
      true
    ); // Use capture to catch all scroll events

    window.addEventListener("resize", () => {
      this.hideContextMenu();
    });

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

      // Left click handler
      header.addEventListener("click", e => {
        e.stopPropagation();

        const caret = header.querySelector(".caret");
        const nodeType = header.getAttribute("data-node");

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

      // Right click handler for context menu (excluding Project and Camera)
      header.addEventListener("contextmenu", e => {
        e.preventDefault();
        e.stopPropagation();

        const nodeType = header.getAttribute("data-node");
        if (nodeType === "Project") {
          return; // No context menu for Project or Camera
        }

        //@ts-ignore
        this.showContextMenu(e.pageX, e.pageY, header as HTMLElement, "create");
      });
    });

    // Leaf node click and context menu
    const nodeChildren = tree.querySelectorAll(".child-item");
    nodeChildren.forEach(child => {
      // Left click handler
      child.addEventListener("click", e => {
        e.stopPropagation();
        if (this.onOpenElement) this.onOpenElement(child as HTMLElement);
      });

      // Right click handler for delete context menu
      child.addEventListener("contextmenu", e => {
        e.preventDefault();
        e.stopPropagation();

        const nodeId = child.getAttribute("data-node-id");
        if (!nodeId) return;

        const nodeData = this.findNodeById(nodeId, this.projectTree);
        if (nodeData) {
          //@ts-ignore
          this.showContextMenu(e.pageX, e.pageY, child as HTMLElement, "delete", nodeData);
        }
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

  private findNodeByTitle(title: string, node: TreeNode): TreeNode | null {
    if (node.title === title) return node;
    if (!node.children) return null;
    for (const child of node.children) {
      const found = this.findNodeByTitle(title, child);
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

  // Clean up method to remove event listeners and DOM elements
  destroy() {
    // Remove global event listeners
    document.removeEventListener("click", this.handleDocumentClick);
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("scroll", this.handleDocumentScroll, true);
    window.removeEventListener("resize", this.handleWindowResize);

    if (this.contextMenu) {
      document.body.removeChild(this.contextMenu);
      this.contextMenu = null;
    }
    if (this.confirmDialog) {
      document.body.removeChild(this.confirmDialog);
      this.confirmDialog = null;
    }
  }

  // Bound methods for proper event listener removal
  private handleDocumentClick = (e: Event) => {
    if (!this.contextMenu?.contains(e.target as Node)) {
      this.hideContextMenu();
    }
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      this.hideContextMenu();
      if (this.confirmDialog?.style.display === "flex") {
        this.hideConfirmDialog();
      }
    }
  };

  private handleDocumentScroll = () => {
    this.hideContextMenu();
  };

  private handleWindowResize = () => {
    this.hideContextMenu();
  };
}
