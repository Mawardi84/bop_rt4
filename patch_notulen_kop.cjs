const fs = require('fs');
const file = 'src/components/NotulenGenerator.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
/PEMBERDAYAAN DAN KESEJAHTERAAN KELUARGA \(PKK\)[\s\S]*?KOTA SEMARANG\s*<\/div>/g,
`PEMBERDAYAAN KESEJAHTERAAN KELUARGA<br/>(PKK)
                </div>
                <div className="text-[16px] font-bold uppercase text-slate-900 leading-tight mt-1">
                  RUKUN TETANGGA {profile.rtNumber} RUKUN WARGA {profile.rwNumber}
                </div>
                <div className="text-[16px] font-bold uppercase text-slate-900 leading-tight">
                  KELURAHAN {profile.kelurahan} KECAMATAN {profile.kecamatan}
                </div>
                <div className="text-[16px] font-bold uppercase text-slate-900 leading-tight">
                  KOTA SEMARANG
                </div>`
);

// We also need to fix the other 4 instances in NotulenGenerator.tsx
content = content.replace(
/<div className="text-\[16px\] font-bold uppercase text-slate-900 leading-tight">\s*PEMBERDAYAAN KESEJAHTERAAN KELUARGA<br\/>\(PKK\)\s*<\/div>\s*<div className="text-\[14px\] font-bold uppercase text-slate-900 leading-tight mt-1">\s*RUKUN TETANGGA \{profile\.rtNumber\} RUKUN WARGA \{profile\.rwNumber\}\s*<\/div>\s*<div className="text-\[14px\] font-bold uppercase text-slate-900 leading-tight">\s*KELURAHAN \{profile\.kelurahan\} KECAMATAN \{profile\.kecamatan\}\s*<\/div>\s*<div className="text-\[14px\] font-bold uppercase text-slate-900 leading-tight">\s*KOTA SEMARANG\s*<\/div>/g,
`<div className="text-[16px] font-bold uppercase text-slate-900 leading-tight">
                        PEMBERDAYAAN KESEJAHTERAAN KELUARGA<br/>(PKK)
                      </div>
                      <div className="text-[16px] font-bold uppercase text-slate-900 leading-tight mt-1">
                        RUKUN TETANGGA {profile.rtNumber} RUKUN WARGA {profile.rwNumber}
                      </div>
                      <div className="text-[16px] font-bold uppercase text-slate-900 leading-tight">
                        KELURAHAN {profile.kelurahan} KECAMATAN {profile.kecamatan}
                      </div>
                      <div className="text-[16px] font-bold uppercase text-slate-900 leading-tight">
                        KOTA SEMARANG
                      </div>`
);

fs.writeFileSync(file, content);
