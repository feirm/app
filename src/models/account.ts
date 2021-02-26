interface Account {
  username: string;
  pin?: string;
  rootPasswordSalt: string;
  rootPublicKey: string;
  encryptedRootKey: {
    cipherText: string;
    iv: string;
  };
  token?: {
    id: string;
    signature: string;
  };
}

export { Account };