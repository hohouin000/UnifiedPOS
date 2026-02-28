import { Component, OnInit } from '@angular/core';
import { ApiService, CustomerDto } from '../../core/services/api.service';

@Component({
  selector: 'app-customers',
  template: `
    <app-layout>
      <div class="page-container">
        <div class="page-header">
          <h2>Customers</h2>
          <div class="header-actions">
            <input 
              type="text" 
              class="form-control" 
              placeholder="Search by name or phone..."
              [(ngModel)]="searchTerm"
              (input)="searchCustomers()"
              style="width: 280px; margin-right: 12px;">
            <button class="btn btn-primary" (click)="openModal()">+ Add Customer</button>
          </div>
        </div>
        
        <div class="card">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Orders</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let customer of customers">
                  <td><strong>{{ customer.name }}</strong></td>
                  <td>{{ customer.phone }}</td>
                  <td>{{ customer.email || '-' }}</td>
                  <td>
                    <span class="badge badge-primary">{{ customer.orderCount }} orders</span>
                  </td>
                  <td>
                    <button class="btn btn-outline btn-sm" (click)="editCustomer(customer)">Edit</button>
                  </td>
                </tr>
                <tr *ngIf="customers.length === 0">
                  <td colspan="5" class="text-center text-muted p-3">
                    {{ loading ? 'Loading...' : 'No customers found' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Add/Edit Customer Modal -->
      <div class="modal-backdrop" *ngIf="showModal" (click)="showModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingCustomer ? 'Edit Customer' : 'Add Customer' }}</h3>
            <button class="btn-close" (click)="showModal = false">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Name *</label>
              <input type="text" class="form-control" [(ngModel)]="customerForm.name">
            </div>
            <div class="form-group">
              <label class="form-label">Phone *</label>
              <input type="text" class="form-control" [(ngModel)]="customerForm.phone" placeholder="e.g., 0123456789">
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" [(ngModel)]="customerForm.email">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="showModal = false">Cancel</button>
            <button class="btn btn-primary" (click)="saveCustomer()" [disabled]="saving">
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header-actions { display: flex; align-items: center; }
    .btn-close { background: none; border: none; font-size: 24px; cursor: pointer; }
  `]
})
export class CustomersComponent implements OnInit {
  customers: CustomerDto[] = [];
  searchTerm = '';
  showModal = false;
  loading = false;
  saving = false;
  editingCustomer: CustomerDto | null = null;
  customerForm = { name: '', phone: '', email: '' };

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.loadAllCustomers();
  }

  loadAllCustomers() {
    this.loading = true;
    this.api.getAllCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  searchCustomers() {
    if (this.searchTerm.length > 0) {
      this.api.searchCustomers(this.searchTerm).subscribe(data => {
        this.customers = data;
      });
    } else {
      this.loadAllCustomers();
    }
  }

  openModal() {
    this.editingCustomer = null;
    this.customerForm = { name: '', phone: '', email: '' };
    this.showModal = true;
  }

  editCustomer(customer: CustomerDto) {
    this.editingCustomer = customer;
    this.customerForm = {
      name: customer.name,
      phone: customer.phone,
      email: customer.email || ''
    };
    this.showModal = true;
  }

  saveCustomer() {
    if (!this.customerForm.name || !this.customerForm.phone) {
      alert('Name and phone are required');
      return;
    }

    this.saving = true;

    if (this.editingCustomer) {
      this.api.updateCustomer(this.editingCustomer.id, {
        id: this.editingCustomer.id,
        name: this.customerForm.name,
        phone: this.customerForm.phone,
        email: this.customerForm.email || undefined
      }).subscribe({
        next: () => {
          this.showModal = false;
          this.saving = false;
          this.loadAllCustomers();
        },
        error: () => {
          alert('Failed to update customer');
          this.saving = false;
        }
      });
    } else {
      this.api.createCustomer(this.customerForm).subscribe({
        next: () => {
          this.showModal = false;
          this.saving = false;
          this.loadAllCustomers();
        },
        error: () => {
          alert('Failed to add customer');
          this.saving = false;
        }
      });
    }
  }
}
