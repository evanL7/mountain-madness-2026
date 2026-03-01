import { useState } from 'react';
import { Clock, MapPin, DollarSign, ChevronDown, ChevronUp, Sparkles, Loader2 } from 'lucide-react';
import { api } from '../../api/client';

const CAL_BADGES = {
  work: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Work' },
  personal: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Personal' },
  social: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Social' },
  health: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Health' },
  family: { bg: 'bg-red-100', text: 'text-red-700', label: 'Family' },
};

export default function EventCard({ event }) {
  const [expanded, setExpanded] = useState(false);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const badge = CAL_BADGES[event.calendarType] || { bg: 'bg-slate-100', text: 'text-slate-700', label: event.calendarType };
  const spend = event.spendingPrediction?.estimated || 0;

  const handleAiAnalysis = async () => {
    setLoading(true);
    try {
      const result = await api.calendar.predictEvent(event);
      setAiPrediction(result);
      setExpanded(true);
    } catch (err) {
      console.error('AI prediction failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const prediction = aiPrediction || event.spendingPrediction;

  return (
    <div className="border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${badge.bg} ${badge.text}`}>
              {badge.label}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {event.startTime} - {event.endTime}
            </span>
          </div>
          <h4 className="text-sm font-medium text-slate-800">{event.title}</h4>
          {event.location && (
            <p className="text-xs text-slate-400 flex items-center gap-0.5 mt-0.5">
              <MapPin className="w-3 h-3" />
              {event.location}
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0 ml-3">
          {spend > 0 ? (
            <span className={`text-lg font-bold ${spend > 50 ? 'text-amber-600' : 'text-slate-700'}`}>
              ${spend.toFixed(0)}
            </span>
          ) : (
            <span className="text-sm text-rbc-blue font-medium">Free</span>
          )}
        </div>
      </div>

      {prediction && (
        <div className="mt-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'Hide details' : 'Show breakdown'}
          </button>
          {expanded && (
            <div className="mt-2 space-y-2">
              {prediction.breakdown?.length > 0 && (
                <div className="bg-slate-50 rounded p-2">
                  {prediction.breakdown.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs py-0.5">
                      <span className="text-slate-600">{item.item}</span>
                      <span className="font-medium text-slate-700">${item.amount?.toFixed?.(2) || item.amount}</span>
                    </div>
                  ))}
                </div>
              )}
              {prediction.savingAlternative && (
                <div className="bg-emerald-50 rounded p-2">
                  <p className="text-xs text-emerald-700">{prediction.savingAlternative.suggestion}</p>
                  <p className="text-xs text-emerald-600 font-medium mt-0.5">
                    Save ${prediction.savingAlternative.potentialSaving}
                  </p>
                </div>
              )}
              {prediction.savingTips?.length > 0 && (
                <div className="bg-emerald-50 rounded p-2 space-y-1">
                  {prediction.savingTips.map((tip, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-emerald-700">{tip.tip}</span>
                      <span className="text-emerald-600 font-medium">Save ${tip.potentialSaving}</span>
                    </div>
                  ))}
                </div>
              )}
              {aiPrediction?.reasoning && (
                <p className="text-xs text-slate-500 italic">{aiPrediction.reasoning}</p>
              )}
            </div>
          )}
        </div>
      )}

      {spend > 0 && !aiPrediction && (
        <button
          onClick={handleAiAnalysis}
          disabled={loading}
          className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-rbc-blue-light text-rbc-blue rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          {loading ? 'Analyzing...' : 'Get AI Analysis'}
        </button>
      )}
    </div>
  );
}
