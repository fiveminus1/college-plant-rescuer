export type PlantVerdict = 'Just watered' | 'Water now' | 'Getting dry, check soon' | 'Fine';

export interface VerdictInput {
  pct: number;
  thirsty: number;
  watered: number;
  lastWatered: number | null;
  intervalDays: number | null;
  now?: number;
  previousVerdict?: PlantVerdict;
}

const HYSTERESIS_POINTS = 2;

export function getPlantVerdict({
  pct,
  thirsty,
  watered,
  lastWatered,
  intervalDays,
  now = Date.now(),
  previousVerdict,
}: VerdictInput): PlantVerdict {
  if (lastWatered !== null && now - lastWatered < 30 * 60 * 1000) return 'Just watered';

  const range = watered - thirsty;
  if (range <= 0) return 'Fine';

  const position = (pct - thirsty) / range;
  const daysSinceWatering = lastWatered === null ? Infinity : (now - lastWatered) / (24 * 60 * 60 * 1000);
  const drySoon = intervalDays !== null && daysSinceWatering >= intervalDays;
  const waterCutoff = previousVerdict === 'Water now' ? 0.15 + HYSTERESIS_POINTS / range : 0.15;
  const dryCutoff = previousVerdict === 'Getting dry, check soon' ? 0.35 + HYSTERESIS_POINTS / range : 0.35;

  if (position <= waterCutoff) return 'Water now';
  if (position <= dryCutoff && drySoon) return 'Getting dry, check soon';
  return 'Fine';
}