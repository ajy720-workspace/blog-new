'use client'

import { type ReactNode } from 'react'

import { type HTMLMotionProps, motion } from 'framer-motion'

interface MotionWrapperProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
}

export const ButtonMotion = ({ children, ...props }: MotionWrapperProps) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    {...props}
  >
    {children}
  </motion.div>
)

export const SubtleButtonMotion = ({
  children,
  ...props
}: MotionWrapperProps) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    {...props}
  >
    {children}
  </motion.div>
)

export const FadeInMotion = ({ children, ...props }: MotionWrapperProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
    {...props}
  >
    {children}
  </motion.div>
)

export const SlideInMotion = ({ children, ...props }: MotionWrapperProps) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    {...props}
  >
    {children}
  </motion.div>
)

export const ScaleInMotion = ({ children, ...props }: MotionWrapperProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    {...props}
  >
    {children}
  </motion.div>
)
