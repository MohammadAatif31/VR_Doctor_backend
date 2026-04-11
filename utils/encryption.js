import CryptoJS from "crypto-js";

const SECRET = process.env.CHAT_SECRET || "aatif_secret";

export const encryptText = (text) => {
  return CryptoJS.AES.encrypt(text, SECRET).toString();
};

export const decryptText = (cipher) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, SECRET);
    return bytes.toString(CryptoJS.enc.Utf8) || cipher;
  } catch {
    return cipher;
  }
};