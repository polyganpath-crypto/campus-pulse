import React, { useState } from 'react';
import {
  IndianRupee,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  Download,
  AlertTriangle,
  Receipt,
  Printer,
  X,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SemesterFeeItem, FeeTransaction } from '../../types';
import { INITIAL_SEMESTER_FEES, INITIAL_FEE_TRANSACTIONS } from '../../data/mockData';

export const FeesTab: React.FC = () => {
  const [feeItems, setFeeItems] = useState<SemesterFeeItem[]>(INITIAL_SEMESTER_FEES);
  const [transactions, setTransactions] = useState<FeeTransaction[]>(INITIAL_FEE_TRANSACTIONS);
  const [showPayModal, setShowPayModal] = useState<boolean>(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<'Net Banking' | 'UPI' | 'Debit Card'>('UPI');
  const [selectedReceipt, setSelectedReceipt] = useState<FeeTransaction | null>(null);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);

  const currentSemFee = feeItems.find((f) => f.semester === 6) || feeItems[0];

  const handleCompletePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amountToPay = currentSemFee.dueBalance;
    if (amountToPay <= 0) return;

    // Update fee balance
    setFeeItems((prev) =>
      prev.map((f) =>
        f.semester === 6
          ? {
              ...f,
              paidAmount: f.totalFee,
              dueBalance: 0,
              status: 'Fully Paid'
            }
          : f
      )
    );

    // Add new transaction
    const newTx: FeeTransaction = {
      id: `tx-${Date.now()}`,
      receiptNumber: `REC-2026-SEM6-F${Math.floor(100 + Math.random() * 900)}`,
      semester: 6,
      amount: amountToPay,
      paymentDate: 'September 21, 2026',
      paymentMode: selectedPaymentMode,
      transactionRef: `REF-${Math.floor(100000000 + Math.random() * 900000000)}`,
      status: 'Success'
    };

    setTransactions((prev) => [newTx, ...prev]);
    setPaymentSuccessMessage(`Payment of ₹${amountToPay.toLocaleString('en-IN')} completed successfully! Transaction Ref: ${newTx.transactionRef}. Receipt generated.`);

    // Confetti celebration
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback if canvas-confetti is mocked
    }

    setTimeout(() => {
      setShowPayModal(false);
      setPaymentSuccessMessage(null);
      setSelectedReceipt(newTx);
    }, 2800);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
              University Accounts & Treasury Wing
            </span>
            <span className="text-xs text-slate-500">Official Fee Portal</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-2">Semester Fees, Reminders & Payment History</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Review detailed semester fee schedules, download automated clearance receipts, track transaction logs, and clear outstanding balances before deadline.
          </p>
        </div>

        {currentSemFee.dueBalance > 0 && (
          <button
            id="open-pay-fee-modal-btn"
            onClick={() => setShowPayModal(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-100 cursor-pointer flex items-center gap-2 self-start md:self-auto shrink-0"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay Due Balance (₹{currentSemFee.dueBalance.toLocaleString('en-IN')})</span>
          </button>
        )}
      </div>

      {/* Automated Payment Reminder & Current Status Strip */}
      <div
        className={`rounded-2xl p-6 border transition-all ${
          currentSemFee.dueBalance > 0
            ? 'bg-gradient-to-r from-rose-900 via-slate-900 to-indigo-950 text-white border-rose-800'
            : 'bg-emerald-900 text-white border-emerald-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              currentSemFee.dueBalance > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {currentSemFee.dueBalance > 0 ? (
                <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/15">
                  Automated Payment Reminder
                </span>
                <span className="text-xs text-slate-300">Semester 6 Term (2025-2026)</span>
              </div>
              <h3 className="text-base font-bold mt-1">
                {currentSemFee.dueBalance > 0
                  ? `Outstanding Balance: ₹${currentSemFee.dueBalance.toLocaleString('en-IN')} is due by ${currentSemFee.dueDate}`
                  : 'All Semester 6 Fees Fully Paid & Cleared!'}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {currentSemFee.dueBalance > 0
                  ? 'Exam hall tickets and official semester grade cards require zero overdue fee balance.'
                  : 'Official no-dues clearance certificate active. Examination hall ticket authorized.'}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-2xl font-black">
              ₹{currentSemFee.paidAmount.toLocaleString('en-IN')} / ₹{currentSemFee.totalFee.toLocaleString('en-IN')}
            </div>
            <span className="text-xs font-semibold text-slate-300">
              {currentSemFee.dueBalance === 0 ? '100% Cleared' : `${((currentSemFee.paidAmount / currentSemFee.totalFee) * 100).toFixed(0)}% Settled`}
            </span>
          </div>
        </div>
      </div>

      {/* Semester 6 Detailed Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Current Semester 6 Fee Structure Breakdown
            </h3>
            <p className="text-xs text-slate-500">Fixed statutory fees approved by Academic Finance Committee</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-800">
            Total Payable: ₹{currentSemFee.totalFee.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Tuition & Faculty</span>
            <div className="text-xl font-bold text-slate-900 mt-1">₹{currentSemFee.tuitionFee.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-slate-400">Core Lecture Modules</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Computing & Cloud Labs</span>
            <div className="text-xl font-bold text-slate-900 mt-1">₹{currentSemFee.labFee.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-slate-400">AWS, GPU & Server Quotas</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Digital Library & Journals</span>
            <div className="text-xl font-bold text-slate-900 mt-1">₹{currentSemFee.libraryFee.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-slate-400">IEEE Xplore & ACM Access</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Campus Amenities & Sports</span>
            <div className="text-xl font-bold text-slate-900 mt-1">₹{currentSemFee.amenitiesFee.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-slate-400">High-speed WiFi & Gym</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Examination & Grading</span>
            <div className="text-xl font-bold text-slate-900 mt-1">₹{currentSemFee.examFee.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-slate-400">Midterm & Terminal CoE</span>
          </div>
        </div>
      </div>

      {/* Payment History & Downloadable Receipts */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-600" />
              Verified Fee Payment History & Receipts
            </h3>
            <p className="text-xs text-slate-500">Official digital receipts verified by University Bursar</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-200 text-slate-700">
            {transactions.length} Transactions Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Receipt No.</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Payment Date</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{tx.receiptNumber}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">Semester {tx.semester}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">₹{tx.amount.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4 text-slate-600">{tx.paymentDate}</td>
                  <td className="py-3.5 px-4">{tx.paymentMode}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{tx.transactionRef}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => setSelectedReceipt(tx)}
                      className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer mx-auto"
                    >
                      <Download className="w-3 h-3" />
                      <span>View Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Online Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Pay Outstanding Semester 6 Fee</h3>
              </div>
              <button
                onClick={() => setShowPayModal(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompletePayment} className="p-6 space-y-4">
              {paymentSuccessMessage ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Payment Processed!</span>
                  </div>
                  <p>{paymentSuccessMessage}</p>
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-indigo-700 font-semibold">Remaining Due Balance:</span>
                      <div className="text-2xl font-black text-indigo-950">₹{currentSemFee.dueBalance.toLocaleString('en-IN')}</div>
                    </div>
                    <span className="text-xs text-indigo-600 font-medium">Installment 2 of 2</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Choose Payment Method:
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {(['UPI', 'Net Banking', 'Debit Card'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setSelectedPaymentMode(mode)}
                          className={`p-2.5 rounded-lg border font-bold transition-all cursor-pointer ${
                            selectedPaymentMode === mode
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedPaymentMode === 'UPI' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Enter UPI ID / VPA:
                      </label>
                      <input
                        type="text"
                        defaultValue="likith@okaxis"
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        required
                      />
                    </div>
                  )}

                  {selectedPaymentMode === 'Net Banking' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Select Bank:
                      </label>
                      <select className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden">
                        <option>HDFC Bank</option>
                        <option>State Bank of India</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                      </select>
                    </div>
                  )}

                  {selectedPaymentMode === 'Debit Card' && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Card Number (XXXX XXXX XXXX 4921)"
                        defaultValue="4242 •••• •••• 4921"
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                        required
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="MM/YY" defaultValue="08/29" className="text-xs p-2.5 rounded-lg border border-slate-300" />
                        <input type="text" placeholder="CVV" defaultValue="•••" className="text-xs p-2.5 rounded-lg border border-slate-300" />
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    🔒 256-bit SSL encrypted transaction with University Payment Gateway. No convenience surcharge.
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPayModal(false)}
                      className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm cursor-pointer"
                    >
                      Confirm Payment of ₹{currentSemFee.dueBalance.toLocaleString('en-IN')}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Printable Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Official University Payment Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="text-center pb-3 border-b border-slate-200">
                <h4 className="font-extrabold uppercase text-slate-900 text-sm">Apex University Finance Office</h4>
                <p className="text-slate-500 text-[11px]">e-Payment Receipt & Clearance Voucher</p>
                <div className="mt-2 font-mono font-bold text-indigo-700">{selectedReceipt.receiptNumber}</div>
              </div>

              <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Name:</span>
                  <strong className="text-slate-900">Likith E.</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Roll Number:</span>
                  <strong className="text-slate-900 font-mono">22CS084</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department & Sem:</span>
                  <strong className="text-slate-900">CSE • Semester {selectedReceipt.semester}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Date:</span>
                  <strong className="text-slate-900">{selectedReceipt.paymentDate}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <strong className="text-slate-900">{selectedReceipt.paymentMode}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gateway Ref:</span>
                  <strong className="text-slate-900 font-mono">{selectedReceipt.transactionRef}</strong>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="font-bold text-slate-800">Total Amount Cleared:</span>
                  <strong className="text-base text-emerald-700 font-black">₹{selectedReceipt.amount.toLocaleString('en-IN')}.00</strong>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 text-center">
                This is a computer-generated voucher. Valid for Examination Hall Ticket Collection.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
