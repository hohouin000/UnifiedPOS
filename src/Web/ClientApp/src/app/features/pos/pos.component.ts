import { Component, OnInit } from '@angular/core';
import { ApiService, CategoryDto, ProductDto, CartItem, PaymentMethod, CreateOrderResult, CustomerDto } from '../../core/services/api.service';
import { PrintService, QuickPrintOrder } from '../../core/services/print.service';

interface CartItemDisplay extends CartItem {
  categoryColor?: string;
}

@Component({
  selector: 'app-pos',
  template: `
    <app-layout>
      <div class="pos-container" [class.cart-open]="isMobileCartOpen">
        <!-- Left Panel: Products -->
        <div class="products-panel">
          <div class="products-header">
            <h2>Point of Sale</h2>
            <div class="category-tabs">
              <button 
                *ngFor="let cat of categories" 
                class="category-tab"
                [class.active]="selectedCategory?.id === cat.id"
                [style.--cat-color]="cat.colorCode || '#3B82F6'"
                (click)="selectCategory(cat)">
                {{ cat.name }}
              </button>
            </div>
          </div>
          
          <div class="products-grid">
            <div 
              *ngFor="let product of filteredProducts" 
              class="product-card"
              [style.--cat-color]="product.categoryColor || '#3B82F6'"
              (click)="addToCart(product)">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-price">RM {{ product.price.toFixed(2) }}</div>
            </div>
          </div>
        </div>
        
        <!-- Mobile View Cart FAB -->
        <button class="cart-fab hidden-desktop" (click)="toggleMobileCart()" *ngIf="cart.length > 0">
          <span class="fab-icon">🛒</span>
          <span class="badge badge-primary fab-badge">{{ cart.length }}</span>
          <span class="fab-total">RM {{ cartTotal.toFixed(2) }}</span>
        </button>
        
        <!-- Mobile Cart Backdrop -->
        <div class="cart-backdrop hidden-desktop" *ngIf="isMobileCartOpen" (click)="toggleMobileCart()"></div>

        <!-- Right Panel: Cart -->
        <div class="cart-panel" [class.mobile-open]="isMobileCartOpen">
          <div class="cart-header">
            <h3>Current Order</h3>
            <div class="cart-header-actions">
              <button class="btn btn-outline btn-sm" (click)="clearCart()" *ngIf="cart.length > 0">Clear</button>
              <button class="btn btn-icon hidden-desktop" (click)="toggleMobileCart()">✕</button>
            </div>
          </div>
          
          <!-- Customer Selection -->
          <div class="customer-section">
            <div class="customer-search" *ngIf="!selectedCustomer">
              <input 
                type="text" 
                class="form-control" 
                placeholder="Search customer..."
                [(ngModel)]="customerSearch"
                (input)="searchCustomers()">
              <div class="customer-results" *ngIf="customerResults.length > 0">
                <div class="customer-option" *ngFor="let c of customerResults" (click)="selectCustomer(c)">
                  <strong>{{ c.name }}</strong>
                  <span class="text-muted">{{ c.phone }}</span>
                </div>
              </div>
            </div>
            <div class="selected-customer" *ngIf="selectedCustomer">
              <div class="customer-badge">
                <span>👤 {{ selectedCustomer.name }}</span>
                <span class="text-muted">{{ selectedCustomer.phone }}</span>
              </div>
              <button class="btn btn-outline btn-sm" (click)="clearCustomer()">Change</button>
            </div>
          </div>
          
          <!-- Cart Items -->
          <div class="cart-items">
            <div *ngIf="cart.length === 0" class="cart-empty">
              <span class="empty-icon">🛒</span>
              <p>Cart is empty</p>
            </div>
            
            <div *ngFor="let item of cart; let i = index" class="cart-item">
              <div class="item-info">
                <span class="item-name">{{ item.productName }}</span>
                <span class="item-price">RM {{ item.unitPrice.toFixed(2) }} × {{ item.quantity }}</span>
              </div>
              <div class="item-actions">
                <button class="qty-btn" (click)="decrementItem(i)">−</button>
                <span class="qty-value">{{ item.quantity }}</span>
                <button class="qty-btn" (click)="incrementItem(i)">+</button>
                <button class="remove-btn" (click)="removeItem(i)">×</button>
              </div>
              <div class="item-subtotal">RM {{ (item.unitPrice * item.quantity).toFixed(2) }}</div>
            </div>
          </div>
          
          <!-- Cart Footer -->
          <div class="cart-footer" *ngIf="cart.length > 0">
            <div class="cart-total">
              <span>Total</span>
              <span class="total-amount">RM {{ cartTotal.toFixed(2) }}</span>
            </div>
            
            <div class="payment-section" *ngIf="!showConfirmation">
              <div class="form-group">
                <label class="form-label">Payment Amount</label>
                <input type="number" class="form-control" [(ngModel)]="paymentAmount" [placeholder]="cartTotal.toFixed(2)">
              </div>
              
              <div class="payment-methods">
                <button *ngFor="let method of paymentMethods" class="method-btn" 
                  [class.active]="selectedPaymentMethod === method.value && !isPayLater" 
                  (click)="selectPaymentMethod(method.value)">
                  <span class="method-icon">{{ method.icon }}</span>
                  <span>{{ method.label }}</span>
                </button>
              </div>
              
              <button class="method-btn pay-later-btn" [class.active]="isPayLater" (click)="selectPayLater()" style="width: 100%; margin-bottom: 16px; flex-direction: row; justify-content: center; gap: 8px;">
                <span class="method-icon">🚚</span>
                <span>Pay Later / COD</span>
              </button>
               
              <div class="change-preview" *ngIf="!isPayLater && paymentAmount >= cartTotal">
                <span>Change:</span>
                <span class="change-amount">RM {{ (paymentAmount - cartTotal).toFixed(2) }}</span>
              </div>
              
              <div class="change-preview" *ngIf="isPayLater" style="background: rgba(245, 158, 11, 0.1);">
                <span>⚠️ Payment Status:</span>
                <span style="color: var(--warning-color, #F59E0B); font-weight: 600;">Not Paid</span>
              </div>
               
              <button class="btn btn-success btn-lg" style="width: 100%;" (click)="showConfirmation = true">Proceed</button>
            </div>
            
            <div class="confirmation-section" *ngIf="showConfirmation">
              <div class="confirmation-card">
                <h4>{{ isPayLater ? 'Confirm Order (Pay Later)' : 'Confirm Payment' }}</h4>
                <div class="confirm-row"><span>Total</span><span>RM {{ cartTotal.toFixed(2) }}</span></div>
                <div class="confirm-row"><span>Paid</span><span>RM {{ isPayLater ? '0.00' : (paymentAmount || cartTotal).toFixed(2) }}</span></div>
                <div class="confirm-row" *ngIf="!isPayLater && paymentAmount > cartTotal"><span>Change</span><span class="text-success">RM {{ (paymentAmount - cartTotal).toFixed(2) }}</span></div>
                <div class="confirm-row" *ngIf="isPayLater"><span>Status</span><span style="color: var(--warning-color, #F59E0B); font-weight: 600;">⚠️ Not Paid (COD)</span></div>
              </div>
              <div class="confirm-actions">
                <button class="btn btn-outline" (click)="showConfirmation = false">Back</button>
                <button class="btn btn-success" (click)="completeOrder()" [disabled]="isProcessing">{{ isProcessing ? '...' : 'Confirm' }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Success Modal -->
      <div class="modal-backdrop" *ngIf="orderResult">
        <div class="modal-content success-modal animate-slide-up">
          <div class="success-icon">✅</div>
          <h2>Order Complete!</h2>
          <div class="ticket-number">{{ orderResult.ticketNumber }}</div>
          <div class="order-summary">
            <div class="summary-row"><span>Total</span><span>RM {{ orderResult.totalAmount.toFixed(2) }}</span></div>
            <div class="summary-row"><span>Paid</span><span>RM {{ orderResult.paidAmount.toFixed(2) }}</span></div>
            <div class="summary-row" *ngIf="orderResult.changeAmount > 0"><span>Change</span><span class="text-success">RM {{ orderResult.changeAmount.toFixed(2) }}</span></div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-outline btn-lg" (click)="printReceipt()">🖨️ Print Receipt</button>
            <button class="btn btn-primary btn-lg" (click)="newOrder()">New Order</button>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .pos-container { display: flex; height: 100vh; position: relative; overflow: hidden; }
    .products-panel { flex: 1; padding: 24px; overflow-y: auto; padding-bottom: 80px; }
    .products-header { margin-bottom: 24px; display: flex; flex-direction: column; gap: 16px; }
    .products-header h2 { margin-bottom: 0; }
    .category-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
    .category-tab { padding: 10px 20px; border: none; border-radius: 25px; font-weight: 500; cursor: pointer; background: var(--bg-card); color: var(--text-primary); transition: all 0.2s; border: 2px solid transparent; }
    .category-tab:hover { border-color: var(--cat-color); }
    .category-tab.active { background: var(--cat-color); color: white; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; }
    .product-card { background: var(--bg-card); border-radius: 12px; padding: 16px 12px; cursor: pointer; border: 2px solid transparent; transition: all 0.2s; text-align: center; border-left: 4px solid var(--cat-color); box-shadow: var(--shadow-sm); }
    .product-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .product-name { font-weight: 600; margin-bottom: 8px; font-size: 14px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; height: 42px; }
    .product-price { color: var(--primary-color); font-weight: 700; font-size: 16px; }
    .cart-panel { width: 380px; background: var(--bg-card); border-left: 1px solid var(--border-color); display: flex; flex-direction: column; z-index: 100; transition: transform 0.3s ease; }
    .cart-header { padding: 16px 20px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
    .cart-header-actions { display: flex; gap: 8px; align-items: center; }
    .customer-section { padding: 16px; border-bottom: 1px solid var(--border-color); }
    .customer-search { position: relative; }
    .customer-results { position: absolute; top: 100%; left: 0; right: 0; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: var(--shadow-md); z-index: 10; max-height: 200px; overflow-y: auto; }
    .customer-option { padding: 12px; cursor: pointer; display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); }
    .customer-option:hover { background: var(--bg-surface); }
    .selected-customer { display: flex; justify-content: space-between; align-items: center; }
    .customer-badge { display: flex; flex-direction: column; }
    .cart-items { flex: 1; overflow-y: auto; padding: 16px; }
    .cart-empty { text-align: center; padding: 40px 20px; color: var(--text-secondary); }
    .empty-icon { font-size: 48px; margin-bottom: 16px; display: block; }
    .cart-item { padding: 12px; background: var(--bg-surface); border-radius: 8px; margin-bottom: 8px; }
    .item-info { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .item-name { font-weight: 500; }
    .item-price { color: var(--text-secondary); font-size: 13px; }
    .item-actions { display: flex; align-items: center; gap: 8px; }
    .qty-btn { width: 28px; height: 28px; border: none; border-radius: 6px; background: var(--bg-card); cursor: pointer; font-weight: 600; }
    .qty-value { width: 30px; text-align: center; font-weight: 600; }
    .remove-btn { width: 28px; height: 28px; border: none; border-radius: 6px; background: rgba(239, 68, 68, 0.1); color: var(--danger-color); cursor: pointer; margin-left: auto; }
    .item-subtotal { text-align: right; font-weight: 600; color: var(--primary-color); margin-top: 8px; }
    .cart-footer { padding: 16px 20px; border-top: 1px solid var(--border-color); background: var(--bg-card); z-index: 10; box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05); }
    .cart-total { display: flex; justify-content: space-between; font-size: 18px; font-weight: 600; margin-bottom: 16px; align-items: center; }
    .total-amount { color: var(--primary-color); font-size: 24px; }
    .payment-methods { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; }
    .method-btn { padding: 10px 8px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-card); cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px; transition: all 0.2s; }
    .method-btn:hover, .method-btn.active { border-color: var(--primary-color); background: rgba(59, 130, 246, 0.1); }
    .method-icon { font-size: 20px; }
    .change-preview { display: flex; justify-content: space-between; padding: 12px; background: rgba(34, 197, 94, 0.1); border-radius: 8px; margin-bottom: 16px; }
    .change-amount { color: var(--secondary-color); font-weight: 600; }
    .confirmation-card { background: var(--bg-surface); border-radius: 12px; padding: 20px; margin-bottom: 16px; }
    .confirmation-card h4 { margin-bottom: 16px; }
    .confirm-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color); }
    .confirm-actions { display: flex; gap: 12px; }
    .confirm-actions button { flex: 1; }
    .success-modal { text-align: center; padding: 40px; max-width: 400px; }
    .success-icon { font-size: 64px; margin-bottom: 16px; }
    .ticket-number { font-size: 32px; font-weight: 700; color: var(--primary-color); background: var(--bg-surface); padding: 16px 32px; border-radius: 12px; margin: 24px 0; letter-spacing: 2px; }
    .order-summary { margin-bottom: 24px; }
    .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .text-success { color: var(--secondary-color); }
    .modal-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .modal-actions button { min-width: 150px; flex: 1; }
    
    /* Mobile Responsive Styles */
    @media (max-width: 1024px) {
      .pos-container { flex-direction: column; }
      .cart-panel {
        position: fixed;
        bottom: 0;
        right: 0;
        left: 0;
        width: 100%;
        height: 85vh;
        transform: translateY(100%);
        border-radius: 20px 20px 0 0;
        box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.15);
      }
      .cart-panel.mobile-open {
        transform: translateY(0);
      }
      .cart-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 90;
      }
      .cart-fab {
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: var(--primary-dark);
        color: white;
        border: none;
        border-radius: 30px;
        padding: 16px 24px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 16px;
        font-weight: 600;
        box-shadow: var(--shadow-lg);
        z-index: 80;
        cursor: pointer;
      }
      .fab-icon { font-size: 20px; }
      .fab-badge {
        position: absolute;
        top: -8px;
        left: -8px;
        background: var(--danger-color);
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        border: 2px solid white;
      }
    }
    
    @media (max-width: 600px) {
      .products-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
      .product-card { padding: 12px 8px; }
      .products-panel { padding: 16px; }
      .category-tab { padding: 8px 16px; font-size: 13px; }
      .success-modal { padding: 24px; width: 95%; }
    }
  `]
})
export class PosComponent implements OnInit {
  categories: CategoryDto[] = [];
  products: ProductDto[] = [];
  filteredProducts: ProductDto[] = [];
  selectedCategory: CategoryDto | null = null;

