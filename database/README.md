# UnifiedPOS Database

## Schema Files

### schema.sql
Complete SQL Server schema for the UnifiedPOS application.

**Features:**
- ASP.NET Core Identity tables
- Business tables (Categories, Products, Variants, Customers, Orders, OrderItems, Payments)
- All indexes and foreign keys
- Seed data (categories and 48 products)
- **Idempotent** - Safe to run multiple times (uses `IF NOT EXISTS` checks)

## Usage

### Local Development
```sql
-- Using SQL Server Management Studio
-- 1. Create database:
CREATE DATABASE UnifiedPOSDb;
GO
USE UnifiedPOSDb;
GO

-- 2. Run schema.sql
```

### CI/CD Pipeline (Azure DevOps / GitHub Actions)
```yaml
# Example Azure DevOps task
- task: SqlAzureDacpacDeployment@1
  inputs:
    azureSubscription: 'your-subscription'
    ServerName: 'your-server.database.windows.net'
    DatabaseName: 'UnifiedPOSDb'
    SqlUsername: '$(DbUser)'
    SqlPassword: '$(DbPassword)'
    deployType: 'SqlTask'
    SqlFile: 'database/schema.sql'
```

### Docker / GitHub Actions Example
```bash
sqlcmd -S localhost -U sa -P "YourPassword" -d UnifiedPOSDb -i database/schema.sql
```

## Connection String

Update `appsettings.json` with your connection:

```json
{
  "ConnectionStrings": {
    "UnifiedPOSDb": "Server=YOUR_SERVER;Database=UnifiedPOSDb;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

### Examples:
- **Local SQL Express**: `Server=localhost\SQLEXPRESS;Database=UnifiedPOSDb;Trusted_Connection=True;TrustServerCertificate=True;`
- **Azure SQL**: `Server=your-server.database.windows.net;Database=UnifiedPOSDb;User Id=admin;Password=xxx;`
- **Docker SQL**: `Server=localhost,1433;Database=UnifiedPOSDb;User Id=sa;Password=xxx;`
