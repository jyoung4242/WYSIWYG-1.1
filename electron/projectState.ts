// src/main/ProjectState.ts
import { promises as fs } from "fs";
import * as path from "path";
import {
  ActorData,
  CameraData,
  ComponentData,
  EngineData,
  ExcaliburBlue,
  LevelData,
  ParticleData,
  PostProcessorData,
  ProjectData,
  SceneData,
  ScreenElementData,
  SystemData,
} from "./types";

import { UUID } from "./UUID";
import { DataType, DisplayMode } from "./enums";

export class ProjectState {
  private static _data: ProjectData = {
    type: DataType.PROJECT,
    name: "Untitled",
    lastOpened: Date.now(),
    scenes: [] as SceneData[],
    actors: [] as ActorData[],
    screenElements: [] as ScreenElementData[],
    levels: [] as LevelData[],
    camera: [] as CameraData[],
    components: [] as ComponentData[],
    systems: [] as SystemData[],
    postProcessors: [] as PostProcessorData[],
    particles: [] as ParticleData[],
    engineConfig: {} as EngineData,
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
      type: DataType.PROJECT,
      name: "myProject",
      lastOpened: Date.now(),
      scenes: [
        {
          type: DataType.SCENE,
          id: UUID.generateUUID(),
          name: "Root",
        },
      ],
      actors: [
        {
          type: DataType.ACTOR,
          id: UUID.generateUUID(),
          name: "DefaultActor",
        },
      ],
      screenElements: [],
      levels: [],
      camera: [
        {
          type: DataType.CAMERA,
          id: UUID.generateUUID(),
          name: "DefaultCamera",
        },
      ],
      components: [],
      systems: [],
      postProcessors: [],
      particles: [],
      engineConfig: {
        size: { width: 800, height: 600 },
        backgroundColor: ExcaliburBlue,
        fps: 60,
        pixelRatio: 1,
        DisplayMode: DisplayMode.Fixed,
        antiAliasing: true,
        pixelArt: true,
      },
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
      return { id: scene.id, type: "element", title: this._capitalizeFirst(scene.name) };
    });

    const actorArray: Array<any> = this.data.actors.map(actor => {
      return { id: actor.id, type: "element", title: this._capitalizeFirst(actor.name) };
    });

    const levelArray: Array<any> = this.data.levels.map(level => {
      return { id: level.id, type: "element", title: this._capitalizeFirst(level.name) };
    });

    const componentArray: Array<any> = this.data.components.map(component => {
      return { id: component.id, type: "element", title: this._capitalizeFirst(component.name) };
    });

    const systemArray: Array<any> = this.data.systems.map(system => {
      return { id: system.id, type: "element", title: this._capitalizeFirst(system.name) };
    });

    const postProcessorArray: Array<any> = this.data.postProcessors.map(postProcessor => {
      return { id: postProcessor.id, type: "element", title: this._capitalizeFirst(postProcessor.name) };
    });

    const screenElementArray: Array<any> = this.data.screenElements.map(screenElement => {
      return { id: screenElement.id, type: "element", title: this._capitalizeFirst(screenElement.name) };
    });

    const particleArray: Array<any> = this.data.particles.map(particle => {
      return { id: particle.id, type: "element", title: this._capitalizeFirst(particle.name) };
    });

    const cameraArray: Array<any> = this.data.camera.map(camera => {
      return { id: camera.id, type: "element", title: this._capitalizeFirst(camera.name) };
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

  static findById(
    id: UUID
  ):
    | SceneData
    | ActorData
    | ScreenElementData
    | LevelData
    | CameraData
    | ComponentData
    | SystemData
    | PostProcessorData
    | ParticleData
    | undefined {
    // Search through all collections
    const collections = [
      this._data.scenes,
      this._data.actors,
      this._data.screenElements,
      this._data.levels,
      this._data.camera,
      this._data.components,
      this._data.systems,
      this._data.postProcessors,
      this._data.particles,
    ];
    for (const collection of collections) {
      const found = collection.find(item => item.id === id);
      if (found) {
        return found;
      }
    }
    return undefined;
  }
}