  cart: CartItemDisplay[] = [];
  paymentAmount: number = 0;
  selectedPaymentMethod: PaymentMethod = PaymentMethod.Cash;
  showConfirmation = false;
  isProcessing = false;
  orderResult: CreateOrderResult | null = null;
  isMobileCartOpen = false;
  isPayLater = false;

  // Customer selection
  customerSearch = '';
  customerResults: CustomerDto[] = [];
  selectedCustomer: CustomerDto | null = null;

  paymentMethods = [
    { value: PaymentMethod.Cash, label: 'Cash', icon: '💵' },
    { value: PaymentMethod.QR, label: 'QR Code', icon: '📱' },
    { value: PaymentMethod.Credit, label: 'Card', icon: '💳' }
  ];

  // Store cart for printing
  private lastCart: CartItem[] = [];

  constructor(private api: ApiService, private printService: PrintService) { }

  ngOnInit() { this.loadData(); }

  loadData() {
    this.api.getCategories().subscribe(cats => {
      this.categories = cats;
      if (cats.length > 0) this.selectCategory(cats[0]);
    });
    this.api.getProducts().subscribe(products => {
      this.products = products;
      this.filterProducts();
    });
  }

  selectCategory(category: CategoryDto) {
    this.selectedCategory = category;
    this.filterProducts();
  }

