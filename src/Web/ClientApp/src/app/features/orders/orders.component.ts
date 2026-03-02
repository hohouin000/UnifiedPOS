import { Component, OnInit } from '@angular/core';
import { ApiService, OrderListDto, OrderDetailDto, OrderStatus, PaymentStatus, PaymentMethod, PaymentDto, ShopSettingsDto } from '../../core/services/api.service';
import { PrintService } from '../../core/services/print.service';

@Component({
  selector: 'app-orders',
  template: `
    <app-layout>
      <div class="page-container">
        <div class="page-header">
          <h2>Orders</h2>
          <div class="header-actions">
            <input 
              type="text" 
              class="form-control" 
              placeholder="Search by ticket or customer..."
              [(ngModel)]="searchTerm"
              (input)="loadOrders()"
              style="width: 280px;">
          </div>
        </div>
        
        <!-- Status Filters -->
        <div class="status-filters">
          <button 
            class="filter-btn" 
            [class.active]="statusFilter === null"
            (click)="filterByStatus(null)">
            All
          </button>
          <button 
            class="filter-btn pending" 
            [class.active]="statusFilter === OrderStatus.Pending"
            (click)="filterByStatus(OrderStatus.Pending)">
            Pending
          </button>
          <button 
            class="filter-btn processing" 
            [class.active]="statusFilter === OrderStatus.Processing"
            (click)="filterByStatus(OrderStatus.Processing)">
            Processing
          </button>
          <button 
            class="filter-btn ready" 
            [class.active]="statusFilter === OrderStatus.Ready"
            (click)="filterByStatus(OrderStatus.Ready)">
            Ready
          </button>
          <button 
            class="filter-btn completed" 
            [class.active]="statusFilter === OrderStatus.Completed"
            (click)="filterByStatus(OrderStatus.Completed)">
            Completed
          </button>
          <button 
            class="filter-btn collected" 
            [class.active]="statusFilter === OrderStatus.Collected"
            (click)="filterByStatus(OrderStatus.Collected)">
            Collected
          </button>
        </div>
        
        <!-- Orders Table -->
        <div class="card">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Bill #</th>
                  <th>Remark</th>
                  <th>Date</th>
                  <th>Collected</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let order of orders">
                  <td>
                    <span class="ticket-number clickable" (click)="viewOrder(order)">{{ order.ticketNumber }}</span>
                  </td>
                  <td>
                    <div *ngIf="order.customerName">{{ order.customerName }}</div>
                    <div class="text-muted text-sm" *ngIf="order.customerPhone">{{ order.customerPhone }}</div>
                    <div class="text-muted" *ngIf="!order.customerName">Walk-in</div>
                  </td>
                  <td>RM {{ order.totalAmount.toFixed(2) }}</td>
                  <td>RM {{ order.paidAmount.toFixed(2) }}</td>
                  <td>
                    <span class="badge" [class]="getPaymentStatusClass(order.paymentStatus)">
                      {{ getPaymentStatusLabel(order.paymentStatus) }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" [class]="getStatusClass(order.orderStatus)">
                      {{ getStatusLabel(order.orderStatus) }}
                    </span>
                  </td>
                  <td>
                    <span *ngIf="order.billNumber" class="text-sm">{{ order.billNumber }}</span>
                    <span *ngIf="!order.billNumber" class="text-muted text-sm">—</span>
                  </td>
                  <td>
                    <span *ngIf="order.remark" class="text-sm">{{ order.remark }}</span>
                    <span *ngIf="!order.remark" class="text-muted text-sm">—</span>
                  </td>
                  <td>{{ formatDate(order.created) }}</td>
                  <td>
                    <span *ngIf="order.collectedAt" class="text-sm">{{ formatDate(order.collectedAt) }}</span>
                    <span *ngIf="!order.collectedAt" class="text-muted text-sm">—</span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn btn-sm btn-outline" (click)="viewOrder(order)">View</button>
                      <select 
                        class="form-control status-select" 
                        [ngModel]="order.orderStatus"
                        (ngModelChange)="onStatusChange(order, $event)">
                        <option [ngValue]="OrderStatus.Pending">Pending</option>
                        <option [ngValue]="OrderStatus.Processing">Processing</option>
                        <option [ngValue]="OrderStatus.Ready">Ready</option>
                        <option [ngValue]="OrderStatus.Completed">Completed</option>
                        <option [ngValue]="OrderStatus.Collected">Collected</option>
                      </select>
                      <button class="btn btn-sm btn-danger" (click)="promptDelete(order)" title="Delete order">❌</button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="orders.length === 0">
                  <td colspan="11" class="text-center text-muted p-3">No orders found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Order Detail Modal -->
      <div class="modal-overlay" *ngIf="selectedOrder" (click)="closeOrderDetail()">
        <div class="modal-content order-detail-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Order #{{ selectedOrder.ticketNumber }}</h3>
            <button class="modal-close" (click)="closeOrderDetail()">&times;</button>
          </div>
          <div class="modal-body">
            <!-- Customer Info -->
            <div class="detail-section">
              <h4>Customer</h4>
              <p *ngIf="selectedOrder.customerName">{{ selectedOrder.customerName }}</p>
              <p *ngIf="selectedOrder.customerPhone">{{ selectedOrder.customerPhone }}</p>
              <p *ngIf="!selectedOrder.customerName" class="text-muted">Walk-in Customer</p>
            </div>
            
            <!-- Order Items -->
            <div class="detail-section">
              <h4>Items</h4>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style="text-align: right;">Qty</th>
                    <th style="text-align: right;">Price</th>
                    <th style="text-align: right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of selectedOrder.items">
                    <td>
                      {{ item.productName }}
                      <span class="text-muted text-sm" *ngIf="item.categoryName">({{ item.categoryName }})</span>
                    </td>
                    <td style="text-align: right;">{{ item.quantity }}</td>
                    <td style="text-align: right;">RM {{ item.unitPrice.toFixed(2) }}</td>
                    <td style="text-align: right;">RM {{ item.subtotal.toFixed(2) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3"><strong>Total</strong></td>
                    <td style="text-align: right;"><strong>RM {{ selectedOrder.totalAmount.toFixed(2) }}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <!-- Payments -->
            <div class="detail-section">
              <h4>Payments</h4>
              <div *ngIf="selectedOrder.payments.length > 0">
                <div class="payment-item" *ngFor="let payment of selectedOrder.payments">
                  <span>{{ getPaymentMethodLabel(payment.method) }}</span>
                  <span>RM {{ payment.amount.toFixed(2) }}</span>
                </div>
              </div>
              <div class="payment-summary">
                <div class="summary-row">
                  <span>Total:</span>
                  <span><strong>RM {{ selectedOrder.totalAmount.toFixed(2) }}</strong></span>
                </div>
                <div class="summary-row">
                  <span>Paid:</span>
                  <span>RM {{ selectedOrder.paidAmount.toFixed(2) }}</span>
                </div>
                <div class="summary-row balance" *ngIf="selectedOrder.balanceRemaining > 0">
                  <span>Balance Due:</span>
                  <span class="text-danger"><strong>RM {{ selectedOrder.balanceRemaining.toFixed(2) }}</strong></span>
                </div>
              </div>
              
              <!-- Add Payment Section (visible when there's a balance) -->
              <div class="add-payment-section" *ngIf="selectedOrder.balanceRemaining > 0">
                <h5>Add Payment</h5>
                <div class="payment-form">
                  <div class="form-group">
                    <label>Amount (RM)</label>
                    <input type="number" class="form-control" [(ngModel)]="newPayment.amount" 
                           [max]="selectedOrder.balanceRemaining" step="0.01" min="0.01">
                    <button class="btn btn-sm btn-outline" (click)="fillRemainingBalance()">
                      Pay Full Balance
                    </button>
                  </div>
                  <div class="form-group">
                    <label>Payment Method</label>
                    <div class="payment-methods">
                      <button class="payment-method-btn" 
                              [class.active]="newPayment.method === PaymentMethod.Cash"
                              (click)="newPayment.method = PaymentMethod.Cash">
                        💵 Cash
                      </button>
                      <button class="payment-method-btn"
                              [class.active]="newPayment.method === PaymentMethod.QR"
                              (click)="newPayment.method = PaymentMethod.QR">
                        📱 QR
                      </button>
                      <button class="payment-method-btn"
                              [class.active]="newPayment.method === PaymentMethod.Credit"
                              (click)="newPayment.method = PaymentMethod.Credit">
                        💳 Card
                      </button>
                    </div>
                  </div>
                  <div class="form-group" *ngIf="newPayment.method !== PaymentMethod.Cash">
                    <label>Reference Number</label>
                    <input type="text" class="form-control" [(ngModel)]="newPayment.referenceNumber" 
                           placeholder="Transaction reference">
                  </div>
                  <button class="btn btn-primary" (click)="addPayment()" 
                          [disabled]="!newPayment.amount || newPayment.amount <= 0">
                    Add Payment
                  </button>
                </div>
              </div>
              
              <p *ngIf="selectedOrder.payments.length === 0 && selectedOrder.balanceRemaining === 0" class="text-muted">
                Fully paid
              </p>
            </div>
            
            <!-- Bill Number & Remark -->
            <div class="detail-section">
              <h4>Details</h4>
              <div class="detail-edit-grid">
                <div class="form-group">
                  <label class="form-label">Bill Number</label>
                  <input type="text" class="form-control" [(ngModel)]="selectedOrder.billNumber" placeholder="e.g. INV-001">
                </div>
                <div class="form-group">
                  <label class="form-label">Remark</label>
                  <input type="text" class="form-control" [(ngModel)]="selectedOrder.remark" placeholder="Any notes">
                </div>
                <button class="btn btn-sm btn-outline" (click)="saveOrderDetails()" [disabled]="isSavingDetails">
                  {{ isSavingDetails ? 'Saving...' : 'Save Details' }}
                </button>
              </div>
            </div>
            
            <!-- Status -->
            <div class="detail-section">
              <h4>Status</h4>
              <div class="status-row">
                <span class="badge" [class]="getStatusClass(selectedOrder.orderStatus)">
                  {{ getStatusLabel(selectedOrder.orderStatus) }}
                </span>
                <span class="badge" [class]="getPaymentStatusClass(selectedOrder.paymentStatus)">
                  {{ getPaymentStatusLabel(selectedOrder.paymentStatus) }}
                </span>
              </div>
              <div class="status-timestamps" style="margin-top: 8px; font-size: 12px; color: #64748B;">
                <div *ngIf="selectedOrder.completedAt">✅ Completed: {{ formatDate(selectedOrder.completedAt) }}</div>
                <div *ngIf="selectedOrder.collectedAt">📦 Collected: {{ formatDate(selectedOrder.collectedAt) }}</div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <div class="print-actions">
              <button class="btn btn-outline" (click)="printReceipt()" [disabled]="isPrinting">
                {{ isPrinting ? '⏳ Printing...' : '🖨️ Print Receipt' }}
              </button>
              <button class="btn btn-outline" (click)="openReceiptWindow()" title="Open in new window">
                🔗 Open Receipt
              </button>
              <button class="btn btn-success whatsapp-btn" 
                (click)="sendWhatsApp()" 
                [disabled]="!selectedOrder?.customerPhone"
                [title]="selectedOrder?.customerPhone ? 'Send receipt via WhatsApp' : 'No customer phone number available'">
                📲 WhatsApp
              </button>
            </div>
            <button class="btn btn-primary" (click)="closeOrderDetail()">Close</button>
          </div>
        </div>
      </div>
    </app-layout>

    <!-- Password Modal -->
    <div class="modal-overlay" *ngIf="showPasswordModal" (click)="cancelPasswordAction()">
      <div class="modal-content" style="max-width: 400px;" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>🔒 Password Required</h3>
          <button class="modal-close" (click)="cancelPasswordAction()">&times;</button>
        </div>
        <div class="modal-body">
          <p style="margin-bottom: 16px; color: #64748B;">{{ passwordActionMessage }}</p>
          <div class="form-group">
            <label class="form-label">Admin Password</label>
            <input type="password" class="form-control" [(ngModel)]="passwordInput" 
              placeholder="Enter password" (keyup.enter)="confirmPasswordAction()">
          </div>
          <p *ngIf="passwordError" style="color: #EF4444; margin-top: 8px; font-size: 13px;">{{ passwordError }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" (click)="cancelPasswordAction()">Cancel</button>
          <button class="btn btn-primary" (click)="confirmPasswordAction()">Confirm</button>
        </div>
      </div>
    </div>
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
    
    .status-filters {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
    }
    
    .filter-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 25px;
      font-weight: 500;
      cursor: pointer;
      background: var(--bg-card);
      color: var(--text-primary);
      transition: all 0.2s;
    }
    
    .filter-btn:hover {
      background: var(--bg-surface);
    }
    
    .filter-btn.active {
      color: white;
    }
    
    .filter-btn.active,
    .filter-btn.pending.active { background: var(--warning-color); }
    .filter-btn.processing.active { background: var(--primary-color); }
    .filter-btn.ready.active { background: var(--info-color); }
    .filter-btn.completed.active { background: var(--secondary-color); }
    
    .ticket-number {
      font-weight: 600;
      font-family: monospace;
      font-size: 14px;
      color: var(--primary-color);
    }
    
    .ticket-number.clickable {
      cursor: pointer;
      text-decoration: underline;
    }
    
    .ticket-number.clickable:hover {
      color: var(--primary-hover);
    }
    
    .action-buttons {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    .btn-sm {
      padding: 4px 12px;
      font-size: 12px;
    }
    
    .status-select {
      padding: 4px 8px;
      font-size: 12px;
      width: 120px;
    }
    
    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .order-detail-modal {
      width: 650px;
      max-height: 85vh;
      overflow-y: auto;
    }
    
    .modal-content {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #E2E8F0;
    }
    
    .modal-header h3 {
      margin: 0;
      font-size: 20px;
    }
    
    .modal-close {
      background: none;
      border: none;
      font-size: 28px;
      cursor: pointer;
      color: #64748B;
    }
    
    .modal-body {
      padding: 24px;
    }
    
    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #E2E8F0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    
    .detail-section {
      margin-bottom: 24px;
    }
    
    .detail-section h4 {
      font-size: 14px;
      font-weight: 600;
      color: #64748B;
      margin-bottom: 12px;
      text-transform: uppercase;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .items-table th, .items-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #E2E8F0;
    }
    
    .items-table tfoot td {
      border-top: 2px solid #E2E8F0;
      background: #F8FAFC;
    }
    
    .payment-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #E2E8F0;
    }
    
    .payment-summary {
      margin-top: 12px;
      padding: 12px;
      background: #F8FAFC;
      border-radius: 8px;
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
    }
    
    .summary-row.balance {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px dashed #E2E8F0;
    }
    
    .text-danger {
      color: var(--danger-color);
    }
    
    .add-payment-section {
      margin-top: 20px;
      padding: 16px;
      background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
      border-radius: 12px;
      border: 1px solid #C7D2FE;
    }
    
    .add-payment-section h5 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #4F46E5;
    }
    
    .payment-form .form-group {
      margin-bottom: 12px;
    }
    
    .payment-form label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      margin-bottom: 6px;
      color: #64748B;
    }
    
    .payment-form .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    
    .payment-form .form-group .btn-sm {
      align-self: flex-start;
    }
    
    .payment-methods {
      display: flex;
      gap: 8px;
    }
    
    .payment-method-btn {
      flex: 1;
      padding: 12px;
      border: 2px solid #E2E8F0;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    
    .payment-method-btn:hover {
      border-color: var(--primary-color);
    }
    
    .payment-method-btn.active {
      border-color: var(--primary-color);
      background: rgba(59, 130, 246, 0.1);
      color: var(--primary-color);
    }
    
    .status-row {
      display: flex;
      gap: 12px;
    }
    
    .text-sm {
      font-size: 12px;
    }
    
    .print-actions {
      display: flex;
      gap: 8px;
    }
    
    .modal-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  `]
})
export class OrdersComponent implements OnInit {
  orders: OrderListDto[] = [];
  searchTerm = '';
  statusFilter: OrderStatus | null = null;
  OrderStatus = OrderStatus;
  PaymentMethod = PaymentMethod;
  selectedOrder: OrderDetailDto | null = null;

