const fs = require('fs');

const file = './src/components/NotulenGenerator.tsx';
let content = fs.readFileSync(file, 'utf-8');

const daftarHadirView = `          {/* ================== VIEW 1: DAFTAR HADIR (FORMAT KERTAS A4) ================== */}
          {docViewMode === 'daftar-hadir' && (
            <div className="space-y-4 print-one-page text-slate-900 leading-relaxed">
              {/* KOP Surat Resmi */}
              <div className="flex items-center justify-between border-b-4 border-double border-slate-900 pb-3 mb-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 print:w-24 print:h-24 flex-shrink-0 flex items-center justify-center">
                  <img 
                    src={meetingType === 'pkk' ? (profile.pkkLogoUrl || profile.logoUrl || DEFAULT_SEMARANG_LOGO) : (profile.logoUrl || DEFAULT_SEMARANG_LOGO)} 
                    alt={meetingType === 'pkk' ? "Logo PKK" : "Logo Kota Semarang"} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-center flex-grow px-4">
                  <div className="text-[14px] font-bold uppercase text-slate-900 leading-tight">
                    PEMERINTAH KOTA SEMARANG
                  </div>
                  <div className="text-[14px] font-bold uppercase text-slate-900 leading-tight">
                    KECAMATAN {profile.kecamatan}
                  </div>
                  <div className="text-[14px] font-bold uppercase text-slate-900 leading-tight">
                    KELURAHAN {profile.kelurahan}
                  </div>
                  <div className="text-[18px] font-bold uppercase text-slate-900 leading-tight mt-1">
                    RT {profile.rtNumber} RW {profile.rwNumber} NGABEAN
                  </div>
                  <p className="text-[10px] text-slate-800 leading-tight mt-1">
                    Alamat: Ngabean RT {profile.rtNumber} RW {profile.rwNumber} Kelurahan {profile.kelurahan}
                  </p>
                </div>
                <div className="w-24 h-24 sm:w-28 sm:h-28 print:w-24 print:h-24 flex-shrink-0"></div>
              </div>

              {/* Judul Daftar Hadir */}
              <div className="text-center my-4">
                <h1 className="text-base print:text-base font-black tracking-wider uppercase underline underline-offset-4 text-slate-900 leading-tight">
                  {selectedPresetId === 'notulen-tirakatan-16agustus' || selectedPresetId === 'notulen-resepsi-23agustus' 
                    ? agendaSummary.toUpperCase()
                    : (meetingType === 'rt' 
                      ? \`DAFTAR HADIR RAPAT RUTIN WARGA RT \${profile.rtNumber} RW \${profile.rwNumber}\` 
                      : \`DAFTAR HADIR PERTEMUAN RUTIN PKK RT \${profile.rtNumber} RW \${profile.rwNumber}\`)}
                </h1>
                <p className="text-xs print:text-xs font-bold uppercase text-slate-700 mt-2">
                  Bulan {month} Tahun {profile.year}
                </p>
              </div>

              {/* Tabel Meta Pertemuan */}
              <div className="flex justify-between items-end mb-2">
                <table className="w-2/3 border-none text-[13px] print:text-[13px] leading-relaxed">
                  <tbody>
                    <tr>
                      <td className="py-0.5 font-bold w-32">Hari / Tanggal</td>
                      <td className="py-0.5 w-4 font-bold">:</td>
                      <td className="py-0.5">{formatDate(date)}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 font-bold w-32">Waktu / Pukul</td>
                      <td className="py-0.5 w-4 font-bold">:</td>
                      <td className="py-0.5">{time}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 font-bold w-32">Tempat</td>
                      <td className="py-0.5 w-4 font-bold">:</td>
                      <td className="py-0.5 font-bold uppercase">{location}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tabel Kehadiran (Format Ringkas - 2 Kolom untuk menghemat kertas) */}
              <div className="grid grid-cols-2 gap-4 print:gap-x-8">
                {/* Kolom Kiri */}
                <table className="w-full border-collapse border border-slate-900 text-[11px] print:text-[11px] leading-tight">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-900 py-1.5 px-2 w-10 text-center">No</th>
                      <th className="border border-slate-900 py-1.5 px-2 text-left">{meetingType === 'rt' ? 'Nama Kepala Keluarga' : 'Nama Ibu / Anggota PKK'}</th>
                      <th className="border border-slate-900 py-1.5 px-2 w-20 text-center">Tanda Tangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.slice(0, Math.ceil(attendees.length / 2)).map((att, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-900 py-1.5 px-2 text-center">{idx + 1}</td>
                        <td className="border border-slate-900 py-1.5 px-2">{att.name}</td>
                        <td className="border border-slate-900 py-1.5 px-2 relative">
                          <span className={\`absolute top-1/2 -translate-y-1/2 text-[9px] text-slate-400 \${(idx + 1) % 2 === 1 ? 'left-2' : 'right-2'}\`}>
                            {idx + 1}.
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Kolom Kanan */}
                <table className="w-full border-collapse border border-slate-900 text-[11px] print:text-[11px] leading-tight">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-900 py-1.5 px-2 w-10 text-center">No</th>
                      <th className="border border-slate-900 py-1.5 px-2 text-left">{meetingType === 'rt' ? 'Nama Kepala Keluarga' : 'Nama Ibu / Anggota PKK'}</th>
                      <th className="border border-slate-900 py-1.5 px-2 w-20 text-center">Tanda Tangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.slice(Math.ceil(attendees.length / 2)).map((att, idx) => {
                      const realIdx = Math.ceil(attendees.length / 2) + idx;
                      return (
                        <tr key={realIdx}>
                          <td className="border border-slate-900 py-1.5 px-2 text-center">{realIdx + 1}</td>
                          <td className="border border-slate-900 py-1.5 px-2">{att.name}</td>
                          <td className="border border-slate-900 py-1.5 px-2 relative">
                            <span className={\`absolute top-1/2 -translate-y-1/2 text-[9px] text-slate-400 \${(realIdx + 1) % 2 === 1 ? 'left-2' : 'right-2'}\`}>
                              {realIdx + 1}.
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Tanda Tangan Mengetahui */}
              <div className="mt-8 pt-4 grid grid-cols-2 gap-12 text-[13px] print:text-[13px] text-center print-avoid-break">
                <div>
                  <p className="font-bold uppercase">
                    {meetingType === 'rt' ? \`Notulis / Sekretaris RT \${profile.rtNumber}\` : \`Sekretaris PKK RT \${profile.rtNumber}\`}
                  </p>
                  <div className="h-20 print:h-20"></div>
                  <p className="font-extrabold underline uppercase">{secretary}</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1">Semarang, {formatDate(date)}</p>
                  <p className="font-bold uppercase">
                    {meetingType === 'rt' ? \`Ketua RT \${profile.rtNumber}\` : \`Ketua PKK RT \${profile.rtNumber}\`}
                  </p>
                  <div className="h-20 print:h-20"></div>
                  <p className="font-extrabold underline uppercase">{leader}</p>
                </div>
              </div>
            </div>
          )}

`;

content = content.replace("{docViewMode === 'notulen' && (", daftarHadirView + "          {docViewMode === 'notulen' && (");

fs.writeFileSync(file, content);
console.log('Restored daftar hadir view');
