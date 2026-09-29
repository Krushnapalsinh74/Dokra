# Reconstruction Status

The recovered project is organized around the APK's actual contents:

- `apktool/` is the authoritative editable recovery: decoded manifest/resources/assets/native libraries and smali for all eight DEX files.
- `jadx/` is a best-effort Java-like source output. JADX may fail or omit files when Windows rejects resource-derived paths longer than its limit; smali remains complete.
- `original/` preserves the supplied APK and analysis commands.

## Current boundary

The APK contains enough information to reproduce the packaged binary's resources and inspect its code, but not enough to recreate Samsung's original Gradle project or compile the full app independently. The missing inputs are proprietary Samsung SDKs, generated sources, server contracts, release signing keys, and device companion services.

No replacement screens, mock data, or redesigned behavior have been added. Adding a minimal launcher would create a different application and would not be a clone of the supplied app.

## Next technically valid cloning steps

1. Inspect or edit recovered behavior in `apktool/smali*`.
2. Rebuild the decoded package with Apktool for experiments, using a new debug keystore.
3. Replace individual smali/resource components only when their behavior is understood and tested.
4. Validate changes on a compatible Android device or emulator with the required Samsung/Health Connect dependencies.
