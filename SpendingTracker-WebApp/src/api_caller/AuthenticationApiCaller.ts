const SIGN_IN_URL = "/api/auth/web/sign-in";
const SIGN_IN_WITH_GOOGLE_URL = "/api/auth/web/sign-in/google";
const SIGN_OUT_URL = "/api/auth/web/sign-out";
const SIGN_UP_URL = "/api/auth/web/sign-up";

/**
 * Signs in a user.
 * @param email - The email of the user.
 * @param password - The password of the user.
 * @returns A promise that resolves when the user is signed in.
 */
export function signIn(
  { email, password }: { email: string; password: string },
  remember: boolean
): Promise<Response> {
  let url = SIGN_IN_URL;
  if (remember) {
    url += "?remember=true";
  }

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
}

/**
 * Signs in a user using Google authentication.
 * @returns A promise that resolves when the user is signed in with Google.
 */
export function signInWithGoogle(remember: boolean): Promise<Response> {
  let url = SIGN_IN_WITH_GOOGLE_URL;
  if (remember) {
    url += "?remember=true";
  }

  return fetch(url, {
    method: "GET",
    credentials: "include",
  });
}

/**
 * Signs out the current user.
 * @returns A promise that resolves when the user is signed out.
 */
export function signOut(): Promise<Response> {
  return fetch(SIGN_OUT_URL, {
    method: "POST",
    credentials: "include",
  });
}

/**
 * Signs up a new user.
 * @param email - The email of the new user.
 * @param password - The password of the new user.
 * @returns A promise that resolves to the response of the sign-up request.
 */
export function SignUp(
  { email, password }: { email: string; password: string }
): Promise<Response> {
  return fetch(SIGN_UP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
}

export interface AuthenticationApiCaller {
  signIn: (credentials: { email: string; password: string }, remember: boolean) => Promise<Response>;
  signInWithGoogle: (remember: boolean) => Promise<Response>;
  signOut: () => Promise<Response>;
  SignUp: (credentials: { email: string; password: string }, isWeb?: boolean) => Promise<Response>;
};

export const authenticationApiCaller: AuthenticationApiCaller = {
  signIn,
  signInWithGoogle,
  signOut,
  SignUp,
};