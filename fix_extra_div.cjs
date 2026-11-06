const fs = require('fs');

const file = './src/components/NotulenGenerator.tsx';
let content = fs.readFileSync(file, 'utf-8');

// Find exactly:
//           })}
//             </div>
//           </div>
//         </div>
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block">
const target = `          })}
            </div>
          </div>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block">`;

const replacement = `          })}
            </div>
          </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block">`;

content = content.replace(target, replacement);

fs.writeFileSync(file, content);
console.log('Fixed extra div');
