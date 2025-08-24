import { motion } from "framer-motion";
import heroBookImage from "../../assets/hero-book.png";
import MainButton from "../shared/buttons/MainButton";
import heroHexagon from "../../assets/hero-Hexagon.png";
import heroShape from "../../assets/hero-shape.png";
import { useNavigate } from "react-router-dom";

// Create a motion-wrapped version of MainButton
const MotionMainButton = motion(MainButton);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

const floatingVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 0.7,
    scale: 1,
    y: [0, -15, 0],
    transition: {
      opacity: { duration: 1, delay: 0.8 },
      scale: { duration: 1, delay: 0.8 },
      y: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  },
};

const rotatingVariants = {
  initial: { opacity: 0, rotate: -45 },
  animate: {
    opacity: 1,
    rotate: [0, 5, 0, -5, 0],
    transition: {
      opacity: { duration: 1.2, delay: 1 },
      rotate: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  },
};

const bookImageVariants = {
  hidden: { opacity: 0, x: 100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 1,
      ease: "easeOut" as const,
      delay: 0.5,
    },
  },
};

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex h-[calc(100vh-80px)] w-full items-center bg-[url('./assets/hero-book-section.png')]"
    >
      <div className="relative container mx-auto flex h-full items-center justify-between">
        <motion.div variants={itemVariants}>
          <motion.h6
            variants={itemVariants}
            className="moon-dance-regular text-secondary text-3xl"
          >
            Explore the books
          </motion.h6>
          <motion.h1
            variants={itemVariants}
            className="text-primary mb-[30px] text-[74px] leading-[90px] font-[700]"
          >
            Expand Your Mind <br />
            Reading a Book
          </motion.h1>
          <motion.div variants={itemVariants}>
            <MotionMainButton
              onClick={() => navigate("/borrow-books")}
              className="!w-[200px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start now
            </MotionMainButton>
          </motion.div>
        </motion.div>

        <motion.img
          src={heroBookImage}
          alt="books"
          className="absolute right-0 bottom-0 hidden lg:block"
          variants={bookImageVariants}
        />

        <motion.img
          src={heroHexagon}
          alt="Hexagon"
          className="absolute top-40 left-1/2 opacity-70"
          initial="initial"
          animate="animate"
          variants={floatingVariants}
        />

        <motion.img
          src={heroShape}
          alt="shape"
          className="absolute top-20 left-[30%]"
          initial="initial"
          animate="animate"
          variants={rotatingVariants}
        />
      </div>
    </motion.section>
  );
}
