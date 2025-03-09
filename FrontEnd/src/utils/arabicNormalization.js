export const normalizeArabicText = (text) => {
  if (typeof text !== "string") return "";

  return text
    .normalize("NFKC")
    .replace(/[أإآا]/g, "ا")
    .replace(/[ىي]/g, "ي")
    .replace(/[ؤ]/g, "و")
    .replace(/[ة]/g, "ه")
    .replace(/[ئ]/g, "ي")
    .toLowerCase();
};
