import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';

import { HTMLMotionProps } from 'motion/react';

interface MagneticButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'gold' | 'outline-gold' | 'default';
  children: React.ReactNode;
}

export default function MagneticButton({ children, variant = 'default', className = '', ...props }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.1, y: middleY * 0.1 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'gold':
        return 'btn-gold group';
      case 'outline-gold':
        return 'btn-outline-gold group';
      default:
        return '';
    }
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      className={`${getVariantClasses()} ${className} flex items-center justify-center`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
