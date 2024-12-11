import { getCookie, setCookie, deleteCookie } from "cookies-next";
import { type IStorageProvider } from "@lens-protocol/client";

export const storage: IStorageProvider = {
    getItem: async (key: string) => {
        return getCookie(key)?.toString() || null;
      },
      setItem: async (key: string, value: string) => {
        setCookie(key, value);
      },
      removeItem: async (key: string) => {
        setCookie(key, '');
      },
  };