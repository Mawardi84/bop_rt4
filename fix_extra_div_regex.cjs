const fs = require('fs');

const file = './src/components/NotulenGenerator.tsx';
let content = fs.readFileSync(file, 'utf-8');

// Match `})}` followed by whitespace, then three `</div>`, then `<div className="grid grid-cols-1`
const target = /\}\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*<div className="grid grid-cols-1/;
const replacement = `})}
          </div>
        </div>
      <div className="grid grid-cols-1`;

content = content.replace(target, replacement);

fs.writeFileSync(file, content);
console.log('Fixed extra div regex');
