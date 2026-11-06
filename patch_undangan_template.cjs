const fs = require('fs');
let content = fs.readFileSync('src/components/NotulenGenerator.tsx', 'utf8');

const endTarget = `            </div>
          )}
        </div>
      </div>
    </div>
  );
};`;

const newTemplate = `            </div>
          )}

          {/* ================== VIEW 3: SURAT UNDANGAN ================== */}
          {docViewMode === 'undangan' && (
            <div className="space-y-4 print-one-page text-slate-900 leading-relaxed max-w-4xl mx-auto px-6 py-8">
              {/* KOP Surat Resmi */}
              <div className="flex items-center justify-between border-b-4 border-double border-slate-900 pb-3 mb-6">
                <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
                  <img 
                    src={meetingType === 'pkk' ? (profile.pkkLogoUrl || profile.logoUrl || "https://upload.wikimedia.org/wikipedia/commons/e/e9/Coat_of_arms_of_Semarang.svg") : (profile.logoUrl || "https://upload.wikimedia.org/wikipedia/commons/e/e9/Coat_of_arms_of_Semarang.svg")} 
                    alt="Logo Pemkot Semarang" 
                    className="w-16 h-16 object-contain grayscale"
                  />
                </div>
                <div className="flex-1 text-center font-serif leading-tight">
                  <h1 className="text-xl font-bold tracking-wider text-slate-900">
                    {meetingType === 'rt' ? 'RUKUN TETANGGA (RT) ' + profile.rtNumber : 'PEMBERDAYAAN KESEJAHTERAAN KELUARGA (PKK) RT ' + profile.rtNumber}
                  </h1>
                  <h2 className="text-lg font-bold tracking-wider text-slate-900">
                    RUKUN WARGA (RW) {profile.rwNumber}
                  </h2>
                  <h3 className="text-base font-semibold text-slate-800">
                    KECAMATAN {profile.kecamatan.toUpperCase()}
                  </h3>
                  <h4 className="text-base font-semibold text-slate-800">
                    KELURAHAN {profile.kelurahan.toUpperCase()}
                  </h4>
                  <p className="text-xs text-slate-700 mt-1.5 font-medium font-sans">
                    Sekretariat: {profile.secretariatAddress}
                  </p>
                </div>
                <div className="w-20 h-20 flex-shrink-0"></div>
              </div>
              
              <div className="flex justify-between items-start mb-8 text-[14px]">
                <div>
                  <table className="border-none">
                    <tbody>
                      <tr><td className="pr-4 py-0.5 align-top">Nomor</td><td className="align-top">: ... / {meetingType === 'rt' ? 'RT.04' : 'PKK.RT.04'} / {month.substring(0,3).toUpperCase()} / {profile.year}</td></tr>
                      <tr><td className="pr-4 py-0.5 align-top">Lampiran</td><td className="align-top">: -</td></tr>
                      <tr><td className="pr-4 py-0.5 align-top font-bold">Hal</td><td className="align-top font-bold">: Undangan Pertemuan Rutin {meetingType === 'rt' ? 'Warga RT 04' : 'PKK RT 04'}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="text-right">
                  <p>Semarang, {formatDate(date)}</p>
                </div>
              </div>

              <div className="mb-6 text-[14px]">
                <p>Kepada Yth.</p>
                <p className="font-bold">{meetingType === 'rt' ? 'Bapak/Ibu/Saudara/i Warga RT 04' : 'Ibu-ibu Anggota PKK RT 04'}</p>
                <p>Di Tempat</p>
              </div>

              <div className="mb-6 text-[14px] text-justify space-y-3">
                <p>Dengan hormat,</p>
                <p>
                  Puji syukur kita panjatkan kehadirat Tuhan Yang Maha Esa atas segala limpahan rahmat dan karunia-Nya. 
                  Bersama surat ini, kami mengundang {meetingType === 'rt' ? 'Bapak/Ibu/Saudara/i' : 'Ibu-ibu'} sekalian untuk hadir dalam acara 
                  <span className="font-bold"> Pertemuan Rutin Bulanan {meetingType === 'rt' ? 'Warga RT 04' : 'PKK RT 04'}</span> yang akan diselenggarakan pada:
                </p>
              </div>

              <div className="mb-8 ml-8 text-[14px]">
                <table className="border-none">
                  <tbody>
                    <tr><td className="pr-4 py-1 font-semibold w-32">Hari / Tanggal</td><td className="py-1">: {formatDate(date)}</td></tr>
                    <tr><td className="pr-4 py-1 font-semibold">Waktu</td><td className="py-1">: Pukul {time} WIB - Selesai</td></tr>
                    <tr><td className="pr-4 py-1 font-semibold align-top">Tempat</td><td className="py-1 align-top">: {location}</td></tr>
                    <tr><td className="pr-4 py-1 font-semibold align-top">Agenda Utama</td><td className="py-1 align-top font-bold">: {agendaSummary}</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="mb-12 text-[14px] text-justify space-y-3">
                <p>
                  Mengingat pentingnya acara pertemuan rutin bulanan ini guna membahas program kerja dan menjaga silaturahmi antar warga, 
                  kami sangat mengharapkan kehadiran {meetingType === 'rt' ? 'Bapak/Ibu/Saudara/i' : 'Ibu-ibu'} tepat pada waktunya.
                </p>
                <p>
                  Demikian surat undangan ini kami sampaikan. Atas perhatian dan kehadirannya, kami ucapkan terima kasih.
                </p>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-12 text-[14px] print:text-[14px] text-center print-avoid-break">
                <div>
                  <p className="font-bold uppercase">
                    {meetingType === 'rt' ? \`Sekretaris RT \${profile.rtNumber}\` : \`Sekretaris PKK RT \${profile.rtNumber}\`}
                  </p>
                  <div className="h-24 print:h-24"></div>
                  <p className="font-extrabold underline uppercase">{secretary}</p>
                </div>
                <div>
                  <p className="font-bold uppercase">
                    {meetingType === 'rt' ? \`Ketua RT \${profile.rtNumber}\` : \`Ketua PKK RT \${profile.rtNumber}\`}
                  </p>
                  <div className="h-24 print:h-24"></div>
                  <p className="font-extrabold underline uppercase">{leader}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};`;

content = content.replace(endTarget, newTemplate);

fs.writeFileSync('src/components/NotulenGenerator.tsx', content);
