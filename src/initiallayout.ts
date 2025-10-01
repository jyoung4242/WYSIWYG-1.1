export const contentLayout = {
  content: [
    {
      type: "row",
      content: [
        {
          // Project column
          type: "column",
          width: 25,
          content: [
            {
              type: "component",

              height: 50,
              componentName: "Project Tree",
              componentState: { label: "Project Tree" },
            },
            {
              height: 50,
              type: "component",
              componentName: "Project Inspector",
              componentState: { label: "Project Inspector" },
            },
          ],
        },
        {
          // Editor column Viewer and Asset Manager
          type: "column",
          width: 75,
          content: [
            {
              id: "mainStack",
              type: "stack", // viewer, scripts, and level editor
              height: 80,
              content: [
                {
                  title: "Scene View",
                  type: "row", // scene view and insepctor
                  content: [
                    {
                      type: "component",
                      width: 75,
                      componentName: "Scene Viewer",
                      title: "Scene",
                      componentState: { label: "Scene Viewer" },
                    },
                    {
                      width: 25,
                      type: "component",
                      componentName: "Scene Inspector",
                      title: "Inspector",
                      componentState: {
                        label: "Inspector",
                      },
                    },
                  ],
                },
                {
                  type: "component",
                  componentName: "Script Editor",
                  componentState: {
                    label: "Script Editor",
                  },
                },
                {
                  type: "component",
                  componentName: "Level Editor",
                  componentState: {
                    label: "Level Editor",
                  },
                },
                {
                  type: "component",
                  componentName: "TileMap Editor",
                  componentState: {
                    label: "TileMap Editor",
                  },
                },
              ],
            },
            {
              type: "stack", // Asset Manager and Grahpics
              height: 20,
              content: [
                {
                  type: "component",
                  componentName: "Asset Manager",
                  componentState: {
                    label: "Asset Manager",
                  },
                },
                {
                  type: "component",
                  componentName: "Graphics Manager",
                  componentState: {
                    label: "Graphics Manager",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

/*
item configuration:
{
              type: "component",
              componentName: "testComponent",
              componentState: { label: "C" },
            },


General
argument	    type	optional	default	description
type	        String	false	-	The type of the item. Possible values are 'row', 'column', 'stack', 'component' 
content 	    Array	true	-	An array of configurations for items that will be created as children of this item
width	        Number	true	-	The width of this item, relative to the other children of its parent in percent
height	        Number	true	-	The height of this item, relative to the other children of its parent in percent
id	            Mixed	true	-	A String or an Array of Strings. Used to retrieve the item using item.getItemsById()
isClosable	    Boolean	true	true	Determines if the item is closable. If false, the x on the items tab will be hidden and container.close() will return false
title	        String	true	componentName or ''	The title of the item as displayed on its tab and on popout windows

,
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

*/
