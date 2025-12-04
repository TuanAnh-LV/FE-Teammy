import { translations } from './src/translations/index.js';

const enKeys = Object.keys(translations.EN);
const vieKeys = Object.keys(translations.VIE);

// Find keys in EN but not in VIE
const missingKeys = enKeys.filter(key => !vieKeys.includes(key));

// Sort missing keys
missingKeys.sort();

console.log('='.repeat(80));
console.log('TRANSLATION ANALYSIS REPORT');
console.log('='.repeat(80));
console.log(`\nEN Total Keys: ${enKeys.length}`);
console.log(`VIE Total Keys: ${vieKeys.length}`);
console.log(`Missing Keys in VIE: ${missingKeys.length}`);
console.log('\n' + '='.repeat(80));
console.log('MISSING KEYS (Exist in EN but NOT in VIE):');
console.log('='.repeat(80) + '\n');

missingKeys.forEach((key, index) => {
  const englishValue = translations.EN[key];
  console.log(`${index + 1}. ${key}`);
  console.log(`   English Value: "${englishValue}"`);
  console.log(`   Status: MISSING in VIE\n`);
});

console.log('='.repeat(80));
console.log(`\nSUMMARY: ${missingKeys.length} keys are missing from VIE object`);
console.log('='.repeat(80));
