import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Types based on the API DTOs
export interface CategoryDto {
    id: number;
    name: string;
    prefix: string;
    colorCode?: string;
    productCount: number;
}

export interface ProductDto {
    id: number;
    categoryId: number;
    categoryName: string;
    categoryPrefix: string;
    categoryColor?: string;
    name: string;
    description?: string;
    price: number;
    isStockTracked: boolean;
    stockQuantity: number;
    lowStockAlert: number;
    isActive: boolean;
    isLowStock: boolean;
    variants: ProductVariantDto[];
}

export interface ProductVariantDto {
    id: number;
    name: string;
    options: string;
    isRequired: boolean;
}

export interface CustomerDto {
    id: number;
    name: string;
    phone: string;
    email?: string;
    orderCount: number;
}

export interface OrderListDto {
    id: number;
    ticketNumber: string;
    customerName?: string;
    customerPhone?: string;
    totalAmount: number;
    paidAmount: number;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    billNumber?: string;
    remark?: string;
    created: Date;
    collectedAt?: Date;
}

export interface OrderDetailDto {
    id: number;
    ticketNumber: string;
    customerId?: number;
    customerName?: string;
    customerPhone?: string;
    totalAmount: number;
    paidAmount: number;
    balanceRemaining: number;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    notes?: string;
    billNumber?: string;
    remark?: string;
    created: Date;
    completedAt?: Date;
    collectedAt?: Date;
    items: OrderItemDetailDto[];
    payments: PaymentDetailDto[];
}

export interface OrderItemDetailDto {
    id: number;
    productName: string;
    categoryName?: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    variantDetails?: string;
}

export interface PaymentDetailDto {
    id: number;
    amount: number;
    method: PaymentMethod;
    referenceNumber?: string;
    createdAt: Date;
}

export interface DashboardSummaryDto {
    todaysRevenue: number;
    pendingOrders: number;
    readyForPickup: number;
    totalOrdersToday: number;
    lowStockItems: LowStockItemDto[];
    recentOrders: RecentOrderDto[];
}

export interface LowStockItemDto {
    id: number;
    name: string;
    stockQuantity: number;
    lowStockAlert: number;
}

export interface RecentOrderDto {
    id: number;
    ticketNumber: string;
    customerName?: string;
    totalAmount: number;
    status: OrderStatus;
    created: Date;
}

export interface CreateOrderCommand {
    customerId?: number;
    customerName?: string;
    customerPhone?: string;
    items: CartItem[];
    payment?: PaymentDto;
    notes?: string;
    billNumber?: string;
    remark?: string;
}

export interface CartItem {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    variantDetails?: string;
    categoryName?: string;
    categoryPrefix?: string;
}

export interface PaymentDto {
    amount: number;
    method: PaymentMethod;
    referenceNumber?: string;
}

export interface CreateOrderResult {
    orderId: number;
    ticketNumber: string;
    totalAmount: number;
    paidAmount: number;
    changeAmount: number;
}

export interface SalesReportDto {
    fromDate: Date;
    toDate: Date;
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    uniqueCustomers: number;
    paymentMethods: PaymentMethodBreakdownDto[];
    categorySales: CategorySalesDto[];
    topProducts: TopProductDto[];
    orderStatusDistribution: { [key: number]: number };
    dailyBreakdown: DailySalesDto[];
}

export interface PaymentMethodBreakdownDto {
    method: PaymentMethod;
    count: number;
    amount: number;
    percentage: number;
}

export interface CategorySalesDto {
    categoryName: string;
    itemsSold: number;
    revenue: number;
    percentage: number;
}

export interface TopProductDto {
    rank: number;
    productName: string;
    quantity: number;
    revenue: number;
}

export interface DailySalesDto {
    date: string;
    orders: number;
    revenue: number;
}

export interface ShopSettingsDto {
    shopName: string;
    address: string;
    businessWhatsApp: string;
}

export enum PaymentMethod {
    Cash = 0,
    QR = 1,
    Credit = 2
}

