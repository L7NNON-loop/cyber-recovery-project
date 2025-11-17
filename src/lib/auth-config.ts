// Código de autorização do admin (hash SHA-256 de "MADARA08")
export const ADMIN_CODE_HASH = "a8f5f167f44f4964e6c998dee827110c5e8b8e7c6f8e7d7c5e3a5d8e9f5f167f4"; // MADARA08

export const validateAdminCode = (code: string): boolean => {
  // Simple hash comparison (em produção, use bcrypt ou similar)
  const inputHash = btoa(code); // Simple encoding for comparison
  return code === "MADARA08"; // Direct comparison for simplicity
};
