# Papyrus - Deployment Guide

This guide covers deploying Papyrus as a packaged desktop application for Linux (Ubuntu and Arch Linux) and as a mobile app for Android.

---

## Desktop Application (Linux)

The desktop application is packaged using Electron and distributed as native Linux packages.

### Supported Platforms

- **Ubuntu Linux**: `.deb` package
- **Arch Linux**: `.pacman` or `.tar.gz` package
- **Universal Linux**: AppImage (works on most Linux distributions)

### Prerequisites for Building

- Node.js 18+
- npm or yarn
- Linux build environment (Ubuntu or Arch recommended)

### Setup Electron Packaging

#### 1. Install Electron Dependencies

```bash
cd desktop
npm install electron electron-builder --save-dev
```

#### 2. Update package.json

Add to `desktop/package.json`:

```json
{
  "name": "papyrus-library",
  "version": "1.0.0",
  "description": "Library Management System",
  "main": "electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "npm run build && electron-builder",
    "electron:build:linux": "npm run build && electron-builder --linux",
    "electron:build:deb": "npm run build && electron-builder --linux deb",
    "electron:build:pacman": "npm run build && electron-builder --linux pacman",
    "electron:build:appimage": "npm run build && electron-builder --linux AppImage"
  },
  "build": {
    "appId": "com.papyrus.library",
    "productName": "Papyrus Library",
    "directories": {
      "output": "dist-electron"
    },
    "files": [
      "dist/**/*",
      "electron/**/*",
      "../../backend/dist/**/*",
      "../../backend/database/**/*",
      "../../backend/package.json",
      "../../backend/node_modules/**/*"
    ],
    "extraResources": [
      {
        "from": "../../backend",
        "to": "backend",
        "filter": [
          "dist/**/*",
          "database/**/*",
          "package.json",
          "node_modules/**/*"
        ]
      }
    ],
    "linux": {
      "target": [
        {
          "target": "deb",
          "arch": ["x64", "arm64"]
        },
        {
          "target": "pacman",
          "arch": ["x64"]
        },
        {
          "target": "AppImage",
          "arch": ["x64", "arm64"]
        }
      ],
      "category": "Utility",
      "maintainer": "Papyrus Team",
      "vendor": "Papyrus",
      "synopsis": "Library Management System",
      "description": "A comprehensive library management system for apartment block libraries"
    },
    "deb": {
      "depends": [
        "gconf2",
        "gconf-service",
        "libnotify4",
        "libappindicator1",
        "libxtst6",
        "libnss3"
      ]
    },
    "pacman": {
      "depends": [
        "gtk3",
        "libnotify",
        "nss",
        "libxss",
        "libxtst"
      ]
    }
  }
}
```

#### 3. Create Electron Main Process

Create `desktop/electron/main.js`:

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

