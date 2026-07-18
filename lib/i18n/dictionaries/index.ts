import fr from "./fr";
import en from "./en";
import type { Locale } from "../config";

export const dictionaries = { fr, en };
export type Dictionary = typeof fr;

export function getDictionaryFor(locale: Locale): Dictionary {
  return dictionaries[locale];
}
