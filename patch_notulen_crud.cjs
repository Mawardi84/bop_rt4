const fs = require('fs');

const file = './src/components/NotulenGenerator.tsx';
let content = fs.readFileSync(file, 'utf-8');

// 1. Add NotulenPreset type import and useEffect
content = content.replace("import { RtProfile, AttendeeItem } from '../types';", "import { RtProfile, AttendeeItem, NotulenPreset } from '../types';");
content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';");

// 2. Inject states
const stateInjection = `  const [rtPresets, setRtPresets] = useState<NotulenPreset[]>(() => {
    const saved = localStorage.getItem('rtNotulenPresets');
    return saved ? JSON.parse(saved) : rtNotulenPresets;
  });

  const [pkkPresets, setPkkPresets] = useState<NotulenPreset[]>(() => {
    const saved = localStorage.getItem('pkkNotulenPresets');
    return saved ? JSON.parse(saved) : pkkNotulenPresets;
  });

  useEffect(() => {
    localStorage.setItem('rtNotulenPresets', JSON.stringify(rtPresets));
  }, [rtPresets]);

  useEffect(() => {
    localStorage.setItem('pkkNotulenPresets', JSON.stringify(pkkPresets));
  }, [pkkPresets]);
`;

content = content.replace("  const firstPreset = rtNotulenPresets[0];", stateInjection + "\n  const firstPreset = rtPresets[0] || rtNotulenPresets[0];");

// 3. Replace usages of the raw lists
content = content.replace("const list = type === 'pkk' ? pkkNotulenPresets : rtNotulenPresets;", "const list = type === 'pkk' ? pkkPresets : rtPresets;");
// For the rendering loop:
content = content.replace("{(meetingType === 'rt' ? rtNotulenPresets : pkkNotulenPresets).slice(0, 8).map((preset, idx) => {", "{(meetingType === 'rt' ? rtPresets : pkkPresets).map((preset, idx) => {");

// 4. We need to handle meetingType change nicely. Currently:
// onChange={(e) => {
//   const type = e.target.value as 'rt' | 'pkk';
//   setMeetingType(type);
//   handleSelectPreset(type === 'rt' ? rtNotulenPresets[0].id : pkkNotulenPresets[0].id, type);
// }}
content = content.replace("handleSelectPreset(type === 'rt' ? rtNotulenPresets[0].id : pkkNotulenPresets[0].id, type);", "handleSelectPreset(type === 'rt' ? (rtPresets[0]?.id || rtNotulenPresets[0].id) : (pkkPresets[0]?.id || pkkNotulenPresets[0].id), type);");

// 5. Add CRUD Handlers before handleAddAgenda
const handlers = `  const handleSavePreset = () => {
    const updatedPreset = {
      id: selectedPresetId,
      month,
      date,
      time,
      location,
      participantCount: 40,
      leader,
      secretary,
      agendaTitle: (meetingType === 'rt' ? rtPresets : pkkPresets).find(p => p.id === selectedPresetId)?.agendaTitle,
      agendaItems: [...agendaItems]
    };

    if (meetingType === 'rt') {
      setRtPresets(prev => prev.map(p => p.id === selectedPresetId ? updatedPreset : p));
    } else {
      setPkkPresets(prev => prev.map(p => p.id === selectedPresetId ? updatedPreset : p));
    }
    // simple UI feedback without full alert if possible, but alert is fine for simple app
    alert('Jadwal/Notulen berhasil disimpan!');
  };

  const handleAddPreset = () => {
    const newId = \`\${meetingType}-notulen-\${Date.now()}\`;
    const newPreset = {
      id: newId,
      month: 'Baru',
      date: new Date().toISOString().split('T')[0],
      time: '19:30 - selesai',
      location: meetingType === 'rt' ? 'Kediaman ...' : 'Kediaman Ibu Tistani Subandiyah',
      participantCount: 40,
      leader,
      secretary,
      agendaItems: ['Agenda Baru']
    };

    if (meetingType === 'rt') {
      setRtPresets(prev => [...prev, newPreset]);
    } else {
      setPkkPresets(prev => [...prev, newPreset]);
    }
    
    // Select it
    setSelectedPresetId(newId);
    setMonth(newPreset.month);
    setDate(newPreset.date);
    setTime(newPreset.time);
    setLocation(newPreset.location);
    setAgendaItems([...newPreset.agendaItems]);
  };

  const handleDeletePreset = () => {
    if (confirm('Yakin ingin menghapus jadwal ini?')) {
      if (meetingType === 'rt') {
        setRtPresets(prev => {
          const filtered = prev.filter(p => p.id !== selectedPresetId);
          if (filtered.length > 0) {
            setTimeout(() => handleSelectPreset(filtered[0].id, 'rt'), 0);
          }
          return filtered;
        });
      } else {
        setPkkPresets(prev => {
          const filtered = prev.filter(p => p.id !== selectedPresetId);
          if (filtered.length > 0) {
            setTimeout(() => handleSelectPreset(filtered[0].id, 'pkk'), 0);
          }
          return filtered;
        });
      }
    }
  };
`;

content = content.replace("  const handleAddAgenda = () => {", handlers + "\n  const handleAddAgenda = () => {");

// 6. Add the buttons to UI
const buttonsUI = `
                <div className="flex gap-2 mt-5 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleSavePreset}
                    className="bg-blue-600 text-white px-3 py-2 rounded-xl font-semibold hover:bg-blue-700 flex-1 flex items-center justify-center space-x-1.5 text-xs sm:text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simpan</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAddPreset}
                    className="bg-emerald-600 text-white px-3 py-2 rounded-xl font-semibold hover:bg-emerald-700 flex-1 flex items-center justify-center space-x-1.5 text-xs sm:text-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Baru</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDeletePreset}
                    className="bg-red-50 text-red-600 px-3 py-2 rounded-xl font-semibold hover:bg-red-100 flex items-center justify-center text-xs sm:text-sm"
                  >
                    Hapus
                  </button>
                </div>`;

content = content.replace("</button>\n                </div>\n                <ul className=\"space-y-1\">", "</button>\n                </div>\n                <ul className=\"space-y-1\">\n");
// wait, let's inject after the agenda list
content = content.replace("</ul>\n              </div>\n            </div>\n          </div>\n\n          {/* Form Actions */}", "</ul>\n              </div>\n            </div>\n" + buttonsUI + "\n          </div>\n\n          {/* Form Actions */}");

// 7. Update grid-cols for the presets grid so it wraps nicely
content = content.replace('className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2"', 'className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2"');

fs.writeFileSync(file, content);
console.log('Patched CRUD');
