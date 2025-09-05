import Decimal from "decimal.js";
import { motion, type Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { SwiperSlide } from "swiper/react";
import "../../../node_modules/swiper/modules/navigation.css";
import "../../../node_modules/swiper/modules/pagination.css";
import "../../../node_modules/swiper/swiper.css";
import { useGetBestSeller } from "../../hooks/books/useGetBestSeller";
import { useGetSettings } from "../../hooks/books/useGetSettings";
import { formatMoney } from "../../utils/formatting";
import Spinner from "../shared/Spinner";
import HomeSlider from "./HomeSlider";

const BestBooks = () => {
  const navigate = useNavigate();

  const {
    bestBooksData,
    isPending: isBestBooksPending,
    error: bestBooksError,
  } = useGetBestSeller();
  const { settings, isPending: isSettingsPending } = useGetSettings();

  const isLoading = isBestBooksPending || isSettingsPending;

  const borrowBooks = bestBooksData?.borrow_books || [];
  const purchaseBooks = bestBooksData?.purchase_books || [];

  return (
    <motion.section
      className="bg-gradient-to-br from-gray-50 to-white py-12 pt-30 md:py-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      variants={containerVariants}
    >
      <div className="container mx-auto">
        <div className="flex flex-col gap-16 md:gap-20">
          {/* Best Borrow Books */}
          <motion.div
            variants={sectionVariants}
            className="flex flex-col justify-center"
          >
            {isLoading ? (
              <Spinner size={200} />
            ) : bestBooksError ? (
              <div className="py-12 text-center">
                <p className="text-gray-500">Unable to load popular books</p>
              </div>
            ) : (
              <HomeSlider
                title="Best Borrowed Books"
                to="/borrow-books"
                containerClassName="!my-0"
              >
                {borrowBooks.map((book) => (
                  <SwiperSlide
                    key={book.book.id}
                    onClick={() => {
                      navigate(`/details/borrow/${book.book.book_details_id}`);
                    }}
                    className="cursor-pointer pb-4"
                  >
                    <motion.div
                      variants={itemVariants}
                      className="group h-[350px] rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="mb-3 aspect-3/4 h-52 w-full overflow-hidden rounded-lg bg-gray-50">
                        <img
                          src={book.book.cover_img}
                          alt={book.book.title}
                          className="h-full w-full object-contain object-center transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                      </div>
                      <div className="text-center">
                        {book.book.author_name && (
                          <p className="truncate text-xs text-gray-500 sm:text-sm">
                            {book.book.author_name}
                          </p>
                        )}
                        <p className="text-primary mt-1 truncate text-base font-semibold sm:text-lg">
                          {book.book.title}
                        </p>
                        <p className="text-secondary mt-1 text-sm font-medium">
                          {formatMoney(
                            new Decimal(book.book.price)
                              .mul(settings?.borrow_perc || 0)
                              .div(100)
                              .toString(),
                          )}{" "}
                          EGP/Week
                        </p>
                        {book.total_count > 0 && (
                          <p className="mt-1 text-xs text-gray-400">
                            Borrowed {book.total_count}{" "}
                            {book.total_count > 1 ? "times" : "time"}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </SwiperSlide>
                ))}
              </HomeSlider>
            )}
          </motion.div>

          {/* Best Purchase Books */}
          <motion.div
            variants={sectionVariants}
            className="flex flex-col justify-center"
          >
            {isLoading ? (
              <Spinner size={200} />
            ) : bestBooksError ? (
              <div className="py-12 text-center">
                <p className="text-gray-500">Unable to load popular books</p>
              </div>
            ) : (
              <HomeSlider
                title="Best Selling Books"
                to="/purchase-books"
                containerClassName="!my-0"
              >
                {purchaseBooks.map((book) => (
                  <SwiperSlide
                    key={book.book.id}
                    onClick={() => {
                      navigate(
                        `/details/purchase/${book.book.book_details_id}`,
                      );
                    }}
                    className="cursor-pointer pb-4"
                  >
                    <motion.div
                      variants={itemVariants}
                      className="group h-[350px] rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="mb-3 aspect-3/4 h-52 w-full overflow-hidden rounded-lg bg-gray-50">
                        <img
                          src={book.book.cover_img}
                          alt={book.book.title}
                          className="h-full w-full object-contain object-center transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                      </div>

                      <div className="text-center">
                        {book.book.author_name && (
                          <p className="truncate text-xs text-gray-500 sm:text-sm">
                            {book.book.author_name}
                          </p>
                        )}
                        <p className="text-primary mt-1 truncate text-base font-semibold sm:text-lg">
                          {book.book.title}
                        </p>
                        <p className="text-secondary mt-1 text-sm font-medium">
                          {book.book.price} EGP
                        </p>
                        {book.total_count > 0 && (
                          <p className="mt-1 text-xs text-gray-400">
                            Sold {book.total_count}{" "}
                            {book.total_count > 1 ? "copies" : "copy"}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </SwiperSlide>
                ))}
              </HomeSlider>
            )}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default BestBooks;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const sectionVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};
