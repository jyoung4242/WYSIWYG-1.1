import { DisplayMode } from "../../electron/enums";

// Example sub-form
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

/**
 * Renders the Scene configuration UI into the given root element.
 * @param root  Target DOM node
 * @param scene Current scene object { id, name, elements:{actors:[],...}, scripts:string[] }
 */
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

    // Remote load project-tree items for this type
    // Replace with your own async fetch logic:
    /*     fetch(`/api/project/${type.toLowerCase()}`)
      .then(r => r.json())
      .then((items: any[]) => {
        items.forEach(item => {
          const row = document.createElement("div");
          row.className = "element-row";
          row.textContent = item.name;

          const addBtn = document.createElement("button");
          addBtn.textContent = "Add";
          addBtn.onclick = () => {
            scene.elementsOrder.push({ type, id: item.id, name: item.name });
            refreshAdded();
          };

          row.appendChild(addBtn);
          body.appendChild(row);
        });
      }); */

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

export function renderActorForm(root: HTMLElement, actor: any) {
  const nameInput = document.createElement("input");
  nameInput.value = actor.name;
  nameInput.addEventListener("input", () => {
    actor.name = nameInput.value;
    // optional: dispatch an update event or call API
  });
  root.append("Actor Name:", nameInput);
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
