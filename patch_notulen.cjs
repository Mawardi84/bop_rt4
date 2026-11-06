const fs = require('fs');
let content = fs.readFileSync('src/components/NotulenGenerator.tsx', 'utf8');

const importTarget = `import { executePrint } from '../utils/printHelper';`;
const importReplacement = `import { executePrint } from '../utils/printHelper';
import { Bot, Loader2 } from 'lucide-react';`;
content = content.replace(importTarget, importReplacement);

const stateTarget = `  const [closingSentence, setClosingSentence] = useState('');`;
const stateReplacement = `  const [closingSentence, setClosingSentence] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState('');`;
content = content.replace(stateTarget, stateReplacement);

const functionTarget = `  const handleAddAgenda = () => {`;
const functionReplacement = `  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    setAiError('');
    try {
      const response = await fetch('/api/generate-notulen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agendaItems,
          location,
          meetingType,
          participantCount,
          month
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content');
      }
      const data = await response.json();
      if (data.discussionNotes) setDiscussionNotes(data.discussionNotes);
      if (data.decisions) setDecisions(data.decisions);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Terjadi kesalahan saat memanggil AI.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddAgenda = () => {`;
content = content.replace(functionTarget, functionReplacement);

const buttonTarget = `              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  {selectedPresetId === 'notulen-tirakatan-16agustus' || selectedPresetId === 'notulen-resepsi-23agustus'
                    ? 'Uraian Jalannya Acara & Pelaksanaan'
                    : 'Uraian Pembahasan Rapat'}
                </label>`;
const buttonReplacement = `              <div className="pt-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700 uppercase">
                    {selectedPresetId === 'notulen-tirakatan-16agustus' || selectedPresetId === 'notulen-resepsi-23agustus'
                      ? 'Uraian Jalannya Acara & Pelaksanaan'
                      : 'Uraian Pembahasan Rapat'}
                  </label>
                  <button
                    onClick={handleGenerateAI}
                    disabled={isGeneratingAI || agendaItems.length === 0}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingAI ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Bot className="w-3.5 h-3.5" />
                    )}
                    Generate AI
                  </button>
                </div>
                {aiError && (
                  <div className="text-red-500 text-[10px] mb-2">{aiError}</div>
                )}`;
content = content.replace(buttonTarget, buttonReplacement);

fs.writeFileSync('src/components/NotulenGenerator.tsx', content);
