# UnifiedPOS

Point of Sale system for Laundry and Dry Cleaning businesses.

## Features

- 🛒 **Point of Sale** - Quick item selection with category filtering
- 📋 **Order Management** - Track orders through processing stages
- 👥 **Customer Management** - Customer database with order history
- 📊 **Dashboard** - Real-time business metrics
- 📈 **Reports** - Comprehensive sales reports
- 🖨️ **Receipt Printing** - 80mm thermal/dot-matrix printer support
- 📱 **PWA Support** - Installable on Android tablets

## Quick Start

### Development

```bash
# Build and run
cd src\Web
dotnet watch run

# Navigate to https://localhost:5001
```

### Production Deployment

```bash
# Build and publish
cd src\Web\ClientApp
npm run build
cd ..
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -o ./publish

# Run the executable
.\publish\UnifiedPOS.Web.exe
```

## Distribution

### Windows Installer

Create a professional Windows installer using Inno Setup:

1. **Install Inno Setup 6** from https://jrsoftware.org/isdl.php

2. **Run the build script:**
   ```powershell
   .\build-installer.ps1 -Version "1.0.0"
   ```

3. **Find the installer at:** `installer\output\UnifiedPOS-Setup-1.0.0.exe`

The installer includes:
- Desktop and Start Menu shortcuts
- Firewall exception
- Uninstaller
- SQL Server detection warning

### Android Tablet (PWA)

The app is a Progressive Web App that can be installed on Android tablets:

1. Open Chrome on your tablet
2. Navigate to the app URL
3. Tap the "Install" prompt or use menu → "Add to Home Screen"
4. The app opens in fullscreen like a native app

## Database Setup

The app requires SQL Server. Options:
- **SQL Server Express** (free) - https://www.microsoft.com/sql-server/sql-server-downloads
- **SQL Server LocalDB** (development)

Update connection string in `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=UnifiedPOS;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```

## Default Login

- **Email:** admin@localhost
- **Password:** Admin123!

## Project Structure

```
UnifiedPOS/
├── src/
│   ├── Domain/          # Entities, Enums
│   ├── Application/     # CQRS Commands & Queries
│   ├── Infrastructure/  # Database, Identity
│   └── Web/             # API Endpoints, Angular SPA
├── database/            # SQL Schema
├── installer.iss        # Inno Setup script
└── build-installer.ps1  # Build automation
```

## Technologies

- **Backend:** ASP.NET Core 9, Entity Framework Core
- **Frontend:** Angular 18, TypeScript
- **Database:** SQL Server
- **Architecture:** Clean Architecture, CQRS with MediatR