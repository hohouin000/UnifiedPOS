import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    template: `
    <div class="login-container">
      <div class="login-background">
        <div class="bg-shape shape-1"></div>
        <div class="bg-shape shape-2"></div>
        <div class="bg-shape shape-3"></div>
      </div>
      
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <span class="logo-icon">🧺</span>
            <h1>UnifiedPOS</h1>
          </div>
          <p class="subtitle">Laundry & Dry Cleaning Management</p>
        </div>
        
        <form class="login-form" (ngSubmit)="login()">
          <div class="form-group">
            <label>Email / Username</label>
            <div class="input-wrapper">
              <span class="input-icon">👤</span>
              <input 
                type="text" 
                [(ngModel)]="email" 
                name="email"
                placeholder="Enter your email"
                [class.error]="error">
            </div>
          </div>
          
          <div class="form-group">
            <label>Password</label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                [(ngModel)]="password" 
                name="password"
                placeholder="Enter your password"
                [class.error]="error">
              <button type="button" class="toggle-password" (click)="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>
          
          <div class="error-message" *ngIf="error">
            {{ error }}
          </div>
          
          <button type="submit" class="btn-login" [disabled]="loading">
            <span *ngIf="!loading">Sign In</span>
            <span *ngIf="loading">Signing in...</span>
          </button>
        </form>
        
        <div class="login-footer">
          <p class="hint">Default: <strong>admin</strong> / <strong>Admin123!</strong></p>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%);
      position: relative;
      overflow: hidden;
    }
    
    .login-background {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }
    
    .bg-shape {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.4;
    }
    
    .shape-1 {
      width: 400px;
      height: 400px;
      background: linear-gradient(135deg, #3B82F6, #8B5CF6);
      top: -100px;
      left: -100px;
      animation: float 8s ease-in-out infinite;
    }
    
    .shape-2 {
      width: 300px;
      height: 300px;
      background: linear-gradient(135deg, #22C55E, #10B981);
      bottom: -50px;
      right: -50px;
      animation: float 10s ease-in-out infinite reverse;
    }
    
    .shape-3 {
      width: 200px;
      height: 200px;
      background: linear-gradient(135deg, #F59E0B, #EF4444);
      top: 50%;
      left: 50%;
      animation: float 12s ease-in-out infinite;
    }
    
    @keyframes float {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      25% { transform: translate(30px, -30px) rotate(5deg); }
      50% { transform: translate(-20px, 20px) rotate(-5deg); }
      75% { transform: translate(20px, 30px) rotate(3deg); }
    }
    
    .login-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      padding: 48px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
      position: relative;
      z-index: 1;
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .logo-icon {
      font-size: 48px;
    }
    
    .logo h1 {
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(135deg, #3B82F6, #22C55E);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
    }
    
    .subtitle {
      color: #64748B;
      font-size: 14px;
      margin: 0;
    }
    
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .form-group label {
      display: block;
      font-weight: 600;
      color: #1E293B;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    
    .input-icon {
      position: absolute;
      left: 16px;
      font-size: 18px;
    }
    
    .input-wrapper input {
      width: 100%;
      padding: 16px 16px 16px 50px;
      font-size: 16px;
      border: 2px solid #E2E8F0;
      border-radius: 12px;
      background: #F8FAFC;
      transition: all 0.2s;
    }
    
    .input-wrapper input:focus {
      outline: none;
      border-color: #3B82F6;
      background: white;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }
    
    .input-wrapper input.error {
      border-color: #EF4444;
    }
    
    .toggle-password {
      position: absolute;
      right: 16px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
    }
    
    .error-message {
      background: rgba(239, 68, 68, 0.1);
      color: #DC2626;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      text-align: center;
    }
    
    .btn-login {
      width: 100%;
      padding: 16px;
      font-size: 16px;
      font-weight: 600;
      color: white;
      background: linear-gradient(135deg, #3B82F6, #2563EB);
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-login:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
    }
    
    .btn-login:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .login-footer {
      margin-top: 24px;
      text-align: center;
    }
    
    .hint {
      color: #94A3B8;
      font-size: 13px;
    }
    
    .hint strong {
      color: #64748B;
    }
  `]
})
export class LoginComponent {
    email = '';
    password = '';
    showPassword = false;
    loading = false;
    error = '';

    constructor(private auth: AuthService, private router: Router) { }

    login() {
        if (!this.email || !this.password) {
            this.error = 'Please enter email and password';
            return;
        }

        this.loading = true;
        this.error = '';

        this.auth.login({ email: this.email, password: this.password }).subscribe({
            next: (success) => {
                this.loading = false;
                if (success) {
                    this.router.navigate(['/pos']);
                } else {
                    this.error = 'Invalid email or password';
                }
            },
            error: () => {
                this.loading = false;
                this.error = 'Login failed. Please try again.';
            }
        });
    }
}
