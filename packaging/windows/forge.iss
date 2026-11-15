#ifndef AppVersion
  #define AppVersion "10.6.1"
#endif

#define AppName "Forge"
#define AppExe "forge.exe"
#define AppId "{B91A3D0B-42A1-4653-9FE2-6E7521B31701}"

[Setup]
AppId={#AppId}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher=M. Lokesh
AppPublisherURL=https://github.com/lokesh12dev/Forge
AppSupportURL=https://github.com/lokesh12dev/Forge/issues
AppUpdatesURL=https://github.com/lokesh12dev/Forge/releases
DefaultDirName={localappdata}\Programs\Forge
DefaultGroupName=Forge
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
OutputBaseFilename=Forge-v{#AppVersion}-windows-x64-setup
SetupIconFile=..\..\windows\runner\resources\app_icon.ico
WizardStyle=modern
Compression=lzma2
SolidCompression=yes
UninstallDisplayIcon={app}\{#AppExe}

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Additional icons:"; Flags: unchecked

[Files]
Source: "..\..\build\windows\x64\runner\Release\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\Forge"; Filename: "{app}\{#AppExe}"
Name: "{autodesktop}\Forge"; Filename: "{app}\{#AppExe}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#AppExe}"; Description: "Launch Forge"; Flags: nowait postinstall skipifsilent
