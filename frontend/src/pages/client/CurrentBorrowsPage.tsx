import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle,
  CheckSquare,
  Square,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BorrowedBookItem from "../../components/client/BorrowedBookItem";
import ReturnOrderForm from "../../components/client/ReturnOrderForm";
import SummaryCard from "../../components/client/SummaryCard";
import MainButton from "../../components/shared/buttons/MainButton";
import FullScreenSpinner from "../../components/shared/FullScreenSpinner";
import { useGetMe } from "../../hooks/auth/useGetMe";
import { useGetClientBorrows } from "../../hooks/orders/useGetClientBorrows";
import type { IClientBorrows } from "../../types/ReturnOrder";
import { formatMoney } from "../../utils/formatting";

const CurrentBorrowsPage = () => {
  const { clientBorrows, isPending } = useGetClientBorrows();
  const { me } = useGetMe();
  const [selectedBooks, setSelectedBooks] = useState<Set<number>>(new Set());
  const [totalDeposit, setTotalDeposit] = useState(0);
  const [showReturnOrderForm, setShowReturnOrderForm] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const summary = useMemo(() => {
    if (!clientBorrows) return null;

    const now = new Date();
    let totalDeposit = 0;
    let totalBorrowFees = 0;
    let totalDelayFees = 0;
    let overdueBooks = 0;
    let onTimeBooks = 0;
    let totalOverdueDays = 0;

    clientBorrows.forEach((book) => {
      const expectedReturnDate = new Date(book.expected_return_date);
      const isOverdue = now > expectedReturnDate;
      const daysOverdue = isOverdue
        ? Math.ceil(
            (now.getTime() - expectedReturnDate.getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : 0;

      totalDeposit += parseFloat(book.deposit_fees);
      totalBorrowFees += parseFloat(book.borrow_fees);
      totalDelayFees += parseFloat(book.delay_fees_per_day) * daysOverdue;
      totalOverdueDays += daysOverdue;

      if (isOverdue) {
        overdueBooks++;
      } else {
        onTimeBooks++;
      }
    });
    return {
      totalDeposit,
      totalBorrowFees,
      totalDelayFees,
      totalFees: totalBorrowFees + totalDelayFees,
      overdueBooks,
      onTimeBooks,
      totalBooks: clientBorrows.length,
      totalOverdueDays,
    };
  }, [clientBorrows]);

  const handleBookSelection = (
    bookId: IClientBorrows,
    selected: boolean,
    deposit: number,
  ) => {
    const newSelection = new Set(selectedBooks);
    const expectedData = new Date(bookId.expected_return_date);
    const now = new Date();
    if (selected) {
      newSelection.add(bookId.book_details_id);

      if (now > expectedData) {
        const daysOverdue = Math.ceil(
          (now.getTime() - expectedData.getTime()) / (1000 * 60 * 60 * 24),
        );
        const delayFees = parseFloat(bookId.delay_fees_per_day) * daysOverdue;
        setTotalDeposit(totalDeposit - Math.abs(delayFees - deposit));
      } else {
        setTotalDeposit(totalDeposit + deposit);
      }
    } else {
      if (now > expectedData) {
        const daysOverdue = Math.ceil(
          (now.getTime() - expectedData.getTime()) / (1000 * 60 * 60 * 24),
        );
        const delayFees = parseFloat(bookId.delay_fees_per_day) * daysOverdue;
        setTotalDeposit(totalDeposit + Math.abs(delayFees - deposit));
      } else {
        newSelection.delete(bookId.book_details_id);
        setTotalDeposit(totalDeposit - deposit);
      }
    }
    setSelectedBooks(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedBooks.size === clientBorrows?.length) {
      setSelectedBooks(new Set());
      setTotalDeposit(0);
    } else {
      setSelectedBooks(
        new Set(clientBorrows?.map((book) => book.book_details_id) || []),
      );
      setTotalDeposit(
        clientBorrows?.reduce((sum, book) => {
          const expectedData = new Date(book.expected_return_date);
          const now = new Date();

          if (now > expectedData) {
            const daysOverdue = Math.ceil(
              (now.getTime() - expectedData.getTime()) / (1000 * 60 * 60 * 24),
            );
            const delayFees = parseFloat(book.delay_fees_per_day) * daysOverdue;
            return sum - Math.abs(parseFloat(book.deposit_fees) - delayFees);
          }

          return sum + parseFloat(book.deposit_fees);
        }, 0) || 0,
      );
    }
  };

  const handleCreateReturnOrder = () => {
    setShowReturnOrderForm(true);
  };

  const handleReturnOrderSuccess = () => {
    setSelectedBooks(new Set());
    setShowReturnOrderForm(false);
    queryClient.invalidateQueries({
      queryKey: ["userReturnOrders", `${me!.id}`],
    });
    navigate("/orders-history?tab=returnOrders");
  };

  const summaryCards = [
    {
      label: "Total Books",
      value: summary?.totalBooks,
      icon: <BookOpen />,
      color: "primary",
    },
    {
      label: "On Time",
      value: summary?.onTimeBooks,
      icon: <CheckCircle />,
      color: "success",
    },
    {
      label: "Overdue",
      value: summary?.overdueBooks,
      icon: <AlertTriangle />,
      color: "error",
    },
    {
      label: "Total Overdue Days",
      value: summary?.totalOverdueDays,
      icon: <Calendar />,
      color: "secondary",
    },
  ];

  if (isPending) return <FullScreenSpinner />;

  if (!clientBorrows || clientBorrows.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <BookOpen className="h-16 w-16 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-600">
          No Borrowed Books
        </h2>
        <p className="text-gray-500">You haven't borrowed any books yet.</p>
      </div>
    );
  }

  const selectedBooksData = clientBorrows.filter((book) =>
    selectedBooks.has(book.book_details_id),
  );

  return (
    <div className="container mx-auto">
      {/* Page Header */}
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Current Borrows</h1>

      {/* Summary Cards */}
      {summary && (
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <SummaryCard
              key={card.label}
              label={card.label}
              value={card.value}
              icon={card.icon}
              color={card.color}
            />
          ))}
        </div>
      )}

      {/* Pricing Summary */}
      {summary && (
        <div className="bg-accent mb-8 rounded-lg p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Pricing Summary
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-white p-4">
              <p className="text-sm font-medium text-gray-600">
                Total Borrow Fees
              </p>
              <p className="text-primary text-xl font-bold">
                {formatMoney(summary.totalBorrowFees.toString())} EGP
              </p>
            </div>
            <div className="rounded-lg bg-white p-4">
              <p className="text-sm font-medium text-gray-600">Total Deposit</p>
              <p className="text-primary text-xl font-bold">
                {formatMoney(summary.totalDeposit.toString())} EGP
              </p>
            </div>
            <div className="rounded-lg bg-white p-4">
              <p className="text-sm font-medium text-gray-600">
                Total Delay Fees
              </p>
              <p className="text-primary text-xl font-bold">
                {formatMoney(summary.totalDelayFees.toString())} EGP
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="mb-6 flex flex-col items-start justify-between space-y-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:space-y-0">
        <div className="flex h-10 items-center space-x-4">
          <button
            type="button"
            onClick={handleSelectAll}
            className="flex w-full items-center gap-2 rounded px-1 py-1 text-left text-sm text-gray-800 hover:bg-gray-50"
          >
            {selectedBooks.size === clientBorrows.length ? (
              <CheckSquare className="text-primary h-5 w-5" />
            ) : (
              <Square className="h-5 w-5 text-gray-400" />
            )}
            <span className="text-sm font-medium text-gray-700">
              Select All ({selectedBooks.size}/{clientBorrows.length})
            </span>
          </button>
        </div>

        {selectedBooks.size > 0 && (
          <div className="flex items-center space-x-3">
            <div className="whitespace-nowrap">
              <span className="text-sm text-gray-600">
                {selectedBooks.size} book{selectedBooks.size !== 1 ? "s" : ""}{" "}
                selected
              </span>
              <span className="text-sm text-gray-600">
                {" "}
                - Refund: {formatMoney(totalDeposit.toString())} EGP
              </span>
            </div>
            <MainButton
              onClick={handleCreateReturnOrder}
              className="flex items-center space-x-2"
            >
              Create Return Order
            </MainButton>
          </div>
        )}
      </div>

      {/* Books List */}
      <div className="space-y-4">
        {clientBorrows.map((borrowedBook) => (
          <BorrowedBookItem
            key={borrowedBook.book_details_id}
            borrowedBook={borrowedBook}
            isSelected={selectedBooks.has(borrowedBook.book_details_id)}
            onSelect={handleBookSelection}
          />
        ))}
      </div>

      {/* Return Order Form Modal */}
      {showReturnOrderForm && (
        <ReturnOrderForm
          selectedBooks={selectedBooksData}
          onClose={() => setShowReturnOrderForm(false)}
          onSuccess={handleReturnOrderSuccess}
        />
      )}
    </div>
  );
};

export default CurrentBorrowsPage;
