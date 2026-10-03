# Desktop preview validation — 0.2.0

Validated on Windows x64 with Electron 44.5.1 / electron-builder 26.15.3.

| Layer | Evidence |
| --- | --- |
| Preserved HTML | Existing 17 catalog + 26 augmentation tests passed; source unchanged from `1970769` |
| Storage/project/security | 9 Node cases passed: traversal, ADS/reserved names, strict recipe/project validation, exclusive writes, selected image reads, decoding rejection, capability-token export, partial manifest, project round trip and CSP |
| Actual portable application | 15 checks passed: renderer isolation, native controls, catalog/drawer actions, inline-script denial, recipe input, MixUp pixels, blocked network, resource boundary, forged IPC denial, synthetic image generation, narrow layout and no uncaught exceptions |
| Packaged resources | ASAR contains expected app files only, no development dependencies or tests, latest storage guards, restricted CSP, no default debugging port |
| Native artifacts | Portable and NSIS setup built successfully; both Authenticode status `NotSigned` |

The portable executable was launched and its real Electron renderer was inspected and screenshot-tested via a temporary localhost debugging port. Synthetic images were used exclusively. Normal startup has no debugging port.

The supported Windows UI automation runtime was not available. Native dialog boundaries were integration-tested with controlled responses, but OS-dialog clicking and installer installation/uninstallation were not automated. No security setting was changed and no warning was bypassed.

## Artifact checksums

```text
9D94A4985FECEF55F330318297C4EEB08A9804EB0CDD402A87F30B4DCF71D9DA  Aug-Anything-0.2.0-portable.exe
56D2A4FCEF200B17CEFBAF4651D09BFDF5D378C0B810B62C7BA71889515CE2EB  Aug-Anything-0.2.0-setup.exe
```

Portable: 100,213,945 bytes. Setup: 100,423,251 bytes. Binaries are not committed and no public GitHub Release is created.

## Dependency audit

`npm audit --omit=dev` reports zero production-dependency advisories. The latest build toolchain reports 8 high-severity development-only download/cache advisories; those tools are absent from the ASAR. This record is not a production security certification.
