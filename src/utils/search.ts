export function normalizeText(value: unknown): string {
  if (value === null || value === undefined) return "";

  const str = String(value);

  // Chuẩn hóa riêng ký tự đ/Đ cho chắc chắn (phải làm trước khi normalize)
  const normalized = str
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");

  // Chuyển về lowercase trước khi normalize để đảm bảo xử lý đúng
  return normalized
    .toLowerCase()
    .normalize("NFD") // Tách dấu ra khỏi ký tự
    .replace(/[\u0300-\u036f]/g, "") // Xóa tất cả các dấu (diacritics)
    .replace(/[^a-z0-9\s]/g, " ") // Thay thế ký tự đặc biệt bằng space
    .replace(/\s+/g, " ") // Chuẩn hóa nhiều space thành 1 space
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

    return tokens.every((token) => haystack.includes(token));
  });
}

