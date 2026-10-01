# Jarvis Mobile — Android

A React Native/Expo Android client for the Windows Jarvis assistant. It includes a dark Jarvis interface, Android speech recognition, text input, local fallback replies, and an optional connection to a desktop Jarvis HTTP endpoint.

## Requirements

- Windows, macOS, or Linux development computer
- Node.js 18+
- Android Studio and an Android emulator, or a physical Android phone with USB debugging enabled
- Expo CLI (installed through `npx`)

## Run on Android

```bash
npm install
npx expo prebuild
npx expo run:android
```

For a development server:

```bash
npx expo start
```

Then press `a` with an emulator running, or scan the QR code with a development build. Because `@react-native-voice/voice` is a native module, use `expo run:android` after `expo prebuild`; Expo Go alone cannot load this module.

## Microphone permission

Android will request microphone permission the first time the microphone button is used. Grant it to enable speech recognition.

## Connect to Windows Jarvis

Open `App.tsx` and set `DESKTOP_URL` to an endpoint reachable from the phone, for example:

```ts
const DESKTOP_URL = 'http://192.168.1.20:8000/ask';
```

The endpoint should accept `POST { "prompt": "..." }` and return `{ "response": "..." }`. Your phone and laptop must be on the same Wi-Fi network, and Windows Firewall must allow the chosen port. Do not expose an unauthenticated assistant endpoint to the public internet.

## Build an APK

Install EAS CLI and sign in to Expo:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

Download the generated APK from the Expo build page and install it on your Android phone.
