import { DataType, DisplayMode } from "../../electron/enums";
import { ActorData, ComponentData, NestedComponentPropertyType } from "../../electron/types";
import { UUID } from "../../electron/UUID";

export function renderProjectForm(root: HTMLElement) {
  root.innerHTML = "";

  const form = document.createElement("form");
  form.className = "project-form";

  // --- Title ---
  const title = document.createElement("h1");
  title.className = "form-title";
  title.textContent = "Engine Config";
  form.appendChild(title);

  function fieldRow(labelText: string, input: HTMLElement) {
    const row = document.createElement("div");
    row.className = "form-row";

    const label = document.createElement("label");
    label.textContent = labelText;
    label.htmlFor = labelText.replace(/\s+/g, "-").toLowerCase();

    input.id = label.htmlFor;
    row.append(label, input);
    return row;
  }

  // build inputs
  const displayMode = document.createElement("select");
  Object.keys(DisplayMode).forEach((key: string) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = DisplayMode[key as keyof typeof DisplayMode];
    displayMode.appendChild(opt);
  });
  displayMode.value = DisplayMode.Fixed;

  const antiAlias = Object.assign(document.createElement("input"), { type: "checkbox", checked: true });
  const bgColor = Object.assign(document.createElement("input"), { type: "color", value: "#7cbaeb" });
  const fps = Object.assign(document.createElement("input"), { type: "number", value: "60", min: "1" });
  const pixelArt = Object.assign(document.createElement("input"), { type: "checkbox", checked: true });
  const pixelRatio = Object.assign(document.createElement("input"), { type: "number", step: "0.1", value: "1.0" });
  const width = Object.assign(document.createElement("input"), { type: "number", value: "800", min: "1" });
  const height = Object.assign(document.createElement("input"), { type: "number", value: "600", min: "1" });

  // add rows
  form.append(
    fieldRow("Display Mode", displayMode),
    fieldRow("Antialiasing", antiAlias),
    fieldRow("Background Color", bgColor),
    fieldRow("FPS", fps),
    fieldRow("Pixel Art", pixelArt),
    fieldRow("Pixel Ratio", pixelRatio)
  );

  // size row with two inputs
  const sizeRow = document.createElement("div");
  sizeRow.className = "form-row size-row";
  const sizeLabel = document.createElement("label");
  sizeLabel.textContent = "Size (W × H)";
  const sizeInputs = document.createElement("div");
  sizeInputs.className = "size-inputs";
  sizeInputs.append(width, height);
  sizeRow.append(sizeLabel, sizeInputs);
  form.append(sizeRow);

  root.appendChild(form);

  // helper to read values
  (root as any).getProjectFormValues = () => ({
    displayMode: displayMode.value,
    antialiasing: antiAlias.checked,
    backgroundColor: bgColor.value,
    fps: Number(fps.value),
    pixelArt: pixelArt.checked,
    pixelRatio: parseFloat(pixelRatio.value),
    size: { width: Number(width.value), height: Number(height.value) },
  });
}

