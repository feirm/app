import * as argon2 from "argon2-browser";
import bufferToHex from "@/lib/bufferToHex";

interface Account {
  Username: string;
  Email: string;
  RootPasswordSalt: string;
  RootPublicKey: string;
  EncryptedRootKey: {
    CipherText: string;
    Iv: string;
  };
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
        RootPasswordSalt: bufferToHex(saltArray),
        RootPublicKey: "",
        EncryptedRootKey: {
            CipherText: "",
            Iv: ""
        },
    } as Account;
    
    return account;
}

export {
    generateAccount
}