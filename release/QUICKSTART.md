# Academic-clipper Quick Start (Windows)

Academic-clipper saves a Nature article as Markdown into a local folder. Nothing else needs to be installed: Node.js is bundled.

## Install

1. Extract this zip anywhere (for example your Downloads folder).
2. Open PowerShell in the extracted folder and run:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\install.ps1
   ```

   This installs to `%LOCALAPPDATA%\Academic-clipper`. No administrator rights, PATH changes or global npm packages are involved.
3. Load the extension in Microsoft Edge (Chrome works the same way):
   - open `edge://extensions` and turn on **Developer mode**
   - click **Load unpacked** and choose `%LOCALAPPDATA%\Academic-clipper\extension`
   - copy the 32-letter **ID** shown on the extension card
4. Register the extension with the local host by running the installer again with that ID:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\install.ps1 -ExtensionId <paste-the-id-here>
   ```

## Use

Open a Nature article, click the Academic Clipper toolbar icon, use **Preview Markdown** to check the result, then **Save Paper**. The local bridge starts automatically when needed.

Papers are saved to `Documents\Academic-clipper\papers` unless you change `libraryPath` in `%LOCALAPPDATA%\Academic-clipper\config.json`.

## Update or repair

Extract the newer release and run `install.ps1` again. It is safe to repeat: your `config.json` is kept, registrations are not duplicated, and a running bridge is stopped and replaced. Reload the extension in `edge://extensions` afterwards.

## Uninstall

```powershell
powershell -ExecutionPolicy Bypass -File .\uninstall.ps1
```

This removes the runtime, the Native Messaging registration and the install metadata. Your saved papers are never touched. `config.json` is kept; add `-RemoveConfig` to delete it too. Remove the extension itself from `edge://extensions`.

## What the installer records

`%LOCALAPPDATA%\Academic-clipper\install-state.json` lists the installed version, install time, host registration status and extension status. Registry keys used:

- `HKCU\Software\Microsoft\Edge\NativeMessagingHosts\com.academic_clipper.bridge`
- `HKCU\Software\Google\Chrome\NativeMessagingHosts\com.academic_clipper.bridge`

The extension cannot be installed silently by Edge/Chrome policy; a future Edge Add-ons release will replace step 3.
