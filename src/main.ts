import { initApp } from "./app";

let config = {
  content: [
    {
      type: "row",
      content: [
        {
          type: "component",
          componentName: "testComponent",
          componentState: { label: "A" },
        },
        {
          type: "column",
          content: [
            {
              type: "component",
              componentName: "testComponent",
              componentState: { label: "B" },
            },
            {
              type: "component",
              componentName: "testComponent",
              componentState: { label: "C" },
            },
          ],
        },
      ],
    },
  ],
};
declare var GoldenLayout: any;
var myLayout = new GoldenLayout(config);

myLayout.registerComponent("testComponent", function (container: any, componentState: any) {
  container.getElement().html("<h2>" + componentState.label + "</h2>");
});

myLayout.init();

// Initialize the app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});
