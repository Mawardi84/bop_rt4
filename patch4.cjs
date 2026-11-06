const fs = require('fs');
let content = fs.readFileSync('src/components/NotulenGenerator.tsx', 'utf8');

// 3. Change preset title display
content = content.replace(
`                      <div className="text-[11px] font-extrabold leading-tight mt-0.5 truncate" title={preset.agendaItems[1] || preset.agendaItems[0]}>
                        {preset.month === 'Januari' ? 'Persiapan Haul' :
                         preset.month === 'Pebruari' ? 'Tabungan Warga' :
                         preset.month === 'Maret' ? 'Buka Bersama' :
                         preset.month === 'April' ? 'Halal Bi Halal' :
                         preset.month === 'Mei' ? 'Taman TOGA PKK' :
                         preset.month === 'Juni' ? 'Zarkasi Jogja' :
                         preset.month === 'Juli' ? 'Sosialisasi BOP' :
                         'HUT RI Ke-81'}
                      </div>`,
`                      <div className="text-[11px] font-extrabold leading-tight mt-0.5 truncate" title={preset.agendaItems[1] || preset.agendaItems[0]}>
                        {meetingType === 'rt' ? (
                          preset.month === 'Januari' ? 'Persiapan Haul' :
                          preset.month === 'Pebruari' ? 'Tabungan Warga' :
                          preset.month === 'Maret' ? 'Buka Bersama' :
                          preset.month === 'April' ? 'Halal Bi Halal' :
                          preset.month === 'Mei' ? 'Taman TOGA PKK' :
                          preset.month === 'Juni' ? 'Zarkasi Jogja' :
                          preset.month === 'Juli' ? 'Sosialisasi BOP' :
                          'HUT RI Ke-81'
                        ) : (
                          preset.month === 'Januari' ? 'Proker PKK' :
                          'Laporan Bulanan'
                        )}
                      </div>`
);

fs.writeFileSync('src/components/NotulenGenerator.tsx', content);
