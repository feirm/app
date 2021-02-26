// Representation of an encrypted user account from the API
interface EncryptedAccount {
  id: string;
  username: string;
  pin: string;
  rootPasswordSalt: string;
  rootPublicKey: string;
  encryptedRootKey: {
    cipherText: string;
    iv: string;
  };
  token?: AuthenticationToken;
}

// Representation of an authentication token
interface AuthenticationToken {
  id: string;
  signature: string;
}

export {
  EncryptedAccount,
  AuthenticationToken
};
