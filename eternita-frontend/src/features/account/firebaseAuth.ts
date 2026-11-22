export interface FirebaseCredential {
  idToken: string;
  refreshToken: string;
  localId: string;
  email: string;
}

export class FirebaseAuthError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "FirebaseAuthError";
  }
}

type FirebaseAction =
  | "signUp"
  | "signInWithPassword"
  | "sendOobCode"
  | "lookup";

type FirebaseResponse = {
  idToken?: string;
  refreshToken?: string;
  localId?: string;
  email?: string;
  users?: { emailVerified?: boolean }[];
  error?: {
    message?: string;
  };
};

function getApiKey(): string {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "Firebase is not configured. Set EXPO_PUBLIC_FIREBASE_API_KEY in eternita-frontend/.env."
    );
  }
  return apiKey;
}

function getFirebaseError(code: string | undefined): string {
  switch (code) {
    case "EMAIL_EXISTS":
      return "An account with this email already exists. Sign in instead.";
    case "INVALID_LOGIN_CREDENTIALS":
    case "EMAIL_NOT_FOUND":
    case "INVALID_PASSWORD":
      return "The email or password is incorrect.";
    case "WEAK_PASSWORD":
      return "Choose a stronger password with at least 8 characters.";
    case "OPERATION_NOT_ALLOWED":
      return "Email and password sign-in is disabled in this Firebase project.";
    case "INVALID_API_KEY":
      return "The Firebase API key is invalid.";
    case "TOO_MANY_ATTEMPTS_TRY_LATER":
      return "Too many attempts. Please try again later.";
    default:
      return code ? `Firebase authentication failed: ${code}` : "Firebase authentication failed.";
  }
}

async function requestFirebase(
  action: FirebaseAction,
  body: Record<string, string | boolean>
): Promise<FirebaseResponse> {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${encodeURIComponent(getApiKey())}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  const payload = (await response.json()) as FirebaseResponse;

  if (!response.ok) {
    const code = payload.error?.message ?? "";
    throw new FirebaseAuthError(code, getFirebaseError(code));
  }
  return payload;
}

function requireCredential(payload: FirebaseResponse): FirebaseCredential {
  if (!payload.idToken || !payload.refreshToken || !payload.localId || !payload.email) {
    throw new Error("Firebase returned an incomplete authentication response.");
  }
  return {
    idToken: payload.idToken,
    refreshToken: payload.refreshToken,
    localId: payload.localId,
    email: payload.email,
  };
}

export async function createFirebaseAccount(
  email: string,
  password: string
): Promise<FirebaseCredential> {
  const payload = await requestFirebase("signUp", {
    email,
    password,
    returnSecureToken: true,
  });
  return requireCredential(payload);
}

export async function signInWithFirebase(
  email: string,
  password: string
): Promise<FirebaseCredential> {
  const payload = await requestFirebase("signInWithPassword", {
    email,
    password,
    returnSecureToken: true,
  });
  return requireCredential(payload);
}

export async function sendFirebaseVerificationEmail(
  idToken: string
): Promise<void> {
  await requestFirebase("sendOobCode", {
    requestType: "VERIFY_EMAIL",
    idToken,
  });
}

export async function isFirebaseEmailVerified(idToken: string): Promise<boolean> {
  const lookup = await requestFirebase("lookup", { idToken });
  if (!Array.isArray(lookup.users) || !lookup.users[0]) {
    throw new Error("Firebase did not return the account verification status.");
  }
  return lookup.users[0].emailVerified === true;
}

export async function refreshAndVerifyFirebaseEmail(
  email: string,
  refreshToken: string
): Promise<FirebaseCredential> {
  const response = await fetch(
    `https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(getApiKey())}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }).toString(),
    }
  );
  const payload = (await response.json()) as {
    id_token?: string;
    refresh_token?: string;
    user_id?: string;
    error?: { message?: string };
  };

  if (!response.ok) {
    const code = payload.error?.message ?? "";
    throw new FirebaseAuthError(code, getFirebaseError(code));
  }
  if (!payload.id_token || !payload.refresh_token || !payload.user_id) {
    throw new Error("Firebase returned an incomplete session refresh.");
  }

  if (!(await isFirebaseEmailVerified(payload.id_token))) {
    throw new Error("Open the verification link in your email, then try again.");
  }

  return {
    idToken: payload.id_token,
    refreshToken: payload.refresh_token,
    localId: payload.user_id,
    email,
  };
}
