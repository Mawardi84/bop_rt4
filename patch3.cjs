const fs = require('fs');
let content = fs.readFileSync('src/components/NotulenGenerator.tsx', 'utf8');

// 2. Change 8 Regular Monthly Meetings
content = content.replace(
`          {/* 8 Regular Monthly Meetings */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Pertemuan Rutin Warga RT 04 (Januari - Agustus 2026)
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                40 Hadir • 19:30 WIB • Kediaman Bergilir
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {rtNotulenPresets.slice(0, 8).map((preset, idx) => {`,
`          {/* 8 Regular Monthly Meetings */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {meetingType === 'pkk' ? 'Pertemuan Rutin PKK RT 04' : 'Pertemuan Rutin Warga RT 04'} (Januari - Agustus 2026)
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                40 Hadir • {meetingType === 'pkk' ? '15:30' : '19:30'} WIB • Kediaman Bergilir
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {(meetingType === 'pkk' ? pkkNotulenPresets : rtNotulenPresets).slice(0, 8).map((preset, idx) => {`
);

fs.writeFileSync('src/components/NotulenGenerator.tsx', content);
