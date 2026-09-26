import { Variants, Transition } from "framer-motion";

// Apple-style Cubic Bezier Easing
export const APPLE_EASE = [0.4, 0, 0.2, 1] as const;

export const DEFAULT_SPRING: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

// 1. Modal Scale Up / Down Variants
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15, ease: APPLE_EASE },
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2, ease: APPLE_EASE },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15, ease: APPLE_EASE },
  },
};

// 2. Backdrop Blur Animation
export const backdropVariants: Variants = {
  hidden: { opacity: 0, backdropFilter: "blur(0px)" },
  visible: { opacity: 1, backdropFilter: "blur(8px)" },
  exit: { opacity: 0, backdropFilter: "blur(0px)" },
};

// 3. Page Fade & Slide Transition
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: APPLE_EASE },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: APPLE_EASE },
  },
};

// 4. List Stagger Animation Container & Items
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: APPLE_EASE },
  },
};

// 5. Toast Slide In From Bottom Right
export const toastVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: APPLE_EASE },
  },
  exit: {
    opacity: 0,
    x: 40,
    scale: 0.9,
    transition: { duration: 0.15, ease: APPLE_EASE },
  },
};

// 6. Accordion / Expandable Content Height Transition
export const accordionVariants: Variants = {
  closed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.25, ease: APPLE_EASE },
  },
  open: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.3, ease: APPLE_EASE },
  },
};

// 7. Micro-Interaction Hover & Tap Presets
export const buttonTapScale = { scale: 0.98 };
export const buttonHoverScale = { scale: 1.015, filter: "brightness(1.1)" };
export const cardHoverScale = { y: -2, filter: "brightness(1.03)" };
