/**
 * Converts a number to its French word representation.
 * Specifically tailored for currency (Dinars Algériens).
 */

const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

function convertLessThanThousand(n: number): string {
  if (n === 0) return '';

  let res = '';

  // Hundreds
  if (n >= 100) {
    const h = Math.floor(n / 100);
    if (h > 1) {
      res += units[h] + ' cent';
      if (n % 100 === 0) res += 's';
    } else {
      res += 'cent';
    }
    n %= 100;
    if (n > 0) res += ' ';
  }

  // Tens and Units
  if (n >= 20) {
    const t = Math.floor(n / 10);
    const u = n % 10;
    
    if (t === 7 || t === 9) {
      res += tens[t - 1];
      if (u === 1) res += ' et';
      res += ' ' + teens[u];
    } else {
      res += tens[t];
      if (u === 1) res += ' et un';
      else if (u > 1) res += ' ' + units[u];
    }
  } else if (n >= 10) {
    res += teens[n - 10];
  } else if (n > 0) {
    res += units[n];
  }

  return res.trim();
}

function convertLargeNumber(n: number): string {
  if (n === 0) return '';
  
  if (n >= 1000000) {
    const m = Math.floor(n / 1000000);
    const rest = n % 1000000;
    let res = convertLessThanThousand(m) + ' million';
    if (m > 1) res += 's';
    if (rest > 0) res += ' ' + convertLargeNumber(rest);
    return res.trim();
  }
  
  if (n >= 1000) {
    const k = Math.floor(n / 1000);
    const rest = n % 1000;
    let res = '';
    if (k > 1) {
      res += convertLessThanThousand(k) + ' mille';
    } else {
      res += 'mille';
    }
    if (rest > 0) res += ' ' + convertLessThanThousand(rest);
    return res.trim();
  }
  
  return convertLessThanThousand(n);
}

export function numberToWords(n: number): string {
  if (n === 0) return 'Zéro dinar';

  const integerPart = Math.floor(n);
  const decimalPart = Math.round((n - integerPart) * 100);

  let res = convertLargeNumber(integerPart);

  res = res.trim() + ' dinar';
  if (integerPart > 1) res += 's';

  if (decimalPart > 0) {
    res += ' et ' + convertLessThanThousand(decimalPart) + ' centime';
    if (decimalPart > 1) res += 's';
  }

  return res.charAt(0).toUpperCase() + res.slice(1);
}
