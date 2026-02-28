---
description: How to build, deploy, and update the UnifiedPOS application
---

# UnifiedPOS Deployment & Maintenance

## Building for Production

### 1. Build the Release Package
```bash
cd c:\App2\UnifiedPOS\src\Web

# Build Angular production bundle
cd ClientApp
npm run build
cd ..

# Publish .NET as self-contained exe
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -o ./publish
```

Output: `publish/UnifiedPOS.Web.exe` (single portable executable)

### 2. What's Included
- UnifiedPOS.Web.exe (main app)
- appsettings.json (configure before deploying)
- wwwroot/ (Angular frontend)

---

## Deployment Steps

### First-Time Install
1. Copy `publish/` folder to target PC
2. Edit `appsettings.json` with correct SQL Server connection
3. Run the SQL schema: `database/schema.sql`
4. Run `UnifiedPOS.Web.exe`
5. Access at: https://localhost:5001

### Updating Existing Installation
1. Stop the running application
2. Backup the old `publish/` folder
3. Replace with new `publish/` folder
4. Keep the existing `appsettings.json` (don't overwrite!)
5. Run any database migration scripts (if schema changed)
6. Restart the application

---

## Database Migrations

When the database schema changes:
1. Create a new SQL migration script in `database/migrations/`
2. Name it: `YYYYMMDD_description.sql`
3. Run on target database before deploying new version

Example:
```sql
-- database/migrations/20260124_add_discount_field.sql
ALTER TABLE Orders ADD Discount DECIMAL(18,2) NOT NULL DEFAULT 0;
```

---

## CI/CD Pipeline (Optional)

For automated deployment, add to your GitHub Actions or Azure DevOps:

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: 9.0.x
          
      - name: Build Angular
        run: |
          cd src/Web/ClientApp
          npm ci
          npm run build
          
      - name: Publish
        run: |
          cd src/Web
          dotnet publish -c Release -r win-x64 --self-contained -p:PublishSingleFile=true -o ./publish
          
      - name: Upload Artifact
        uses: actions/upload-artifact@v3
        with:
          name: unifiedpos-release
          path: src/Web/publish/
```

---

## Version Tracking

Recommend adding version number to the app:
1. Update `version` in `src/Web/Web.csproj`
2. Display in UI footer or settings page
3. Keep a CHANGELOG.md for tracking changes
