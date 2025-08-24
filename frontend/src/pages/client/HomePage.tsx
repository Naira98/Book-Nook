import { motion, type Variants } from "framer-motion";
import { Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { SwiperSlide } from "swiper/react";
import "../../../node_modules/swiper/modules/navigation.css";
import "../../../node_modules/swiper/modules/pagination.css";
import "../../../node_modules/swiper/swiper.css";
import HeroSection from "../../components/home/HeroSection";
import OurServices from "../../components/home/OurServices";
import PromoCodeDiscount from "../../components/home/PromoCodeDiscount";
import FullScreenSpinner from "../../components/shared/FullScreenSpinner";
import HomeSlider from "../../components/shared/HomeSlider";
import { useGetMe } from "../../hooks/auth/useGetMe";
import { useGetBestSeller } from "../../hooks/books/useGetBestSeller";
import { useGetCartItems } from "../../hooks/cart/useGetCartItems";
import Footer from "./Footer";

// Lazy load the recommendations component to prevent blocking
const RecommendationCarousel = lazy(
  () => import("../../components/home/RecommendationCarousel"),
);

// Framer Motion variants for animations with proper typing
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

export default function HomePage() {
  const navigate = useNavigate();

  // Priority 1: Critical user data (highest priority)
  const { me, isPending: isUserPending } = useGetMe();

  // Priority 2: Cart items (depends on user, but still critical)
  const { isPending: isCartPending } = useGetCartItems();

  // Priority 3: Best seller books (important but not critical)
  const {
    bestSellerData,
    isPending: isBestSellerPending,
    error: bestSellerError,
  } = useGetBestSeller();

  // Show loading only for critical requests
  if (isUserPending || isCartPending) {
    return (
      <FullScreenSpinner
        minDisplayTime={3000}
        message="Loading your account..."
      />
    );
  }

  // Show error only for critical requests
  if (!me) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-500">Please log in to continue</p>
        </div>
      </div>
    );
  }

  const borrowBooks = bestSellerData?.borrow_books || [];
  const purchaseBooks = bestSellerData?.purchase_books || [];

  return (
    <>
      <HeroSection />

      {/* Combined Best Borrow and Purchase Books Section */}
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
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 md:text-3xl lg:text-4xl">
                  Best Borrowed Books
                </h2>
                <p className="mt-2 text-base text-gray-600 md:text-lg">
                  Discover our most popular books for borrowing
                </p>
              </div>

              {/* Show loading for best sellers if still pending */}
              {isBestSellerPending ? (
                <div className="flex justify-center py-12">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                    <p className="mt-2 text-sm text-gray-500">
                      Loading popular books...
                    </p>
                  </div>
                </div>
              ) : bestSellerError ? (
                <div className="py-12 text-center">
                  <p className="text-gray-500">Unable to load popular books</p>
                </div>
              ) : (
                <HomeSlider
                  title=""
                  to="/borrow-books"
                  containerClassName="!my-0"
                >
                  {borrowBooks.map((book) => (
                    <SwiperSlide
                      key={book.book.id}
                      onClick={() => {
                        navigate(
                          `/details/borrow/${book.book.book_details_id}`,
                        );
                      }}
                      className="cursor-pointer pb-4"
                    >
                      <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="h-full rounded-lg p-3 transition-colors hover:bg-gray-100 sm:p-4"
                      >
                        <div className="mb-3 aspect-3/4 h-48 w-full overflow-hidden rounded-lg shadow-md sm:h-52 md:h-56">
                          <img
                            src={book.book.cover_img}
                            alt={book.book.title}
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-primary truncate text-base font-semibold sm:text-lg">
                            {book.book.title}
                          </p>
                          {/* Added price display for borrow books */}
                          <p className="text-secondary mt-1 text-sm font-medium">
                            ${book.book.price}/week
                          </p>
                          {book.total_count > 0 && (
                            <p className="mt-1 text-xs text-gray-500">
                              Borrowed {book.total_count} times
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
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 md:text-3xl lg:text-4xl">
                  Best Selling Books
                </h2>
                <p className="mt-2 text-base text-gray-600 md:text-lg">
                  Explore our most purchased books
                </p>
              </div>

              {/* Show loading for best sellers if still pending */}
              {isBestSellerPending ? (
                <div className="flex justify-center py-12">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                    <p className="mt-2 text-sm text-gray-500">
                      Loading popular books...
                    </p>
                  </div>
                </div>
              ) : bestSellerError ? (
                <div className="py-12 text-center">
                  <p className="text-gray-500">Unable to load popular books</p>
                </div>
              ) : (
                <HomeSlider
                  title=""
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
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="h-full rounded-lg p-3 transition-colors hover:bg-gray-100 sm:p-4"
                      >
                        <div className="mb-3 aspect-3/4 h-48 w-full overflow-hidden rounded-lg shadow-md sm:h-52 md:h-56">
                          <img
                            src={book.book.cover_img}
                            alt={book.book.title}
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                        <div className="text-center">
                          <p className="truncate text-xs text-gray-600 sm:text-sm">
                            {book.book.author_name}
                          </p>
                          <p className="text-primary truncate text-base font-semibold sm:text-lg">
                            {book.book.title}
                          </p>
                          {/* Added price display for purchase books */}
                          <p className="text-secondary mt-1 text-sm font-medium">
                            ${book.book.price}
                          </p>
                          {book.total_count > 0 && (
                            <p className="mt-1 text-xs text-gray-500">
                              Sold {book.total_count} copies
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

      {/* Lazy-loaded Recommendations - Lowest Priority */}
      <Suspense
        fallback={
          <div className="bg-[#dce9ed] py-12">
            <div className="mx-auto max-w-7xl px-6">
              <h2 className="mb-10 text-center text-2xl font-bold text-[#0B3460]">
                Recommended For You
              </h2>
              <div className="flex justify-center py-8">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-500">
                    Loading personalized recommendations...
                  </p>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <RecommendationCarousel />
      </Suspense>

      <OurServices />
      <PromoCodeDiscount />

      <Footer />
    </>
  );
}
