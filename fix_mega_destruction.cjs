const fs = require('fs');

const file = './src/components/NotulenGenerator.tsx';
let content = fs.readFileSync(file, 'utf-8');

// Find the corrupted line block to replace
const corruptedRegex = /\{preset\.agendaTitle \|\|[\s\S]*?\{meetingType === 'rt' \? preset\.location\.replace\('Kediaman ', ''\) : preset\.location\.replace\('Kediaman Ibu ', 'Ibu '\)\}\s*<\/div>\s*<\/button>\s*\);\s*\}\)\}/;

const theGoodCode = `{meetingType === 'rt' ? (
              <>
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
                  RT {profile.rtNumber} RW {profile.rwNumber}
                </div>
              </>
            ) : (
              <>
                <div className="text-[14px] font-bold uppercase text-slate-900 leading-tight">
                  PEMBERDAYAAN DAN KESEJAHTERAAN KELUARGA (PKK)
                </div>
                <div className="text-[14px] font-bold uppercase text-slate-900 leading-tight">
                  TIM PENGGERAK PKK RT {profile.rtNumber} RW {profile.rwNumber} NGABEAN
                </div>
                <div className="text-[14px] font-bold uppercase text-slate-900 leading-tight">
                  KECAMATAN {profile.kecamatan}
                </div>
                <div className="text-[14px] font-bold uppercase text-slate-900 leading-tight">
                  KELURAHAN {profile.kelurahan}
                </div>
                <div className="text-[18px] font-bold uppercase text-slate-900 leading-tight mt-1">
                  KOTA SEMARANG
                </div>
              </>
            )}
            <p className="text-[10px] text-slate-800 leading-tight mt-1">
              Alamat: Ngabean RT {profile.rtNumber} RW {profile.rwNumber} Kelurahan {profile.kelurahan}
            </p>
          </div>
          <div className={\`\${logoSize} flex-shrink-0 flex items-center justify-center opacity-0 print:opacity-0\`}>
            <div className="w-12 h-12"></div>
          </div>
        </div>

        {/* Tanggal & Nomor Bar */}
        <div className={\`flex justify-between items-start \${textSize}\`}>
          <div className="space-y-0.5">
            <div className="flex">
              <span className="w-20 sm:w-24 font-semibold">Nomor</span>
              <span className="w-4">:</span>
              <span>-</span>
            </div>
            <div className="flex">
              <span className="w-20 sm:w-24 font-semibold">Lampiran</span>
              <span className="w-4">:</span>
              <span>-</span>
            </div>
            <div className="flex">
              <span className="w-20 sm:w-24 font-semibold">Perihal</span>
              <span className="w-4">:</span>
              <span className="font-bold underline uppercase">{currentAcara}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-semibold block mb-0.5">Semarang, {formatDate(currentUndanganDate)}</span>
            <span>Kepada Yth.</span>
            <br />
            <span className="font-bold">{currentPenerima}</span>
            <br />
            <span>di Tempat</span>
          </div>
        </div>

        {/* Isi Surat */}
        <div className={\`text-justify leading-relaxed mt-4 \${textSize}\`}>
          <p className="mb-2 font-bold">{currentSalamPembuka}</p>
          <p className="mb-2 whitespace-pre-line">{currentPengantar}</p>
          
          <table className={\`w-11/12 mx-auto my-3 font-semibold \${tablePadding}\`}>
            <tbody>
              <tr>
                <td className="w-32 py-1">Hari, Tanggal</td>
                <td className="w-4 py-1">:</td>
                <td className="py-1">{formatDate(date)}</td>
              </tr>
              <tr>
                <td className="py-1">Waktu</td>
                <td className="py-1">:</td>
                <td className="py-1">{time}</td>
              </tr>
              <tr>
                <td className="py-1 align-top">Tempat</td>
                <td className="py-1 align-top">:</td>
                <td className="py-1 leading-normal uppercase">{location}</td>
              </tr>
              <tr>
                <td className="py-1 align-top">Acara</td>
                <td className="py-1 align-top">:</td>
                <td className="py-1 leading-normal uppercase">{currentAcara}</td>
              </tr>
              {showAgendaDetailsInUndangan && (
                <tr>
                  <td className="py-1 align-top">Detail Agenda</td>
                  <td className="py-1 align-top">:</td>
                  <td className="py-1 font-normal text-[11px] print:text-[10px]">
                    <ul className="list-disc pl-4 space-y-0.5">
                      {agendaItems.map((ag, i) => (
                         <li key={i}>{ag}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {undanganCatatan && (
            <div className="mb-2 p-2 border-l-2 border-slate-900 bg-slate-50 text-[10px] print:text-[9.5px]">
              <span className="font-bold">Catatan Tambahan:</span><br/>
              <span className="whitespace-pre-line">{undanganCatatan}</span>
            </div>
          )}

          <p className="mb-4 whitespace-pre-line">{currentPenutup}</p>
          <p className="font-bold">{currentSalamPenutup}</p>
        </div>

        {/* Tanda Tangan */}
        <div className="mt-4 pt-2 flex justify-end text-center">
          <div className="w-48">
            <p className="font-bold uppercase text-[12px] print:text-[11px]">
              {meetingType === 'rt' ? \`Ketua RT \${profile.rtNumber}\` : \`Ketua PKK RT \${profile.rtNumber}\`}
            </p>
            <div className={ttdHeight}></div>
            <p className="font-extrabold underline uppercase text-[12px] print:text-[11px]">{leader}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header/Controls */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Generator Notulen & Undangan
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Buat Undangan, Daftar Hadir, dan Notulen kegiatan bulanan warga RT dan PKK.
          </p>
        </div>
        <div className="flex items-center bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200">
          <button
            onClick={() => {
              setMeetingType('rt');
              handleSelectPreset(rtPresets[0]?.id || 'notulen-januari', 'rt');
            }}
            className={\`px-4 py-2 rounded-lg text-sm font-semibold transition-all \${
              meetingType === 'rt' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-800'
            }\`}
          >
            Rapat RT
          </button>
          <button
            onClick={() => {
              setMeetingType('pkk');
              handleSelectPreset(pkkPresets[0]?.id || 'pkk-notulen-januari', 'pkk');
            }}
            className={\`px-4 py-2 rounded-lg text-sm font-semibold transition-all \${
              meetingType === 'pkk' ? 'bg-white text-rose-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-800'
            }\`}
          >
            Rapat PKK
          </button>
        </div>
      </div>

      {/* Control Panel / Presets */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {meetingType === 'rt' ? 'Pertemuan Rutin Warga RT 04 (2026)' : 'Pertemuan Rutin PKK RT 04 (2026)'}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setDocViewMode('daftar-hadir')}
              className={\`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all \${
                docViewMode === 'daftar-hadir' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }\`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Daftar Hadir</span>
            </button>
            <button
              onClick={() => setDocViewMode('notulen')}
              className={\`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all \${
                docViewMode === 'notulen' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }\`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Notulen Rapat</span>
            </button>
            <button
              onClick={() => setDocViewMode('undangan')}
              className={\`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all \${
                docViewMode === 'undangan' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }\`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Surat Undangan</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {(meetingType === 'rt' ? rtPresets : pkkPresets).map((preset, idx) => {
            const isActive = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={\`text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between \${
                  isActive
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs scale-[1.02]'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                }\`}
              >
                <div>
                  <div className={\`text-[10px] font-bold uppercase \${isActive ? 'text-slate-300' : 'text-red-700'}\`}>
                    {idx + 1}. {preset.month}
                  </div>
                  <div className="text-[11px] font-extrabold leading-tight mt-0.5 truncate" title={preset.agendaTitle || preset.agendaItems[0]}>
                    {preset.agendaTitle || 
                      (meetingType === 'rt' ? (
                        preset.month === 'Januari' ? 'Persiapan Haul' :
                        preset.month === 'Pebruari' ? 'Tabungan Warga' :
                        preset.month === 'Maret' ? 'Buka Bersama' :
                        preset.month === 'April' ? 'Halal Bi Halal' :
                        preset.month === 'Mei' ? 'Taman TOGA PKK' :
                        preset.month === 'Juni' ? 'Zarkasi Jogja' :
                        preset.month === 'Juli' ? 'Sosialisasi BOP' :
                        preset.month === 'Agustus' ? 'HUT RI Ke-81' : 'Rapat Rutin'
                      ) : (
                        preset.month === 'Januari' ? 'Proker PKK' :
                        preset.month === 'Pebruari' || preset.month === 'Maret' || preset.month === 'April' || preset.month === 'Mei' || preset.month === 'Juni' || preset.month === 'Juli' || preset.month === 'Agustus' ? 'Laporan Bulanan' : 'Pertemuan PKK'
                      ))
                    }
                  </div>
                </div>
                <div className={\`text-[9px] mt-1.5 pt-1 border-t truncate \${isActive ? 'border-slate-700 text-slate-300' : 'border-slate-100 text-slate-500'}\`}>
                  {meetingType === 'rt' ? preset.location.replace('Kediaman ', '') : preset.location.replace('Kediaman Ibu ', 'Ibu ')}
                </div>
              </button>
            );
          })}`;

content = content.replace(corruptedRegex, theGoodCode);

fs.writeFileSync(file, content);
console.log('Restored mega destruction!');
