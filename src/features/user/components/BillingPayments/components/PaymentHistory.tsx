import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { PaymentHistory as PaymentHistoryType } from '../BillingPayments.types';
import { formatCurrency } from '../BillingPayments.utils';

interface PaymentHistoryProps {
  transactions: PaymentHistoryType[];
  loading?: boolean;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ transactions, loading = false }) => {
  const getStatusIcon = (status: PaymentHistoryType['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'refunded':
        return <ArrowPathIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      default:
        return <ClockIcon className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: PaymentHistoryType['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800">
            Failed
          </Badge>
        );
      case 'refunded':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800">
            Refunded
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const getMethodLabel = (method: PaymentHistoryType['method']) => {
    const methodLabels: Record<PaymentHistoryType['method'], string> = {
      upi: 'UPI',
      online: 'Online',
      cash: 'Cash',
      bank_transfer: 'Bank Transfer',
      cheque: 'Cheque'
    };
    return methodLabels[method] || method;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="rounded-xl border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5 text-primary" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="text-muted-foreground font-medium mt-4">Loading payment history...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="rounded-xl border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5 text-primary" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCardIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground font-medium">No payment history found</p>
            <p className="text-sm text-muted-foreground mt-2">Your payment transactions will appear here once you make a payment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
          <CreditCardIcon className="h-5 w-5 text-primary" />
          Payment History
          <Badge variant="secondary" className="ml-2">
            {transactions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Left side - Transaction details */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(transaction.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-foreground">{transaction.messName}</h4>
                        {getStatusBadge(transaction.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {transaction.description || 'Payment for meal plan'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground ml-8">
                    <span className="flex items-center gap-1">
                      <CreditCardIcon className="h-3 w-3" />
                      {getMethodLabel(transaction.method)}
                    </span>
                    <span>{formatDate(transaction.paymentDate)}</span>
                    {transaction.transactionId && (
                      <span className="font-mono text-xs">ID: {transaction.transactionId.slice(-8)}</span>
                    )}
                  </div>
                </div>

                {/* Right side - Amount */}
                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      transaction.status === 'completed' 
                        ? 'text-green-600 dark:text-green-400' 
                        : transaction.status === 'failed'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-foreground'
                    }`}>
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;

