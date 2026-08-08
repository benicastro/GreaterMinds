import { PromptDefinition } from '../types.js';
import { PH_PROVINCES, PH_PROVINCE_ALIASES } from '../data/ph-provinces.js';

export const phProvince: PromptDefinition = {
  id: 'ph-province',
  category: 'Philippine Province',
  promptText: 'Name a Philippine province.',
  canonicalAnswers: PH_PROVINCES,
  aliases: PH_PROVINCE_ALIASES,
  hostAnswer: 'Cebu',
};
