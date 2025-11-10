import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CommonHeader } from '@/components/common/Header/CommonHeader'
import messOwnerService from '@/services/api/messOwnerService'
import { billingService } from '@/services/api/billingService'
import { StatCard } from './StatCard'
import { formatCurrency, formatDate, getStatusColor, getStatusIcon, getStatusText } from '../BillingPayments.utils'
import {
  EnvelopeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  BanknotesIcon,
  CreditCardIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

const BillingMemberDetail: React.FC = () => {
  // const { membershipId } = useParams() // Unused
  const navigate = useNavigate()
  const location = useLocation() as any
  const member = location?.state?.member
  // const summary = location?.state?.summary // Unused
  const [bills] = React.useState<any[]>(location?.state?.bills || [])
  const [transactions, setTransactions] = React.useState<any[]>(location?.state?.transactions || [])
  const [memberExtra, setMemberExtra] = React.useState<any>({})

  // Feature flag: enable remote fetch for richer details only when backend route exists
  const enableRemoteDetailFetch = (import.meta as any)?.env?.VITE_ENABLE_MEMBER_DETAIL_FETCH === 'true';

  // Fetch richer details if not provided via navigation
  React.useEffect(() => {
    if (!enableRemoteDetailFetch) return;
    const load = async () => {
      try {
        const userId = member?.userId
        if (!userId) return

        // 1) Fetch extra member details (may include plan dates, leave history)
        try {
          const res = await messOwnerService.getMemberDetails(userId)
          if (res?.success && res?.data) {
            setMemberExtra(res.data)
          }
        } catch {}

        // 2) Fetch payment history if transactions missing
        if (!transactions || transactions.length === 0) {
          try {
            const hist = await billingService.getPaymentHistory(userId)
            if (hist?.success && Array.isArray(hist.data)) {
              setTransactions(hist.data)
            }
          } catch {}
        }
      } catch {}
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member?.userId, enableRemoteDetailFetch])

  if (!member) {
    return (
      <div className="flex items-center justify-center min-h-screen lg:ml-72">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Member information not found</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  // const pendingBills = bills.filter((b: any) => b.status === 'pending' || b.status === 'overdue') // Unused
  const paidBills = bills.filter((b: any) => b.status === 'paid')
  const totalPaid = transactions
    .filter((t: any) => t.status === 'completed' || t.status === 'paid')
    .reduce((sum: number, t: any) => sum + (t.amount || 0), 0)

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-2 sm:p-4">
      <CommonHeader
        title="Member Billing Detail"
        subtitle={`${member.userName || 'Member'} - Complete billing information`}
        variant="default"
        onBack={() => navigate(-1)}
      />

      {/* Member Info Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          title="Current Amount"
          value={formatCurrency(member.amount || 0)}
          icon={<CurrencyDollarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />}
          accentBgClassName="bg-blue-100 dark:bg-blue-900/20"
          helperTop={<span className="text-xs text-muted-foreground">Outstanding</span>}
          valueClassName={member.paymentStatus === 'overdue' ? 'text-red-600 dark:text-red-400' : member.paymentStatus === 'paid' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}
        />
        <StatCard
          title="Status"
          value={<Badge className={`${getStatusColor(member.paymentStatus)} text-xs sm:text-sm px-2 py-1`}>
            {getStatusIcon(member.paymentStatus)} {getStatusText(member.paymentStatus)}
          </Badge>}
          icon={<ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400" />}
          accentBgClassName="bg-yellow-100 dark:bg-yellow-900/20"
          helperTop={member.daysOverdue && member.daysOverdue > 0 ? (
            <span className="text-xs text-red-600 dark:text-red-400">{member.daysOverdue} days overdue</span>
          ) : null}
        />
        <StatCard
          title="Total Paid"
          value={formatCurrency(totalPaid)}
          icon={<CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />}
          accentBgClassName="bg-green-100 dark:bg-green-900/20"
          helperTop={<span className="text-xs text-muted-foreground">{paidBills.length} bills paid</span>}
        />
        <StatCard
          title="Leave Days"
          value={member.leaveDays || 0}
          icon={<CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />}
          accentBgClassName="bg-purple-100 dark:bg-purple-900/20"
          helperTop={<span className="text-xs text-muted-foreground">Leave credits</span>}
        />
      </div>

      {/* Member Details Card */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {(member.userName || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl text-foreground">{member.userName || 'Unknown User'}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Member Information</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <EnvelopeIcon className="h-4 w-4" />
                Contact Information
              </div>
              <div className="space-y-2 pl-6">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Email</div>
                  <div className="text-sm font-medium text-foreground">{member.userEmail || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Phone</div>
                  <div className="text-sm font-medium text-foreground">{member.userPhone || 'N/A'}</div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <DocumentTextIcon className="h-4 w-4" />
                Plan Details
              </div>
              <div className="space-y-2 pl-6">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Plan Name</div>
                  <Badge variant="secondary" className="text-xs font-medium">
                    {member.planName || 'N/A'}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Payment Method</div>
                  <div className="text-sm font-medium text-foreground">
                    {member.paymentMethod ? (
                      <Badge variant="outline" className="text-xs">
                        {member.paymentMethod.toUpperCase()}
                      </Badge>
                    ) : (
                      'Not specified'
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                  <div className="text-xs text-muted-foreground mb-1">Start Date</div>
                    <div className="text-sm font-medium text-foreground">
                      {member.planStartDate ? formatDate(member.planStartDate) : (member.startDate ? formatDate(member.startDate) : (memberExtra.planStartDate ? formatDate(memberExtra.planStartDate) : 'N/A'))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">End Date</div>
                    <div className="text-sm font-medium text-foreground">
                      {member.planEndDate ? formatDate(member.planEndDate) : (member.endDate ? formatDate(member.endDate) : (memberExtra.planEndDate ? formatDate(memberExtra.planEndDate) : 'N/A'))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                Important Dates
              </div>
              <div className="space-y-2 pl-6">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Due Date</div>
                  <div className="text-sm font-medium text-foreground">
                    {member.dueDate ? formatDate(member.dueDate) : 'N/A'}
                  </div>
                </div>
                {member.lastPaymentDate && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Last Payment</div>
                    <div className="text-sm font-medium text-foreground">
                      {formatDate(member.lastPaymentDate)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bills and Payments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Bills */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <DocumentTextIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg text-foreground">Recent Bills</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                    {bills.length} total bills
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {bills.length === 0 ? (
              <div className="p-6 text-center">
                <DocumentTextIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No bills found</p>
              </div>
            ) : (
              <div className="space-y-0 divide-y divide-border">
                {bills.slice(0, 5).map((bill: any) => (
                  <div key={bill.id} className="p-3 sm:p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">
                            {formatCurrency(bill.amount)}
                          </span>
                          <Badge className={`${getStatusColor(bill.status)} text-[10px] px-2 py-0.5`}>
                            {getStatusIcon(bill.status)} {getStatusText(bill.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{formatDate(bill.createdAt)}</span>
                          {bill.dueDate && (
                            <>
                              <span>•</span>
                              <span>Due: {formatDate(bill.dueDate)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {bills.length > 5 && (
                  <div className="p-3 text-center border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Showing 5 of {bills.length} bills
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <BanknotesIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg text-foreground">Payment History</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                    {transactions.length} transactions
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {transactions.length === 0 ? (
              <div className="p-6 text-center">
                <BanknotesIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No payment history</p>
              </div>
            ) : (
              <div className="space-y-0 divide-y divide-border">
                {transactions.slice(0, 5).map((transaction: any) => (
                  <div key={transaction.id} className="p-3 sm:p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">
                            {formatCurrency(transaction.amount)}
                          </span>
                          <Badge className={`${getStatusColor(transaction.status)} text-[10px] px-2 py-0.5`}>
                            {getStatusIcon(transaction.status)} {getStatusText(transaction.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          <CreditCardIcon className="h-3 w-3" />
                          <span>{transaction.method?.toUpperCase() || 'N/A'}</span>
                          <span>•</span>
                          <CalendarIcon className="h-3 w-3" />
                          <span>{formatDate(transaction.createdAt)}</span>
                        </div>
                        {transaction.transactionId && (
                          <div className="text-xs text-muted-foreground mt-1">
                            TXN: {transaction.transactionId}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {transactions.length > 5 && (
                  <div className="p-3 text-center border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Showing 5 of {transactions.length} transactions
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Adjustments & Notes */}
      {/* Leaves Section */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base sm:text-lg text-foreground flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Leaves
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
            Approved leaves and credits reflected in billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Array.isArray(member.leaveHistory) && member.leaveHistory.length > 0 ? (
            <div className="space-y-3">
              {member.leaveHistory
                .filter((l: any) => (l.status || '').toLowerCase() === 'approved')
                .map((l: any, idx: number) => (
                  <div key={l.id || idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm font-medium text-foreground">
                      {formatDate(l.startDate)} — {formatDate(l.endDate)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {typeof l.days === 'number' ? `${l.days} day${l.days === 1 ? '' : 's'}` : ''}
                    </div>
                  </div>
                ))}
            </div>
          ) : Array.isArray(memberExtra.leaveHistory) && memberExtra.leaveHistory.length > 0 ? (
            <div className="space-y-3">
              {memberExtra.leaveHistory
                .filter((l: any) => (l.status || '').toLowerCase() === 'approved')
                .map((l: any, idx: number) => (
                  <div key={l.id || idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm font-medium text-foreground">
                      {formatDate(l.startDate)} — {formatDate(l.endDate)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {typeof l.days === 'number' ? `${l.days} day${l.days === 1 ? '' : 's'}` : ''}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No approved leaves found</div>
          )}
        </CardContent>
      </Card>

      {/* Adjustments & Notes */}
      {member.adjustments && member.adjustments.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg text-foreground flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <DocumentTextIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              Billing Adjustments
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">
              Leave credits, discounts, and other adjustments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {member.adjustments.map((adj: any) => (
                <div key={adj.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{adj.reason}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDate(adj.appliedAt)} • {adj.type.replace('_', ' ')}
                    </div>
                  </div>
                  <div className={`text-sm font-semibold ${adj.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {adj.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(adj.amount))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes Section */}
      {member.notes && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg text-foreground flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5 text-muted-foreground" />
              Additional Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground whitespace-pre-wrap">{member.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default BillingMemberDetail
