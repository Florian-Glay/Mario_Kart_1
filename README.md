# Scrollable 3D Animation with Three.js

- Watch the [full tutorial](https://youtu.be/Q7AOvWpIVHU) on YouTube
- [Scrollable Three.js Animation](https://fireship.io/snippets/threejs-scrollbar-animation) Snippet

## Usage

```
git clone <this-repo>
npm install
npm run dev

npm install --save-dev electron-packager
npm install --save-dev electron-builder
npm start
npm install --save-dev electron
npm install --save-dev vite


npx electron-packager . GlayPainparayRACER --platform=win32 --arch=x64 --overwrite --prune=true --icon "./Image/myicon.ico" --ignore '^/3D_Model($|/)' --ignore '^/blender($|/)' --ignore '^/edit($|/)' --ignore '^/EX 1($|/)' --ignore '^/Image($|/)' --ignore '^/public($|/)' --ignore '^/Video($|/)' --ignore '^/dist/win-unpacked($|/)'

npm run build

transform to exe and build : 
"scripts": {
    "dev": "vite",
    "build": "vite build",
    "serve": "vite preview",
    "start": "electron ."
  },


OR 
  "scripts": {
    "dev": "vite",
    "build": "electron-builder",
    "serve": "vite preview",
    "start": "electron ."
  },
```