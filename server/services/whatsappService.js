import SiteSettings from '../models/SiteSettings.js';

export const getWhatsAppNumber = async () => {
  const settings = await SiteSettings.findOne();
  return settings?.whatsappNumber || settings?.companyPhone || '+918009363259';
};

export const generateWhatsAppLink = (phone, message = '') => {
  const cleaned = String(phone).replace(/\D/g, '');
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleaned}${message ? `?text=${encoded}` : ''}`;
};

export const getWhatsAppLink = async (message = '') => {
  const phone = await getWhatsAppNumber();
  return generateWhatsAppLink(phone, message);
};
