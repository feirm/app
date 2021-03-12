// Representation of an encrypted user account from the API
interface EncryptedAccount {
  username: string;
  pin: string;
  rootPasswordSalt: string;
  rootPublicKey: string;
  encryptedRootKey: {
    cipherText: string;
    iv: string;
  };
  token?: SignedAuthenticationToken;
}

// Representation of an encrypted account for V2
interface EncryptedAccountV2 {
  uid: string;
  encrypted_key: EncryptedKey;
  created_at: number;
  version: number;
}

// Representation of an encrypted key for V2
interface EncryptedKey {
  key: string;
  iv: string;
  salt: string;
}

// Representation of a signed authentication token
interface SignedAuthenticationToken {
  id?: string;
  username?: string;
  signature?: string;
}

// Representation of an authentication token straight from the API
interface AuthenticationToken {
  id: string;
  nonce: string;
}

export {
  EncryptedAccount,
  EncryptedAccountV2,
  EncryptedKey,
  SignedAuthenticationToken,
  AuthenticationToken
};
