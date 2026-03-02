-- =====================================================
-- UnifiedPOS Database Schema
-- SQL Server / Azure SQL Database
-- Generated: 2026-01-24
-- =====================================================
-- This script creates the full database schema for the
-- UnifiedPOS Point of Sale system. It is idempotent and
-- can be run in CI/CD pipelines for deployments.
-- =====================================================

-- Use this for Azure SQL or existing database
-- USE UnifiedPOSDb;
-- GO

-- =====================================================
-- Drop existing tables (optional - for clean install)
-- Uncomment if you want to recreate from scratch
-- =====================================================
/*
DROP TABLE IF EXISTS [Payments];
DROP TABLE IF EXISTS [OrderItems];
DROP TABLE IF EXISTS [Orders];
DROP TABLE IF EXISTS [Customers];
DROP TABLE IF EXISTS [Variants];
DROP TABLE IF EXISTS [Products];
DROP TABLE IF EXISTS [Categories];
DROP TABLE IF EXISTS [AspNetUserTokens];
DROP TABLE IF EXISTS [AspNetUserRoles];
DROP TABLE IF EXISTS [AspNetUserLogins];
DROP TABLE IF EXISTS [AspNetUserClaims];
DROP TABLE IF EXISTS [AspNetRoleClaims];
DROP TABLE IF EXISTS [AspNetUsers];
DROP TABLE IF EXISTS [AspNetRoles];
GO
*/

