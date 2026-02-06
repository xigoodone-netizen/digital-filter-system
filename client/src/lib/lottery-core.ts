/**
 * Lottery analysis algorithm module - Frontend Version
 * Migrated from server/lottery-algorithm.ts
 */

export interface ScoredNumber {
  num: string;
  sum: number;
  span: number;
  sumScore: string;
  spanScore: string;
  hotColdScore: string;
  hitScore: string;
  totalScore: string;
  hotCount: number;
  coldCount: number;
  containsKeyCode: boolean;
  isEdgeValue: boolean;
  digits: number[];
}

export interface AnalysisResult {
  hotDigits: number[];
  coldDigits: number[];
  keyCodes: number[];
  codeFreq: Record<number, number>;
  scoredNumbers: Record<string, ScoredNumber>;
  layerResults: Record<string, ScoredNumber[]>;
}

export interface Draw {
  id: number;
  number: string;
  drawDate: string;
  period: string;
}

// Extract last 3 digits from 4-digit number
export function extractLastThreeDigits(fourDigitStr: string): string {
  if (!fourDigitStr) return "";
  // If it's a string like "1,2,3,4"
  if (fourDigitStr.includes(",")) {
    const digits = fourDigitStr.split(",").map((d) => d.trim());
    if (digits.length >= 4) {
      return digits.slice(1).join("");
    }
  }
  // If it's a string like "1234"
  if (fourDigitStr.length >= 4) {
    return fourDigitStr.slice(-3);
  }
  return fourDigitStr;
}

// Analyze history data to find hot/cold/key codes
export function analyzeHistoryData(
  draws: Array<{ number: string }>,
  keyCodeCount: number = 3
): {
  hotDigits: number[];
  coldDigits: number[];
  keyCodes: number[];
  codeFreq: Record<number, number>;
} {
  const codeFreq: Record<number, number> = {};

  draws.forEach((draw) => {
    const lastThree = extractLastThreeDigits(draw.number);
    const digits = lastThree.split("").map((d) => parseInt(d, 10));
    digits.forEach((digit) => {
      if (!isNaN(digit)) {
        codeFreq[digit] = (codeFreq[digit] || 0) + 1;
      }
    });
  });

  const sorted = Object.entries(codeFreq)
    .map(([digit, freq]) => ({ digit: parseInt(digit, 10), freq }))
    .sort((a, b) => b.freq - a.freq);

  const hotDigits = sorted.slice(0, 3).map((d) => d.digit);
  const coldDigits = sorted.slice(-3).map((d) => d.digit);
  const keyCodes = sorted.slice(0, keyCodeCount).map((d) => d.digit);

  return { hotDigits, coldDigits, keyCodes, codeFreq };
}

// Calculate AI 4D scores for all numbers
export function calculateScores(
  hotDigits: number[],
  coldDigits: number[],
  keyCodes: number[],
  codeFreq: Record<number, number>
): Record<string, ScoredNumber> {
  const scoredNumbers: Record<string, ScoredNumber> = {};
  
  // Use digit frequencies to estimate number frequency
  const getNumFreq = (numStr: string) => {
    const digits = numStr.split("").map(d => parseInt(d, 10));
    return (digits.reduce((acc, d) => acc + (codeFreq[d] || 0), 0)) / 3;
  };

  const freqs = Array.from({ length: 1000 }, (_, i) => getNumFreq(String(i).padStart(3, "0")));
  const maxFreq = Math.max(...freqs, 1);

  for (let i = 0; i <= 999; i++) {
    const num = String(i).padStart(3, "0");
    const digits = num.split("").map((d) => parseInt(d, 10));

    // Dimension 1: Sum score
    const sum = digits.reduce((a, b) => a + b, 0);
    const sumScore =
      Math.abs(sum - 16) <= 6 ? 10 - (Math.abs(sum - 16) / 6) * 5 : 2;

    // Dimension 2: Span score
    const span = Math.max(...digits) - Math.min(...digits);
    const spanScore =
      Math.abs(span - 5) <= 1 ? 10 - Math.abs(span - 5) * 2 : 3;

    // Dimension 3: Hot/cold score
    const hotCount = digits.filter((d) => hotDigits.includes(d)).length;
    const coldCount = digits.filter((d) => coldDigits.includes(d)).length;

    let hotColdScore = 5;
    if (
      (hotCount === 2 && coldCount === 1) ||
      (hotCount === 1 && coldCount === 2)
    ) {
      hotColdScore = 10;
    } else if (hotCount === 3) {
      hotColdScore = 4;
    } else if (coldCount === 3) {
      hotColdScore = 3;
    } else if (hotCount === 2 && coldCount === 0) {
      hotColdScore = 7;
    } else if (hotCount === 1 && coldCount === 0) {
      hotColdScore = 6;
    }

    // Dimension 4: Hit rate score
    const freq = getNumFreq(num);
    const hitScore = (freq / maxFreq) * 10;

    // Total score
    const totalScore = (sumScore + spanScore + hotColdScore + hitScore) / 4;

    // Additional flags
    const containsKeyCode = digits.some((d) => keyCodes.includes(d));
    const isEdgeValue = (sum < 10 || sum > 22) || (span < 4 || span > 6);

    scoredNumbers[num] = {
      num,
      sum,
      span,
      sumScore: sumScore.toFixed(2),
      spanScore: spanScore.toFixed(2),
      hotColdScore: hotColdScore.toFixed(2),
      hitScore: hitScore.toFixed(2),
      totalScore: totalScore.toFixed(2),
      hotCount,
      coldCount,
      containsKeyCode,
      isEdgeValue,
      digits,
    };
  }

  return scoredNumbers;
}

