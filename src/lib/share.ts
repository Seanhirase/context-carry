import CryptoJS from "crypto-js";

export type HandoverPayload = {
  patientAlias: string;
  room?: string;
  issue: string;
  urgency: "Routine" | "Watch" | "Time-Critical" | "";
  alerts: string[];
  pendingResults?: string;
  todo: string;
  contact?: string;
  microStory?: string;
};

export const generatePin = (): string => {
  return String(Math.floor(1000 + Math.random() * 9000));
};

export const encryptPayload = (data: HandoverPayload, pin: string): string => {
  const plaintext = JSON.stringify(data);
  // Using passphrase-based AES; salt is embedded in the output string
  return CryptoJS.AES.encrypt(plaintext, pin).toString();
};

export const decryptPayload = (
  cipher: string,
  pin: string
): HandoverPayload | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, pin);
    const decoded = bytes.toString(CryptoJS.enc.Utf8);
    if (!decoded) return null;
    return JSON.parse(decoded) as HandoverPayload;
  } catch (e) {
    return null;
  }
};

export const buildSharePath = (cipher: string): string => {
  return `/v/${encodeURIComponent(cipher)}`;
};