-- =====================================================
-- ASP.NET Core Identity Tables
-- =====================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AspNetRoles')
BEGIN
    CREATE TABLE [AspNetRoles] (
        [Id] NVARCHAR(450) NOT NULL,
        [Name] NVARCHAR(256) NULL,
        [NormalizedName] NVARCHAR(256) NULL,
        [ConcurrencyStamp] NVARCHAR(MAX) NULL,
        CONSTRAINT [PK_AspNetRoles] PRIMARY KEY ([Id])
    );
    CREATE UNIQUE INDEX [RoleNameIndex] ON [AspNetRoles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AspNetUsers')
BEGIN
    CREATE TABLE [AspNetUsers] (
        [Id] NVARCHAR(450) NOT NULL,
        [Role] INT NOT NULL DEFAULT 0, -- 0=Cashier, 1=Manager, 2=Admin (UserRole enum)
        [UserName] NVARCHAR(256) NULL,
        [NormalizedUserName] NVARCHAR(256) NULL,
        [Email] NVARCHAR(256) NULL,
        [NormalizedEmail] NVARCHAR(256) NULL,
        [EmailConfirmed] BIT NOT NULL DEFAULT 0,
        [PasswordHash] NVARCHAR(MAX) NULL,
        [SecurityStamp] NVARCHAR(MAX) NULL,
        [ConcurrencyStamp] NVARCHAR(MAX) NULL,
        [PhoneNumber] NVARCHAR(MAX) NULL,
        [PhoneNumberConfirmed] BIT NOT NULL DEFAULT 0,
        [TwoFactorEnabled] BIT NOT NULL DEFAULT 0,
        [LockoutEnd] DATETIMEOFFSET NULL,
        [LockoutEnabled] BIT NOT NULL DEFAULT 0,
        [AccessFailedCount] INT NOT NULL DEFAULT 0,
        CONSTRAINT [PK_AspNetUsers] PRIMARY KEY ([Id])
    );
    CREATE INDEX [EmailIndex] ON [AspNetUsers] ([NormalizedEmail]);
    CREATE UNIQUE INDEX [UserNameIndex] ON [AspNetUsers] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AspNetRoleClaims')
BEGIN
    CREATE TABLE [AspNetRoleClaims] (
        [Id] INT IDENTITY(1,1) NOT NULL,
        [RoleId] NVARCHAR(450) NOT NULL,
        [ClaimType] NVARCHAR(MAX) NULL,
        [ClaimValue] NVARCHAR(MAX) NULL,
        CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AspNetUserClaims')
BEGIN
    CREATE TABLE [AspNetUserClaims] (
        [Id] INT IDENTITY(1,1) NOT NULL,
        [UserId] NVARCHAR(450) NOT NULL,
        [ClaimType] NVARCHAR(MAX) NULL,
        [ClaimValue] NVARCHAR(MAX) NULL,
        CONSTRAINT [PK_AspNetUserClaims] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AspNetUserLogins')
BEGIN
    CREATE TABLE [AspNetUserLogins] (
        [LoginProvider] NVARCHAR(450) NOT NULL,
        [ProviderKey] NVARCHAR(450) NOT NULL,
        [ProviderDisplayName] NVARCHAR(MAX) NULL,
        [UserId] NVARCHAR(450) NOT NULL,
        CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY ([LoginProvider], [ProviderKey]),
        CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AspNetUserRoles')
BEGIN
    CREATE TABLE [AspNetUserRoles] (
        [UserId] NVARCHAR(450) NOT NULL,
        [RoleId] NVARCHAR(450) NOT NULL,
        CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY ([UserId], [RoleId]),
        CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AspNetUserTokens')
BEGIN
    CREATE TABLE [AspNetUserTokens] (
        [UserId] NVARCHAR(450) NOT NULL,
        [LoginProvider] NVARCHAR(450) NOT NULL,
        [Name] NVARCHAR(450) NOT NULL,
        [Value] NVARCHAR(MAX) NULL,
        CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY ([UserId], [LoginProvider], [Name]),
        CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END
GO

-- =====================================================
-- UnifiedPOS Business Tables
-- =====================================================

-- Categories Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Categories')
BEGIN
    CREATE TABLE [Categories] (
        [Id] INT IDENTITY(1,1) NOT NULL,
        [Name] NVARCHAR(100) NOT NULL,
        [Prefix] NVARCHAR(10) NOT NULL,
        [ColorCode] NVARCHAR(20) NULL,
        [Created] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        [CreatedBy] NVARCHAR(450) NULL,
        [LastModified] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        [LastModifiedBy] NVARCHAR(450) NULL,
        CONSTRAINT [PK_Categories] PRIMARY KEY ([Id])
    );
    CREATE UNIQUE INDEX [IX_Categories_Prefix] ON [Categories] ([Prefix]);
END
GO

-- Products Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Products')
BEGIN
    CREATE TABLE [Products] (
        [Id] INT IDENTITY(1,1) NOT NULL,
        [CategoryId] INT NOT NULL,
        [Name] NVARCHAR(200) NOT NULL,
        [Description] NVARCHAR(500) NULL,
        [Price] DECIMAL(18,2) NOT NULL,
        [IsStockTracked] BIT NOT NULL DEFAULT 0,
        [StockQuantity] INT NOT NULL DEFAULT 0,
        [LowStockAlert] INT NOT NULL DEFAULT 0,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [Created] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        [CreatedBy] NVARCHAR(450) NULL,
        [LastModified] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        [LastModifiedBy] NVARCHAR(450) NULL,
        CONSTRAINT [PK_Products] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Products_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([Id]) ON DELETE CASCADE
    );
    CREATE INDEX [IX_Products_CategoryId] ON [Products] ([CategoryId]);
END
GO

-- Variants Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Variants')
BEGIN
    CREATE TABLE [Variants] (
        [Id] INT IDENTITY(1,1) NOT NULL,
        [ProductId] INT NOT NULL,
        [Name] NVARCHAR(100) NOT NULL,
        [Options] NVARCHAR(500) NOT NULL, -- JSON array of options
        [IsRequired] BIT NOT NULL DEFAULT 0,
        CONSTRAINT [PK_Variants] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Variants_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE
    );
    CREATE INDEX [IX_Variants_ProductId] ON [Variants] ([ProductId]);
END
GO

-- Customers Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Customers')
BEGIN
    CREATE TABLE [Customers] (
        [Id] INT IDENTITY(1,1) NOT NULL,
        [Name] NVARCHAR(200) NOT NULL,
        [Phone] NVARCHAR(20) NOT NULL,
        [Email] NVARCHAR(200) NULL,
        [Address] NVARCHAR(500) NULL,
        [Notes] NVARCHAR(1000) NULL,
        [Created] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        [CreatedBy] NVARCHAR(450) NULL,
        [LastModified] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        [LastModifiedBy] NVARCHAR(450) NULL,
        CONSTRAINT [PK_Customers] PRIMARY KEY ([Id])
    );
    CREATE UNIQUE INDEX [IX_Customers_Phone] ON [Customers] ([Phone]);
    CREATE INDEX [IX_Customers_Name] ON [Customers] ([Name]);
END
GO

-- Orders Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Orders')
BEGIN
    CREATE TABLE [Orders] (
        [Id] INT IDENTITY(1,1) NOT NULL,
        [TicketNumber] NVARCHAR(20) NOT NULL,
        [CustomerId] INT NULL,
        [CustomerName] NVARCHAR(200) NULL,
        [CustomerPhone] NVARCHAR(20) NULL,
        [TotalAmount] DECIMAL(18,2) NOT NULL,
        [PaidAmount] DECIMAL(18,2) NOT NULL DEFAULT 0,
        [PaymentStatus] INT NOT NULL DEFAULT 0, -- 0=Unpaid, 1=Partial, 2=Paid
        [OrderStatus] INT NOT NULL DEFAULT 0, -- 0=Pending, 1=Processing, 2=Ready, 3=Completed
        [Notes] NVARCHAR(MAX) NULL,
        [CompletedAt] DATETIMEOFFSET NULL,
        [Created] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        [CreatedBy] NVARCHAR(450) NULL,
        [LastModified] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        [LastModifiedBy] NVARCHAR(450) NULL,
        CONSTRAINT [PK_Orders] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Orders_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([Id]) ON DELETE SET NULL
    );
    CREATE UNIQUE INDEX [IX_Orders_TicketNumber] ON [Orders] ([TicketNumber]);
    CREATE INDEX [IX_Orders_CustomerId] ON [Orders] ([CustomerId]);
    CREATE INDEX [IX_Orders_OrderStatus] ON [Orders] ([OrderStatus]);
    CREATE INDEX [IX_Orders_Created] ON [Orders] ([Created]);
END
GO

-- OrderItems Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'OrderItems')
BEGIN
    CREATE TABLE [OrderItems] (
        [Id] INT IDENTITY(1,1) NOT NULL,
        [OrderId] INT NOT NULL,
        [ProductId] INT NULL,
        [ProductName] NVARCHAR(200) NOT NULL,
        [CategoryName] NVARCHAR(100) NULL,
        [CategoryPrefix] NVARCHAR(10) NULL,
        [Quantity] INT NOT NULL,
        [UnitPrice] DECIMAL(18,2) NOT NULL,
        [Subtotal] DECIMAL(18,2) NOT NULL,
        [VariantDetails] NVARCHAR(500) NULL, -- JSON of selected variants
        CONSTRAINT [PK_OrderItems] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_OrderItems_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_OrderItems_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE SET NULL
    );
    CREATE INDEX [IX_OrderItems_OrderId] ON [OrderItems] ([OrderId]);
    CREATE INDEX [IX_OrderItems_ProductId] ON [OrderItems] ([ProductId]);
END
GO

-- Payments Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Payments')
BEGIN
    CREATE TABLE [Payments] (
        [Id] INT IDENTITY(1,1) NOT NULL,
        [OrderId] INT NOT NULL,
        [Amount] DECIMAL(18,2) NOT NULL,
        [PaymentMethod] INT NOT NULL, -- 0=Cash, 1=QR, 2=Credit
        [ReferenceNumber] NVARCHAR(100) NULL,
        [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT [PK_Payments] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Payments_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([Id]) ON DELETE CASCADE
    );
    CREATE INDEX [IX_Payments_OrderId] ON [Payments] ([OrderId]);
END
GO

-- =====================================================
-- Seed Data
-- =====================================================

-- Seed Roles
IF NOT EXISTS (SELECT * FROM [AspNetRoles] WHERE [Name] = 'Administrator')
BEGIN
    INSERT INTO [AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp])
    VALUES (NEWID(), 'Administrator', 'ADMINISTRATOR', NEWID());
END
GO

-- Seed Categories
IF NOT EXISTS (SELECT * FROM [Categories] WHERE [Prefix] = 'DC')
BEGIN
    INSERT INTO [Categories] ([Name], [Prefix], [ColorCode])
    VALUES ('Dry Cleaning', 'DC', '#22C55E');
END

IF NOT EXISTS (SELECT * FROM [Categories] WHERE [Prefix] = 'LN')
BEGIN
    INSERT INTO [Categories] ([Name], [Prefix], [ColorCode])
    VALUES ('Laundry', 'LN', '#3B82F6');
END
GO

-- Seed Dry Cleaning Products
DECLARE @DcCategoryId INT = (SELECT [Id] FROM [Categories] WHERE [Prefix] = 'DC');
IF @DcCategoryId IS NOT NULL AND NOT EXISTS (SELECT * FROM [Products] WHERE [CategoryId] = @DcCategoryId)
BEGIN
    INSERT INTO [Products] ([CategoryId], [Name], [Price], [IsActive]) VALUES
    (@DcCategoryId, 'Baju Kurung', 15.00, 1),
    (@DcCategoryId, 'Baju Melayu', 15.00, 1),
    (@DcCategoryId, 'Bathrobe (M)', 12.00, 1),
    (@DcCategoryId, 'Bedspread', 25.00, 1),
    (@DcCategoryId, 'Blazer', 20.00, 1),
    (@DcCategoryId, 'Blouse', 10.00, 1),
    (@DcCategoryId, 'Bush Jacket', 18.00, 1),
    (@DcCategoryId, 'Coat', 35.00, 1),
    (@DcCategoryId, 'Curtain Crease', 5.00, 1),
    (@DcCategoryId, 'Dress', 18.00, 1),
    (@DcCategoryId, 'Evening Gown', 45.00, 1),
    (@DcCategoryId, 'Neck Tie/Scarf Toy', 8.00, 1),
    (@DcCategoryId, 'Overcoat/Cloak', 38.00, 1),
    (@DcCategoryId, 'Pillow Case (M)', 5.00, 1),
    (@DcCategoryId, 'Saree/Wedding Saree', 65.00, 1),
    (@DcCategoryId, 'Sheep Skin/Chamois/Suede', 50.00, 1),
    (@DcCategoryId, 'Skirt', 8.00, 1),
    (@DcCategoryId, 'Skirt (Pleated)', 10.00, 1),
    (@DcCategoryId, 'Sport Shirt', 10.00, 1),
    (@DcCategoryId, 'Sweater', 12.00, 1),
    (@DcCategoryId, 'Trousers (M)', 10.00, 1),
    (@DcCategoryId, 'Waistcoat', 15.00, 1),
    (@DcCategoryId, 'Uniform Set', 20.00, 1),
    (@DcCategoryId, 'Jumpsuit', 22.00, 1);
END
GO

-- Seed Laundry Products
DECLARE @LnCategoryId INT = (SELECT [Id] FROM [Categories] WHERE [Prefix] = 'LN');
IF @LnCategoryId IS NOT NULL AND NOT EXISTS (SELECT * FROM [Products] WHERE [CategoryId] = @LnCategoryId)
BEGIN
    INSERT INTO [Products] ([CategoryId], [Name], [Price], [IsActive]) VALUES
    (@LnCategoryId, 'Wash & Fold (per kg)', 6.00, 1),
    (@LnCategoryId, 'Wash & Iron (per kg)', 8.00, 1),
    (@LnCategoryId, 'Bedsheet (Single)', 8.00, 1),
    (@LnCategoryId, 'Bedsheet (Queen)', 10.00, 1),
    (@LnCategoryId, 'Bedsheet (King)', 12.00, 1),
    (@LnCategoryId, 'Blanket (Single)', 15.00, 1),
    (@LnCategoryId, 'Blanket (Queen)', 18.00, 1),
    (@LnCategoryId, 'Blanket (King)', 22.00, 1),
    (@LnCategoryId, 'Comforter (Single)', 25.00, 1),
    (@LnCategoryId, 'Comforter (Queen)', 30.00, 1),
    (@LnCategoryId, 'Comforter (King)', 35.00, 1),
    (@LnCategoryId, 'Pillow Case', 3.00, 1),
    (@LnCategoryId, 'Bolster Case', 4.00, 1),
    (@LnCategoryId, 'Curtain (per panel)', 10.00, 1),
    (@LnCategoryId, 'Table Cloth (Small)', 8.00, 1),
    (@LnCategoryId, 'Table Cloth (Large)', 12.00, 1),
    (@LnCategoryId, 'Towel (Small)', 3.00, 1),
    (@LnCategoryId, 'Towel (Large)', 5.00, 1),
    (@LnCategoryId, 'Bath Mat', 6.00, 1),
    (@LnCategoryId, 'Carpet (per sqm)', 15.00, 1),
    (@LnCategoryId, 'Rug (Small)', 20.00, 1),
    (@LnCategoryId, 'Rug (Medium)', 35.00, 1),
    (@LnCategoryId, 'Rug (Large)', 50.00, 1),
    (@LnCategoryId, 'Ironing Only (per piece)', 3.00, 1);
END
GO

PRINT 'UnifiedPOS database schema created successfully!';
GO
