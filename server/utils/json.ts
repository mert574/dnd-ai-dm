export function parseJson(value: string | null): unknown {
  if (!value) return null;
  return JSON.parse(value);
}