// Start the backend server
function startBackend() {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    // In development, assume backend is running separately
    console.log('Development mode: Connect to existing backend');
    return;
  }

  // In production, start the bundled backend
  const backendPath = path.join(process.resourcesPath, 'backend', 'dist', 'index.js');

  backendProcess = spawn('node', [backendPath], {
    env: {
      ...process.env,
      PORT: 3001,
      DB_PATH: path.join(app.getPath('userData'), 'papyrus.db'),
    },
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../public/icon.png'),
  });

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startBackend();

  // Wait a bit for backend to start
  setTimeout(createWindow, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
```

#### 4. Create electron-builder Configuration

Create `desktop/electron-builder.yml`:

```yaml
appId: com.papyrus.library
productName: Papyrus Library
copyright: Copyright © 2025

directories:
  output: dist-electron
  buildResources: build

files:
  - dist/**/*
  - electron/**/*

extraResources:
  - from: ../backend
    to: backend
    filter:
      - dist/**/*
      - package.json
      - node_modules/**/*

linux:
  target:
    - target: deb
      arch:
        - x64
        - arm64
    - target: pacman
      arch:
        - x64
    - target: AppImage
      arch:
        - x64
        - arm64

  category: Utility
  maintainer: papyrus@example.com
  vendor: Papyrus
  synopsis: Library Management System
  description: >
    A comprehensive library management system designed for apartment block libraries.
    Features include book cataloging, borrower management, transaction tracking,
    and reporting capabilities.

deb:
  depends:
    - gconf2
    - gconf-service
    - libnotify4
    - libappindicator1
    - libxtst6
    - libnss3

pacman:
  depends:
    - gtk3
    - libnotify
    - nss
    - libxss
    - libxtst
```

### Building the Application

#### Build for all Linux platforms:

```bash
cd desktop
npm run electron:build:linux
```

#### Build specific packages:

**Ubuntu (.deb):**
```bash
npm run electron:build:deb
```

**Arch Linux (.pacman):**
```bash
npm run electron:build:pacman
```

**Universal Linux (AppImage):**
```bash
npm run electron:build:appimage
```

Output files will be in `desktop/dist-electron/`

### Installation

#### Ubuntu/Debian:

```bash
sudo dpkg -i papyrus-library_1.0.0_amd64.deb
# Or
sudo apt install ./papyrus-library_1.0.0_amd64.deb
```

#### Arch Linux:

```bash
sudo pacman -U papyrus-library-1.0.0-x86_64.pkg.tar.zst
```

#### AppImage (Universal):

```bash
chmod +x Papyrus-Library-1.0.0.AppImage
./Papyrus-Library-1.0.0.AppImage
```

### Post-Installation

The application will:
- Store data in: `~/.config/papyrus-library/`
- Create database at: `~/.config/papyrus-library/papyrus.db`
- Store backups in: `~/.config/papyrus-library/backups/`

---

## Mobile Application (Android)

The mobile app is built using React Native and connects to the desktop backend over local network.

### Prerequisites

- Node.js 18+
- Java Development Kit (JDK) 11 or newer
- Android Studio with Android SDK
- React Native CLI

### Setup React Native Project

#### 1. Create React Native Project

```bash
# From project root
npx react-native init PapyrusMobile --template react-native-template-typescript
cd mobile
```

#### 2. Install Dependencies

```bash
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install axios @tanstack/react-query
npm install react-native-gesture-handler react-native-reanimated
```

#### 3. Configure Android

Edit `mobile/android/app/build.gradle`:

```gradle
android {
    compileSdkVersion 33

    defaultConfig {
        applicationId "com.papyrus.mobile"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
    }

    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### 4. Configure Network Permissions

Edit `mobile/android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Add these permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />

    <application
        android:usesCleartextTraffic="true"
        ...>
        ...
    </application>
</manifest>
```

### Building Android APK

#### Debug Build:

```bash
cd mobile/android
./gradlew assembleDebug
```

Output: `mobile/android/app/build/outputs/apk/debug/app-debug.apk`

#### Release Build:

1. **Generate Signing Key:**

```bash
keytool -genkeypair -v -keystore papyrus-release-key.keystore \
  -alias papyrus-key -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configure Signing:**

Create `mobile/android/gradle.properties`:

```properties
PAPYRUS_UPLOAD_STORE_FILE=papyrus-release-key.keystore
PAPYRUS_UPLOAD_KEY_ALIAS=papyrus-key
PAPYRUS_UPLOAD_STORE_PASSWORD=your_keystore_password
PAPYRUS_UPLOAD_KEY_PASSWORD=your_key_password
```

3. **Edit build.gradle:**

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('PAPYRUS_UPLOAD_STORE_FILE')) {
                storeFile file(PAPYRUS_UPLOAD_STORE_FILE)
                storePassword PAPYRUS_UPLOAD_STORE_PASSWORD
                keyAlias PAPYRUS_UPLOAD_KEY_ALIAS
                keyPassword PAPYRUS_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

4. **Build Release APK:**

```bash
cd mobile/android
./gradlew assembleRelease
```

Output: `mobile/android/app/build/outputs/apk/release/app-release.apk`

### Building Android App Bundle (AAB) for Play Store

```bash
cd mobile/android
./gradlew bundleRelease
```

Output: `mobile/android/app/build/outputs/bundle/release/app-release.aab`

### Mobile App Configuration

The mobile app needs to connect to the desktop backend. Users can configure this in the app settings:

1. **Auto-discovery** (recommended):
   - Scan local network for Papyrus servers
   - Uses mDNS/Bonjour for service discovery

2. **Manual configuration**:
   - Enter desktop IP address: e.g., `192.168.1.100:3001`
   - Test connection before saving

---

## Distribution

### Desktop Application

#### Option 1: Direct Download
- Host `.deb`, `.pacman`, and `.AppImage` files on a web server
- Provide installation instructions on website

#### Option 2: Package Repositories

**Ubuntu/Debian PPA:**
```bash
# Create PPA on Launchpad
# Upload .deb packages
```

**Arch User Repository (AUR):**
- Create PKGBUILD
- Submit to AUR
- Users install via: `yay -S papyrus-library`

#### Option 3: Snap Store

```bash
# Create snapcraft.yaml
sudo snap install snapcraft --classic
snapcraft
snapcraft upload --release=stable papyrus-library_1.0.0_amd64.snap
```

#### Option 4: Flatpak

```bash
# Create org.papyrus.Library.json manifest
flatpak-builder build-dir org.papyrus.Library.json
flatpak-builder --user --install build-dir org.papyrus.Library.json
```

### Mobile Application

#### Option 1: Direct APK Distribution
- Host APK on website
- Users enable "Install from Unknown Sources"
- Direct download and install

#### Option 2: Google Play Store
- Create Google Play Developer account ($25 one-time fee)
- Upload AAB file
- Complete store listing
- Submit for review

#### Option 3: F-Droid
- Submit to F-Droid repository (open source apps)
- Free alternative to Play Store

---

## Auto-Updates

### Desktop (Electron)

Use electron-updater:

```bash
npm install electron-updater
```

Configure in `main.js`:

```javascript
const { autoUpdater } = require('electron-updater');

app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();
});
```

### Mobile (Android)

Implement in-app update checking:

```javascript
import { checkForUpdate } from './services/updateService';

