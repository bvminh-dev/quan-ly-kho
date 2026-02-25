export function normalizeText(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value)
    // Chuẩn hóa riêng ký tự đ/Đ cho chắc chắn
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d");

  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function quickSearchFilter<T>(
  items: T[],
  query: string,
  getFields: (item: T) => Array<unknown>,
): T[] {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return items;

  const tokens = normalizedQuery.split(" ").filter(Boolean);
  if (!tokens.length) return items;

  return items.filter((item) => {
    const fields = getFields(item).filter(
      (v) => v !== null && v !== undefined,
    );
    if (!fields.length) return false;

    const haystack = normalizeText(fields.join(" "));
    if (!haystack) return false;

    return tokens.some((token) => haystack.includes(token));
  });
}

