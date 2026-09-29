# Samsung Health APK Recovery

This directory is a forensic recovery of the supplied `Samsung Health.apk` (Samsung Health 7.00.6.011). The original APK is preserved one directory above this project.

## Contents

- `apktool/`: decoded manifest, resources, assets, native libraries, and smali for all eight DEX files.
- `jadx/`: best-effort Java-like decompilation when JADX completes.
- `original/`: APK metadata and signing evidence; the original APK is not modified.
- `app/`: Android project shell and recovered source/resource material.
- `RECOVERY_REPORT.md`: evidence, reconstruction boundaries, and build status.
- `RECONSTRUCTION_STATUS.md`: current cloning boundary and technically valid next steps.
- `tools/recover-apk.ps1`: repeatable Apktool extraction script.

The decompiled code is not the original Samsung source and cannot be treated as source-equivalent. Proprietary Samsung SDKs, generated build inputs, server services, signing keys, and device integrations are not present in the APK and prevent an exact clean rebuild.
