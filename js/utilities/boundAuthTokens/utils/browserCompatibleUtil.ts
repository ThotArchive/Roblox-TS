// TextEncoder is not supported for IE. https://caniuse.com/textencoder
export const textEncode = (str: string): Uint8Array => {
  if (window.TextEncoder) {
    return new TextEncoder().encode(str);
  }
  const utf8 = decodeURIComponent(encodeURIComponent(str));
  const result = new Uint8Array(utf8.length);
  for (let i = 0; i < utf8.length; i++) {
    result[i] = utf8.charCodeAt(i);
  }
  return result;
};

export default {
  textEncode
};
