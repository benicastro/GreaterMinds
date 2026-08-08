// TODO(content): This is a STUB, not the authoritative list. The official Philippine
// provinces list has ~81-86 entries depending on how recent splits/renames are treated
// (e.g. Davao de Oro vs. "Compostela Valley", Cotabato vs. "North Cotabato", the
// Maguindanao del Norte / del Sur split, Samar naming, Dinagat Islands, NCR is not a
// province). Source and verify the full list + common spelling-variant aliases
// (e.g. "Nueva Ecija" misspellings, "Metro Manila" is NOT a province) before shipping
// this prompt for real play. Populated with a small sample set for now so the app
// builds and runs end-to-end.
export const PH_PROVINCES: string[] = [
  'Cebu',
  'Davao del Sur',
  'Ilocos Norte',
  'Ilocos Sur',
  'Pampanga',
  'Batangas',
  'Cavite',
  'Laguna',
  'Bohol',
  'Palawan',
];

export const PH_PROVINCE_ALIASES: Record<string, string> = {
  // TODO(content): populate alongside the full list above (e.g. common misspellings).
};
