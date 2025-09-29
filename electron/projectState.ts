// src/main/ProjectState.ts
import { promises as fs } from "fs";
import { app } from "electron";
import * as path from "path";

export interface ProjectData {
  name: string;
  lastOpened: number;
  scenes: string[];
  actors: string[];
  screenElements: string[];
  levels: string[];
  camera: string[];
  components: string[];
  systems: string[];
  postProcessors: string[];
  particles: string[];
  // add more fields as needed
}

export class ProjectState {
  private static _data: ProjectData = {
    name: "Untitled",
    lastOpened: Date.now(),
    scenes: [],
    actors: [],
    screenElements: [],
    levels: [],
    camera: [],
    components: [],
    systems: [],
    postProcessors: [],
    particles: [],
  };

  private static _projectRoot: string | null = null;
  private static _projectName: string | null = null;

  static setProjectRoot(dir: string) {
    this._projectRoot = dir;
  }

  static setProjectFileName(name: string) {
    this._projectName = name;
  }

  private static get savePath(): string {
    if (!this._projectRoot) return "";

    return path.join(this._projectRoot, `${this._projectName}`);
  }

  static setupNewProjectDefaults(): void {
    this._data = {
      name: "myProject",
      lastOpened: Date.now(),
      scenes: ["Root"],
      actors: ["DefaultActor"],
      screenElements: [],
      levels: [],
      camera: ["default"],
      components: [],
      systems: [],
      postProcessors: [],
      particles: [],
    };
  }

  /** Read the latest state from disk */
  static async load(): Promise<void> {
    try {
      const raw = await fs.readFile(this.savePath, "utf8");
      this._data = JSON.parse(raw);
    } catch (err: any) {
      if (err.code !== "ENOENT") throw err; // ignore missing file
    }
  }

  static _capitalizeFirst(str: string): string {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static async getProjectTreeData(): Promise<any> {
    const sceneArray: Array<any> = this.data.scenes.map(scene => {
      return { id: scene, type: "element", title: this._capitalizeFirst(scene) };
    });

    const actorArray: Array<any> = this.data.actors.map(actor => {
      return { id: actor, type: "element", title: this._capitalizeFirst(actor) };
    });

    const levelArray: Array<any> = this.data.levels.map(level => {
      return { id: level, type: "element", title: this._capitalizeFirst(level) };
    });

    const componentArray: Array<any> = this.data.components.map(component => {
      return { id: component, type: "element", title: this._capitalizeFirst(component) };
    });

    const systemArray: Array<any> = this.data.systems.map(system => {
      return { id: system, type: "element", title: this._capitalizeFirst(system) };
    });

    const postProcessorArray: Array<any> = this.data.postProcessors.map(postProcessor => {
      return { id: postProcessor, type: "element", title: this._capitalizeFirst(postProcessor) };
    });

    const screenElementArray: Array<any> = this.data.screenElements.map(screenElement => {
      return { id: screenElement, type: "element", title: this._capitalizeFirst(screenElement) };
    });

    const particleArray: Array<any> = this.data.particles.map(particle => {
      return { id: particle, type: "element", title: this._capitalizeFirst(particle) };
    });

    const cameraArray: Array<any> = this.data.camera.map(camera => {
      return { id: camera, type: "element", title: this._capitalizeFirst(camera) };
    });

    return {
      id: this._data.name,
      type: "project",
      title: this._data.name,
      children: [
        { id: "scenes", type: "section", title: "Scenes", children: [...sceneArray] },
        { id: "actors", type: "section", title: "Actors", children: [...actorArray] },
        { id: "screen-elements", type: "section", title: "Screen-Elements", children: [...screenElementArray] },
        { id: "levels", type: "section", title: "Levels", children: [...levelArray] },
        { id: "components", type: "section", title: "Components", children: [...componentArray] },
        { id: "systems", type: "section", title: "Systems", children: [...systemArray] },
        { id: "camera", type: "section", title: "Camera", children: [...cameraArray] },
        { id: "post-processors", type: "section", title: "Post-Processors", children: [...postProcessorArray] },
        { id: "particles", type: "section", title: "Particles", children: [...particleArray] },
      ],
    };

    /*
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
      */
  }

  static async save(): Promise<void> {
    // Ensure parent directory exists

    console.log("savePath :", this.savePath);
    console.log("dirname  :", path.dirname(this.savePath));

    await fs.mkdir(path.dirname(this.savePath), { recursive: true });

    // Now write (creates or overwrites the file)
    console.log("Saving state to", this.savePath);

    await fs.writeFile(this.savePath, JSON.stringify(this._data, null, 2));
  }

  /** Get current state object (read-only) */
  static get data(): ProjectData {
    return this._data;
  }

  /** Update part of the state and persist */
  static async update(partial: Partial<ProjectData>): Promise<void> {
    this._data = { ...this._data, ...partial, lastOpened: Date.now() };
    await this.save();
  }
}