export enum PaymentStatus {
    Unpaid = 0,
    Partial = 1,
    Paid = 2
}

export enum OrderStatus {
    Pending = 0,
    Processing = 1,
    Ready = 2,
    Completed = 3,
    Collected = 4
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = '/api';

    constructor(private http: HttpClient) { }

    // Categories
    getCategories(): Observable<CategoryDto[]> {
        return this.http.get<CategoryDto[]>(`${this.baseUrl}/categories`);
    }

    createCategory(category: { name: string; prefix: string; colorCode?: string }): Observable<number> {
        return this.http.post<number>(`${this.baseUrl}/categories`, category);
    }

    updateCategory(id: number, category: { id: number; name: string; colorCode?: string }): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/categories/${id}`, category);
    }

    deleteCategory(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/categories/${id}`);
    }

    // Products
    getProducts(categoryId?: number, activeOnly: boolean = true): Observable<ProductDto[]> {
        const params: any = { activeOnly };
        if (categoryId) params.categoryId = categoryId;
        return this.http.get<ProductDto[]>(`${this.baseUrl}/products`, { params });
    }

    createProduct(product: any): Observable<number> {
        return this.http.post<number>(`${this.baseUrl}/products`, product);
    }

    updateProduct(id: number, product: any): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/products/${id}`, { id, ...product });
    }

    deleteProduct(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/products/${id}`);
    }

    // Customers
    getAllCustomers(): Observable<CustomerDto[]> {
        return this.http.get<CustomerDto[]>(`${this.baseUrl}/customers`);
    }

    searchCustomers(searchTerm: string): Observable<CustomerDto[]> {
        return this.http.get<CustomerDto[]>(`${this.baseUrl}/customers/search`, {
            params: { searchTerm }
        });
    }

    createCustomer(customer: { name: string; phone: string; email?: string }): Observable<number> {
        return this.http.post<number>(`${this.baseUrl}/customers`, customer);
    }

    updateCustomer(id: number, customer: { id: number; name: string; phone: string; email?: string }): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/customers/${id}`, customer);
    }

    // Orders
    getOrders(filters?: { status?: OrderStatus; searchTerm?: string }): Observable<OrderListDto[]> {
        return this.http.get<OrderListDto[]>(`${this.baseUrl}/orders`, { params: filters as any });
    }

    getOrderById(id: number): Observable<OrderDetailDto> {
        return this.http.get<OrderDetailDto>(`${this.baseUrl}/orders/${id}`);
    }

    createOrder(command: CreateOrderCommand): Observable<CreateOrderResult> {
        return this.http.post<CreateOrderResult>(`${this.baseUrl}/orders`, command);
    }

    updateOrderStatus(id: number, status: OrderStatus): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/orders/${id}/status`, { id, status });
    }

    addPayment(orderId: number, payment: PaymentDto): Observable<any> {
        return this.http.post(`${this.baseUrl}/orders/${orderId}/payments`, payment);
    }

    updateOrderDetails(orderId: number, details: { id: number; billNumber?: string; remark?: string }): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/orders/${orderId}/details`, details);
    }

    deleteOrder(orderId: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/orders/${orderId}`);
    }

    // Dashboard
    getDashboardSummary(): Observable<DashboardSummaryDto> {
        return this.http.get<DashboardSummaryDto>(`${this.baseUrl}/dashboard`);
    }

    // Reports
    getSalesReport(fromDate: string, toDate: string): Observable<SalesReportDto> {
        return this.http.get<SalesReportDto>(`${this.baseUrl}/reports/sales`, {
            params: { fromDate, toDate }
        });
    }

    // Shop Settings
    getShopSettings(): Observable<ShopSettingsDto> {
        return this.http.get<ShopSettingsDto>(`${this.baseUrl}/settings/shop`);
    }

    updateShopSettings(settings: ShopSettingsDto): Observable<ShopSettingsDto> {
        return this.http.put<ShopSettingsDto>(`${this.baseUrl}/settings/shop`, settings);
    }
}
