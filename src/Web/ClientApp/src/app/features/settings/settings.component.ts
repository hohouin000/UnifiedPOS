import { Component, OnInit } from '@angular/core';
import { ApiService, CategoryDto, ProductDto, ShopSettingsDto } from '../../core/services/api.service';

@Component({
  selector: 'app-settings',
  template: `
    <app-layout>
      <div class="page-container">
        <div class="page-header">
          <h2>Settings</h2>
        </div>
        
        <!-- Shop Information -->
        <div class="card mb-3">
          <div class="card-header">
            <span>🏪 Shop Information</span>
            <button class="btn btn-primary btn-sm" (click)="saveShopSettings()" [disabled]="isSavingShop">
              {{ isSavingShop ? 'Saving...' : 'Save' }}
            </button>
          </div>
          <div class="card-body">
            <div class="shop-settings-grid">
              <div class="form-group">
                <label class="form-label">Shop Name</label>
                <input type="text" class="form-control" [(ngModel)]="shopSettings.shopName" placeholder="My Shop">
              </div>
              <div class="form-group">
                <label class="form-label">Address</label>
                <input type="text" class="form-control" [(ngModel)]="shopSettings.address" placeholder="123 Main St, City">
              </div>
              <div class="form-group">
                <label class="form-label">Business WhatsApp Number</label>
                <input type="text" class="form-control" [(ngModel)]="shopSettings.businessWhatsApp" placeholder="+60123456789">
                <small class="text-muted">Used as sender info in WhatsApp receipts</small>
              </div>
            </div>
            <div class="shop-save-status" *ngIf="shopSaveMessage">
              <span class="text-success">✅ {{ shopSaveMessage }}</span>
            </div>
          </div>
        </div>
        
        <!-- Categories Section -->
        <div class="card mb-3">
          <div class="card-header">
            <span>📂 Categories</span>
            <button class="btn btn-primary btn-sm" (click)="openCategoryModal()">+ Add Category</button>
          </div>
          <div class="card-body">
            <div class="categories-list">
              <div class="category-item" *ngFor="let cat of categories">
                <div class="category-color" [style.background]="cat.colorCode || '#3B82F6'"></div>
                <div class="category-info">
                  <strong>{{ cat.name }}</strong>
                  <span class="text-muted">Prefix: {{ cat.prefix }}</span>
                </div>
                <span class="badge badge-primary">{{ cat.productCount }} products</span>
                <div class="item-actions">
                  <button class="btn btn-outline btn-sm" (click)="editCategory(cat)">Edit</button>
                  <button class="btn btn-danger btn-sm" (click)="deleteCategory(cat)" *ngIf="cat.productCount === 0">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Products Section -->
        <div class="card">
          <div class="card-header">
            <span>📦 Products</span>
            <div class="header-actions">
              <select class="form-control" [(ngModel)]="selectedCategoryId" (change)="loadProducts()" style="width: 200px; margin-right: 12px;">
                <option [value]="null">All Categories</option>
                <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
              </select>
              <button class="btn btn-primary btn-sm" (click)="openProductModal()">+ Add Product</button>
            </div>
          </div>
          <div class="card-body">
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let product of products">
                  <td><strong>{{ product.name }}</strong></td>
                  <td>{{ product.categoryName }}</td>
                  <td>RM {{ product.price.toFixed(2) }}</td>
                  <td>
                    <span class="badge" [class.badge-success]="product.isActive" [class.badge-danger]="!product.isActive">
                      {{ product.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-outline btn-sm" (click)="editProduct(product)">Edit</button>
                    <button class="btn btn-danger btn-sm" (click)="deleteProduct(product)">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Category Modal -->
      <div class="modal-backdrop" *ngIf="showCategoryModal" (click)="showCategoryModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingCategory ? 'Edit Category' : 'Add Category' }}</h3>
            <button class="btn-close" (click)="showCategoryModal = false">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Name *</label>
              <input type="text" class="form-control" [(ngModel)]="categoryForm.name">
            </div>
            <div class="form-group" *ngIf="!editingCategory">
              <label class="form-label">Prefix * (2 chars, e.g., LN, DC)</label>
              <input type="text" class="form-control" [(ngModel)]="categoryForm.prefix" maxlength="2" style="text-transform: uppercase;">
            </div>
            <div class="form-group">
              <label class="form-label">Color</label>
              <input type="color" class="form-control" [(ngModel)]="categoryForm.colorCode" style="height: 50px;">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="showCategoryModal = false">Cancel</button>
            <button class="btn btn-primary" (click)="saveCategory()">Save</button>
          </div>
        </div>
      </div>
      
      <!-- Product Modal -->
      <div class="modal-backdrop" *ngIf="showProductModal" (click)="showProductModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingProduct ? 'Edit Product' : 'Add Product' }}</h3>
            <button class="btn-close" (click)="showProductModal = false">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group" *ngIf="!editingProduct">
              <label class="form-label">Category *</label>
              <select class="form-control" [(ngModel)]="productForm.categoryId">
                <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Name *</label>
              <input type="text" class="form-control" [(ngModel)]="productForm.name">
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <input type="text" class="form-control" [(ngModel)]="productForm.description">
            </div>
            <div class="form-group">
              <label class="form-label">Price (RM) *</label>
              <input type="number" class="form-control" [(ngModel)]="productForm.price" step="0.01">
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" [(ngModel)]="productForm.isActive"> Active
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="showProductModal = false">Cancel</button>
            <button class="btn btn-primary" (click)="saveProduct()">Save</button>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header { margin-bottom: 24px; }
    .card-header { display: flex; justify-content: space-between; align-items: center; }
    .header-actions { display: flex; align-items: center; }
    .categories-list { display: flex; flex-direction: column; gap: 12px; }
    .category-item { display: flex; align-items: center; gap: 16px; padding: 16px; background: var(--bg-surface); border-radius: 10px; }
    .category-color { width: 40px; height: 40px; border-radius: 10px; }
    .category-info { flex: 1; display: flex; flex-direction: column; }
    .item-actions { display: flex; gap: 8px; }
    .btn-close { background: none; border: none; font-size: 24px; cursor: pointer; }
    .shop-settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .shop-save-status { margin-top: 12px; }
    @media (max-width: 768px) {
      .shop-settings-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class SettingsComponent implements OnInit {
  categories: CategoryDto[] = [];
  products: ProductDto[] = [];
  selectedCategoryId: number | null = null;

  showCategoryModal = false;
  showProductModal = false;
  editingCategory: CategoryDto | null = null;
  editingProduct: ProductDto | null = null;

  categoryForm = { name: '', prefix: '', colorCode: '#3B82F6' };
  productForm = { categoryId: 0, name: '', description: '', price: 0, isActive: true };

  shopSettings: ShopSettingsDto = { shopName: '', address: '', businessWhatsApp: '' };
  isSavingShop = false;
  shopSaveMessage = '';

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
    this.loadShopSettings();
  }

  loadShopSettings() {
    this.api.getShopSettings().subscribe(s => this.shopSettings = s);
  }

  saveShopSettings() {
    this.isSavingShop = true;
    this.shopSaveMessage = '';
    this.api.updateShopSettings(this.shopSettings).subscribe({
      next: () => {
        this.isSavingShop = false;
        this.shopSaveMessage = 'Shop settings saved!';
        setTimeout(() => this.shopSaveMessage = '', 3000);
      },
      error: () => { this.isSavingShop = false; alert('Failed to save'); }
    });
  }

  loadCategories() {
    this.api.getCategories().subscribe(cats => this.categories = cats);
  }

  loadProducts() {
    this.api.getProducts(this.selectedCategoryId || undefined, false).subscribe(p => this.products = p);
  }

  openCategoryModal() {
    this.editingCategory = null;
    this.categoryForm = { name: '', prefix: '', colorCode: '#3B82F6' };
    this.showCategoryModal = true;
  }

  editCategory(cat: CategoryDto) {
    this.editingCategory = cat;
    this.categoryForm = { name: cat.name, prefix: cat.prefix, colorCode: cat.colorCode || '#3B82F6' };
    this.showCategoryModal = true;
  }

  saveCategory() {
    if (this.editingCategory) {
      this.api.updateCategory(this.editingCategory.id, {
        id: this.editingCategory.id,
        name: this.categoryForm.name,
        colorCode: this.categoryForm.colorCode
      }).subscribe(() => {
        this.showCategoryModal = false;
        this.loadCategories();
      });
    } else {
      this.api.createCategory(this.categoryForm).subscribe(() => {
        this.showCategoryModal = false;
        this.loadCategories();
      });
    }
  }

  deleteCategory(cat: CategoryDto) {
    if (confirm(`Delete category "${cat.name}"?`)) {
      this.api.deleteCategory(cat.id).subscribe(() => this.loadCategories());
    }
  }

  openProductModal() {
    this.editingProduct = null;
    this.productForm = {
      categoryId: this.categories[0]?.id || 0,
      name: '',
      description: '',
      price: 0,
      isActive: true
    };
    this.showProductModal = true;
  }

  editProduct(product: ProductDto) {
    this.editingProduct = product;
    this.productForm = {
      categoryId: product.categoryId,
      name: product.name,
      description: product.description || '',
      price: product.price,
      isActive: product.isActive
    };
    this.showProductModal = true;
  }

  saveProduct() {
    if (this.editingProduct) {
      this.api.updateProduct(this.editingProduct.id, {
        name: this.productForm.name,
        description: this.productForm.description,
        price: this.productForm.price,
        isActive: this.productForm.isActive,
        isStockTracked: false,
        stockQuantity: 0,
        lowStockAlert: 0
      }).subscribe(() => {
        this.showProductModal = false;
        this.loadProducts();
      });
    } else {
      this.api.createProduct({
        categoryId: this.productForm.categoryId,
        name: this.productForm.name,
        description: this.productForm.description,
        price: this.productForm.price
      }).subscribe(() => {
        this.showProductModal = false;
        this.loadProducts();
      });
    }
  }

  deleteProduct(product: ProductDto) {
    if (confirm(`Delete product "${product.name}"?`)) {
      this.api.deleteProduct(product.id).subscribe(() => this.loadProducts());
    }
  }
}