  newPayment: PaymentDto = {
    amount: 0,
    method: PaymentMethod.Cash
  };

  isPrinting = false;
  isSavingDetails = false;
  shopSettings: ShopSettingsDto = { shopName: '', address: '', businessWhatsApp: '' };

  // Password modal
  showPasswordModal = false;
  passwordInput = '';
  passwordError = '';
  passwordActionMessage = '';
  pendingAction: (() => void) | null = null;
  private readonly ADMIN_PASSWORD = 'admin123';

  constructor(private api: ApiService, private printService: PrintService) { }

  ngOnInit() {
    this.loadOrders();
    this.api.getShopSettings().subscribe(s => this.shopSettings = s);
  }

  loadOrders() {
    const filters: any = {};
    if (this.statusFilter !== null) {
      filters.status = this.statusFilter;
    }
    if (this.searchTerm) {
      filters.searchTerm = this.searchTerm;
    }

    this.api.getOrders(filters).subscribe(orders => {
      this.orders = orders;
    });
  }

  filterByStatus(status: OrderStatus | null) {
    this.statusFilter = status;
    this.loadOrders();
  }

  viewOrder(order: OrderListDto) {
    this.api.getOrderById(order.id).subscribe(detail => {
      this.selectedOrder = detail;
      this.resetPaymentForm();
    });
  }

