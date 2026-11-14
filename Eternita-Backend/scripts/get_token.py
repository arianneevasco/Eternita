import getpass

import httpx

from app.config import required_env


def main():
    email = input("Firebase email: ").strip()
    password = getpass.getpass("Firebase password: ")

    response = httpx.post(
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword",
        params={"key": required_env("FIREBASE_WEB_API_KEY")},
        json={
            "email": email,
            "password": password,
            "returnSecureToken": True,
        },
        timeout=20,
    )

    if response.is_error:
        print("Sign-in failed. Check the account and Firebase configuration.")
        return

    print(response.json()["idToken"])


if __name__ == "__main__":
    main()