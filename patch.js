const fs = require('fs');
const file = 'src/components/NotulenGenerator.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/<div className="text-\[14px\] font-bold uppercase text-slate-900 leading-tight">\s*PEMERINTAH KOTA SEMARANG\s*<\/div>\s*<div className="text-\[14px\] font-bold uppercase text-slate-900 leading-tight">\s*KECAMATAN \{profile\.kecamatan\}\s*<\/div>\s*<div className="text-\[14px\] font-bold uppercase text-slate-900 leading-tight">\s*KELURAHAN \{profile\.kelurahan\}\s*<\/div>\s*\{meetingType === 'pkk' \? \(\s*<div className="text-\[16px\] font-bold uppercase text-slate-900 leading-tight mt-1">\s*TIM PENGGERAK PKK RT \{profile\.rtNumber\} RW \{profile\.rwNumber\} NGABEAN\s*<\/div>\s*\) : \(/g, 
`{meetingType === 'pkk' ? (
                    <>
                      <div className="text-[16px] font-bold uppercase text-slate-900 leading-tight">
                        PEMBERDAYAAN KESEJAHTERAAN KELUARGA<br/>(PKK)
                      </div>
                      <div className="text-[14px] font-bold uppercase text-slate-900 leading-tight mt-1">
                        RUKUN TETANGGA {profile.rtNumber} RUKUN WARGA {profile.rwNumber}
                      </div>
                      <div className="text-[14px] font-bold uppercase text-slate-900 leading-tight">
                        KELURAHAN {profile.kelurahan} KECAMATAN {profile.kecamatan}
                      </div>
                      <div className="text-[14px] font-bold uppercase text-slate-900 leading-tight">
                        KOTA SEMARANG
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-[14px] font-bold uppercase text-slate-900 leading-tight">
                        PEMERINTAH KOTA SEMARANG
                      </div>
                      <div className="text-[14px] font-bold uppercase text-slate-900 leading-tight">
                        KECAMATAN {profile.kecamatan}
                      </div>
                      <div className="text-[14px] font-bold uppercase text-slate-900 leading-tight">
                        KELURAHAN {profile.kelurahan}
                      </div>`);
                      
content = content.replace(/<div className="text-\[14px\] font-bold uppercase text-slate-900 leading-tight">\s*PEMERINTAH KOTA SEMARANG\s*<\/div>\s*<div className="text-\[14px\] font-bold uppercase text-slate-900 leading-tight">\s*KECAMATAN \{profile\.kecamatan\}\s*<\/div>\s*<div className="text-\[14px\] font-bold uppercase text-slate-900 leading-tight">\s*KELURAHAN \{profile\.kelurahan\}\s*<\/div>\s*\{meetingType === 'pkk' \? \(\s*<div className="text-\[16px\] font-bold uppercase text-slate-900 leading-tight mt-1">\s*TIM PENGGERAK PKK RT \{profile\.rtNumber\} RW \{profile\.rwNumber\}\s*<\/div>\s*\) : \(/g, 
`{meetingType === 'pkk' ? (
                    <>
                      <div className="text-[16px] font-bold uppercase text-slate-900 leading-tight">
                        PEMBERDAYAAN KESEJAHTERAAN KELUARGA<br/>(PKK)
                      </div>
                      <div className="text-[14px] font-bold uppercase text-slate-900 leading-tight mt-1">
                        RUKUN TETANGGA {profile.rtNumber} RUKUN WARGA {profile.rwNumber}
                      </div>
                      <div className="text-[14px] font-bold uppercase text-slate-900 leading-tight">
                        KELURAHAN {profile.kelurahan} KECAMATAN {profile.kecamatan}
                      </div>
                      <div className="text-[14px] font-bold uppercase text-slate-900 leading-tight">
                        KOTA SEMARANG
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-[14px] font-bold uppercase text-slate-900 leading-tight">
                        PEMERINTAH KOTA SEMARANG
                      </div>
                      <div className="text-[14px] font-bold uppercase text-slate-900 leading-tight">
                        KECAMATAN {profile.kecamatan}
                      </div>
                      <div className="text-[14px] font-bold uppercase text-slate-900 leading-tight">
                        KELURAHAN {profile.kelurahan}
                      </div>`);
fs.writeFileSync(file, content);
