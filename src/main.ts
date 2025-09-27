import { initApp } from "./app";
import { contentLayout } from "./initiallayout";

declare var GoldenLayout: any;
var myLayout = new GoldenLayout(contentLayout);

myLayout.registerComponent("testComponent", function (container: any, componentState: any) {
  container.getElement().html("<h2>" + componentState.label + "</h2>");
});
myLayout.registerComponent("Project Tree", function (container: any, componentState: any) {
  container.getElement().html("<h2>" + componentState.label + "</h2>");
});
myLayout.registerComponent("Project Inspector", function (container: any, componentState: any) {
  container.getElement().html("<h2>" + componentState.label + "</h2>");
});
myLayout.registerComponent("Scene Inspector", function (container: any, componentState: any) {
  container.getElement().html("<h2>" + componentState.label + "</h2>");
});
myLayout.registerComponent("Scene Viewer", function (container: any, componentState: any) {
  container.getElement().html("<h2>" + componentState.label + "</h2>");
});
myLayout.registerComponent("Script Editor", function (container: any, componentState: any) {
  container.getElement().html("<h2>" + componentState.label + "</h2>");
});

myLayout.registerComponent("Level Editor", function (container: any, componentState: any) {
  container.getElement().html("<h2>" + componentState.label + "</h2>");
});
myLayout.registerComponent("Asset Manager", function (container: any, componentState: any) {
  container.getElement().html("<h2>" + componentState.label + "</h2>");
});
myLayout.registerComponent("Graphics Manager", function (container: any, componentState: any) {
  container.getElement().html("<h2>" + componentState.label + "</h2>");
});

myLayout.init();

// Initialize the app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});
