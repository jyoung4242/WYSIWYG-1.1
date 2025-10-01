import { Vector } from "./types";

//Default components on an Actor
export interface ActionsComponent {}
export interface PointerComponent {}
export interface TransformComponent {}
export interface GraphicsComponent {}
export interface MotionComponent {
  vel: Vector;
  maxVel: Vector;
  acc: Vector;
  scaleFactor: Vector;
  angularVelocity: number;
  torque: number;
  inertia: number;
}
export interface BodyComponent {}
export interface ColliderComponent {}

export const ExcaliburBlue = "#7cbaeb";
