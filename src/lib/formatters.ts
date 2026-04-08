export const formatPrice = (price: number): string => {
  // Return the integer part of the price, removing the "mieles" factor
  return Math.floor(price).toString();
};