// Perform 9-layer filtering
export function performNineLayerFiltering(
  scoredNumbers: Record<string, ScoredNumber>,
  hotDigits: number[],
  keyCodes: number[]
): Record<string, ScoredNumber[]> {
  const layerResults: Record<string, ScoredNumber[]> = {};

  const allScored = Object.values(scoredNumbers).sort(
    (a, b) => parseFloat(b.totalScore) - parseFloat(a.totalScore)
  );

  // L9: Original layer (top 90%)
  layerResults.L9 = allScored.slice(0, 900);

  // L8: Edge layer (remove bottom 20%)
  layerResults.L8 = layerResults.L9.slice(0, 800);

  // L7: Balance layer (70% hot, 20% cold, 10% other)
  const withHot = layerResults.L8.filter((n) => n.hotCount > 0);
  const withCold = layerResults.L8.filter((n) => n.coldCount > 0);
  const others = layerResults.L8.filter(
    (n) => n.hotCount === 0 && n.coldCount === 0
  );
  layerResults.L7 = [
    ...withHot.slice(0, Math.floor(700 * 0.7)),
    ...withCold.slice(0, Math.floor(700 * 0.2)),
    ...others.slice(0, Math.floor(700 * 0.1)),
  ].slice(0, 700);

  // L6: Fault tolerance layer (600 combinations)
  layerResults.L6 = layerResults.L7.slice(0, 600);

  // L5: Standard layer (500 combinations)
  layerResults.L5 = layerResults.L6.slice(0, 500);

  // L4: Extension layer (400 combinations)
  const edgeCombos = layerResults.L5.filter((n) => n.isEdgeValue);
  const normalCombos = layerResults.L5.filter((n) => !n.isEdgeValue);
  layerResults.L4 = [
    ...edgeCombos.slice(0, Math.floor(400 * 0.4)),
    ...normalCombos.slice(0, Math.floor(400 * 0.6)),
  ].slice(0, 400);

  // L3: Core layer (300 combinations with key codes)
  const withKeyCode = layerResults.L4.filter((n) => n.containsKeyCode);
  const withoutKeyCode = layerResults.L4.filter((n) => !n.containsKeyCode);
  layerResults.L3 = [
    ...withKeyCode.slice(0, 300),
    ...withoutKeyCode.slice(0, Math.max(0, 300 - withKeyCode.length)),
  ].slice(0, 300);

  // L2: Selected layer (200 combinations)
  layerResults.L2 = layerResults.L3.slice(0, 200);

  // L1: Limit layer (100 combinations)
  layerResults.L1 = layerResults.L2.slice(0, 100);

  return layerResults;
}

// Test if draw number hits L6 layer
export function testL6Hit(
  drawNumber: string,
  l6Results: ScoredNumber[]
): boolean {
  const lastThree = extractLastThreeDigits(drawNumber);
  return l6Results.some((item) => item.num === lastThree);
}

// Get layer information
export const LAYERS = [
  { id: "L9", name: "Original", ratio: 0.9, desc: "Top 90% by score" },
  { id: "L8", name: "Edge", ratio: 0.8, desc: "Remove bottom 20%" },
  { id: "L7", name: "Balance", ratio: 0.7, desc: "Hot/cold distribution" },
  { id: "L6", name: "Fault Tolerance", ratio: 0.6, desc: "Fault tolerance" },
  { id: "L5", name: "Standard", ratio: 0.5, desc: "Standard matrix" },
  { id: "L4", name: "Extension", ratio: 0.4, desc: "Range coverage" },
  { id: "L3", name: "Core", ratio: 0.3, desc: "Key code rotation" },
  { id: "L2", name: "Selected", ratio: 0.2, desc: "Misalignment" },
  { id: "L1", name: "Limit", ratio: 0.1, desc: "Top scores only" },
];
