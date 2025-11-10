import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDownTrayIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../BillingPayments.utils';
import { format } from 'date-fns';

interface InvoiceDownloadProps {
  plans: any[];
  selectedPlan?: any;
  pricing?: any;
  approvedLeaves?: any[];
  user: any;
  billingData?: any;
  onClose: () => void;
}

const InvoiceDownload: React.FC<InvoiceDownloadProps> = ({
  plans,
  selectedPlan,
  pricing,
  user,
  billingData,
  onClose
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const downloadInvoice = () => {
    if (!invoiceRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Invoice - SmartMess</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              color: hsl(195, 52%, 2%);
              background: hsl(195, 63%, 100%);
              padding: 0;
              line-height: 1.6;
            }
            .invoice-container {
              max-width: 900px;
              margin: 0 auto;
              background: hsl(195, 63%, 100%);
            }
            .header {
              background: linear-gradient(135deg, hsl(195, 49%, 47%) 0%, hsl(195, 41%, 81%) 50%, hsl(195, 41%, 70%) 100%);
              color: hsl(195, 41%, 21%);
              padding: 40px;
              margin-bottom: 0;
            }
            .header-content {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .logo-section h1 {
              font-size: 36px;
              font-weight: bold;
              margin-bottom: 8px;
              color: hsl(195, 41%, 21%);
            }
            .logo-section p {
              font-size: 16px;
              color: hsl(195, 41%, 21%);
              opacity: 0.9;
            }
            .invoice-title {
              text-align: right;
            }
            .invoice-title h2 {
              font-size: 48px;
              color: hsl(195, 41%, 21%);
              margin-bottom: 12px;
              font-weight: bold;
            }
            .invoice-title p {
              color: hsl(195, 41%, 21%);
              opacity: 0.9;
              font-size: 14px;
              margin: 4px 0;
            }
            .invoice-title span {
              font-weight: 600;
            }
            .content-section {
              padding: 40px;
            }
            .info-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 40px;
            }
            .info-box {
              background: hsl(195, 15%, 85%);
              padding: 24px;
              border-radius: 12px;
              border: 1px solid hsl(195, 8%, 90%);
            }
            .info-box h3 {
              font-size: 12px;
              color: hsl(195, 12%, 25%);
              text-transform: uppercase;
              margin-bottom: 16px;
              padding-bottom: 8px;
              border-bottom: 1px solid hsl(195, 8%, 90%);
              letter-spacing: 1px;
              font-weight: 600;
            }
            .info-box p {
              color: hsl(195, 52%, 2%);
              margin: 8px 0;
              font-size: 14px;
            }
            .info-box strong {
              color: hsl(195, 52%, 2%);
              font-size: 18px;
              font-weight: 700;
            }
            .plans-section {
              margin-bottom: 40px;
            }
            .plans-section h2 {
              font-size: 24px;
              color: hsl(195, 52%, 2%);
              margin-bottom: 24px;
              padding-bottom: 12px;
              border-bottom: 2px solid hsl(195, 41%, 81%);
              font-weight: 700;
            }
            .plan-card {
              background: linear-gradient(135deg, hsl(195, 15%, 85%) 0%, hsl(195, 16%, 88%) 100%);
              border: 2px solid hsl(195, 8%, 90%);
              border-radius: 12px;
              padding: 24px;
              margin-bottom: 24px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            .plan-header {
              display: flex;
              justify-content: space-between;
              align-items: start;
              margin-bottom: 16px;
            }
            .plan-name {
              font-size: 18px;
              font-weight: bold;
              color: hsl(195, 52%, 2%);
            }
            .plan-price-label {
              font-size: 12px;
              color: hsl(195, 12%, 25%);
              margin-bottom: 4px;
            }
            .plan-price {
              font-size: 28px;
              font-weight: bold;
              color: hsl(195, 49%, 47%);
            }
            .plan-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              margin-top: 12px;
              font-size: 14px;
              color: hsl(195, 12%, 25%);
            }
            .plan-details p {
              margin: 4px 0;
            }
            .plan-features {
              margin-top: 16px;
              padding-top: 16px;
              border-top: 1px solid hsl(195, 8%, 90%);
            }
            .plan-features h4 {
              font-size: 14px;
              color: hsl(195, 12%, 25%);
              margin-bottom: 8px;
            }
            .features-list {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
            }
            .feature-badge {
              background: hsl(195, 41%, 81%);
              color: hsl(195, 49%, 47%);
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              border: 1px solid hsl(195, 41%, 70%);
            }
            .pricing-breakdown {
              margin-bottom: 40px;
            }
            .pricing-breakdown h2 {
              font-size: 24px;
              color: hsl(195, 52%, 2%);
              margin-bottom: 24px;
              padding-bottom: 12px;
              border-bottom: 2px solid hsl(195, 41%, 81%);
              font-weight: 700;
            }
            .pricing-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .pricing-table th {
              background: linear-gradient(135deg, hsl(195, 15%, 85%) 0%, hsl(195, 16%, 88%) 100%);
              padding: 16px;
              text-align: left;
              font-size: 14px;
              color: hsl(195, 52%, 2%);
              border: 1px solid hsl(195, 8%, 90%);
              font-weight: 700;
            }
            .pricing-table th:last-child {
              text-align: right;
            }
            .pricing-table td {
              padding: 14px 16px;
              border: 1px solid hsl(195, 8%, 90%);
              font-size: 14px;
            }
            .pricing-table tr:hover {
              background: hsl(195, 15%, 85%);
            }
            .pricing-table tr.subtotal {
              background: hsl(195, 15%, 85%);
              font-weight: 600;
            }
            .pricing-table tr.discount {
              color: hsl(142, 76%, 36%);
            }
            .total-row {
              background: linear-gradient(135deg, hsl(195, 41%, 81%) 0%, hsl(195, 41%, 70%) 100%);
              font-weight: bold;
              border: 2px solid hsl(195, 49%, 47%);
            }
            .total-row td {
              padding: 20px 16px;
              font-size: 24px;
            }
            .total-row td:first-child {
              font-size: 18px;
            }
            .total-row td:last-child {
              color: hsl(195, 49%, 47%);
              text-align: right;
            }
            .footer {
              margin-top: 50px;
              padding: 30px;
              border-top: 2px solid hsl(195, 8%, 90%);
              background: hsl(195, 15%, 85%);
              border-radius: 12px;
              text-align: center;
            }
            .footer p {
              color: hsl(195, 12%, 25%);
              font-size: 14px;
              margin: 8px 0;
            }
            .footer strong {
              color: hsl(195, 52%, 2%);
              font-size: 18px;
              font-weight: 700;
            }
            .footer .thank-you {
              color: hsl(195, 49%, 47%);
              font-weight: 600;
              margin-top: 16px;
            }
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              opacity: 0.08;
              font-size: 180px;
              color: hsl(195, 49%, 47%);
              font-weight: bold;
              pointer-events: none;
              z-index: 0;
              white-space: nowrap;
              user-select: none;
            }
            .invoice-container {
              position: relative;
              z-index: 1;
            }
            @media print {
              body {
                padding: 20px;
              }
              .watermark {
                opacity: 0.1;
                font-size: 200px;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="watermark">SmartMess</div>
            
            <div class="header">
              <div class="header-content">
                <div class="logo-section">
                  <h1>SmartMess</h1>
                  <p>Meal Plan Management Platform</p>
                </div>
                <div class="invoice-title">
                  <h2>INVOICE</h2>
                  <p>Invoice #<span>${invoiceNumber}</span></p>
                  <p>Date: <span>${invoiceDate}</span></p>
                </div>
              </div>
            </div>

            <div class="content-section">
              <div class="info-section">
              <div class="info-box">
                <h3>Bill To</h3>
                <p><strong>${user?.firstName || ''} ${user?.lastName || ''}</strong></p>
                <p>${user?.email || 'N/A'}</p>
                <p>${user?.phone || 'N/A'}</p>
              </div>
              <div class="info-box">
                <h3>From</h3>
                <p><strong>SmartMess Platform</strong></p>
                <p>Meal Plan Management System</p>
                <p>support@smartmess.com</p>
              </div>
            </div>

            <div class="plans-section">
              <h2>Meal Plan Details</h2>
              ${plans.map((plan) => {
                const messInfo = billingData?.memberships?.find((m: any) => m.membershipId === plan.id);
                return `
                  <div class="plan-card">
                    <div class="plan-header">
                      <div>
                        <div class="plan-name">${plan.name} <span style="background: hsl(195, 41%, 81%); color: hsl(195, 49%, 47%); padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-left: 8px; border: 1px solid hsl(195, 41%, 70%);">Active</span></div>
                        ${messInfo ? `<p style="color: hsl(195, 12%, 25%); font-size: 14px; margin-top: 8px;">Mess: <strong style="color: hsl(195, 52%, 2%);">${messInfo.messName || plan.messName || 'N/A'}</strong></p>` : ''}
                      </div>
                      <div style="text-align: right;">
                        <div class="plan-price-label">Plan Price</div>
                        <div class="plan-price">${formatCurrency(plan.basePrice)}</div>
                      </div>
                    </div>
                    <div class="plan-details">
                      <div>
                        <p><strong>Duration:</strong> ${plan.duration} days</p>
                        <p><strong>Description:</strong> ${plan.description || 'N/A'}</p>
                        ${plan.subscriptionStartDate ? `<p><strong>Start Date:</strong> ${format(new Date(plan.subscriptionStartDate), 'dd MMM yyyy')}</p>` : ''}
                        ${plan.subscriptionEndDate ? `<p><strong>End Date:</strong> ${format(new Date(plan.subscriptionEndDate), 'dd MMM yyyy')}</p>` : ''}
                      </div>
                      <div>
                        ${messInfo ? `
                          <p><strong>Mess ID:</strong> ${messInfo.messId || 'N/A'}</p>
                          <p><strong>Membership ID:</strong> ${messInfo.membershipId || plan.id}</p>
                          <p><strong>Payment Status:</strong> ${messInfo.paymentStatus || 'N/A'}</p>
                          ${messInfo.dueDate ? `<p><strong>Due Date:</strong> ${format(new Date(messInfo.dueDate), 'dd MMM yyyy')}</p>` : ''}
                        ` : ''}
                      </div>
                    </div>
                    ${plan.features && plan.features.length > 0 ? `
                      <div class="plan-features">
                        <h4>Plan Features:</h4>
                        <div class="features-list">
                          ${plan.features.map((feature: string) => `<span class="feature-badge">${feature}</span>`).join('')}
                        </div>
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>

            ${pricing ? `
              <div class="pricing-breakdown">
                <h2>Price Breakdown</h2>
                <table class="pricing-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th style="text-align: right;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Plan Price (${selectedPlan?.duration || 30} days)</td>
                      <td style="text-align: right;">${formatCurrency(pricing.basePrice)}</td>
                    </tr>
                    ${pricing.extensionPrice > 0 ? `
                      <tr>
                        <td>Extension</td>
                        <td style="text-align: right;">${formatCurrency(pricing.extensionPrice)}</td>
                      </tr>
                    ` : ''}
                    <tr class="subtotal">
                      <td>Subtotal</td>
                      <td style="text-align: right;">${formatCurrency(pricing.pricing?.subtotal || pricing.basePrice)}</td>
                    </tr>
                    ${pricing.discountAmount > 0 ? `
                      <tr class="discount">
                        <td>Discount</td>
                        <td style="text-align: right;">-${formatCurrency(pricing.discountAmount)}</td>
                      </tr>
                    ` : ''}
                    ${pricing.approvedLeavesDeduction > 0 ? `
                      <tr class="discount">
                        <td>Approved Leaves Deduction</td>
                        <td style="text-align: right;">-${formatCurrency(pricing.approvedLeavesDeduction)}</td>
                      </tr>
                    ` : ''}
                    ${pricing.platformFee > 0 ? `
                      <tr>
                        <td>Platform Fee</td>
                        <td style="text-align: right;">${formatCurrency(pricing.platformFee)}</td>
                      </tr>
                    ` : ''}
                    <tr class="total-row">
                      <td>Total Amount</td>
                      <td>${formatCurrency(pricing.pricing?.finalTotal || pricing.basePrice)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ` : ''}

            <div class="footer">
              <p><strong>SmartMess Platform</strong></p>
              <p>This is a computer-generated invoice. No signature required.</p>
              <p style="margin-top: 12px; font-size: 12px;">support@smartmess.com • www.smartmess.com</p>
              <p class="thank-you">Thank you for using SmartMess!</p>
            </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const invoiceNumber = Date.now().toString().slice(-8);
  const invoiceDate = format(new Date(), 'dd MMM yyyy');

  return (
    <div className="w-full space-y-4">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onClose} className="flex items-center gap-2">
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Back to Plans</span>
        </Button>
        <Button onClick={downloadInvoice} className="flex items-center gap-2">
          <ArrowDownTrayIcon className="h-4 w-4" />
          Download Invoice
        </Button>
      </div>

      {/* Invoice Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-foreground text-lg sm:text-xl">Invoice Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={invoiceRef} className="bg-card text-card-foreground rounded-lg border border-border w-full overflow-hidden">
            {/* Professional Header with Gradient */}
            <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2">SmartMess</h1>
                  <p className="text-primary-foreground/90 text-sm sm:text-base">Meal Plan Management Platform</p>
                </div>
                <div className="text-right">
                  <h2 className="text-4xl sm:text-5xl font-bold mb-2">INVOICE</h2>
                  <div className="space-y-1">
                    <p className="text-primary-foreground/90 text-sm">Invoice #<span className="font-semibold">{invoiceNumber}</span></p>
                    <p className="text-primary-foreground/90 text-sm">Date: <span className="font-semibold">{invoiceDate}</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-4 sm:p-6 lg:p-8">

              {/* Bill To & From Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-muted/30 dark:bg-muted/20 p-4 sm:p-5 rounded-lg border border-border">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 pb-2 border-b border-border">Bill To</h3>
                  <div className="space-y-2">
                    <p className="font-bold text-foreground text-base sm:text-lg break-words">{user?.firstName || ''} {user?.lastName || ''}</p>
                    <p className="text-sm text-muted-foreground break-all">{user?.email || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">{user?.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="bg-muted/30 dark:bg-muted/20 p-4 sm:p-5 rounded-lg border border-border">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 pb-2 border-b border-border">From</h3>
                  <div className="space-y-2">
                    <p className="font-bold text-foreground text-base sm:text-lg">SmartMess Platform</p>
                    <p className="text-sm text-muted-foreground">Meal Plan Management System</p>
                    <p className="text-sm text-muted-foreground">support@smartmess.com</p>
                  </div>
                </div>
              </div>

              {/* Meal Plan Details Section */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6 pb-3 border-b-2 border-primary/30">Meal Plan Details</h2>
                {plans.length > 0 ? (
                  plans.map((plan) => {
                    const messInfo = billingData?.memberships?.find((m: any) => m.membershipId === plan.id);
                    return (
                      <div key={plan.id} className="bg-gradient-to-br from-muted/40 to-muted/20 dark:from-muted/20 dark:to-muted/10 border-2 border-border rounded-xl p-4 sm:p-6 mb-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg sm:text-xl font-bold text-foreground break-words">{plan.name}</h3>
                              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-semibold">Active</span>
                            </div>
                            {messInfo && (
                              <p className="text-sm text-muted-foreground break-words">Mess: <span className="font-medium text-foreground">{messInfo.messName || plan.messName || 'N/A'}</span></p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground mb-1">Plan Price</p>
                            <p className="text-2xl sm:text-3xl font-bold text-primary">{formatCurrency(plan.basePrice)}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pt-4 border-t border-border">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Duration:</span>
                              <span className="text-sm font-medium text-foreground">{plan.duration} days</span>
                            </div>
                            {plan.subscriptionStartDate && (
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Start Date:</span>
                                <span className="text-sm font-medium text-foreground">{format(new Date(plan.subscriptionStartDate), 'dd MMM yyyy')}</span>
                              </div>
                            )}
                            {plan.subscriptionEndDate && (
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">End Date:</span>
                                <span className="text-sm font-medium text-foreground">{format(new Date(plan.subscriptionEndDate), 'dd MMM yyyy')}</span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            {messInfo && (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Payment Status:</span>
                                  <span className="text-sm font-medium text-green-600 dark:text-green-400">{messInfo.paymentStatus || 'N/A'}</span>
                                </div>
                                {messInfo.dueDate && (
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Due Date:</span>
                                    <span className="text-sm font-medium text-foreground">{format(new Date(messInfo.dueDate), 'dd MMM yyyy')}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Membership ID:</span>
                                  <span className="text-sm font-mono text-xs break-all">{messInfo.membershipId || plan.id}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {plan.description && (
                          <div className="mb-4 pt-4 border-t border-border">
                            <p className="text-sm text-muted-foreground mb-1">Description:</p>
                            <p className="text-sm text-foreground">{plan.description}</p>
                          </div>
                        )}
                        
                        {plan.features && plan.features.length > 0 && (
                          <div className="pt-4 border-t border-border">
                            <p className="text-sm font-semibold text-muted-foreground mb-3">Plan Features:</p>
                            <div className="flex flex-wrap gap-2">
                              {plan.features.map((feature: string, idx: number) => (
                                <span key={idx} className="bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-xs font-medium">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 sm:py-12 text-muted-foreground bg-muted/30 rounded-lg border border-border">
                    <p className="text-base sm:text-lg">No plans selected for invoice</p>
                  </div>
                )}
              </div>

              {/* Price Breakdown Section */}
              {pricing ? (
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6 pb-3 border-b-2 border-primary/30">Price Breakdown</h2>
                  <div className="overflow-x-auto">
                    <div className="min-w-full">
                      <table className="w-full border-collapse text-sm sm:text-base">
                        <thead>
                          <tr className="bg-gradient-to-r from-muted to-muted/50 dark:from-muted/50 dark:to-muted/30">
                            <th className="border border-border p-3 sm:p-4 text-left font-bold text-foreground">Description</th>
                            <th className="border border-border p-3 sm:p-4 text-right font-bold text-foreground">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="hover:bg-muted/30 transition-colors">
                            <td className="border border-border p-3 sm:p-4 text-foreground">Plan Price ({selectedPlan?.duration || plans[0]?.duration || 30} days)</td>
                            <td className="border border-border p-3 sm:p-4 text-right text-foreground font-medium whitespace-nowrap">{formatCurrency(pricing.basePrice)}</td>
                          </tr>
                          {pricing.extensionPrice > 0 && (
                            <tr className="hover:bg-muted/30 transition-colors">
                              <td className="border border-border p-3 sm:p-4 text-foreground">Extension</td>
                              <td className="border border-border p-3 sm:p-4 text-right text-foreground font-medium whitespace-nowrap">{formatCurrency(pricing.extensionPrice)}</td>
                            </tr>
                          )}
                          <tr className="bg-muted/20 dark:bg-muted/10">
                            <td className="border border-border p-3 sm:p-4 font-semibold text-foreground">Subtotal</td>
                            <td className="border border-border p-3 sm:p-4 text-right font-semibold text-foreground whitespace-nowrap">{formatCurrency(pricing.pricing?.subtotal || pricing.basePrice)}</td>
                          </tr>
                          {pricing.discountAmount > 0 && (
                            <tr className="hover:bg-green-50/50 dark:hover:bg-green-950/20 transition-colors">
                              <td className="border border-border p-3 sm:p-4 text-green-600 dark:text-green-400 font-medium">Discount</td>
                              <td className="border border-border p-3 sm:p-4 text-right text-green-600 dark:text-green-400 font-medium whitespace-nowrap">-{formatCurrency(pricing.discountAmount)}</td>
                            </tr>
                          )}
                          {pricing.approvedLeavesDeduction > 0 && (
                            <tr className="hover:bg-green-50/50 dark:hover:bg-green-950/20 transition-colors">
                              <td className="border border-border p-3 sm:p-4 text-green-600 dark:text-green-400 font-medium break-words">Approved Leaves Deduction</td>
                              <td className="border border-border p-3 sm:p-4 text-right text-green-600 dark:text-green-400 font-medium whitespace-nowrap">-{formatCurrency(pricing.approvedLeavesDeduction)}</td>
                            </tr>
                          )}
                          {pricing.platformFee > 0 && (
                            <tr className="hover:bg-muted/30 transition-colors">
                              <td className="border border-border p-3 sm:p-4 text-foreground">Platform Fee</td>
                              <td className="border border-border p-3 sm:p-4 text-right text-foreground font-medium whitespace-nowrap">{formatCurrency(pricing.platformFee)}</td>
                            </tr>
                          )}
                          <tr className="bg-gradient-to-r from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 border-2 border-primary/30">
                            <td className="border border-primary/30 p-4 sm:p-5 font-bold text-lg text-foreground">Total Amount</td>
                            <td className="border border-primary/30 p-4 sm:p-5 text-right font-bold text-2xl sm:text-3xl text-primary whitespace-nowrap">{formatCurrency(pricing.pricing?.finalTotal || pricing.basePrice)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 sm:mb-8 text-center py-8 bg-muted/30 rounded-lg border border-border">
                  <p className="text-sm sm:text-base text-muted-foreground">Pricing information will be calculated when a plan is selected</p>
                </div>
              )}

              {/* Footer Section */}
              <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t-2 border-border">
                <div className="bg-muted/20 dark:bg-muted/10 rounded-lg p-4 sm:p-6 text-center">
                  <p className="font-bold text-foreground text-base sm:text-lg mb-2">SmartMess Platform</p>
                  <p className="text-sm text-muted-foreground mb-3 break-words">This is a computer-generated invoice. No signature required.</p>
                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-muted-foreground">
                    <span>support@smartmess.com</span>
                    <span>•</span>
                    <span>www.smartmess.com</span>
                  </div>
                  <p className="mt-4 text-sm font-medium text-primary">Thank you for using SmartMess!</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceDownload;

