# Recovery Report

## Artifact

- Input: `Samsung Health.apk`
- SHA-256: `F8F096E6625F908600AB8BBD6EC1826078C3F7EE8E6EF96F53DD7783AAC7B23D`
- Size: 354,195,445 bytes
- Package: `com.sec.android.app.shealth`
- Version: `7.00.6.011` (version code `7006011`)
- Certificate: Samsung Corporation / Samsung Cert, DMC; SHA-256 `B9:A4:2D:D5:FC:4E:05:48:89:AE:41:27:A6:27:4C:EC:64:E7:5C:41:73:3D:42:F5:99:1E:70:19:F9:EA:5C:AF`

## Framework and build evidence

The APK is a native Android application written primarily in Java/Kotlin. It contains Kotlin metadata, AndroidX Compose and View libraries, Room, WorkManager, Firebase, Google Play services, Health Connect, Samsung SDK namespaces, and native JNI libraries. No Flutter, React Native, Unity, Capacitor, or Cordova runtime markers were found.

- Compile SDK: 37 (platform/build codename 17)
- Minimum SDK: 29
- Target SDK: 36
- Primary application class: `com.samsung.android.app.shealth.SHealthApplication`
- Launcher: `com.samsung.android.app.shealth.home.HomeMainActivity`
- Deep-link entry point: `com.samsung.android.app.shealth.home.DeeplinkDelegatorActivity`
- Native ABIs: `arm64-v8a`, `armeabi-v7a`

## Recovered

- AndroidManifest and component declarations via Apktool.
- All eight DEX files converted to smali partitions.
- Decoded Android resources and asset files.
- 49 native library entries across two ABIs.
- Bundled fonts, icons, images, animations, SVG, audio, GPX, JSON, protobuf, database/configuration files, certificates, and five TensorFlow Lite models.
- Signing certificate metadata.
- JADX analysis was attempted, but source emission was blocked by APK resource names exceeding Windows path limits; Apktool smali remains the authoritative code recovery.
- Dependency/version metadata embedded by the APK.

The manifest identifies extensive activities, services, broadcast receivers, content providers, foreground services, Health Connect integration, wearable/device integrations, Firebase messaging, ML Kit, WorkManager, notifications, boot handling, deep links, and Samsung-specific permissions.

## Reconstruction

The project shell preserves the recovered artifacts and declares the recoverable Android SDK levels. Reconstructed material is limited to what can be derived from the APK: decoded resources, smali, decompiled source, manifest contracts, assets, and native binaries. No new product behavior or redesign was added.

## Not exactly recoverable

- Original Java/Kotlin source, comments, build scripts, Gradle dependency graph, and generated sources.
- Samsung proprietary SDK source and build repositories.
- Server-side APIs, credentials, account state, backend data, and device services.
- Original signing keys and production release process.
- Runtime databases created on user devices.
- Exact source-level Compose/UI state architecture and unobfuscated symbol intent where R8/proguard optimization removed it.
- Device-specific behavior requiring Samsung hardware or companion packages.

## Build status

The decoded package was rebuilt successfully with Apktool 2.10.0 after converting copies of four original resources whose filenames end in `.png` while their payloads are WebP (`RIFF`/`WEBP`) data. The authoritative decoded artifacts remain byte-preserving; conversion is confined to `build/apktool-rebuild`. The output `build/SamsungHealth-rebuilt-unsigned.apk` retains package `com.sec.android.app.shealth`, version `7.00.6.011`, min SDK 29, target SDK 36, and all eight DEX files. `build/SamsungHealth-rebuilt-debug.apk` is signed with a newly generated local recovery key and passes APK v3 verification. It cannot update the production Samsung Health app because the original Samsung signing key is unavailable. Full server/device behavior still requires proprietary Samsung dependencies and services. The exact analysis commands are listed in `original/analysis-commands.txt`.

## Recoverability estimate

Binary/resource recovery: approximately 95% of archive contents.
Source-level recovery: approximately 15-30% depending on package; smali is complete for the DEX partitions, while Java/Kotlin reconstruction is limited by obfuscation and decompiler/resource-path failures.
Full behavioral/build recovery: low, approximately 10-20%, due to proprietary services, server dependencies, release signing, and hardware integrations.