export async function renderSceneForm(root: HTMLElement, scene: any) {
  root.innerHTML = "";

  const container = document.createElement("div");
  container.className = "scene-form";

  // ---------- Title ----------
  const title = document.createElement("h1");
  title.className = "scene-title";
  title.textContent = "Scene Config";
  container.appendChild(title);

  // ---------- Scene Name ----------
  const nameRow = document.createElement("div");
  nameRow.className = "form-row";
  const nameLabel = document.createElement("label");
  nameLabel.textContent = "Scene Name";
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.value = scene.name || "";
  nameInput.addEventListener("input", () => (scene.name = nameInput.value));
  nameRow.append(nameLabel, nameInput);
  container.appendChild(nameRow);

  // ---------- Elements Section ----------
  const elementTypes = ["Actors", "Levels", "Timers", "Screen Elements", "Cameras"];
  const addedList = document.createElement("ul");
  addedList.className = "scene-added-list";

  // helper to refresh added elements UI
  function refreshAdded() {
    addedList.innerHTML = "";
    scene.elementsOrder.forEach((el: any, idx: number) => {
      const li = document.createElement("li");
      li.className = "added-item";
      li.textContent = `${el.type}: ${el.name}`;

      // --- Controls container ---
      const controls = document.createElement("div");
      controls.className = "item-controls";

      const up = document.createElement("button");
      up.textContent = "▲";
      up.title = "Move Up";
      up.onclick = () => {
        if (idx > 0) {
          [scene.elementsOrder[idx - 1], scene.elementsOrder[idx]] = [scene.elementsOrder[idx], scene.elementsOrder[idx - 1]];
          refreshAdded();
        }
      };

      const down = document.createElement("button");
      down.textContent = "▼";
      down.title = "Move Down";
      down.onclick = () => {
        if (idx < scene.elementsOrder.length - 1) {
          [scene.elementsOrder[idx + 1], scene.elementsOrder[idx]] = [scene.elementsOrder[idx], scene.elementsOrder[idx + 1]];
          refreshAdded();
        }
      };

      const remove = document.createElement("button");
      remove.textContent = "✖";
      remove.title = "Remove";
      remove.onclick = () => {
        scene.elementsOrder.splice(idx, 1);
        refreshAdded();
      };

      // append buttons to the controls container
      controls.append(up, down, remove);
      // and append container to the list item
      li.appendChild(controls);
      addedList.appendChild(li);
    });
  }

  let projectData: any;
  //@ts-ignore
  if (window.api)
    //@ts-ignore
    projectData = await window.api.getProjectTreeData();

  const actors = [...projectData.children[1].children];
  const screenElements = [...projectData.children[2].children];
  const levels = [...projectData.children[3].children];
  const timers = [...projectData.children[9].children];
  const cameras = [...projectData.children[6].children];

  // Build collapsible panels for each element type
  elementTypes.forEach((type, index) => {
    const section = document.createElement("div");
    section.className = "collapsible";

    let items: any[] = [];
    if (index === 0) items = actors;
    if (index === 1) items = levels;
    if (index === 2) items = timers;
    if (index === 3) items = screenElements;
    if (index === 4) items = cameras;

    const count = items.length;

    const header = document.createElement("div");
    header.className = "collapsible-header";
    header.textContent = `${type}type (${count})`;
    const body = document.createElement("div");
    body.className = "collapsible-body";

    header.addEventListener("click", () => {
      body.classList.toggle("open");
      header.classList.toggle("expanded");
    });

    items.forEach(item => {
      const row = document.createElement("div");
      row.className = "element-row";
      row.textContent = item.title;

      const addBtn = document.createElement("button");
      addBtn.textContent = "Add";
      addBtn.onclick = () => {
        scene.elementsOrder.push({ type, id: item.id, name: item.title });
        refreshAdded();
      };

      row.appendChild(addBtn);
      body.appendChild(row);
    });

    console.log("projectData", projectData);

    section.append(header, body);
    container.appendChild(section);
  });

  // Added list section
  const addedSection = document.createElement("div");
  addedSection.className = "added-section";
  const addedTitle = document.createElement("h2");
  addedTitle.textContent = "Elements in Scene";
  addedSection.append(addedTitle, addedList);
  container.appendChild(addedSection);

  // ---------- Open Script Button ----------
  const scriptBtn = document.createElement("button");
  scriptBtn.className = "open-script-btn";
  scriptBtn.textContent = "Open Scene Script";
  scriptBtn.onclick = () => {
    // hook to your script editor
    //@ts-ignore
    window.api?.openSceneScript?.(scene.id);
  };
  container.appendChild(scriptBtn);

  root.appendChild(container);

  // Initialize
  scene.elementsOrder = scene.elementsOrder || [];
  refreshAdded();
}

