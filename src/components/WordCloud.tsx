import React, { useMemo } from 'react';

interface WordCloudProps {
  words: { text: string; value: number }[];
  textLength: number;
}

const PALETTE = [
  '#0284c7', // sky
  '#d97706', // amber
  '#dc2626', // red
  '#059669', // emerald
  '#7c3aed', // violet
  '#ea580c', // orange
  '#475569', // slate
  '#b45309', // brown/bronze
  '#2563eb', // blue
  '#0d9488', // teal
];

export const WordCloud: React.FC<WordCloudProps> = ({ words, textLength }) => {
  if (textLength <= 10) {
    return (
      <div className="bg-sky-50 border border-sky-200 text-sky-800 p-4 rounded-lg text-sm flex items-center gap-2">
        <span>ℹ️</span> Not enough text for word cloud analysis.
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 text-slate-600 p-4 rounded-lg text-sm text-center">
        No significant mining terms extracted.
      </div>
    );
  }

  const { minVal, maxVal } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    words.forEach((w) => {
      if (w.value < min) min = w.value;
      if (w.value > max) max = w.value;
    });
    return { minVal: min === Infinity ? 1 : min, maxVal: max === -Infinity ? 1 : max };
  }, [words]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-800 text-base flex items-center gap-2">
            <span>☁️</span> Text Mining: Word Cloud
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Key terminology & frequency extraction from cleaned inspection narrative
          </p>
        </div>
        <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
          {words.length} terms extracted
        </span>
      </div>

      {/* Visual Word Cloud Container */}
      <div className="min-h-[220px] bg-slate-50/70 rounded-lg p-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 border border-dashed border-slate-200">
        {words.map((item, index) => {
          // Scale font size smoothly between 13px and 36px
          const range = maxVal - minVal || 1;
          const ratio = (item.value - minVal) / range;
          const fontSize = Math.round(13 + ratio * 23);
          const color = PALETTE[index % PALETTE.length];
          const fontWeight = item.value > 1 ? 700 : 500;

          return (
            <span
              key={`${item.text}-${index}`}
              style={{
                fontSize: `${fontSize}px`,
                color: color,
                fontWeight: fontWeight,
              }}
              title={`Word: "${item.text}" | Frequency: ${item.value}`}
              className="inline-block transition-transform duration-150 hover:scale-125 cursor-default select-none px-1"
            >
              {item.text}
              {item.value > 1 && (
                <sup className="text-[10px] ml-0.5 opacity-60 font-mono">
                  {item.value}
                </sup>
              )}
            </span>
          );
        })}
      </div>

      {/* Top 6 keywords bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500">Prominent terms:</span>
        {words.slice(0, 6).map((w, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono"
          >
            <span className="font-medium">{w.text}</span>
            <span className="text-slate-400">×{w.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
};