  closeOrderDetail() {
    this.selectedOrder = null;
    this.loadOrders();
  }

  // Password-protected status change
  onStatusChange(order: OrderListDto, newStatus: OrderStatus) {
    if (order.orderStatus === OrderStatus.Collected) {
      // Changing FROM Collected requires password
      this.passwordActionMessage = `Changing status of order ${order.ticketNumber} from Collected. Enter admin password to proceed.`;
      this.pendingAction = () => this.updateStatus(order, newStatus);
      this.showPasswordModal = true;
    } else {
      this.updateStatus(order, newStatus);
    }
  }

  promptDelete(order: OrderListDto) {
    this.passwordActionMessage = `Delete order ${order.ticketNumber}? This action cannot be undone. Enter admin password to proceed.`;
    this.pendingAction = () => {
      this.api.deleteOrder(order.id).subscribe({
        next: () => this.loadOrders(),
        error: () => alert('Failed to delete order')
      });
    };
    this.showPasswordModal = true;
  }

  confirmPasswordAction() {
    if (this.passwordInput !== this.ADMIN_PASSWORD) {
      this.passwordError = 'Incorrect password';
      return;
    }
    if (this.pendingAction) {
      this.pendingAction();
    }
    this.cancelPasswordAction();
  }

  cancelPasswordAction() {
    this.showPasswordModal = false;
    this.passwordInput = '';
    this.passwordError = '';
    this.passwordActionMessage = '';
    this.pendingAction = null;
    this.loadOrders();
  }