export async function renderActorForm(root: HTMLElement, actor: ActorData) {
  // Default built-in components
  const builtInComponents = [
    "BodyComponent",
    "MotionComponent",
    "PointerComponent",
    "GraphicsComponent",
    "ActionsComponent",
    "TransformComponent",
  ];

  // Ensure actor has components array
  if (!actor.components) {
    actor.components = [...builtInComponents];
  }

  // Custom components list (will be fetched via IPC)
  let customComponents: ComponentData[] = [];
  //@ts-ignore
  customComponents = await window.api.getCustomComponents();
  console.log("customComponents", customComponents);

  // Fetch custom components from Electron IPC

  // Render the complete form
  function render() {
    root.innerHTML = `
      <div id="ActorConfigureForm" class="actor-form">
        <div class="form-title">Actor Configuration</div>
        
        <!-- Actor Name -->
        <div class="form-row">
          <label for="actor-name">Actor Name:</label>
          <input 
            type="text" 
            id="actor-name" 
            value="${actor.name || ""}" 
            placeholder="Enter actor name"
          />
        </div>

        <!-- Components Section -->
        <div class="collapsible">
          <div class="collapsible-header" id="components-header">
            <span>📦 Attached Components (${actor.components.length})</span>
          </div>
          <div class="collapsible-body open" id="components-body">
            <!-- Added Components List -->
            <div class="added-section">
              <ul class="scene-added-list" id="added-components-list">
                ${renderComponentsList()}
              </ul>
            </div>

            <!-- Add Component Dropdown -->
            <div class="form-row" style="margin-top: 12px;">
              <label for="component-select">Add Component:</label>
              <div style="display: flex; gap: 8px; flex: 1;">
                <select id="component-select" style="flex: 1;">
                  <option value="">Select a component...</option>
                  
                </select>
                <button class="add-component-btn" id="add-component-btn">+</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Script Section -->
        <div class="script-section" style="margin-top: 16px;">
          <button class="open-script-btn" id="open-script-btn">
            📝 Open Actor Script
          </button>
        </div>
      </div>
    `;

    attachEventListeners();
    renderComponentDropdown();
  }

  // Render the list of attached components
  function renderComponentsList(): string {
    if (actor.components.length === 0) {
      return '<li style="color: #888; text-align: center; padding: 8px;">No components attached</li>';
    }

    return actor.components
      .map(
        (component, index) => `
        <li class="added-item" data-index="${index}">
          <span>${component}</span>
          <div class="item-controls">
            <button class="remove-component-btn" data-component="${component}" title="Remove">✕</button>
          </div>
        </li>
      `
      )
      .join("");
  }

  // Update the components list in the DOM
  function updateComponentsList() {
    const list = root.querySelector("#added-components-list");
    if (list) {
      list.innerHTML = renderComponentsList();
      attachComponentListeners();
    }

    // Update count in header
    const header = root.querySelector("#components-header span");
    if (header) {
      header.textContent = `📦 Attached Components (${actor.components.length})`;
    }
  }

  // Render the component dropdown with available options
  function renderComponentDropdown() {
    console.log("rendering: customComponents", customComponents);

    const select = root.querySelector("#component-select") as HTMLSelectElement;
    console.log("select", select);

    if (!select) return;

    let builtInComponentsData = builtInComponents.map(
      comp => ({ name: comp, type: DataType.COMPONENT, id: UUID.generateUUID(), properties: {} } as ComponentData)
    );

    // Get all available components (built-in + custom) that aren't already added
    const availableComponents = [...customComponents].filter(comp => !actor.components.includes(comp.id));
    console.log("availableComponents", availableComponents);

    select.innerHTML = `
      <option value="">Select a component...</option>
      ${availableComponents
        .map(
          comp => `
        <option value="${comp.name}">${comp.name}</option>
      `
        )
        .join("")}
    `;
  }

  // Attach event listeners for component list items
  function attachComponentListeners() {
    const removeButtons = root.querySelectorAll(".remove-component-btn");
    removeButtons.forEach(btn => {
      btn.addEventListener("click", e => {
        const component = (e.target as HTMLElement).getAttribute("data-component");
        if (component) {
          removeComponent(component);
        }
      });
    });
  }

  // Add a component to the actor
  function addComponent(componentName: string) {
    if (!componentName || actor.components.includes(componentName)) {
      return;
    }

    actor.components.push(componentName);
    updateComponentsList();
    renderComponentDropdown();

    // Dispatch custom event for component added
    const event = new CustomEvent("actor-component-added", {
      detail: { actor, component: componentName },
    });
    root.dispatchEvent(event);
  }

  // Remove a component from the actor
  function removeComponent(componentName: string) {
    const index = actor.components.indexOf(componentName);
    if (index > -1) {
      actor.components.splice(index, 1);
      updateComponentsList();
      renderComponentDropdown();

      // Dispatch custom event for component removed
      const event = new CustomEvent("actor-component-removed", {
        detail: { actor, component: componentName },
      });
      root.dispatchEvent(event);
    }
  }

  // Attach all event listeners
  function attachEventListeners() {
    // Actor name input
    const nameInput = root.querySelector("#actor-name") as HTMLInputElement;
    if (nameInput) {
      nameInput.addEventListener("input", e => {
        actor.name = (e.target as HTMLInputElement).value;

        // Dispatch custom event for name change
        const event = new CustomEvent("actor-name-changed", {
          detail: { actor, name: actor.name },
        });
        root.dispatchEvent(event);
      });
    }

    // Collapsible header toggle
    const header = root.querySelector("#components-header");
    const body = root.querySelector("#components-body");
    if (header && body) {
      header.addEventListener("click", () => {
        body.classList.toggle("open");
      });
    }

    // Add component button
    const addBtn = root.querySelector("#add-component-btn");
    const select = root.querySelector("#component-select") as HTMLSelectElement;
    if (addBtn && select) {
      addBtn.addEventListener("click", () => {
        const selectedComponent = select.value;
        if (selectedComponent) {
          addComponent(selectedComponent);
          select.value = "";
        }
      });

      // Also allow adding via Enter key
      select.addEventListener("keypress", e => {
        if (e.key === "Enter") {
          const selectedComponent = select.value;
          if (selectedComponent) {
            addComponent(selectedComponent);
            select.value = "";
          }
        }
      });
    }

    // Open script button
    const scriptBtn = root.querySelector("#open-script-btn");
    if (scriptBtn) {
      scriptBtn.addEventListener("click", () => {
        // Dispatch custom event for script editor
        const event = new CustomEvent("open-actor-script", {
          detail: { actor },
        });
        root.dispatchEvent(event);
      });
    }

    // Attach component list listeners
    attachComponentListeners();
  }

  // Initial render
  render();
}

