/**
 * Valida un CUIT/CUIL argentino mediante el algoritmo oficial de Módulo 11 (AFIP).
 */
export function isValidCuit(cuit: string): boolean {
  if (!cuit || cuit.trim() === '') return true;
  const cleanCuit = cuit.replace(/\D/g, '');

  if (cleanCuit.length !== 11) return false;

  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCuit[i], 10) * multipliers[i];
  }

  const mod = sum % 11;
  let calculatedDigit = 11 - mod;
  if (calculatedDigit === 11) calculatedDigit = 0;
  if (calculatedDigit === 10) calculatedDigit = 9;

  const actualDigit = parseInt(cleanCuit[10], 10);
  return calculatedDigit === actualDigit;
}

/**
 * Valida formato de correo electrónico.
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}
