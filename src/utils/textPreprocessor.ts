import * as mammoth from 'mammoth';

// Clean text function identical to Python utils/text_preprocessor.py
export function cleanText(text: string): string {
  if (!text) return '';
  // Remove special characters but keep percentages and decimals
  const lower = text.toLowerCase();
  const cleaned = lower.replace(/[^a-z0-9.% ]/g, ' ');
  return cleaned.trim().split(/\s+/).join(' ');
}

// Stop words for word cloud generation (matching common NLP stop words)
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'could',
  'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each', 'few',
  'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d',
  'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d',
  'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s',
  'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you',
  'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves',
  // Common generic inspection terms
  'per', 'hrs', 'shift', 'date', 'report', 'inspection', 'mine', 'section', 'district'
]);

export function calculateWordFrequencies(
  cleanedText: string,
  maxWords = 50
): { text: string; value: number }[] {
  if (!cleanedText || cleanedText.length <= 10) return [];

  const tokens = cleanedText.split(/\s+/);
  const freqMap: Record<string, number> = {};

  for (const token of tokens) {
    // Exclude purely numeric tokens or single letter tokens or stopwords
    const cleanWord = token.replace(/[^a-z]/g, '');
    if (cleanWord.length > 2 && !STOP_WORDS.has(cleanWord)) {
      freqMap[cleanWord] = (freqMap[cleanWord] || 0) + 1;
    }
  }

  const entries = Object.entries(freqMap).map(([text, value]) => ({ text, value }));
  entries.sort((a, b) => b.value - a.value);
  return entries.slice(0, maxWords);
}

// Client-side extraction for PDF, DOCX, and TXT
export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.docx')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value || '';
    } catch (err) {
      console.error('Error extracting text from docx:', err);
      throw new Error('Failed to read DOCX file. Please verify file integrity.');
    }
  }

  if (fileName.endsWith('.pdf')) {
    try {
      // Dynamically load pdfjs to prevent issues if worker isn't loaded
      const pdfjs = await import('pdfjs-dist');
      // Set worker src
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
      }
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ');
        fullText += pageText + ' ';
      }
      return fullText.trim();
    } catch (err) {
      console.warn('PDF extraction fallback via binary string:', err);
      // Fallback for simple PDFs if worker fetch fails in offline/restricted sandbox
      const text = await file.text();
      // Extract readable ASCII strings
      const printable = text.replace(/[^\x20-\x7E\n\r]/g, ' ');
      return printable.length > 50 ? printable : '';
    }
  }

  // Fallback for plain text, csv, or logs
  return await file.text();
}
