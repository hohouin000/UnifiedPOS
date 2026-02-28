import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, UserInfo } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  template: `
    <div class="app-layout">
      <!-- Mobile Top Bar -->
      <div class="mobile-topbar hidden-desktop">
        <button class="hamburger-btn" (click)="toggleSidebar()">
          <span class="hamburger-icon">☰</span>
        </button>
        <div class="mobile-logo">
          <span class="logo-text">UnifiedPOS</span>
        </div>
      </div>

      <!-- Backdrop for Mobile Sidebar -->
      <div class="sidebar-backdrop hidden-desktop" 
           *ngIf="isSidebarOpen" 
           (click)="closeSidebar()"></div>

      <!-- Sidebar -->
      <aside class="sidebar" [class.sidebar-open]="isSidebarOpen">
        <div class="sidebar-header">
          <div class="logo">
            <span class="logo-icon">🧺</span>
            <span class="logo-text">UnifiedPOS</span>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <a routerLink="/pos" routerLinkActive="active" class="nav-item" (click)="closeSidebar()">
            <span class="nav-icon">🛒</span>
            <span class="nav-label">Point of Sale</span>
          </a>
          <a routerLink="/orders" routerLinkActive="active" class="nav-item" (click)="closeSidebar()">
            <span class="nav-icon">📋</span>
            <span class="nav-label">Orders</span>
          </a>
          <a routerLink="/customers" routerLinkActive="active" class="nav-item" (click)="closeSidebar()">
            <span class="nav-icon">👥</span>
            <span class="nav-label">Customers</span>
          </a>
          <a routerLink="/inventory" routerLinkActive="active" class="nav-item" (click)="closeSidebar()">
            <span class="nav-icon">📦</span>
            <span class="nav-label">Inventory</span>
          </a>
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" (click)="closeSidebar()">
            <span class="nav-icon">📊</span>
            <span class="nav-label">Dashboard</span>
          </a>
          <a routerLink="/reports" routerLinkActive="active" class="nav-item" (click)="closeSidebar()">
            <span class="nav-icon">📈</span>
            <span class="nav-label">Reports</span>
          </a>
          <a routerLink="/settings" routerLinkActive="active" class="nav-item" (click)="closeSidebar()">
            <span class="nav-icon">⚙️</span>
            <span class="nav-label">Settings</span>
          </a>
        </nav>
        
        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">👤</div>
            <div class="user-details">
              <span class="user-name">{{ user?.userName || 'User' }}</span>
              <span class="user-role">Administrator</span>
            </div>
            <button class="logout-btn" (click)="logout()" title="Logout">🚪</button>
          </div>
        </div>
      </aside>
      
      <!-- Main Content -->
      <main class="main-content">
        <ng-content></ng-content>
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
    }
    
    .sidebar {
      width: var(--sidebar-width);
      background: var(--bg-sidebar);
      color: var(--text-white);
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      z-index: 1000;
      transition: transform 0.3s ease;
    }
    
    .mobile-topbar {
      display: flex;
      align-items: center;
      padding: 0 16px;
      height: var(--header-height);
      background: var(--bg-sidebar);
      color: white;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 900;
      box-shadow: var(--shadow-sm);
    }
    
    .hamburger-btn {
      background: transparent;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 8px;
      margin-right: 16px;
    }
    
    .sidebar-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 950;
    }
    
    .sidebar-header {
      padding: 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .logo-icon {
      font-size: 28px;
    }
    
    .logo-text {
      font-size: 20px;
      font-weight: 700;
      background: linear-gradient(135deg, #60A5FA, #34D399);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .sidebar-nav {
      flex: 1;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 10px;
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      transition: all 0.2s ease;
    }
    
    .nav-item:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    .nav-item.active {
      background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    
    .nav-icon {
      font-size: 20px;
      width: 24px;
      text-align: center;
    }
    
    .nav-label {
      font-weight: 500;
    }
    
    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
    }
    
    .user-avatar {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    
    .user-details {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    
    .user-name {
      font-weight: 600;
      font-size: 14px;
    }
    
    .user-role {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
    }
    
    .logout-btn {
      width: 36px;
      height: 36px;
      border: none;
      background: rgba(239, 68, 68, 0.2);
      border-radius: 8px;
      cursor: pointer;
      font-size: 18px;
      transition: all 0.2s;
    }
    
    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.4);
    }
    
    .main-content {
      flex: 1;
      margin-left: var(--sidebar-width);
      background: var(--bg-surface);
      min-height: 100vh;
      padding: 0;
    }
    
    @media print {
      .sidebar, .mobile-topbar { display: none !important; }
      .main-content { margin-left: 0 !important; padding-top: 0 !important; }
    }
    
    /* Responsive Mode */
    @media (max-width: 1024px) {
      .sidebar {
        transform: translateX(-100%);
      }
      .sidebar.sidebar-open {
        transform: translateX(0);
      }
      .main-content {
        margin-left: 0;
        padding-top: var(--header-height);
      }
    }
  `]
})
export class LayoutComponent implements OnInit {
  user: UserInfo | null = null;
  isSidebarOpen = false;

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit() {
    this.auth.user$.subscribe(user => this.user = user);
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        // Force redirect anyway
        window.location.href = '/login';
      }
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }
}
