
# Frontend Query String Specification
## For api-query-params Backend

## Purpose

This document defines how Frontend must build query strings when calling APIs.

Backend uses api-query-params → converts query string directly to MongoDB filters.

Frontend MUST follow this spec.

---

# BASIC FORMAT

```

?filter[field]=value
&sort=field,-field2
&limit=20
&skip=0

```

---

# FILTERING

## Equality

```

?filter[name]=John

```

---

## Multiple Fields (AND)

```

?filter[name]=John&filter[status]=active

```

Equivalent logic:

```

name === "John" AND status === "active"

```

---

## Comparison Operators

| Operator | Meaning |
|---------|--------|
| $gt | > |
| $gte | >= |
| $lt | < |
| $lte | <= |
| $ne | != |

Example:

```

?filter[age][$gte]=25

````

---

## IN (multi-select filters)

Frontend multi-select:

```ts
["active", "pending"]
````

Convert to:

```
?filter[status][$in]=active,pending
```

---

## Text Search (LIKE)

```
?filter[name][$regex]=john&filter[name][$options]=i
```

Used for search input.

---

# OR CONDITIONS

Example:

User selects roles: Admin OR Manager

```
?filter[$or][0][role]=admin
&filter[$or][1][role]=manager
```

---

# COMBINED FILTER

```
?filter[status]=active
&filter[age][$gte]=30
&filter[$or][0][role]=admin
&filter[$or][1][role]=manager
```

Meaning:

```
status = active
AND age >= 30
AND (role = admin OR role = manager)
```

---

# DATE RANGE FILTER

From / To UI:

```ts
from = "2025-01-01"
to   = "2025-12-31"
```

Convert:

```
?filter[createdAt][$gte]=2025-01-01
&filter[createdAt][$lte]=2025-12-31
```

---

# SORTING

## Single

Ascending:

```
?sort=name
```

Descending:

```
?sort=-createdAt
```

---

## Multiple

```
?sort=-createdAt,name,age
```

Rule:

* "-" prefix = DESC
* no prefix = ASC

---

# PAGINATION

Backend supports SKIP + LIMIT.

Frontend Page UI:

```ts
page = 2
pageSize = 20
```

Convert:

```
limit = pageSize
skip = (page - 1) * pageSize
```

Final:

```
?limit=20&skip=20
```

---

# FIELD SELECTION (OPTIONAL)

If frontend needs partial fields:

```
?projection[name]=1&projection[email]=1
```

---

# FULL REAL EXAMPLE

```
/api/users
?filter[status]=active
&filter[age][$gte]=25
&filter[name][$regex]=john
&filter[name][$options]=i
&filter[$or][0][role]=admin
&filter[$or][1][role]=manager
&sort=-createdAt,name
&limit=20
&skip=0
```

---

# FRONTEND HELPER FUNCTION (RECOMMENDED)

```ts
export function buildQuery(params: {
  page?: number;
  pageSize?: number;
  sort?: string[];
  filters?: Record<string, any>;
}) {
  const q = new URLSearchParams();

  if (params.sort?.length) {
    q.set("sort", params.sort.join(","));
  }

  if (params.pageSize) {
    q.set("limit", String(params.pageSize));
    q.set(
      "skip",
      String(((params.page ?? 1) - 1) * params.pageSize)
    );
  }

  Object.entries(params.filters || {}).forEach(([k, v]) => {
    q.set(`filter[${k}]`, v);
  });

  return q.toString();
}
```

---

# UI → QUERY MAPPING TABLE

| UI Component | Query         |
| ------------ | ------------- |
| Search box   | `$regex`      |
| Range slider | `$gte / $lte` |
| Multi-select | `$in`         |
| Checkbox OR  | `$or`         |
| Sort header  | `sort=`       |
| Pagination   | `limit/skip`  |

---

# IMPORTANT RULES FOR FRONTEND

✅ Always send pagination
✅ Always send sort
✅ Never send raw Mongo operators except documented
✅ Never expose internal fields
✅ Regex must include `$options=i`
✅ Multi-select → `$in`
✅ OR checkbox → `$or`

---

# AI FRONTEND AGENT RULES

When generating query:

1. Prefer AND by default
2. Use OR only for checkbox groups
3. Always calculate skip
4. Always include limit
5. Always include sort
6. Never invent fields

---