  filterProducts() {
    this.filteredProducts = this.selectedCategory
      ? this.products.filter(p => p.categoryId === this.selectedCategory!.id)
      : this.products;
  }

  searchCustomers() {
    if (this.customerSearch.length > 1) {
      this.api.searchCustomers(this.customerSearch).subscribe(results => this.customerResults = results);
    } else {
      this.customerResults = [];
    }
  }

  selectCustomer(customer: CustomerDto) {
    this.selectedCustomer = customer;
    this.customerResults = [];
    this.customerSearch = '';
  }

  clearCustomer() {
    this.selectedCustomer = null;
  }

  addToCart(product: ProductDto) {
    const existing = this.cart.find(item => item.productId === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        categoryName: product.categoryName,
        categoryPrefix: product.categoryPrefix,
        categoryColor: product.categoryColor
      });
    }
    this.paymentAmount = this.cartTotal;
  }

  incrementItem(index: number) { this.cart[index].quantity++; this.paymentAmount = this.cartTotal; }
  decrementItem(index: number) { if (this.cart[index].quantity > 1) this.cart[index].quantity--; else this.removeItem(index); this.paymentAmount = this.cartTotal; }
  removeItem(index: number) {
    this.cart.splice(index, 1);
    this.paymentAmount = this.cartTotal;
    if (this.cart.length === 0) this.isMobileCartOpen = false;
  }

  clearCart() {
    this.cart = [];
    this.paymentAmount = 0;
    this.showConfirmation = false;
    this.isMobileCartOpen = false;
  }

  get cartTotal(): number { return this.cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0); }

  toggleMobileCart() {
    this.isMobileCartOpen = !this.isMobileCartOpen;
  }

  completeOrder() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const command: any = {
      customerId: this.selectedCustomer?.id,
      customerName: this.selectedCustomer?.name,
      customerPhone: this.selectedCustomer?.phone,
      items: this.cart
    };

    if (!this.isPayLater) {
      command.payment = { amount: this.paymentAmount || this.cartTotal, method: this.selectedPaymentMethod };
    }

    this.api.createOrder(command).subscribe({
      next: (result) => {
        this.orderResult = result;
        this.lastCart = [...this.cart]; // Save cart for printing
        this.isProcessing = false;
      },
      error: (err) => { console.error(err); this.isProcessing = false; alert('Failed to create order'); }
    });
  }

  newOrder() {
    this.orderResult = null;
    this.lastCart = [];
    this.clearCart();
    this.selectedCustomer = null;
    this.showConfirmation = false;
    this.isPayLater = false;
  }

  selectPaymentMethod(method: PaymentMethod) {
    this.selectedPaymentMethod = method;
    this.isPayLater = false;
    this.paymentAmount = this.cartTotal;
  }

  selectPayLater() {
    this.isPayLater = true;
    this.paymentAmount = 0;
  }

  printReceipt() {
    if (!this.orderResult) return;

    const printOrder: QuickPrintOrder = {
      ticketNumber: this.orderResult.ticketNumber,
      customerName: this.selectedCustomer?.name,
      customerPhone: this.selectedCustomer?.phone,
      items: this.lastCart,
      totalAmount: this.orderResult.totalAmount,
      paidAmount: this.orderResult.paidAmount,
      changeAmount: this.orderResult.changeAmount,
      paymentMethod: this.selectedPaymentMethod
    };

    this.printService.quickPrint(printOrder);
  }
}
