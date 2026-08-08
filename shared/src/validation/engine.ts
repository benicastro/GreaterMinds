import { PromptDefinition, ValidationResult } from '../types.js';
import { normalizeForMatch } from './normalize.js';

export interface CompiledPrompt {
  definition: PromptDefinition;
  lookup: Map<string, string>;
  rejectSet: Set<string>;
}

export function compilePrompt(definition: PromptDefinition): CompiledPrompt {
  const lookup = new Map<string, string>();

  for (const canonical of definition.canonicalAnswers) {
    lookup.set(normalizeForMatch(canonical), canonical);
  }

  if (definition.aliases) {
    for (const [alias, canonical] of Object.entries(definition.aliases)) {
      lookup.set(normalizeForMatch(alias), canonical);
    }
  }

  const rejectSet = new Set((definition.rejections ?? []).map(normalizeForMatch));

  return { definition, lookup, rejectSet };
}

export function classifyAnswer(compiled: CompiledPrompt, raw: string): ValidationResult {
  if (compiled.definition.validate) {
    return compiled.definition.validate(raw);
  }

  const normalized = normalizeForMatch(raw);
  if (!normalized) {
    return { valid: false };
  }

  if (compiled.rejectSet.has(normalized)) {
    return { valid: false };
  }

  const canonicalAnswer = compiled.lookup.get(normalized);
  if (!canonicalAnswer) {
    return { valid: false };
  }

  return { valid: true, canonicalAnswer };
}
