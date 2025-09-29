import { DataType, DisplayMode } from "./enums";
import { UUID } from "./UUID";

export const ExcaliburBlue = "#7cbaeb";

type CanvasSize = {
  width: number;
  height: number;
};

export type EngineData = {
  size: CanvasSize;
  pixelRatio: number;
  DisplayMode: DisplayMode;
  antiAliasing: boolean;
  pixelArt: boolean;
  backgroundColor: string;
  fps: number;
};

export type SceneData = {
  type: DataType.SCENE;
  id: UUID;
  name: string;
};

export type ActorData = {
  type: DataType.ACTOR;
  id: UUID;
  name: string;
};

export type LevelData = {
  type: DataType.LEVEL;
  id: UUID;
  name: string;
};

export type CameraData = {
  type: DataType.CAMERA;
  id: UUID;
  name: string;
};

export type PostProcessorData = {
  type: DataType.POSTPROCESSOR;
  id: UUID;
  name: string;
};

export type ParticleData = {
  type: DataType.PARTICLE;
  id: UUID;
  name: string;
};

export type ComponentData = {
  type: DataType.COMPONENT;
  id: UUID;
  name: string;
};

export type SystemData = {
  type: DataType.SYSTEM;
  id: UUID;
  name: string;
};

export type ScreenElementData = {
  type: DataType.SCREENELEMENT;
  id: UUID;
  name: string;
};

export type TimerData = {
  type: DataType.TIMER;
  id: UUID;
  name: string;
  interval: number;
  repeat: boolean;
  script: UUID;
};

export type ScriptData = {
  type: DataType.SCRIPT;
  id: UUID;
  name: string;
  scriptType: keyof Omit<DataType, "SCRIPT">;
};

export type Script = {
  id: UUID;
  code: string; //<-- the code of the script
  //params: Record<string, any>;
};

export type ProjectData = {
  type: DataType.PROJECT;
  name: string;
  lastOpened: number;
  scenes: SceneData[];
  actors: ActorData[];
  screenElements: ScreenElementData[];
  levels: LevelData[];
  camera: CameraData[];
  components: ComponentData[];
  systems: SystemData[];
  postProcessors: PostProcessorData[];
  particles: ParticleData[];
  engineConfig: EngineData;
  scripts: any[];
  timers: TimerData[];
};