// Check for updates on app start
useEffect(() => {
  checkForUpdate();
}, []);
```

---

## Deployment Checklist

### Before Release

- [ ] Test on Ubuntu 22.04 LTS and Ubuntu 24.04 LTS
- [ ] Test on Arch Linux (latest)
- [ ] Test AppImage on Fedora/OpenSUSE
- [ ] Test Android app on multiple devices (Android 8+)
- [ ] Verify database migrations work correctly
- [ ] Test backup and restore functionality
- [ ] Verify all API endpoints work over local network
- [ ] Test mobile app connection to desktop backend
- [ ] Security audit (especially JWT handling)
- [ ] Update all dependencies to latest versions
- [ ] Create user documentation
- [ ] Create installation videos/GIFs
- [ ] Set up crash reporting (Sentry)
- [ ] Test auto-update mechanism
- [ ] Create release notes

### Release Process

1. Update version in all package.json files
2. Update CHANGELOG.md
3. Build all packages
4. Test installation on clean systems
5. Create GitHub release with binaries
6. Update website with download links
7. Submit to package repositories
8. Submit Android app to Play Store (if applicable)
9. Announce release

---

## System Requirements

### Desktop Application

**Minimum:**
- Ubuntu 18.04+ or Arch Linux
- 2 GB RAM
- 500 MB free disk space
- 1280x720 display

**Recommended:**
- Ubuntu 22.04+ or Arch Linux (latest)
- 4 GB RAM
- 1 GB free disk space
- 1920x1080 display

### Mobile Application

**Minimum:**
- Android 8.0 (API level 26)
- 1 GB RAM
- 100 MB free storage
- WiFi connection to same network as desktop

**Recommended:**
- Android 11.0+
- 2 GB RAM
- 200 MB free storage

---

## Troubleshooting

### Desktop Issues

**App won't start:**
```bash
# Check logs
journalctl --user -u papyrus-library
# Or
cat ~/.config/papyrus-library/logs/error.log
```

**Database locked:**
```bash
# Remove lock file
rm ~/.config/papyrus-library/papyrus.db-wal
rm ~/.config/papyrus-library/papyrus.db-shm
```

### Mobile Issues

**Can't connect to desktop:**
- Ensure both devices on same network
- Check firewall allows port 3001
- Try manual IP configuration
- Disable VPN if active

**APK won't install:**
- Enable "Install from Unknown Sources"
- Check minimum Android version
- Clear space on device

---

## Support

For deployment assistance:
- Check [GETTING_STARTED.md](GETTING_STARTED.md)
- Review [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
- Open an issue on GitHub

---

**Last Updated:** October 16, 2025
