export const WHATSAPP_NUMBER = '919363911273';

export const getWhatsAppLink = ({ type, data }) => {
  let message = '';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  if (type === 'product' && data) {
    message = `Hi Gift Yours 👋\n\nI'm interested in this product.\n\nProduct Name: ${data.name}\n\nPrice: ₹${data.price}\n\nProduct Link: ${currentUrl}\n\nCan you please provide more details?\n\nThank you.`;
  } else if (type === 'category' && data) {
    message = `Hi Gift Yours 👋\n\nI'm interested in products from the ${data.name} category.\n\nLink: ${currentUrl}\n\nCan you please provide more details?\n\nThank you.`;
  } else {
    message = `Hi Gift Yours 👋\n\nI have an enquiry regarding your products.\n\nLink: ${currentUrl}\n\nThank you.`;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
};
