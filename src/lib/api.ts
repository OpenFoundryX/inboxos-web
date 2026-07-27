export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** FastAPI puts the human-readable reason in `detail`, either as a string or,
 *  for validation errors, as a list of {msg, loc} objects. Without this the UI
 *  can only show "Request failed: 422" — but the categorization endpoints
 *  return messages worth reading ("a category is already named 'Client work'"). */
async function errorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    const detail = body?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const msgs = detail.map((d) => d?.msg).filter(Boolean);
      if (msgs.length) return msgs.join("; ");
    }
  } catch {
    // Non-JSON or empty body — fall through to the generic message.
  }
  return `Request failed: ${res.status}`;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new ApiError(res.status, await errorMessage(res));
  }
  if (res.status === 204) {
    return undefined as T;
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
