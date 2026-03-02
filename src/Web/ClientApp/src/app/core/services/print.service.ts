import { Injectable } from '@angular/core';
import { OrderDetailDto, PaymentMethod, CartItem, CreateOrderResult } from './api.service';

export interface PrintResult {
    success: boolean;
    message: string;
}

// Simplified order data for quick printing from POS
export interface QuickPrintOrder {
    ticketNumber: string;
    customerName?: string;
    customerPhone?: string;
    items: CartItem[];
    totalAmount: number;
    paidAmount: number;
    changeAmount: number;
    paymentMethod: PaymentMethod;
}

@Injectable({
    providedIn: 'root'
})
export class PrintService {

    // Standard receipt paper width: 80mm ≈ 302px at 96 DPI, 58mm ≈ 219px
    private readonly PAPER_WIDTH_80MM = '80mm';
    private readonly PAPER_WIDTH_58MM = '58mm';

    /**
     * Quick print from POS - opens window and auto-triggers print
     * This provides the most seamless experience
     */
    quickPrint(order: QuickPrintOrder): void {
        const receiptHTML = this.generateQuickReceiptHTML(order);
        const printWindow = window.open('', '_blank', 'width=400,height=700,scrollbars=yes');
        if (printWindow) {
            printWindow.document.write(receiptHTML);
            printWindow.document.close();
            // Focus and trigger print after a short delay for content to render
            printWindow.onload = () => {
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                }, 300);
            };
        }
    }

    /**
     * Print order receipt to receipt printer
     * Uses browser print API with receipt-optimized CSS
     */
    printReceipt(order: OrderDetailDto): Promise<PrintResult> {
        return new Promise((resolve) => {
            try {
                // Create a hidden iframe for printing
                const printFrame = document.createElement('iframe');
                printFrame.style.position = 'absolute';
                printFrame.style.width = '0';
                printFrame.style.height = '0';
                printFrame.style.border = 'none';
                printFrame.style.left = '-9999px';
                document.body.appendChild(printFrame);

                const printDocument = printFrame.contentDocument || printFrame.contentWindow?.document;
                if (!printDocument) {
                    resolve({ success: false, message: 'Could not create print document' });
                    return;
                }

                // Generate receipt HTML
                const receiptHTML = this.generateReceiptHTML(order);
                printDocument.open();
                printDocument.write(receiptHTML);
                printDocument.close();

                // Wait for content to load then print
                printFrame.onload = () => {
                    try {
                        printFrame.contentWindow?.focus();
                        printFrame.contentWindow?.print();

                        // Clean up after print dialog closes
                        setTimeout(() => {
                            document.body.removeChild(printFrame);
                        }, 1000);

                        resolve({ success: true, message: 'Print dialog opened' });
                    } catch (printError) {
                        document.body.removeChild(printFrame);
                        resolve({ success: false, message: 'Print failed: ' + printError });
                    }
                };

            } catch (error) {
                resolve({ success: false, message: 'Print error: ' + error });
            }
        });
    }

    /**
     * Open receipt in new window (fallback option)
     */
    openReceiptInWindow(order: OrderDetailDto): void {
        const receiptHTML = this.generateReceiptHTML(order);
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (printWindow) {
            printWindow.document.write(receiptHTML);
            printWindow.document.close();
        }
    }

    /**
     * Generate quick receipt HTML for POS (simplified, with auto-print)
     */
    private generateQuickReceiptHTML(order: QuickPrintOrder): string {
        const shopName = 'UnifiedPOS Laundry';
        const shopAddress = 'No. 123, Jalan Maju, Taman Indah';
        const shopCity = '47100 Puchong, Selangor';
        const shopPhone = 'Tel: 03-1234 5678';

        const currentDate = new Date();
        const dateStr = currentDate.toLocaleDateString('en-MY', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
        const timeStr = currentDate.toLocaleTimeString('en-MY', {
            hour: '2-digit', minute: '2-digit'
        });

        const itemsHTML = order.items.map(item => `
            <tr>
                <td class="item-name">${this.escapeHtml(item.productName)}</td>
                <td class="item-qty">${item.quantity}</td>
                <td class="item-price">${(item.unitPrice * item.quantity).toFixed(2)}</td>
            </tr>
        `).join('');

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Receipt #${order.ticketNumber}</title>
    <style>
        @page {
            size: ${this.PAPER_WIDTH_80MM} auto;
            margin: 2mm;
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            line-height: 1.3;
            width: ${this.PAPER_WIDTH_80MM};
            max-width: ${this.PAPER_WIDTH_80MM};
            color: #000;
            background: #fff;
        }
        
        .receipt { padding: 3mm; }
        .header { text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
        .shop-name { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
        .shop-info { font-size: 10px; }
        .ticket-info { margin: 10px 0; border-bottom: 1px dashed #000; padding-bottom: 10px; }
        .ticket-number { font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 5px; }
        .info-row { display: flex; justify-content: space-between; font-size: 10px; }
        .customer-info { margin: 8px 0; font-size: 11px; }
        .items-table { width: 100%; margin: 10px 0; border-collapse: collapse; }
        .items-table th { font-size: 10px; text-align: left; border-bottom: 1px solid #000; padding: 3px 0; }
        .items-table th:last-child, .items-table td:last-child { text-align: right; }
        .items-table th:nth-child(2), .items-table td:nth-child(2) { text-align: center; width: 30px; }
        .items-table td { padding: 4px 0; font-size: 11px; vertical-align: top; }
        .item-name { max-width: 140px; word-wrap: break-word; }
        .totals { border-top: 1px dashed #000; padding-top: 8px; margin-top: 8px; }
        .total-row { display: flex; justify-content: space-between; font-size: 12px; padding: 3px 0; }
        .total-row.grand-total { font-size: 16px; font-weight: bold; border-top: 1px solid #000; margin-top: 5px; padding-top: 5px; }
        .total-row.change { color: #060; font-weight: bold; }
        .payment-method { margin-top: 10px; text-align: center; font-size: 11px; padding: 8px; background: #f5f5f5; }
        .barcode { text-align: center; font-size: 16px; font-weight: bold; letter-spacing: 3px; margin: 15px 0; padding: 10px; border: 1px dashed #000; }
        .footer { text-align: center; margin-top: 15px; padding-top: 10px; border-top: 1px dashed #000; font-size: 10px; }
        .footer .thanks { font-size: 14px; font-weight: bold; margin-bottom: 5px; }
        
        /* Screen controls */
        .screen-controls { text-align: center; margin: 20px 0; padding: 15px; background: #f0f0f0; }
        .screen-controls button { padding: 12px 24px; font-size: 14px; margin: 5px; cursor: pointer; border: none; border-radius: 5px; }
        .print-btn { background: #2563EB; color: white; }
        .close-btn { background: #6B7280; color: white; }
        
        @media print {
            .screen-controls { display: none !important; }
            body { width: ${this.PAPER_WIDTH_80MM}; }
        }
        
        @media screen {
            body { width: 320px; margin: 10px auto; border: 1px solid #ccc; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <div class="shop-name">${this.escapeHtml(shopName)}</div>
            <div class="shop-info">${this.escapeHtml(shopAddress)}</div>
            <div class="shop-info">${this.escapeHtml(shopCity)}</div>
            <div class="shop-info">${this.escapeHtml(shopPhone)}</div>
        </div>
        
        <div class="ticket-info">
            <div class="ticket-number">#${this.escapeHtml(order.ticketNumber)}</div>
            <div class="info-row">
                <span>Date: ${dateStr}</span>
                <span>Time: ${timeStr}</span>
            </div>
        </div>
        
        ${order.customerName ? `
        <div class="customer-info">
            <div><strong>Customer:</strong> ${this.escapeHtml(order.customerName)}</div>
            ${order.customerPhone ? `<div><strong>Phone:</strong> ${this.escapeHtml(order.customerPhone)}</div>` : ''}
        </div>
        ` : `<div class="customer-info">Walk-in Customer</div>`}
        
        <table class="items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>RM</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHTML}
            </tbody>
        </table>
        
        <div class="totals">
            <div class="total-row grand-total">
                <span>TOTAL</span>
                <span>RM ${order.totalAmount.toFixed(2)}</span>
            </div>
            <div class="total-row">
                <span>Paid</span>
                <span>RM ${order.paidAmount.toFixed(2)}</span>
            </div>
            ${order.changeAmount > 0 ? `
            <div class="total-row change">
                <span>CHANGE</span>
                <span>RM ${order.changeAmount.toFixed(2)}</span>
            </div>
            ` : ''}
        </div>
        
        <div class="payment-method">
            Payment: ${this.getPaymentMethodLabel(order.paymentMethod)}
        </div>
        
        <div class="barcode">
            ${order.ticketNumber}
        </div>
        
        <div class="footer">
            <div class="thanks">Thank You!</div>
            <div>Terima Kasih</div>
            <div style="margin-top: 5px;">Please keep this receipt for collection</div>
        </div>
    </div>
    
    <div class="screen-controls">
        <button class="print-btn" onclick="window.print()">🖨️ Print Again</button>
        <button class="close-btn" onclick="window.close()">✕ Close</button>
    </div>
</body>
</html>
        `;
    }

    /**
     * Generate receipt HTML with print-optimized CSS
     */
    private generateReceiptHTML(order: OrderDetailDto): string {
        const shopName = 'UnifiedPOS Laundry';
        const shopAddress = 'No. 123, Jalan Maju, Taman Indah';
        const shopCity = '47100 Puchong, Selangor';
        const shopPhone = 'Tel: 03-1234 5678';

        const currentDate = new Date();
        const dateStr = currentDate.toLocaleDateString('en-MY', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
        const timeStr = currentDate.toLocaleTimeString('en-MY', {
            hour: '2-digit', minute: '2-digit'
        });

        const itemsHTML = order.items.map(item => `
            <tr>
                <td class="item-name">${this.escapeHtml(item.productName)}</td>
                <td class="item-qty">${item.quantity}</td>
                <td class="item-price">${item.subtotal.toFixed(2)}</td>
            </tr>
        `).join('');

        const paymentsHTML = order.payments.map(p => `
            <div class="payment-row">
                <span>${this.getPaymentMethodLabel(p.method)}</span>
                <span>RM ${p.amount.toFixed(2)}</span>
            </div>
        `).join('');

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Receipt #${order.ticketNumber}</title>
    <style>
        @page {
            size: ${this.PAPER_WIDTH_80MM} auto;
            margin: 2mm;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            line-height: 1.3;
            width: ${this.PAPER_WIDTH_80MM};
            max-width: ${this.PAPER_WIDTH_80MM};
            color: #000;
            background: #fff;
        }
        
        .receipt {
            padding: 3mm;
        }
        
        .header {
            text-align: center;
            margin-bottom: 10px;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
        }
        
        .shop-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 4px;
        }
        
        .shop-info {
            font-size: 10px;
        }
        
        .ticket-info {
            margin: 10px 0;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
        }
        
        .ticket-number {
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 5px;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
        }
        
        .customer-info {
            margin: 8px 0;
            font-size: 11px;
        }
        
        .items-table {
            width: 100%;
            margin: 10px 0;
            border-collapse: collapse;
        }
        
        .items-table th {
            font-size: 10px;
            text-align: left;
            border-bottom: 1px solid #000;
            padding: 3px 0;
        }
        
        .items-table th:last-child,
        .items-table td:last-child {
            text-align: right;
        }
        
        .items-table th:nth-child(2),
        .items-table td:nth-child(2) {
            text-align: center;
            width: 30px;
        }
        
        .items-table td {
            padding: 4px 0;
            font-size: 11px;
            vertical-align: top;
        }
        
        .item-name {
            max-width: 140px;
            word-wrap: break-word;
        }
        
        .totals {
            border-top: 1px dashed #000;
            padding-top: 8px;
            margin-top: 8px;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            padding: 2px 0;
        }
        
        .total-row.grand-total {
            font-size: 14px;
            font-weight: bold;
            border-top: 1px solid #000;
            margin-top: 5px;
            padding-top: 5px;
        }
        
        .total-row.balance {
            color: #c00;
        }
        
        .payments {
            margin: 10px 0;
            border-top: 1px dashed #000;
            padding-top: 8px;
        }
        
        .payments-title {
            font-weight: bold;
            font-size: 11px;
            margin-bottom: 5px;
        }
        
        .payment-row {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            padding: 2px 0;
        }
        
        .footer {
            text-align: center;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px dashed #000;
            font-size: 10px;
        }
        
        .footer .thanks {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .barcode {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            letter-spacing: 2px;
            margin: 10px 0;
        }
        
        /* Print button - hidden when printing */
        .print-btn {
            display: block;
            margin: 20px auto;
            padding: 10px 30px;
            font-size: 14px;
            cursor: pointer;
        }
        
        @media print {
            .print-btn {
                display: none !important;
            }
            body {
                width: ${this.PAPER_WIDTH_80MM};
            }
        }
        
        @media screen {
            body {
                width: 302px;
                margin: 20px auto;
                border: 1px solid #ccc;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <div class="shop-name">${this.escapeHtml(shopName)}</div>
            <div class="shop-info">${this.escapeHtml(shopAddress)}</div>
            <div class="shop-info">${this.escapeHtml(shopCity)}</div>
            <div class="shop-info">${this.escapeHtml(shopPhone)}</div>
        </div>
        
        <div class="ticket-info">
            <div class="ticket-number">#${this.escapeHtml(order.ticketNumber)}</div>
            <div class="info-row">
                <span>Date: ${dateStr}</span>
                <span>Time: ${timeStr}</span>
            </div>
        </div>
        
        ${order.customerName ? `
        <div class="customer-info">
            <div><strong>Customer:</strong> ${this.escapeHtml(order.customerName)}</div>
            ${order.customerPhone ? `<div><strong>Phone:</strong> ${this.escapeHtml(order.customerPhone)}</div>` : ''}
        </div>
        ` : `<div class="customer-info">Walk-in Customer</div>`}
        
        <table class="items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>RM</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHTML}
            </tbody>
        </table>
        
        <div class="totals">
            <div class="total-row grand-total">
                <span>TOTAL</span>
                <span>RM ${order.totalAmount.toFixed(2)}</span>
            </div>
            <div class="total-row">
                <span>Paid</span>
                <span>RM ${order.paidAmount.toFixed(2)}</span>
            </div>
            ${order.balanceRemaining > 0 ? `
            <div class="total-row balance">
                <span>BALANCE DUE</span>
                <span>RM ${order.balanceRemaining.toFixed(2)}</span>
            </div>
            ` : ''}
        </div>
        
        ${order.payments.length > 0 ? `
        <div class="payments">
            <div class="payments-title">Payment Method(s):</div>
            ${paymentsHTML}
        </div>
        ` : ''}
        
        <div class="barcode">
            ${order.ticketNumber}
        </div>
        
        <div class="footer">
            <div class="thanks">Thank You!</div>
            <div>Terima Kasih</div>
            <div style="margin-top: 5px;">Please keep this receipt</div>
            <div>for collection</div>
        </div>
    </div>
    
    <button class="print-btn" onclick="window.print()">🖨️ Print Receipt</button>
</body>
</html>
        `;
    }

    private getPaymentMethodLabel(method: PaymentMethod): string {
        switch (method) {
            case PaymentMethod.Cash: return 'Cash';
            case PaymentMethod.QR: return 'QR Payment';
            case PaymentMethod.Credit: return 'Card';
            default: return 'Other';
        }
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
