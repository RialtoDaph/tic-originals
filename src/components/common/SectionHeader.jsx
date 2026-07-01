import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable editorial section header used across the app.
 * Layout: big cyan number on the left, label + oversized display title on the right.
 */
export default function SectionHeader({ number, label, title, subtitle, align = 'left', invert = false }) {
  const titleColor = invert ? 'text-white' : 'text-dark-deep';
  const labelColor = invert ? 'text-cyan' : 'text-gray-text';

  return (
    <div className="grid grid-cols-12 gap-6 md:gap-10 mb-12 md:mb-16">
      {number && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="col-span-12 md:col-span-3"
        >
          <p className="font-display text-[100px] md:text-[160px] leading-[0.8] text-cyan/80">{number}</p>
          {label && (
            <p className={`text-[10px] tracking-[0.4em] uppercase mt-2 ${labelColor}`}>{label}</p>
          )}
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className={`col-span-12 ${number ? 'md:col-span-9 md:pt-8' : ''} ${align === 'center' ? 'text-center' : ''}`}
      >
        {!number && label && (
          <p className={`text-[10px] tracking-[0.4em] uppercase mb-4 ${labelColor}`}>{label}</p>
        )}
        <h2 className={`font-display uppercase leading-[0.9] text-4xl md:text-6xl lg:text-7xl ${titleColor}`}>
          {title}
        </h2>
        {subtitle && (
          <p className={`mt-6 max-w-xl text-sm md:text-base ${invert ? 'text-white/70' : 'text-gray-text'}`}>
            {subtitle}
          </p>
        )}
      </motion.div>
    </div>
  );
}