export function renderCameraForm(root: HTMLElement, camera: any) {
  const nameInput = document.createElement("input");
  nameInput.value = camera.name;
  nameInput.addEventListener("input", () => {
    camera.name = nameInput.value;
    // optional: dispatch an update event or call API
  });
  root.append("Camera Name:", nameInput);
}

export function renderComponentForm(root: HTMLElement, component: ComponentData) {
  root.innerHTML = "";

  const form = document.createElement("div");
  form.className = "project-form";

  // Title
  const title = document.createElement("div");
  title.className = "form-title";
  title.textContent = "Custom Component Builder";
  form.appendChild(title);

  // Component Name
  const nameRow = document.createElement("div");
  nameRow.className = "form-row";
  const nameLabel = document.createElement("label");
  nameLabel.textContent = "Component Name:";
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.value = component.name || "";
  nameInput.placeholder = "e.g., HealthComponent";
  nameInput.addEventListener("input", e => {
    component.name = (e.target as HTMLInputElement).value;
  });
  nameRow.appendChild(nameLabel);
  nameRow.appendChild(nameInput);
  form.appendChild(nameRow);

  // Properties Section
  const propsSection = document.createElement("div");
  propsSection.className = "added-section";

  const propsHeader = document.createElement("div");
  propsHeader.style.cssText = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;";
  propsHeader.innerHTML = '<strong style="color: #4fc3f7;">Properties</strong>';

  const addPropBtn = document.createElement("button");
  addPropBtn.className = "open-script-btn";
  addPropBtn.textContent = "+ Add Property";
  addPropBtn.style.cssText = "padding: 4px 12px; font-size: 13px;";
  addPropBtn.addEventListener("click", () => {
    addProperty(component, propsList, component.properties);
  });
  propsHeader.appendChild(addPropBtn);
  propsSection.appendChild(propsHeader);

  // Properties List
  const propsList = document.createElement("ul");
  propsList.className = "scene-added-list";
  propsSection.appendChild(propsList);

  // Initialize properties if not exists
  if (!component.properties) {
    component.properties = {};
  }

  // Render existing properties
  renderProperties(propsList, component.properties, component);

  form.appendChild(propsSection);

  // Export Button
  const exportBtn = document.createElement("button");
  exportBtn.className = "open-script-btn";
  exportBtn.textContent = "Open Component Script";
  exportBtn.style.marginTop = "12px";
  exportBtn.addEventListener("click", () => {
    console.log("Component:", component);
    alert("Component Script opened");
  });
  form.appendChild(exportBtn);

  root.appendChild(form);
}

