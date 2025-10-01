import { ComponentData } from "../electron/types";
import { UUID } from "../electron/UUID";

// src/global.d.ts
interface Window {
  GoldenLayout: any;
  api?: {
    ping: () => "pong";
    selectProject: (path: string) => void;
    newProject: (path: string) => void;
    exit: () => void;
    get: () => Promise<ProjectData>;
    update: (partial: Partial<ProjectData>) => Promise<ProjectData>;
    load: () => Promise<ProjectData>;
    getProjectTreeData: () => Promise<any>;
    selectProjectDirectory: () => Promise<string>;
    createNewProjectFile: () => Promise<string>;
    getDataByID: (id: UUID) => any;
    getComponentsByID: (id: UUID) => Promise<ComponentData[]>;
    getCustomComponents: () => Promise<ComponentData[]>;
  };
}