  resetPaymentForm() {
    this.newPayment = {
      amount: 0,
      method: PaymentMethod.Cash
    };
  }

  fillRemainingBalance() {
    if (this.selectedOrder) {
      this.newPayment.amount = this.selectedOrder.balanceRemaining;
    }
  }

  addPayment() {
    if (!this.selectedOrder || !this.newPayment.amount || this.newPayment.amount <= 0) {
      return;
    }

    this.api.addPayment(this.selectedOrder.id, this.newPayment).subscribe({
      next: () => {
        // Reload the order to get updated payment info
        if (this.selectedOrder) {
          this.api.getOrderById(this.selectedOrder.id).subscribe(detail => {
            this.selectedOrder = detail;
            this.resetPaymentForm();
          });
        }
      },
      error: (err) => {
        console.error(err);
        alert('Failed to add payment');
      }
    });
  }

  updateStatus(order: OrderListDto, newStatus: OrderStatus) {
    this.api.updateOrderStatus(order.id, newStatus).subscribe(() => {
      order.orderStatus = newStatus;
    });
  }

  async printReceipt() {
    if (!this.selectedOrder || this.isPrinting) return;

    this.isPrinting = true;
    try {
      const result = await this.printService.printReceipt(this.selectedOrder);
      if (!result.success) {
        // Show fallback option
        const useFallback = confirm(
          `Print may have failed: ${result.message}\n\nWould you like to open the receipt in a new window instead?`
        );
        if (useFallback) {
          this.openReceiptWindow();
        }
      }
    } catch (error) {
      console.error('Print error:', error);
      alert('Failed to print. Please try the "Open Receipt" option.');
    } finally {
      this.isPrinting = false;
    }
  }