function renderProperties(
  listEl: HTMLElement,
  properties: Record<string, NestedComponentPropertyType>,
  component: ComponentData,
  path: string[] = []
) {
  listEl.innerHTML = "";

  for (const [key, prop] of Object.entries(properties)) {
    const item = document.createElement("li");
    item.className = "added-item";

    const propPath = [...path, key];

    // Property info
    const info = document.createElement("div");
    info.style.flex = "1";

    const propName = document.createElement("strong");
    propName.textContent = key;
    propName.style.color = "#4fc3f7";
    info.appendChild(propName);

    // Check if prop has the expected structure
    if (typeof prop === "object" && prop !== null && "type" in prop) {
      const propType = document.createElement("span");
      propType.textContent = ` (${prop.type})`;
      propType.style.cssText = "color: #888; font-size: 12px; margin-left: 4px;";
      info.appendChild(propType);
    }

    item.appendChild(info);

    // Controls
    const controls = document.createElement("div");
    controls.className = "item-controls";

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "✎";
    editBtn.title = "Edit";
    editBtn.addEventListener("click", () => {
      editProperty(key, prop, properties, listEl, component, propPath);
    });
    controls.appendChild(editBtn);

    console.log("prop", prop);

    // If object type, show expand button
    if (typeof prop === "object" && prop !== null && "type" in prop && prop.type === "object") {
      const expandBtn = document.createElement("button");
      expandBtn.textContent = "▼";
      expandBtn.title = "Expand";
      expandBtn.addEventListener("click", () => {
        // Initialize nested properties if they don't exist
        //TODO
        //@ts-ignoreBUG
        if (!prop.nested) {
          //@ts-ignore
          prop.nested = {};
        }
        //@ts-ignore
        showNestedProperties(item, prop.nested, component, propPath);
      });
      controls.appendChild(expandBtn);
    }

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.textContent = "✕";
    delBtn.title = "Delete";
    delBtn.addEventListener("click", () => {
      //@ts-ignore
      delete properties[key];
      renderProperties(listEl, properties, component, path);
    });
    controls.appendChild(delBtn);

    item.appendChild(controls);
    listEl.appendChild(item);
  }
}

function showNestedProperties(parentItem: HTMLElement, nestedProps: any, component: any, path: string[]) {
  // Check if already expanded
  const existing = parentItem.querySelector(".nested-props");
  if (existing) {
    existing.remove();
    return;
  }

  const nestedContainer = document.createElement("div");
  nestedContainer.className = "nested-props";
  nestedContainer.style.cssText = "margin-left: 20px; margin-top: 8px; border-left: 2px solid #444; padding-left: 12px;";

  const nestedList = document.createElement("ul");
  nestedList.className = "scene-added-list";
  nestedList.style.marginBottom = "8px";

  const addNestedBtn = document.createElement("button");
  addNestedBtn.textContent = "+ Add Nested Property";
  addNestedBtn.style.cssText =
    "background: #3a3a3a; color: #4fc3f7; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;";
  addNestedBtn.addEventListener("click", () => {
    addProperty(component, nestedList, nestedProps, path);
  });

  nestedContainer.appendChild(addNestedBtn);
  nestedContainer.appendChild(nestedList);

  renderProperties(nestedList, nestedProps, component, path);

  parentItem.appendChild(nestedContainer);
}

