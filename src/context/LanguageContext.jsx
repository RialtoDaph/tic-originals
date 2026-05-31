import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    nav: { shop: 'Shop', about: 'About', contact: 'Contact', faq: 'FAQ', cart: 'Cart' },
    hero: { subtitle: 'TILL I COLLAPSE', cta: 'Shop Now', announcement: 'Free shipping on orders over €80' },
    products: { title: 'Products', all: 'All', filter: 'Filter', search: 'Search products...', size: 'Size', color: 'Color', price: 'Price', addToCart: 'Add to Cart', inStock: 'In Stock', lowStock: 'Low Stock', soldOut: 'Sold Out', inclVat: 'incl. VAT' },
    cart: { title: 'Shopping Cart', empty: 'Your cart is empty', subtotal: 'Subtotal', shipping: 'Shipping', total: 'Total', checkout: 'Checkout', remove: 'Remove', free: 'Free', standardShipping: 'Standard Shipping', freeShippingNote: 'Free shipping on orders over €80', quantity: 'Qty' },
    checkout: { title: 'Checkout', shipping: 'Shipping Address', method: 'Shipping Method', payment: 'Payment', review: 'Review', firstName: 'First Name', lastName: 'Last Name', street: 'Street', houseNumber: 'House No.', postalCode: 'Postal Code', city: 'City', country: 'Country', email: 'Email', phone: 'Phone', placeOrder: 'Place Order', back: 'Back', next: 'Continue', standard: 'Standard (2-5 days)', express: 'Express (1-2 days)', stripe: 'Credit/Debit Card', paypal: 'PayPal' },
    order: { confirmation: 'Order Confirmed!', orderNumber: 'Order Number', thankYou: 'Thank you for your order. You will receive a confirmation email shortly.', trackOrder: 'Track Your Order', backToShop: 'Back to Shop' },
    tracking: { title: 'Order Tracking', enterOrder: 'Enter your order number', track: 'Track', status: 'Status', carrier: 'Carrier', trackingNumber: 'Tracking Number', estimatedDelivery: 'Estimated Delivery', notFound: 'Order not found' },
    about: { title: 'About Us', story: 'Our Story' },
    contact: { title: 'Contact Us', name: 'Name', email: 'Email', subject: 'Subject', message: 'Message', send: 'Send Message', sent: 'Message sent successfully!' },
    footer: { newsletter: 'Subscribe to our newsletter', newsletterHeading: 'Newsletter', subscribe: 'Subscribe', legal: 'Legal', impressum: 'Impressum', privacy: 'Privacy Policy', terms: 'Terms & Conditions', followUs: 'Follow Us', service: 'Service', emailPlaceholder: 'Your email address', tagline: 'Till I Collapse — Premium streetwear from Eichstätt, Germany.' },
    common: { germany: 'Germany', close: 'Close', loading: 'Loading...', error: 'An error occurred' },
    status: { pending: 'Pending', confirmed: 'Confirmed', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled', returned: 'Returned' }
  },
  de: {
    nav: { shop: 'Shop', about: 'Über uns', contact: 'Kontakt', faq: 'FAQ', cart: 'Warenkorb' },
    hero: { subtitle: 'TILL I COLLAPSE', cta: 'Jetzt shoppen', announcement: 'Kostenloser Versand ab €80' },
    products: { title: 'Produkte', all: 'Alle', filter: 'Filter', search: 'Produkte suchen...', size: 'Größe', color: 'Farbe', price: 'Preis', addToCart: 'In den Warenkorb', inStock: 'Auf Lager', lowStock: 'Wenig Lager', soldOut: 'Ausverkauft', inclVat: 'inkl. MwSt.' },
    cart: { title: 'Warenkorb', empty: 'Dein Warenkorb ist leer', subtotal: 'Zwischensumme', shipping: 'Versand', total: 'Gesamt', checkout: 'Zur Kasse', remove: 'Entfernen', free: 'Kostenlos', standardShipping: 'Standardversand', freeShippingNote: 'Kostenloser Versand ab €80', quantity: 'Anz.' },
    checkout: { title: 'Kasse', shipping: 'Lieferadresse', method: 'Versandart', payment: 'Zahlung', review: 'Überprüfung', firstName: 'Vorname', lastName: 'Nachname', street: 'Straße', houseNumber: 'Hausnr.', postalCode: 'PLZ', city: 'Stadt', country: 'Land', email: 'E-Mail', phone: 'Telefon', placeOrder: 'Bestellung aufgeben', back: 'Zurück', next: 'Weiter', standard: 'Standard (2-5 Tage)', express: 'Express (1-2 Tage)', stripe: 'Kredit-/Debitkarte', paypal: 'PayPal' },
    order: { confirmation: 'Bestellung bestätigt!', orderNumber: 'Bestellnummer', thankYou: 'Vielen Dank für Ihre Bestellung. Sie erhalten in Kürze eine Bestätigungs-E-Mail.', trackOrder: 'Bestellung verfolgen', backToShop: 'Zurück zum Shop' },
    tracking: { title: 'Bestellverfolgung', enterOrder: 'Geben Sie Ihre Bestellnummer ein', track: 'Verfolgen', status: 'Status', carrier: 'Versanddienstleister', trackingNumber: 'Sendungsnummer', estimatedDelivery: 'Voraussichtliche Lieferung', notFound: 'Bestellung nicht gefunden' },
    about: { title: 'Über uns', story: 'Unsere Geschichte' },
    contact: { title: 'Kontakt', name: 'Name', email: 'E-Mail', subject: 'Betreff', message: 'Nachricht', send: 'Nachricht senden', sent: 'Nachricht erfolgreich gesendet!' },
    footer: { newsletter: 'Abonniere unseren Newsletter', newsletterHeading: 'Newsletter', subscribe: 'Abonnieren', legal: 'Rechtliches', impressum: 'Impressum', privacy: 'Datenschutz', terms: 'AGB', followUs: 'Folge uns', service: 'Service', emailPlaceholder: 'Deine E-Mail-Adresse', tagline: 'Till I Collapse — Premium Streetwear aus Eichstätt, Deutschland.' },
    common: { germany: 'Deutschland', close: 'Schließen', loading: 'Laden...', error: 'Ein Fehler ist aufgetreten' },
    status: { pending: 'Ausstehend', confirmed: 'Bestätigt', processing: 'In Bearbeitung', shipped: 'Versendet', delivered: 'Zugestellt', cancelled: 'Storniert', returned: 'Retourniert' }
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('tic_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('tic_lang', lang);
  }, [lang]);

  const t = (path) => {
    const keys = path.split('.');
    let value = translations[lang];
    for (const key of keys) {
      value = value?.[key];
    }
    return value || path;
  };

  const toggleLang = () => setLang(l => l === 'en' ? 'de' : 'en');

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);