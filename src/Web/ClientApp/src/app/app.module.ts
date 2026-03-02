import { BrowserModule } from '@angular/platform-browser';
import { APP_ID, NgModule, APP_INITIALIZER, isDevMode } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { ModalModule } from 'ngx-bootstrap/modal';

import { AppComponent } from './app.component';
import { AuthorizeInterceptor } from 'src/api-authorization/authorize.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Core
import { AuthService } from './core/services/auth.service';
import { AuthGuard } from './core/guards/auth.guard';

// Layout
import { LayoutComponent } from './layout/layout.component';

// Feature Components  
import { LoginComponent } from './features/login/login.component';
import { PosComponent } from './features/pos/pos.component';
import { OrdersComponent } from './features/orders/orders.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CustomersComponent } from './features/customers/customers.component';
import { InventoryComponent } from './features/inventory/inventory.component';
import { SettingsComponent } from './features/settings/settings.component';
import { ReportsComponent } from './features/reports/reports.component';
import { ServiceWorkerModule } from '@angular/service-worker';

// Initialize auth on app start
export function initAuth(auth: AuthService) {
    return () => new Promise<void>((resolve) => {
        auth.checkAuth();
        setTimeout(() => resolve(), 500); // Give time for auth check
    });
}

@NgModule({
    declarations: [
        AppComponent,
        LayoutComponent,
        LoginComponent,
        PosComponent,
        OrdersComponent,
        DashboardComponent,
        CustomersComponent,
        InventoryComponent,
        SettingsComponent,
        ReportsComponent
    ],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        FormsModule,
        RouterModule.forRoot([
            { path: 'login', component: LoginComponent },
            { path: '', redirectTo: '/pos', pathMatch: 'full' },
            { path: 'pos', component: PosComponent, canActivate: [AuthGuard] },
            { path: 'orders', component: OrdersComponent, canActivate: [AuthGuard] },
            { path: 'customers', component: CustomersComponent, canActivate: [AuthGuard] },
            { path: 'inventory', component: InventoryComponent, canActivate: [AuthGuard] },
            { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
            { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard] },
            { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
            { path: '**', redirectTo: '/pos' }
        ]),
        BrowserAnimationsModule,
        ModalModule.forRoot(),
        ServiceWorkerModule.register('ngsw-worker.js', {
          enabled: !isDevMode(),
          // Register the ServiceWorker as soon as the application is stable
          // or after 30 seconds (whichever comes first).
          registrationStrategy: 'registerWhenStable:30000'
        })
    ],
    providers: [
        { provide: APP_ID, useValue: 'ng-cli-universal' },
        { provide: HTTP_INTERCEPTORS, useClass: AuthorizeInterceptor, multi: true },
        {
            provide: APP_INITIALIZER,
            useFactory: initAuth,
            deps: [AuthService],
            multi: true
        },
        provideHttpClient(withInterceptorsFromDi())
    ]
})
export class AppModule { }
