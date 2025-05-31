# 知识库

## 技术栈与项目背景

在这里，我们概述了这个项目使用的工具链与运行时。

对于整个项目，我们有：

- [Node.js >=18.17.0](https://nodejs.org/)  — 核心库的基础环境。
- [Electron 27](https://electron.atom.io)  — 启动器的实际运行时。
- [pnpm](https://pnpm.io/)  — 用于 monorepo 包管理。
- [TypeScript](https://www.typescriptlang.org/)  — 整个项目尽可能使用 TypeScript 编写。

对于主进程（Electron），我们使用：

- [esbuild](https://esbuild.github.io/)  — 使用 esbuild 构建主进程的 TypeScript 代码。

对于渲染器端（纯前端）：

- [Vue](https://vuejs.org)  — 用于构建用户界面。
- [Vite](https://vitejs.dev/)  — 用作构建系统。
- [Vuetify](https://vuetifyjs.com/)  — 作为组件库。
- [Windi CSS](https://windicss.org/)  — 用于 CSS 工具。
- [Vue Composition API](https://github.com/vuejs/composition-api)  — Vue 2 的组合式 API 桥梁。一旦 Vuetify 升级到 Vue 3，此依赖将被移除。

### 项目结构

![diagram](/assets/diagram.svg)

- **xmcl**
  - 链接至 [launcher-core](https://github.com/voxelum/minecraft-launcher-core-node)，这是一个  git 子模块。
  - 实现核心 Minecraft 安装和启动逻辑，并以库的形式暴露出来。
- **xmcl-electron-app**
  - 使用 Electron 实现运行时。
  - 直接依赖于 `xmcl-runtime`。
  - 临时依赖于 `xmcl-keystone-ui`（未来可能会移除）。
- **xmcl-keystone-ui**
  - 启动器的主要默认 UI。
  - 完全兼容浏览器，不涉及任何 Electron API。
- **xmcl-runtime**
  - 启动器架构的核心实现。仅依赖 Node.js，无需 Electron 运行时。
- **xmcl-runtime-api**
  - XMCL 运行时的共享代码与 API 接口。可用于渲染器端（浏览器侧）。

### 概念 / 架构

启动器采用“服务器/客户端”或“主进程/渲染器”的结构。它们通过 Electron 的 [ipcMain](https://electronjs.org/docs/api/ipc-main)  和 [ipcRenderer](https://electronjs.org/docs/api/ipc-renderer)  进行通信。

**主进程** 是启动器的“后端”，负责管理窗口以及所有持久化的数据和状态。它使用 [Vuex](https://vuex.vuejs.org/)  来管理状态。当某个 [Vuex commit](https://vuex.vuejs.org/guide/mutations.html)  修改了状态数据时，它会通过 IPC 广播包含变更信息的消息给所有渲染器进程，并触发对应模块的磁盘保存操作。

**渲染器进程** 只是与主进程通信的浏览器页面。它维护着一份 store 数据的副本（可以是完整的，也可以是部分的）。用户的输入会触发一个 [action](https://vuex.vuejs.org/guide/actions.html)  或 [commit](https://vuex.vuejs.org/guide/mutations.html)，这些变更会自动同步到主进程。因此，开发者无需手动处理同步逻辑，只需像开发普通  Vue 应用一样进行开发即可。

### 推荐的代码阅读指南

如果你对某个特定页面的逻辑感兴趣，可以前往 `xmcl-keystone-ui/src/windows/main/views`。该目录下的 `.vue` 文件代表启动器的主要组件。文件前缀通常表示其所属的功能域。

#### 示例：
1. `AppSideBar.vue` 是侧边栏组件，其中 `AppSideBarInstanceItem.vue` 表示侧边栏中的实例项。
2. `Curseforge.vue` 是 CurseForge 页面组件，`CurseforgeCategories.vue` 是该页面中显示类别的卡片组件。

如果你对核心逻辑感兴趣，可以查看 `xmcl-runtime/services/` 目录。每个文件都封装了一个特定领域的服务逻辑。同时你应参考 `xmcl-runtime-api/services/` 中对应的接口定义。

#### 示例：
1. `xmcl-runtime/services/InstanceService.ts` — 实现实例的添加/删除/更新逻辑。
   - 接口：`xmcl-runtime-api/services/InstanceService.ts`
2. `xmcl-runtime/services/InstanceVersionService.ts` — 检查实例版本健康状况。
3. `xmcl-runtime/services/InstallService.ts` — 负责安装 Minecraft、Forge、Fabric 等。
4. `xmcl-runtime/services/LaunchService.ts` — 实现启动实例的逻辑。

---

## 开发指南

我们强烈建议使用 **VSCode** 打开本项目。

### 克隆项目

克隆项目时请带上子模块参数：

```bash
git clone --recurse-submodules https://github.com/Voxelum/x-minecraft-launcher 