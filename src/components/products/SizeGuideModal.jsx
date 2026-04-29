import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const teeData = [
  { size: 'XS', chest: '86–91', length: '68', shoulder: '42' },
  { size: 'S',  chest: '91–96', length: '70', shoulder: '44' },
  { size: 'M',  chest: '96–101', length: '72', shoulder: '46' },
  { size: 'L',  chest: '101–106', length: '74', shoulder: '48' },
  { size: 'XL', chest: '106–111', length: '76', shoulder: '50' },
  { size: 'XXL', chest: '111–116', length: '78', shoulder: '52' },
];

export default function SizeGuideModal({ onClose }) {
  const { lang } = useLanguage();

  const t = {
    title: lang === 'de' ? 'Größenguide' : 'Size Guide',
    size: lang === 'de' ? 'Größe' : 'Size',
    chest: lang === 'de' ? 'Brust (cm)' : 'Chest (cm)',
    length: lang === 'de' ? 'Länge (cm)' : 'Length (cm)',
    shoulder: lang === 'de' ? 'Schulter (cm)' : 'Shoulder (cm)',
    tip: lang === 'de'
      ? 'Tip: Bei Unklarheit empfehlen wir, eine Größe größer zu bestellen.'
      : 'Tip: When in doubt, we recommend sizing up.',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-white max-w-lg w-full p-8"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-heading text-2xl font-light">{t.title}</h2>
            <button onClick={onClose} className="text-gray-text hover:text-dark"><X className="w-5 h-5" /></button>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-xs tracking-wider uppercase text-gray-text">{t.size}</th>
                <th className="text-center py-2 text-xs tracking-wider uppercase text-gray-text">{t.chest}</th>
                <th className="text-center py-2 text-xs tracking-wider uppercase text-gray-text">{t.length}</th>
                <th className="text-center py-2 text-xs tracking-wider uppercase text-gray-text">{t.shoulder}</th>
              </tr>
            </thead>
            <tbody>
              {teeData.map(row => (
                <tr key={row.size} className="border-b last:border-0 hover:bg-muted transition-colors">
                  <td className="py-3 font-medium">{row.size}</td>
                  <td className="py-3 text-center text-gray-text">{row.chest}</td>
                  <td className="py-3 text-center text-gray-text">{row.length}</td>
                  <td className="py-3 text-center text-gray-text">{row.shoulder}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-xs text-gray-text mt-6 leading-relaxed">{t.tip}</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}