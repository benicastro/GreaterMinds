import { PROMPT_REGISTRY, compilePrompt, CompiledPrompt } from '@greater-minds/shared';

const cache = new Map<string, CompiledPrompt>(
  PROMPT_REGISTRY.map((prompt) => [prompt.id, compilePrompt(prompt)]),
);

export function getCompiledPrompt(promptId: string): CompiledPrompt {
  const compiled = cache.get(promptId);
  if (!compiled) {
    throw new Error(`Unknown prompt id: ${promptId}`);
  }
  return compiled;
}
