# Getting Started with Localization

## Pre-requirements

- [Git](https://git-scm.com/). You **must** install Git to get started.
- [VSCode](https://code.visualstudio.com/). This is the highly recommended editor for translators. It has an integrated UI tool to help you find translation keys.
- [Node.js >=18.17.0](https://nodejs.org/dist/v18.17.0/). If you want to test your translation locally, you need this. You can simply install the latest version.
- [pnpm](https://pnpm.io/installation). If you want to test your translation locally, you need this. Follow its installation guide.

## Getting Started

### Fork & Clone

You need to fork and clone the project using Git.

Assuming you've already forked the project on GitHub into your own repository:

```bash
git clone --recurse-submodules https://github.com/your-id/x-minecraft-launcher
```

### Install

**Optional**: If you want to test your translations locally, you'll need to install the project's dependencies.

This project supports [Nix](https://nixos.org/download.html) (with flakes enabled) and [direnv](https://direnv.net/docs/installation.html) for a reproducible development environment. If you have Nix and direnv installed and wish to use them for local testing:

1. After cloning, `cd` into the project directory (e.g., `x-minecraft-launcher`).
2. Run `direnv allow`.

This will automatically configure your shell with the correct versions of Node.js, pnpm, and other dependencies defined in `flake.nix`, preparing the environment for the next step.

Once your environment is set up (either via Nix/direnv or by manually ensuring you have Node.js and pnpm), install the project dependencies using [pnpm](https://pnpm.io/):

In the cloned folder (e.g. `x-minecraft-launcher`), run:

```bash
pnpm install
```

### Install i18n Extension

**Optional**, if you are using VSCode.

Install the i18n Ally (`lokalise.i18n-ally`) extension. VSCode may suggest installing recommended extensions, which should already include this one.

### Find the Locale Files

You need to locate the corresponding locale YAML file under:

- `xmcl-keystone-ui/locales`
- `xmcl-electron-app/main/locales`

The file name corresponds to the locale code. You can refer to [this document](http://man.hubwiz.com/docset/electron.docset/Contents/Resources/Documents/docs/api/locales.html) to choose the appropriate locale.

### Test Your Translation

**Optional**: You need to have the project installed first. See the [#install](#install) section above.

In VSCode, click the `Run and Debug` icon in the sidebar, select the configuration `Electron: Main (launch)`, and click the play button.

Alternatively, press `F5`, which might be the shortcut for this action.

This will start the launcher. You can switch to your language in the settings page to test your translation.

### Adding a New Language

**Optional**

If you're adding a new language, you also need to update `assets/locales.json` and add the new language key-value pair there.

For example, to add French (`fr`), open the file `assets/locales.json`:

```json
{
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  "en": "English",
  "ru": "Русский язык",
  "uk": "Українська мова",
  "es-ES": "Español"
}
```

Add a new entry at the end:

```json
{
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  "en": "English",
  "ru": "Русский язык",
  "uk": "Українська мова",
  "es-ES": "Españол",
  "fr": "French"
}
```

### Submit a Pull Request

Please follow the [GitHub guide](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) for instructions on how to submit a pull request.

