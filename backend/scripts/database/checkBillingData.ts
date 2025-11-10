import mongoose from 'mongoose';
import Billing from '../../src/models/Billing';
import Transaction from '../../src/models/Transaction';

const checkBillingData = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/smartmess');
    console.log('Connected to MongoDB');

    const userId = '68f3934eb0fcf35d037c45e4';
    
    const bills = await Billing.find({ userId });
    const transactions = await Transaction.find({ userId });
    
    console.log('Bills found:', bills.length);
    console.log('Transactions found:', transactions.length);
    
    if (bills.length > 0 && bills[0]) {
      console.log('Sample bill:', {
        id: bills[0]._id,
        userId: bills[0].userId,
        messId: bills[0].messId,
        status: bills[0].payment?.status
      });
    }
    
    if (transactions.length > 0 && transactions[0]) {
      console.log('Sample transaction:', {
        id: transactions[0]._id,
        userId: transactions[0].userId,
        messId: transactions[0].messId,
        status: transactions[0].status
      });
    }
    
    // Check all bills and transactions
    console.log('\nAll bills:');
    bills.forEach((bill, index) => {
      console.log(`${index + 1}. Bill ID: ${bill._id}, Status: ${bill.payment?.status}, Amount: ${bill.subscription?.totalAmount}`);
    });
    
    console.log('\nAll transactions:');
    transactions.forEach((txn, index) => {
      console.log(`${index + 1}. Transaction ID: ${txn._id}, Status: ${txn.status}, Amount: ${txn.amount}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

checkBillingData();
