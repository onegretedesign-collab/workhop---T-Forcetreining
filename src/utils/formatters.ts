/**
 * Utility functions for form masks, validations, and ticket calculations
 */

export function cleanDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatCPF(value: string): string {
  const digits = cleanDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function validateCPF(cpf: string): boolean {
  const digits = cleanDigits(cpf);
  if (digits.length !== 11) return false;
  // Check for repeated digits like 111.111.111-11
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(digits.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(digits.charAt(10), 10)) return false;

  return true;
}

export function formatPhone(value: string): string {
  const digits = cleanDigits(value).slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export function generateVoucherId(): string {
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  const year = '2026';
  return `KRS-${year}-${randomPart}`;
}

export interface InstallmentOption {
  count: number;
  monthlyAmount: number;
  totalAmount: number;
  label: string;
}

export function calculateInstallments(total: number, maxCount: number = 12): InstallmentOption[] {
  const options: InstallmentOption[] = [];
  for (let i = 1; i <= maxCount; i++) {
    // 1 to 3 installments interest-free, 4+ with standard 1.99% a.m. simulation
    let totalWithInterest = total;
    if (i > 3) {
      const interestRate = 0.015 * (i - 3);
      totalWithInterest = Math.round(total * (1 + interestRate) * 100) / 100;
    }
    const monthly = Math.round((totalWithInterest / i) * 100) / 100;
    options.push({
      count: i,
      monthlyAmount: monthly,
      totalAmount: totalWithInterest,
      label: i <= 3 
        ? `${i}x de ${formatCurrency(monthly)} sem juros` 
        : `${i}x de ${formatCurrency(monthly)} (${formatCurrency(totalWithInterest)})`
    });
  }
  return options;
}
