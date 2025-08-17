interface BorrowedBook {
  id: number;
  title: string;
  cover_img: string;
}

export interface IClientBorrows {
  book_details_id: number;
  borrowing_weeks: number;
  expected_return_date: Date;
  deposit_fees: string;
  borrow_fees: string;
  delay_fees_per_day: string;
  book: BorrowedBook;
}
