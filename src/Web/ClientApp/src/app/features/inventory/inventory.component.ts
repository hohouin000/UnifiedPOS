import { Component, OnInit } from '@angular/core';
import { ApiService, ProductDto, CategoryDto } from '../../core/services/api.service';

@Component({
  selector: 'app-inventory',
  template: `
    <app-layout>
      <div class="page-container">
        <div class="page-header">
          <h2>Inventory</h2>
          <div class="header-filter">
            <select class="form-control" [(ngModel)]="selectedCategoryId" (change)="loadProducts()">
              <option [value]="null">All Categories</option>
              <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
            </select>
          </div>
        </div>
        
        <div class="card">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let product of products">
                  <td>
                    <strong>{{ product.name }}</strong>
                    <div class="text-muted text-sm" *ngIf="product.description">
                      {{ product.description }}
                    </div>
                  </td>
                  <td>
                    <span class="category-badge" [style.background]="product.categoryColor + '20'" [style.color]="product.categoryColor">
                      {{ product.categoryName }}
                    </span>
                  </td>
                  <td>RM {{ product.price.toFixed(2) }}</td>
                  <td>
                    <span *ngIf="product.isStockTracked">
                      {{ product.stockQuantity }}
                      <span class="badge badge-danger" *ngIf="product.isLowStock">Low</span>
                    </span>
                    <span *ngIf="!product.isStockTracked" class="text-muted">-</span>
                  </td>
                  <td>
                    <span class="badge" [class.badge-success]="product.isActive" [class.badge-danger]="!product.isActive">
                      {{ product.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                </tr>
                <tr *ngIf="products.length === 0">
                  <td colspan="5" class="text-center text-muted p-3">No products found</td>
                </tr>
              </tbody>
            </table>
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
    
    .header-filter select {
      width: 200px;
    }
    
    .category-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
    }
  `]
})
export class InventoryComponent implements OnInit {
  products: ProductDto[] = [];
  categories: CategoryDto[] = [];
  selectedCategoryId: number | null = null;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.api.getCategories().subscribe(cats => {
      this.categories = cats;
    });
    this.loadProducts();
  }

  loadProducts() {
    this.api.getProducts(this.selectedCategoryId || undefined).subscribe(data => {
      this.products = data;
    });
  }
}
