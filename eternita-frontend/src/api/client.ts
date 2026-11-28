type ApiRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  idToken?: string;
  body?: unknown;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getApiBaseUrl(): string {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

  if (!baseUrl) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL is not configured.");
  }

  return baseUrl;
}

function getApplicationError(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  if ("error" in payload && typeof payload.error === "string") {
    return payload.error;
  }

  return undefined;
}

function getResponseMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  if ("message" in payload && typeof payload.message === "string") {
    return payload.message;
  }

  if ("message" in payload && Array.isArray(payload.message)) {
    return payload.message.join(", ");
  }

  return undefined;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const idToken = options.idToken;
  if (idToken) {
    headers.Authorization = `Bearer ${idToken}`;
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: options.method ?? "GET",
    headers,
    body:
      options.body === undefined
        ? undefined
        : JSON.stringify(options.body),
  });
  const responseText = await response.text();
  let payload: unknown;

  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      if (!response.ok) {
        throw new ApiError(responseText, response.status);
      }

      throw new Error("Backend returned an invalid JSON response.");
    }
  }

  if (!response.ok) {
    throw new ApiError(
      getResponseMessage(payload) ?? "Backend request failed.",
      response.status
    );
  }

  const applicationError = getApplicationError(payload);
  if (applicationError) {
    throw new ApiError(applicationError, response.status);
  }

  return payload as T;
}
