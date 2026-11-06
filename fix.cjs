const fs = require('fs');
const file = 'src/components/NotulenGenerator.tsx';
let content = fs.readFileSync(file, 'utf8');

// The issue is that the replacement missed the closing fragment `</>` for the else branch.
// We need to fix the malformed JSX manually.

content = content.replace(/<div className="text-\[18px\] font-bold uppercase text-slate-900 leading-tight mt-1">\s*RT \{profile\.rtNumber\} RW \{profile\.rwNumber\} NGABEAN\s*<\/div>\s*\)\}/g, 
`<div className="text-[18px] font-bold uppercase text-slate-900 leading-tight mt-1">
                        RT {profile.rtNumber} RW {profile.rwNumber} NGABEAN
                      </div>
                    </>
                  )}`);

content = content.replace(/<div className="text-\[18px\] font-bold uppercase text-slate-900 leading-tight mt-1">\s*RT \{profile\.rtNumber\} RW \{profile\.rwNumber\}\s*<\/div>\s*\)\}/g, 
`<div className="text-[18px] font-bold uppercase text-slate-900 leading-tight mt-1">
                        RT {profile.rtNumber} RW {profile.rwNumber}
                      </div>
                    </>
                  )}`);

fs.writeFileSync(file, content);
