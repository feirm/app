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

// Representation of a signed authentication token
interface SignedAuthenticationToken {
  id: string;
  username?: string;
  signature: string;
}

// Representation of an authentication token straight from the API
interface AuthenticationToken {
  id: string;
  nonce: string;
}

export {
  EncryptedAccount,
  SignedAuthenticationToken,
  AuthenticationToken
};
