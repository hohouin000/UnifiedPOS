import { Component } from '@angular/core';
import { ApiService, SalesReportDto, PaymentMethod } from '../../core/services/api.service';

@Component({
  selector: 'app-reports',
  template: `
    <app-layout>
      <div class="page-container">
        <div class="page-header no-print">
          <h2>Sales Report</h2>
          <div class="header-actions">
            <input type="date" class="form-control" [(ngModel)]="fromDate" style="width: 160px;">
            <span>to</span>
            <input type="date" class="form-control" [(ngModel)]="toDate" style="width: 160px;">
            <button class="btn btn-primary" (click)="generateReport()">Generate Report</button>
            <button class="btn btn-outline" (click)="printReport()" *ngIf="report">🖨️ Print</button>
          </div>
        </div>
        
        <!-- Report Content (Printable) -->
        <div class="report-content" id="report-content" *ngIf="report">
          <!-- Report Header -->
          <div class="report-header">
            <div class="company-info">
              <h1>UnifiedPOS Laundry & Dry Cleaning</h1>
              <p>SSM Registration No: 123456-X</p>
              <p>No. 123, Jalan Maju, Taman Indah</p>
              <p>47100 Puchong, Selangor Darul Ehsan</p>
              <p>Tel: 03-1234 5678 | Email: info&#64;unifiedpos.com.my</p>
            </div>
            <div class="report-title">
              <h2>LAPORAN JUALAN HARIAN</h2>
              <h3>DAILY SALES REPORT</h3>
              <p class="report-period">
                <strong>Tempoh / Period:</strong> {{ formatDate(report.fromDate) }} - {{ formatDate(report.toDate) }}
              </p>
              <p class="report-generated">
                <strong>Dijana pada / Generated:</strong> {{ generatedAt }}
              </p>
            </div>
          </div>
          
          <hr class="divider">
          
          <!-- Executive Summary -->
          <section class="report-section">
            <h3>RINGKASAN EKSEKUTIF / EXECUTIVE SUMMARY</h3>
            <table class="summary-table">
              <tr>
                <td>Jumlah Hasil / Total Revenue</td>
                <td class="text-right"><strong>RM {{ report.totalRevenue.toFixed(2) }}</strong></td>
              </tr>
              <tr>
                <td>Jumlah Pesanan / Total Orders</td>
                <td class="text-right"><strong>{{ report.totalOrders }}</strong></td>
              </tr>
              <tr>
                <td>Nilai Purata Pesanan / Average Order Value</td>
                <td class="text-right"><strong>RM {{ report.averageOrderValue.toFixed(2) }}</strong></td>
              </tr>
              <tr>
                <td>Pelanggan Unik / Unique Customers</td>
                <td class="text-right"><strong>{{ report.uniqueCustomers }}</strong></td>
              </tr>
            </table>
          </section>
          
          <!-- Payment Methods Breakdown -->
          <section class="report-section">
            <h3>PECAHAN KAEDAH PEMBAYARAN / PAYMENT METHODS BREAKDOWN</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Kaedah / Method</th>
                  <th class="text-right">Bil. Transaksi / Count</th>
                  <th class="text-right">Jumlah / Amount (RM)</th>
                  <th class="text-right">Peratus / %</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let pm of report.paymentMethods">
                  <td>{{ getPaymentMethodName(pm.method) }}</td>
                  <td class="text-right">{{ pm.count }}</td>
                  <td class="text-right">{{ pm.amount.toFixed(2) }}</td>
                  <td class="text-right">{{ pm.percentage }}%</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>JUMLAH / TOTAL</strong></td>
                  <td class="text-right"><strong>{{ getTotalPaymentCount() }}</strong></td>
                  <td class="text-right"><strong>{{ report.totalRevenue.toFixed(2) }}</strong></td>
                  <td class="text-right"><strong>100%</strong></td>
                </tr>
              </tfoot>
            </table>
          </section>
          
          <!-- Category Sales -->
          <section class="report-section">
            <h3>JUALAN MENGIKUT KATEGORI / SALES BY CATEGORY</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Kategori / Category</th>
                  <th class="text-right">Unit Dijual / Items Sold</th>
                  <th class="text-right">Hasil / Revenue (RM)</th>
                  <th class="text-right">Peratus / %</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let cat of report.categorySales">
                  <td>{{ cat.categoryName }}</td>
                  <td class="text-right">{{ cat.itemsSold }}</td>
                  <td class="text-right">{{ cat.revenue.toFixed(2) }}</td>
                  <td class="text-right">{{ cat.percentage }}%</td>
                </tr>
              </tbody>
            </table>
          </section>
          
          <!-- Top Products -->
          <section class="report-section">
            <h3>10 PRODUK TERLARIS / TOP 10 BEST SELLERS</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Bil. / No.</th>
                  <th>Produk / Product</th>
                  <th class="text-right">Kuantiti / Qty</th>
                  <th class="text-right">Hasil / Revenue (RM)</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of report.topProducts">
                  <td>{{ p.rank }}</td>
                  <td>{{ p.productName }}</td>
                  <td class="text-right">{{ p.quantity }}</td>
                  <td class="text-right">{{ p.revenue.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </section>
          
          <!-- Daily Breakdown -->
          <section class="report-section" *ngIf="report.dailyBreakdown.length > 1">
            <h3>PECAHAN HARIAN / DAILY BREAKDOWN</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Tarikh / Date</th>
                  <th class="text-right">Pesanan / Orders</th>
                  <th class="text-right">Hasil / Revenue (RM)</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let day of report.dailyBreakdown">
                  <td>{{ day.date }}</td>
                  <td class="text-right">{{ day.orders }}</td>
                  <td class="text-right">{{ day.revenue.toFixed(2) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>JUMLAH / TOTAL</strong></td>
                  <td class="text-right"><strong>{{ report.totalOrders }}</strong></td>
                  <td class="text-right"><strong>{{ report.totalRevenue.toFixed(2) }}</strong></td>
                </tr>
              </tfoot>
            </table>
          </section>
          
          <!-- Footer -->
          <div class="report-footer">
            <div class="signature-section">
              <div class="signature-box">
                <div class="signature-line"></div>
                <p>Disediakan oleh / Prepared by</p>
                <p class="signature-name">________________________</p>
                <p>Tarikh / Date: ________________</p>
              </div>
              <div class="signature-box">
                <div class="signature-line"></div>
                <p>Disahkan oleh / Verified by</p>
                <p class="signature-name">________________________</p>
                <p>Tarikh / Date: ________________</p>
              </div>
            </div>
            <p class="disclaimer">
              Laporan ini dijana secara automatik oleh sistem UnifiedPOS. / This report was auto-generated by UnifiedPOS system.
            </p>
          </div>
        </div>
        
        <!-- No Report State -->
        <div class="no-report" *ngIf="!report && !loading">
          <p>📊 Select a date range and click "Generate Report" to view sales data.</p>
        </div>
        
        <div class="loading" *ngIf="loading">
          <p>Loading report...</p>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header-actions { display: flex; gap: 12px; align-items: center; }
    
    .report-content { background: white; padding: 40px; border-radius: 8px; box-shadow: var(--shadow-sm); }
    .report-header { display: flex; justify-content: space-between; margin-bottom: 24px; }
    .company-info h1 { font-size: 24px; margin-bottom: 8px; color: #1E293B; }
    .company-info p { margin: 2px 0; font-size: 13px; color: #64748B; }
    .report-title { text-align: right; }
    .report-title h2 { font-size: 20px; margin: 0; color: #1E293B; }
    .report-title h3 { font-size: 16px; margin: 4px 0 16px; color: #64748B; font-weight: 400; }
    .report-period, .report-generated { font-size: 13px; margin: 4px 0; }
    
    .divider { border: none; border-top: 2px solid #E2E8F0; margin: 24px 0; }
    
    .report-section { margin-bottom: 32px; }
    .report-section h3 { font-size: 14px; font-weight: 600; color: #1E293B; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #E2E8F0; }
    
    .summary-table { width: 100%; max-width: 500px; }
    .summary-table td { padding: 12px 0; border-bottom: 1px solid #E2E8F0; }
    .summary-table td:last-child { font-size: 18px; }
    
    .data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .data-table th { background: #F8FAFC; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #E2E8F0; }
    .data-table td { padding: 10px 12px; border-bottom: 1px solid #E2E8F0; }
    .data-table tfoot td { background: #F8FAFC; font-weight: 600; }
    .text-right { text-align: right; }
    
    .report-footer { margin-top: 48px; padding-top: 24px; border-top: 2px solid #E2E8F0; }
    .signature-section { display: flex; justify-content: space-between; margin-bottom: 32px; }
    .signature-box { width: 45%; }
    .signature-line { border-bottom: 1px solid #1E293B; margin-bottom: 8px; height: 60px; }
    .signature-box p { font-size: 12px; margin: 4px 0; color: #64748B; }
    .signature-name { font-weight: 500; color: #1E293B; }
    .disclaimer { font-size: 11px; color: #94A3B8; text-align: center; font-style: italic; }
    
    .no-report, .loading { text-align: center; padding: 60px; color: #64748B; }
    
    /* Print Styles */
    @media print {
      .no-print { display: none !important; }
      .page-container { padding: 0; }
      .report-content { box-shadow: none; padding: 20px; }
      body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .data-table th { background: #F0F0F0 !important; -webkit-print-color-adjust: exact; }
    }
  `]
})
export class ReportsComponent {
  fromDate = '';
  toDate = '';
  report: SalesReportDto | null = null;
  loading = false;
  generatedAt = '';

  constructor(private api: ApiService) {
    // Default to today
    const today = new Date();
    this.toDate = this.toISODate(today);
    this.fromDate = this.toISODate(today);
  }

  toISODate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('ms-MY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  generateReport() {
    if (!this.fromDate || !this.toDate) {
      alert('Please select date range');
      return;
    }

    this.loading = true;
    this.api.getSalesReport(this.fromDate, this.toDate).subscribe({
      next: (data) => {
        this.report = data;
        this.generatedAt = new Date().toLocaleString('ms-MY');
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        alert('Failed to generate report');
        this.loading = false;
      }
    });
  }

  getPaymentMethodName(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.Cash: return 'Tunai / Cash';
      case PaymentMethod.QR: return 'Kod QR / QR Code';
      case PaymentMethod.Credit: return 'Kad Kredit/Debit / Credit/Debit Card';
      default: return 'Lain-lain / Other';
    }
  }

  getTotalPaymentCount(): number {
    return this.report?.paymentMethods.reduce((sum, pm) => sum + pm.count, 0) || 0;
  }

  printReport() {
    window.print();
  }
}
