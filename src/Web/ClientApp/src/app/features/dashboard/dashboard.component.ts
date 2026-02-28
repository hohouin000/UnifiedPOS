import { Component, OnInit } from '@angular/core';
import { ApiService, DashboardSummaryDto, OrderStatus } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <app-layout>
      <div class="page-container">
        <div class="page-header">
          <h2>Dashboard</h2>
          <span class="text-muted">{{ today }}</span>
        </div>
        
        <!-- Summary Cards -->
        <div class="summary-cards" *ngIf="summary">
          <div class="summary-card revenue">
            <div class="card-icon">💰</div>
            <div class="card-content">
              <span class="card-label">Today's Revenue</span>
              <span class="card-value">RM {{ summary.todaysRevenue.toFixed(2) }}</span>
            </div>
          </div>
          
          <div class="summary-card pending">
            <div class="card-icon">⏳</div>
            <div class="card-content">
              <span class="card-label">Pending Orders</span>
              <span class="card-value">{{ summary.pendingOrders }}</span>
            </div>
          </div>
          
          <div class="summary-card ready">
            <div class="card-icon">✅</div>
            <div class="card-content">
              <span class="card-label">Ready for Pickup</span>
              <span class="card-value">{{ summary.readyForPickup }}</span>
            </div>
          </div>
          
          <div class="summary-card total">
            <div class="card-icon">📋</div>
            <div class="card-content">
              <span class="card-label">Total Orders Today</span>
              <span class="card-value">{{ summary.totalOrdersToday }}</span>
            </div>
          </div>
        </div>
        
        <div class="dashboard-grid">
          <!-- Recent Orders -->
          <div class="card">
            <div class="card-header">
              <span>Recent Orders</span>
            </div>
            <div class="card-body">
              <div class="recent-order" *ngFor="let order of summary?.recentOrders">
                <div class="order-info">
                  <span class="ticket">{{ order.ticketNumber }}</span>
                  <span class="customer">{{ order.customerName || 'Walk-in' }}</span>
                </div>
                <div class="order-meta">
                  <span class="amount">RM {{ order.totalAmount.toFixed(2) }}</span>
                  <span class="badge" [class]="getStatusClass(order.status)">
                    {{ getStatusLabel(order.status) }}
                  </span>
                </div>
              </div>
              <div *ngIf="!summary?.recentOrders?.length" class="text-center text-muted p-2">
                No recent orders
              </div>
            </div>
          </div>
          
          <!-- Low Stock Alerts -->
          <div class="card">
            <div class="card-header">
              <span>⚠️ Low Stock Alerts</span>
            </div>
            <div class="card-body">
              <div class="low-stock-item" *ngFor="let item of summary?.lowStockItems">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-stock badge badge-danger">
                  {{ item.stockQuantity }} left
                </span>
              </div>
              <div *ngIf="!summary?.lowStockItems?.length" class="text-center text-muted p-2">
                ✅ All stock levels OK
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .page-container {
      padding: 24px;
    }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }
    
    .summary-card {
      background: var(--bg-card);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-color);
    }
    
    .card-icon {
      font-size: 40px;
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
    }
    
    .summary-card.revenue .card-icon { background: rgba(34, 197, 94, 0.1); }
    .summary-card.pending .card-icon { background: rgba(245, 158, 11, 0.1); }
    .summary-card.ready .card-icon { background: rgba(99, 102, 241, 0.1); }
    .summary-card.total .card-icon { background: rgba(59, 130, 246, 0.1); }
    
    .card-content {
      display: flex;
      flex-direction: column;
    }
    
    .card-label {
      color: var(--text-secondary);
      font-size: 14px;
      margin-bottom: 4px;
    }
    
    .card-value {
      font-size: 28px;
      font-weight: 700;
    }
    
    .summary-card.revenue .card-value { color: var(--secondary-color); }
    .summary-card.pending .card-value { color: var(--warning-color); }
    .summary-card.ready .card-value { color: var(--info-color); }
    .summary-card.total .card-value { color: var(--primary-color); }
    
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    
    .recent-order {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--border-color);
    }
    
    .recent-order:last-child {
      border-bottom: none;
    }
    
    .order-info {
      display: flex;
      flex-direction: column;
    }
    
    .ticket {
      font-weight: 600;
      font-family: monospace;
      color: var(--primary-color);
    }
    
    .customer {
      font-size: 13px;
      color: var(--text-secondary);
    }
    
    .order-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }
    
    .amount {
      font-weight: 600;
    }
    
    .low-stock-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--border-color);
    }
    
    .low-stock-item:last-child {
      border-bottom: none;
    }
    
    .item-name {
      font-weight: 500;
    }
    
    @media (max-width: 1024px) {
      .summary-cards {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @media (max-width: 768px) {
      .summary-cards {
        grid-template-columns: 1fr;
      }
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  summary: DashboardSummaryDto | null = null;
  today = new Date().toLocaleDateString('en-MY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.api.getDashboardSummary().subscribe(data => {
      this.summary = data;
    });
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending: return 'status-pending';
      case OrderStatus.Processing: return 'status-processing';
      case OrderStatus.Ready: return 'status-ready';
      case OrderStatus.Completed: return 'status-completed';
      default: return '';
    }
  }

  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending: return 'Pending';
      case OrderStatus.Processing: return 'Processing';
      case OrderStatus.Ready: return 'Ready';
      case OrderStatus.Completed: return 'Completed';
      default: return '';
    }
  }
}
