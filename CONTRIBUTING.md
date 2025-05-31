# Knowledge Base

## Tech Stack & Some Background

<kbd>[<img title="Ukraine" alt="Ukraine" src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Flag_of_Ukraine.svg/1280px-Flag_of_Ukraine.svg.png"  width="22">](contributing/CONTRIBUTING.ua.md)</kbd>
<kbd>[<img title="Russia" alt="Russia" src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Russia.svg/1280px-Flag_of_Russia.svg.png"  width="22">](contributing/CONTRIBUTING.ru.md)</kbd>
<kbd>[<img title="Polish" alt="Polish" src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Flag_of_Poland.svg/250px-Flag_of_Poland.svg.png"  width="22">](contributing/CONTRIBUTING.pl)</kbd>
<kbd>[<img title="Deutsch" alt="Deutsch" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2uEryZuDlXosocJnvXBB0kYWkrtTNNINFaaJQySlzoRRolztbc2Pgrw7u3WLxVqcpC4k&usqp=CAU" width="22">](contributing/CONTRIBUTING.de.md)</kbd>

Here is an overview of the toolchain and runtime used in this project.

### Project Overview 

For the whole project, we use:
- [Node.js >=18.17.0](https://nodejs.org/):  The core environment for libraries.
- [Electron 27](https://electron.atom.io):  The actual runtime of the launcher.
- [pnpm](https://pnpm.io/):  Used for monorepo package management.
- [TypeScript](https://www.typescriptlang.org/):  The entire project uses TypeScript as much as possible.

#### Main Process (Electron):
- [esbuild](https://esbuild.github.io/):  Used to build the main process TypeScript files.

#### Renderer (Frontend):
- [Vue](https://vuejs.org):  Used to build user interfaces.
- [Vite](https://vitejs.dev):  Our build system.
- [Vuetify](https://vuetifyjs.com/):  UI component library.
- [Windi CSS](https://windicss.org/):  CSS utility-first framework.
- [Vue Composition API](https://github.com/vuejs/composition-api):  Provides compositional API support for Vue 2. Once Vuetify upgrades to Vue 3, this will be removed.

### Project Structure

![diagram](/assets/diagram.svg)

- **xmcl**
  - A linked git submodule from [launcher-core](https://github.com/voxelum/minecraft-launcher-core-node). 
  - Implements core Minecraft install and launch logic, exposed as a library.

- **xmcl-electron-app**
  - Uses Electron to implement the runtime.
  - Depends directly on `xmcl-runtime`.
  - Implicitly depends on `xmcl-keystone-ui` (temporarily; may be removed later).

- **xmcl-keystone-ui**
  - The primary default UI of the launcher.
  - Fully browser-compatible with no Electron APIs involved.

- **xmcl-runtime**
  - Core implementation of the launcher architecture.
  - Only depends on Node.js, not requiring an Electron runtime.

- **xmcl-runtime-api**
  - Shared code and API definitions for XMCL runtime.
  - Can be used on the renderer side (browser).

### Concept / Architecture

The launcher follows a "server/client" or "main/renderer" structure. Communication happens via Electron's [ipcMain](https://electronjs.org/docs/api/ipc-main)  and [ipcRenderer](https://electronjs.org/docs/api/ipc-renderer). 

#### Main Process
Acts as the backend of the launcher:
- Manages windows and persistent app state/data.
- Uses [Vuex](https://vuex.vuejs.org/)  to manage state.
- Broadcasts Vuex mutations over IPC to all renderers.
- Triggers disk-saving actions when modules are modified.

#### Renderer Process
Are just browser windows that communicate with the main process:
- Maintain a copy of the store (full or partial).
- User input triggers Vuex actions or commits, which are synced to the main process automatically.
- Developers can treat them like normal Vue applications without worrying about synchronization.

### Recommended Code Reading Guide

If you're interested in specific UI pages:
- Go to `xmcl-keystone-ui/src/windows/main/views`
- `.vue` files here represent major components. File prefixes indicate their domain.

Examples:
1. `AppSideBar.vue`: Sidebar component.
   - `AppSideBarInstanceItem.vue`: Component representing an instance in the sidebar.

2. `Curseforge.vue`: CurseForge page.
   - `CurseforgeCategories.vue`: Category card component used inside `Curseforge.vue`.

For core logic:
- Look at `xmcl-runtime/services/`. Each file represents a service for a specific domain.
- Also check `xmcl-runtime-api/services/`, which declares corresponding interfaces.

Examples:
1. `InstanceService.ts` — Implementation of instance add/remove/update logic.
   - Interface: `xmcl-runtime-api/services/InstanceService.ts`

2. `InstanceVersionService.ts` — Checks version health of instances.

3. `InstallService.ts` — Handles installation of Minecraft, Forge, Fabric, etc.

4. `LaunchService.ts` — Handles launching instances.

## Contributing

We highly recommend using **VSCode** to open the project.

### Getting Started

#### Clone the Project

Clone with submodules:

```bash
git clone --recurse-submodules https://github.com/Voxelum/x-minecraft-launcher 