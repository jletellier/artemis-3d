# ARtemis

## Description

ARtemis is a collection of open-source tools to quickly prototype and test mobile augmented reality (AR) scenes. 

**ARtemis Viewer** uses [Babylon.js](https://github.com/BabylonJS/Babylon.js) and the [WebXR API](https://github.com/immersive-web/webxr) on mobile browsers to render ARtemis scenes. 

**ARtemis Editor** is a web-based authoring tool to create ARtemis scenes. It aims to be usable by non-programmers, such as artists and domain experts from cultural fields. 

**ARtemis Server** can be used to host ARtemis scenes and provides an API for the ARtemis Viewer and other applications.

## Main Goals

- Creating, editing and sharing *ARtemis scenes*
- Defining marker images to be used as targets for further augmentations
- Defining scene objects to be placed on detected surfaces
- Adding 3D meshes (.fbx, .gltf), images (.png, .jpg) and videos (.mp4) to the scene
- Transformation (translation, rotation, scaling) of scene objects
- Scripting via a visual programming interface or [TypeScript](https://www.typescriptlang.org/) 
- Testing *ARtemis scenes* using [Mozilla's WebXR Viewer](https://github.com/mozilla-mobile/webxr-ios) on iOS or [Google Chrome Canary](https://play.google.com/store/apps/details?id=com.chrome.canary&hl=en) on Android
