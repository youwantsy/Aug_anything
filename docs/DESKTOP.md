# ◈ Aug Anything for Windows

**The same local image lab, now in its own desktop window.**

The desktop edition is developed on `feature/desktop-app`. The original standalone HTML remains unchanged and usable without installation. This is a preview build, not a signed production release.

## Run the application

Two x64 Windows artifacts are built locally:

- **`Aug-Anything-0.2.0-portable.exe`** — double-click to run without installing. Keep this executable wherever you prefer; startup extracts its runtime into a temporary directory.
- **`Aug-Anything-0.2.0-setup.exe`** — optional per-user installer with directory selection and Start menu / desktop shortcuts. Administrator elevation is not requested.

End users do not need Node.js, npm, a terminal, or a browser server. There is no listening application port in normal use. Debugging ports are only enabled when a developer explicitly adds the command-line flag described below.

**Unsigned preview:** these executables do not have an Authenticode signing certificate. Windows may show an unknown-publisher or SmartScreen warning. This project does not disable, change, or bypass those protections. If organizational policy blocks unsigned applications, use your organization's approved review process.

## A simple workflow

1. Open **Augmentation → 로컬 이미지 선택** and choose PNG, JPG, or WebP files in the Windows file picker.
2. Set the augmentation recipe, optional classification labels, and seed. Preview, then generate the batch.
3. Choose **결과 폴더에 저장**. Select a parent folder; the app creates a uniquely named `Aug-Anything-…` child folder containing images and `manifest.json`.
4. For an individual file or ZIP, use the corresponding save button and Windows Save dialog.
5. Use **프로젝트 저장** to save a JSON project that contains decoded input images, classification labels, recipe, and catalog metadata. **프로젝트 불러오기** restores that work in a new session.

Project files do **not** contain generated results; regenerate those from the saved recipe or export them separately. Project images are embedded PNGs, not links to external paths. Source EXIF/ICC metadata and original compression are not preserved. A project can be large and contains the images you selected, so share it deliberately.

### Persistence and cancellation

- Saving is explicit. Unsaved inputs, outputs, and changes disappear on exit. Closing the window asks you to confirm this.
- Catalog rows remain metadata, not archived image files or an authorization system. Saving a project persists that metadata only.
- Existing files are never overwritten. If a Save dialog targets an existing file, the app refuses the write and asks for a new filename.
- Original images are read-only to the app. Exported files use generated names.
- Cancelling generation preserves the previous completed batch. Cancelling a folder export leaves the already written files in its new folder and writes a partial manifest with `exportStatus: "cancelled-partial"`.
- PNG/JPG, ZIP, source and output limits, label weighting, and bbox/mask limitations remain as documented in the main README. Project JSON is limited to 240 MiB.

## Develop

Requires Node.js 22.12+ (Node.js 24 tested) and Windows x64. Dependencies are pinned with `package-lock.json`.

```sh
git clone --branch feature/desktop-app https://github.com/youwantsy/Aug_anything.git
cd Aug_anything
npm ci
npm run setup:electron
npm start
```

Electron 44 uses an explicit binary setup step. `setup:electron` runs the official Electron package's installer. Dependency downloads use the official npm registry and Electron/electron-builder distributions. After setup, `Run-Development.cmd` also starts the app from the correct directory. It is a developer convenience, not the packaged executable.

```sh
npm test                   # storage, path, project and CSP checks
npm run dist:win            # unsigned portable + NSIS installer in dist/
```

To inspect a running development app with the smoke test, explicitly launch it with a **local development-only** debugging port:

```sh
npm run prepare:desktop
npx electron . --remote-debugging-port=9444
# In a second terminal in this repository:
npm run test:desktop
```

Do not expose that port to a network. Change the port if another development app is already using it. The shipped executable does not enable remote debugging by default.

## Security boundaries

- Sandboxed renderer, `contextIsolation: true`, `nodeIntegration: false`, and `webSecurity: true`.
- Restrictive CSP: packaged scripts only, no inline JavaScript, no eval, no network connections, no frames or plugins. Inline **styles** remain allowed for the existing UI's layout values.
- Local resources use an allowlisted `aug://app/` scheme. Navigation, new windows, permission requests, and network requests are denied. Reference links display their URL rather than launching external content.
- Six narrowly scoped preload methods. Every IPC call checks the main window and top-level frame identity. There is no general filesystem, shell, arbitrary path, or arbitrary IPC API exposed to the renderer.
- File reads begin with an OS picker. Folder writes require a main-process-issued capability token, safe basenames, output type/size limits, and a fresh child directory. Files are opened with exclusive creation.
- Project imports validate the schema, recipe ranges, embedded PNG signature/dimensions, counts, and metadata lengths before becoming application state.

## Validation and remaining scope

The preserved standalone HTML passes its 43 existing browser checks. Desktop storage/path/project tests and real Electron renderer smoke checks cover the new boundaries. Test reports and screenshots are in `docs/desktop/`.

The native dialog boundary is exercised with controlled dialog responses in integration tests; the available environment did not expose the supported Windows UI automation runtime for end-to-end clicking of OS file dialogs. Actual Electron windows and packaged resources are checked separately. Installer installation/uninstallation and other Windows versions remain manual release checks.

The current build toolchain reports 8 high-severity **development-only** advisories through electron-builder's download/cache dependency chain. The latest official toolchain is pinned; downgrading introduced additional advisories, so it was not retained. `npm audit --omit=dev` reports zero production-dependency advisories. These build tools are excluded from the packaged app. This does not constitute a complete security audit; review upstream fixes before a production release.

Electron and its included components have their own licenses; the packaged runtime includes its license notices. No open-source license has been assigned to the application's original code.

## Architecture

```text
data-management-platform-prototype.html  Preserved standalone source
desktop/build-renderer.cjs               Extracts external CSS/JS and removes inline event execution
desktop/actions.js                      Explicit allowlisted UI action adapter; no eval
desktop/native.js                       Native image/export/project workflow
desktop/main.cjs                        Electron window, protocol, CSP boundary and IPC authorization
desktop/preload.cjs                     Isolated, minimal bridge
desktop/storage.cjs                     Validated native dialogs and filesystem operations
desktop/tests/                          Node tests with synthetic data
desktop/generated/                      Build output (not tracked)
dist/                                   Executables and runtime (not tracked)
```

References: [Electron security](https://www.electronjs.org/docs/latest/tutorial/security), [Electron context isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation), [electron-builder Windows targets](https://www.electron.build/win/).