  openReceiptWindow() {
    if (!this.selectedOrder) return;
    this.printService.openReceiptInWindow(this.selectedOrder);
  }

  sendWhatsApp() {
    if (!this.selectedOrder?.customerPhone) return;
    const order = this.selectedOrder;
    const shopName = this.shopSettings.shopName || 'Our Shop';
    const shopPhone = this.shopSettings.businessWhatsApp || '';
    const shopAddr = this.shopSettings.address || '';

    let receipt = `🧾 *Receipt - ${shopName}*\n`;
    if (shopAddr) receipt += `📍 ${shopAddr}\n`;
    if (shopPhone) receipt += `📞 ${shopPhone}\n`;
    receipt += `\n`;
    receipt += `*Ticket:* ${order.ticketNumber}\n`;
    receipt += `*Date:* ${this.formatDate(order.created)}\n`;
    if (order.customerName) receipt += `*Customer:* ${order.customerName}\n`;
    receipt += `\n`;
    receipt += `*Items:*\n`;
    receipt += `─────────────────\n`;
    for (const item of order.items) {
      receipt += `${item.productName} x${item.quantity} — RM ${item.subtotal.toFixed(2)}\n`;
    }
    receipt += `─────────────────\n`;
    receipt += `*Total: RM ${order.totalAmount.toFixed(2)}*\n`;
    receipt += `*Paid: RM ${order.paidAmount.toFixed(2)}*\n`;
    if (order.balanceRemaining > 0) {
      receipt += `*Balance Due: RM ${order.balanceRemaining.toFixed(2)}*\n`;
    }
    receipt += `\nThank you for your business! 🙏`;

    // Clean phone number: remove spaces, dashes, keep + prefix
    let phone = order.customerPhone.replace(/[\s\-()]/g, '');
    if (phone.startsWith('0')) {
      phone = '60' + phone.substring(1); // Convert local MY number to international
    }
    if (!phone.startsWith('+')) {
      phone = phone; // keep as-is if already has country code without +
    } else {
      phone = phone.substring(1); // wa.me doesn't use the + prefix
    }

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(receipt)}`;
    window.open(url, '_blank');
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending: return 'status-pending';
      case OrderStatus.Processing: return 'status-processing';
      case OrderStatus.Ready: return 'status-ready';
      case OrderStatus.Completed: return 'status-completed';
      case OrderStatus.Collected: return 'status-collected';
      default: return '';
    }
  }

  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending: return 'Pending';
      case OrderStatus.Processing: return 'Processing';
      case OrderStatus.Ready: return 'Ready';
      case OrderStatus.Completed: return 'Completed';
      case OrderStatus.Collected: return 'Collected';
      default: return '';
    }
  }

  saveOrderDetails() {
    if (!this.selectedOrder) return;
    this.isSavingDetails = true;
    this.api.updateOrderDetails(this.selectedOrder.id, {
      id: this.selectedOrder.id,
      billNumber: this.selectedOrder.billNumber || undefined,
      remark: this.selectedOrder.remark || undefined
    }).subscribe({
      next: () => {
        this.isSavingDetails = false;
        this.loadOrders();
      },
      error: () => { this.isSavingDetails = false; }
    });
  }

  getPaymentStatusClass(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.Unpaid: return 'status-unpaid';
      case PaymentStatus.Partial: return 'status-partial';
      case PaymentStatus.Paid: return 'status-paid';
      default: return '';
    }
  }

  getPaymentStatusLabel(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.Unpaid: return 'Unpaid';
      case PaymentStatus.Partial: return 'Partial';
      case PaymentStatus.Paid: return 'Paid';
      default: return '';
    }
  }

  getPaymentMethodLabel(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.Cash: return 'Cash';
      case PaymentMethod.QR: return 'QR Payment';
      case PaymentMethod.Credit: return 'Credit/Debit Card';
      default: return 'Other';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-MY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
