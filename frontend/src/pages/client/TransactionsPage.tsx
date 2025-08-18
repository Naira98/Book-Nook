import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  Calendar,
  ClipboardClock,
  Clock,
  Plus,
} from "lucide-react";
import { useState } from "react";
import Spinner from "../../components/shared/Spinner";
import { useGetMe } from "../../hooks/auth/useGetMe";
import { useCreateCheckoutSession } from "../../hooks/transactions/useCreateCheckoutSession";
import { useGetTransactions } from "../../hooks/transactions/useGetTransactions";
import { TransactionType } from "../../types/Transactions";
import { formatClock, formatMoney } from "../../utils/formatting";
import { groupTransactionsByDate } from "../../utils/transactions";

const TransactionsPage = () => {
  const [activeTab, setActiveTab] = useState<"balance" | "history">("balance");
  const [fundAmount, setFundAmount] = useState<string>("");
  const { me } = useGetMe();
  const { transactions, isPending: isTransactionsPending } = useGetTransactions(
    me!.id,
  );

  const { createCheckoutSession, isPending: isCheckoutPending } =
    useCreateCheckoutSession();

  if (isTransactionsPending) return <Spinner />;

  const addFund = () => {
    const amount = parseFloat(fundAmount) * 100; /* in piaster 100 for 1 EGP */
    if (amount > 0) {
      createCheckoutSession(amount);
    }
  };

  const groupedTransactions = groupTransactionsByDate(transactions || []);

  const formatAmount = (amount: string, type: TransactionType) => {
    const sign = type === TransactionType.ADDING ? "+" : "-";
    const color =
      type === TransactionType.ADDING ? "text-success" : "text-error";
    return (
      <span className={`font-semibold ${color}`}>
        {sign} {formatMoney(amount)} EGP
      </span>
    );
  };

  return (
    <>
      <h1 className="mb-8 text-2xl font-bold">Transactions</h1>

      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("balance")}
            className={`cursor-pointer px-1 pb-4 font-semibold transition-colors duration-200 ${
              activeTab === "balance"
                ? "text-secondary border-secondary border-b"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Balance
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`cursor-pointer px-1 pb-4 font-semibold transition-colors duration-200 ${
              activeTab === "history"
                ? "text-secondary border-secondary border-b"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "balance" && (
        <div className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Account Balance</h2>
          <div className="text-secondary text-3xl font-bold">
            {me!.wallet ? formatMoney(me!.wallet) : "0.00"} EGP
          </div>
          <p className="mt-2 text-gray-600">
            Available balance for transactions
          </p>

          {/* Fund Wallet Section */}
          <div className="mt-8 border-t border-gray-100 pt-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              Fund Your Wallet
            </h3>
            <div className="flex gap-3">
              <div className="flex-1">
                <label htmlFor="fundAmount" className="sr-only">
                  Amount to fund
                </label>
                <div className="relative">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500">
                    EGP
                  </span>
                  <input
                    id="fundAmount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    className="focus:border-b-secondary w-full border-b py-3 pr-6 pl-12 text-gray-900 placeholder-gray-500 focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={addFund}
                disabled={
                  !fundAmount ||
                  parseFloat(fundAmount) <= 0 ||
                  isCheckoutPending
                }
                className="bg-secondary hover:bg-secondary/90 focus:ring-secondary flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-5 w-5" />
                {isCheckoutPending ? "Processing..." : "Fund Wallet"}
              </button>
            </div>
            <p className="mt-2 px-2 text-sm text-gray-500">
              Enter the amount you want to add to your wallet
            </p>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-6">
          {groupedTransactions.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <ClipboardClock className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <p>No transactions found</p>
            </div>
          ) : (
            groupedTransactions.map(([date, dayTransactions]) => (
              <div key={date}>
                <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-400">
                      {date}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {dayTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="px-6 py-4 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-1 items-center gap-4">
                          {/* Transaction Icon */}
                          <div className="flex-shrink-0">
                            {transaction.transaction_type ===
                            TransactionType.ADDING ? (
                              <BanknoteArrowUp className="text-success h-5 w-5" />
                            ) : (
                              <BanknoteArrowDown className="text-error h-5 w-5" />
                            )}
                          </div>

                          {/* Description */}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {transaction.description || "Transaction"}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{formatClock(transaction.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="flex-shrink-0">
                          {formatAmount(
                            transaction.amount,
                            transaction.transaction_type,
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
};

export default TransactionsPage;
