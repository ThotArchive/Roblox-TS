import cryptoUtil from '../boundAuthTokens/crypto/cryptoUtil';

export const base64StringToBase64UrlString = (rawString: string) => {
  return rawString.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

export const base64UrlStringToBase64String = (rawString: string) => {
  const padding = rawString.length % 4 ? 4 - (rawString.length % 4) : 0;
  return rawString.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padding);
};

export const convertPublicKeyParametersToStandardBase64 = (options: string) => {
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
  const makeOptions = JSON.parse(options);
  makeOptions.publicKey.challenge = base64UrlStringToBase64String(makeOptions.publicKey.challenge);

  if (makeOptions.publicKey.user && makeOptions.publicKey.user.id) {
    makeOptions.publicKey.user.id = base64UrlStringToBase64String(
      (makeOptions.publicKey.user.id as unknown) as string
    );
  }
  if (makeOptions.publicKey.allowCredentials) {
    for (let i = 0; i < makeOptions.publicKey.allowCredentials.length; i++) {
      makeOptions.publicKey.allowCredentials[i].id = base64UrlStringToBase64String(
        makeOptions.publicKey.allowCredentials[i].id
      );
    }
  }
  if (makeOptions.publicKey.excludeCredentials) {
    for (let i = 0; i < makeOptions.publicKey.excludeCredentials.length; i++) {
      makeOptions.publicKey.excludeCredentials[i].id = base64UrlStringToBase64String(
        (makeOptions.publicKey.excludeCredentials[i].id as unknown) as string
      );
    }
  }
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return makeOptions;
};

export const formatCredentialAuthenticationResponseApp = (credentialString: string) => {
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
  const credential = JSON.parse(credentialString);
  const publicKeyCredential = {
    id: base64StringToBase64UrlString(credential.id),
    type: credential.type,
    response: {
      authenticatorData: base64StringToBase64UrlString(credential.response.authenticatorData),
      clientDataJSON: base64StringToBase64UrlString(credential.response.clientDataJSON)
    }
  };
  if ('rawId' in credential) {
    (publicKeyCredential as any).rawId = base64StringToBase64UrlString(credential.rawId);
  }
  if ('signature' in credential.response) {
    (publicKeyCredential as any).response.signature = base64StringToBase64UrlString(
      credential.response.signature
    );
  }
  if ('userHandle' in credential.response) {
    (publicKeyCredential as any).response.userHandle = base64StringToBase64UrlString(
      credential.response.userHandle
    );
  }
  return JSON.stringify(publicKeyCredential);
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
};

export const formatCredentialRegistrationResponseApp = (credentialString: string) => {
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
  const credential = JSON.parse(credentialString);
  if (credential.rawId !== undefined) {
    return JSON.stringify({
      authenticatorAttachment: credential.authenticatorAttachment,
      id: base64StringToBase64UrlString(credential.id),
      type: credential.type,
      rawId: base64StringToBase64UrlString(credential.rawId),
      response: {
        attestationObject: base64StringToBase64UrlString(credential.response.attestationObject),
        clientDataJSON: base64StringToBase64UrlString(credential.response.clientDataJSON)
      }
    });
  }
  return JSON.stringify({
    authenticatorAttachment: credential.authenticatorAttachment,
    id: base64StringToBase64UrlString(credential.id),
    type: credential.type,
    response: {
      attestationObject: base64StringToBase64UrlString(credential.response.attestationObject),
      clientDataJSON: base64StringToBase64UrlString(credential.response.clientDataJSON)
    }
  });
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
};

export const formatCredentialRequestWeb = (options: string) => {
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
  const makeAssertionOptions = JSON.parse(options);
  makeAssertionOptions.publicKey.challenge = cryptoUtil.base64StringToArrayBuffer(
    (makeAssertionOptions.publicKey.challenge as unknown) as string
  );

  if (makeAssertionOptions.publicKey.allowCredentials) {
    for (let i = 0; i < makeAssertionOptions.publicKey.allowCredentials.length; i++) {
      makeAssertionOptions.publicKey.allowCredentials[i].id = cryptoUtil.base64StringToArrayBuffer(
        makeAssertionOptions.publicKey.allowCredentials[i].id
      );
    }
  }

  if (makeAssertionOptions.publicKey.user && makeAssertionOptions.publicKey.user.id) {
    makeAssertionOptions.publicKey.user.id = cryptoUtil.base64StringToArrayBuffer(
      (makeAssertionOptions.publicKey.user.id as unknown) as string
    );
  }
  if (makeAssertionOptions.publicKey.excludeCredentials) {
    for (let i = 0; i < makeAssertionOptions.publicKey.excludeCredentials.length; i++) {
      makeAssertionOptions.publicKey.excludeCredentials[
        i
      ].id = cryptoUtil.base64StringToArrayBuffer(
        (makeAssertionOptions.publicKey.excludeCredentials[i].id as unknown) as string
      );
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return makeAssertionOptions.publicKey;
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
};

export const formatCredentialAuthenticationResponseWeb = (credential: PublicKeyCredential) => {
  const response = credential.response as AuthenticatorAssertionResponse;
  const authData = new Uint8Array(response.authenticatorData);
  const clientDataJSON = new Uint8Array(response.clientDataJSON);
  const rawId = new Uint8Array(credential.rawId);
  const signature = new Uint8Array(response.signature);
  const userHandle = new Uint8Array(response.userHandle);
  const publicKeyCredential = {
    id: credential.id,
    rawId: base64StringToBase64UrlString(cryptoUtil.arrayBufferToBase64String(rawId)),
    type: credential.type,
    response: {
      authenticatorData: base64StringToBase64UrlString(
        cryptoUtil.arrayBufferToBase64String(authData)
      ),
      clientDataJSON: base64StringToBase64UrlString(
        cryptoUtil.arrayBufferToBase64String(clientDataJSON)
      ),
      signature: base64StringToBase64UrlString(cryptoUtil.arrayBufferToBase64String(signature)),
      userHandle: base64StringToBase64UrlString(cryptoUtil.arrayBufferToBase64String(userHandle))
    }
  };
  return JSON.stringify(publicKeyCredential);
};

export const formatCredentialRegistrationResponseWeb = (credential: PublicKeyCredential) => {
  const response = credential.response as AuthenticatorAttestationResponse;
  const attestationObject = new Uint8Array(response.attestationObject);
  const clientDataJSON = new Uint8Array(response.clientDataJSON);
  const rawId = new Uint8Array(credential.rawId);
  return JSON.stringify({
    // For some reason this will always fail to build without an explicit any typecast.
    // Although PublicKeyCredential should always have authenticatorAttachment, the compiler is somehow unaware.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    authenticatorAttachment: (credential as any).authenticatorAttachment,
    id: credential.id,
    rawId: base64StringToBase64UrlString(cryptoUtil.arrayBufferToBase64String(rawId)),
    type: credential.type,
    response: {
      attestationObject: base64StringToBase64UrlString(
        cryptoUtil.arrayBufferToBase64String(attestationObject)
      ),
      clientDataJSON: base64StringToBase64UrlString(
        cryptoUtil.arrayBufferToBase64String(clientDataJSON)
      )
    }
  });
};

export default {
  base64StringToBase64UrlString,
  base64UrlStringToBase64String,
  convertPublicKeyParametersToStandardBase64,
  formatCredentialAuthenticationResponseApp,
  formatCredentialRegistrationResponseApp,
  formatCredentialRequestWeb,
  formatCredentialAuthenticationResponseWeb,
  formatCredentialRegistrationResponseWeb
};
