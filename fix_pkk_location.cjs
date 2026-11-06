const fs = require('fs');

const file = './src/data/initialData.ts';
let content = fs.readFileSync(file, 'utf-8');

// The user said: "untuk undangan PKK tempat nya Ibu Tistani Subandiyah (Ketua PKK) karena tidak ada anjangsana"
// And the name is "TISNANI SUBANDIYAH" or "Tistani Subandiyah". 
// We will replace all location: 'Kediaman Ibu ...' with location: 'Kediaman Ibu Tisnani Subandiyah',

content = content.replace(/location: 'Kediaman Ibu \.\.\.'/g, "location: 'Kediaman Ibu Tisnani Subandiyah'");

fs.writeFileSync(file, content);
console.log('Fixed initialData.ts');