function addProperty(component: any, listEl: HTMLElement, targetObj: any, path: string[] = []) {
  // Create modal for adding property
  const modal = document.createElement("div");
  modal.style.cssText =
    "position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000;";

  const modalContent = document.createElement("div");
  modalContent.className = "project-form";
  modalContent.style.maxWidth = "450px";

  const modalTitle = document.createElement("div");
  modalTitle.className = "form-title";
  modalTitle.textContent = "Add Property";
  modalContent.appendChild(modalTitle);

  // Property Name
  const nameRow = document.createElement("div");
  nameRow.className = "form-row";
  const nameLabel = document.createElement("label");
  nameLabel.textContent = "Property Name:";
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "e.g., health";
  nameRow.appendChild(nameLabel);
  nameRow.appendChild(nameInput);
  modalContent.appendChild(nameRow);

  // Type Selection
  const typeRow = document.createElement("div");
  typeRow.className = "form-row";
  const typeLabel = document.createElement("label");
  typeLabel.textContent = "Type:";
  const typeSelect = document.createElement("select");
  ["string", "number", "boolean", "vector", "object"].forEach(type => {
    const opt = document.createElement("option");
    opt.value = type;
    opt.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    typeSelect.appendChild(opt);
  });
  typeRow.appendChild(typeLabel);
  typeRow.appendChild(typeSelect);
  modalContent.appendChild(typeRow);

  // Buttons
  const btnRow = document.createElement("div");
  btnRow.style.cssText = "display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px;";

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.style.cssText =
    "background: #555; color: whitesmoke; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;";
  cancelBtn.addEventListener("click", () => modal.remove());

  const saveBtn = document.createElement("button");
  saveBtn.className = "open-script-btn";
  saveBtn.textContent = "Add";
  saveBtn.addEventListener("click", () => {
    const propName = nameInput.value.trim();
    if (!propName) {
      alert("Property name is required");
      return;
    }

    const type = typeSelect.value;

    targetObj[propName] = { type };
    renderProperties(listEl, targetObj, component, path);
    modal.remove();
  });

  btnRow.appendChild(cancelBtn);
  btnRow.appendChild(saveBtn);
  modalContent.appendChild(btnRow);

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Close on backdrop click
  modal.addEventListener("click", e => {
    if (e.target === modal) modal.remove();
  });
}

function editProperty(key: string, prop: any, properties: any, listEl: HTMLElement, component: any, path: string[]) {
  const modal = document.createElement("div");
  modal.style.cssText =
    "position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000;";

  const modalContent = document.createElement("div");
  modalContent.className = "project-form";
  modalContent.style.maxWidth = "450px";

  const modalTitle = document.createElement("div");
  modalTitle.className = "form-title";
  modalTitle.textContent = `Edit Property: ${key}`;
  modalContent.appendChild(modalTitle);

  // Property Name
  const nameRow = document.createElement("div");
  nameRow.className = "form-row";
  const nameLabel = document.createElement("label");
  nameLabel.textContent = "Property Name:";
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.value = key;
  nameRow.appendChild(nameLabel);
  nameRow.appendChild(nameInput);
  modalContent.appendChild(nameRow);

  // Type Selection
  const typeRow = document.createElement("div");
  typeRow.className = "form-row";
  const typeLabel = document.createElement("label");
  typeLabel.textContent = "Type:";
  const typeSelect = document.createElement("select");
  ["string", "number", "boolean", "vector", "object"].forEach(type => {
    const opt = document.createElement("option");
    opt.value = type;
    opt.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    if (prop.type === type) {
      opt.selected = true;
    }
    typeSelect.appendChild(opt);
  });
  typeRow.appendChild(typeLabel);
  typeRow.appendChild(typeSelect);
  modalContent.appendChild(typeRow);

  // Buttons
  const btnRow = document.createElement("div");
  btnRow.style.cssText = "display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px;";

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.style.cssText =
    "background: #555; color: whitesmoke; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;";
  cancelBtn.addEventListener("click", () => modal.remove());

  const saveBtn = document.createElement("button");
  saveBtn.className = "open-script-btn";
  saveBtn.textContent = "Save";
  saveBtn.addEventListener("click", () => {
    const newName = nameInput.value.trim();
    if (!newName) {
      alert("Property name is required");
      return;
    }

    const newType = typeSelect.value;

    // If name changed, delete old and create new
    if (newName !== key) {
      delete properties[key];
    }

    // Preserve nested properties if it's an object type
    if (newType === "object" && prop.nested) {
      properties[newName] = { type: newType, nested: prop.nested };
    } else {
      properties[newName] = { type: newType };
    }

    renderProperties(listEl, properties, component, path);
    modal.remove();
  });

  btnRow.appendChild(cancelBtn);
  btnRow.appendChild(saveBtn);
  modalContent.appendChild(btnRow);

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  modal.addEventListener("click", e => {
    if (e.target === modal) modal.remove();
  });
}
