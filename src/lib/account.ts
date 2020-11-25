import * as argon2 from "argon2-browser";
import bufferToHex from "@/lib/bufferToHex";

interface Account {
  Username: string;
  Email: string;
  RootPublicKey: string;
  EncryptedRootKey: {
    CipherText: string;
    Iv: string;
  };
  PasswordSalt: string;
}

async function generateAccount(username: string, email: string, password: string): Promise<Account> {
    // Generate 16 random bytes of salt
    const saltArray: Uint8Array = new Uint8Array(16);
    const salt = window.crypto.getRandomValues(saltArray);

    // Derive secret key from password
    const secretKey = await argon2.hash({
        pass: password,
        salt: salt,
        type: argon2.ArgonType.Argon2id,
        hashLen: 32
    })

    const account = {
        Username: username,
        Email: email,
        RootPublicKey: "",
        EncryptedRootKey: {
            CipherText: "",
            Iv: ""
        },
        PasswordSalt: bufferToHex(saltArray)
    } as Account;
    
    return account;
}

export {
    generateAccount
}