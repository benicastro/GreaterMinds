import { PromptDefinition } from '../types.js';
import { PH_PROVINCES, PH_PROVINCE_ALIASES } from '../data/ph-provinces.js';

export const phProvince: PromptDefinition = {
  id: 'ph-province',
  category: 'Philippine Province',
  promptText: 'Name a Philippine province.',
  // NOTE: canonicalAnswers is sourced from a STUB list — see shared/src/data/ph-provinces.ts.
  canonicalAnswers: PH_PROVINCES,
  aliases: PH_PROVINCE_ALIASES,
  hostAnswer: 'Cebu',
};
