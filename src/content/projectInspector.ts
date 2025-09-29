// Example sub-form
export function renderSceneForm(root: HTMLElement, scene: any) {
  const nameInput = document.createElement("input");
  nameInput.value = scene.name;
  nameInput.addEventListener("input", () => {
    scene.name = nameInput.value;
    // optional: dispatch an update event or call API
  });
  root.append("Scene Name:", nameInput);
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
