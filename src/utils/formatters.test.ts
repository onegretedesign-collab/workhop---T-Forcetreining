import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanDigits,
  formatCPF,
  validateCPF,
  formatPhone,
  formatCurrency,
  generateVoucherId,
  calculateInstallments,
} from './formatters.js';

test('cleanDigits strips all non-numeric characters', () => {
  assert.equal(cleanDigits('123.456.789-00'), '12345678900');
  assert.equal(cleanDigits('(11) 98765-4321'), '11987654321');
  assert.equal(cleanDigits('abc!@#123'), '123');
});

test('formatCPF formats progressively and caps at 11 digits', () => {
  assert.equal(formatCPF('123'), '123');
  assert.equal(formatCPF('123456'), '123.456');
  assert.equal(formatCPF('12345678901'), '123.456.789-01');
  assert.equal(formatCPF('123456789019999'), '123.456.789-01');
});

test('validateCPF verifies standard CPF check digits and rejects repeated numbers', () => {
  // Repeated digits must fail
  assert.equal(validateCPF('11111111111'), false);
  assert.equal(validateCPF('00000000000'), false);
  assert.equal(validateCPF('123'), false);

  // Known valid test CPF (algorithmically valid)
  // 529.982.247-25 is a known valid algorithmic CPF
  assert.equal(validateCPF('52998224725'), true);
  assert.equal(validateCPF('529.982.247-25'), true);

  // Invalid check digit
  assert.equal(validateCPF('52998224726'), false);
});

test('formatPhone formats standard Brazilian phone numbers', () => {
  assert.equal(formatPhone('11987654321'), '(11) 98765-4321');
  assert.equal(formatPhone('1133334444'), '(11) 3333-4444');
  assert.equal(formatPhone('11'), '(11');
});

test('generateVoucherId formats with expected KRS-2026 prefix', () => {
  const code = generateVoucherId();
  assert.match(code, /^KRS-2026-[A-Z0-9]{5}$/);
});

test('calculateInstallments returns 12 installment tiers', () => {
  const tiers = calculateInstallments(350, 12);
  assert.equal(tiers.length, 12);
  assert.equal(tiers[0].count, 1);
  assert.equal(tiers[0].totalAmount, 350);
  assert.ok(tiers[0].label.includes('sem juros'));
  assert.equal(tiers[2].count, 3);
  assert.ok(tiers[2].label.includes('sem juros'));
});
