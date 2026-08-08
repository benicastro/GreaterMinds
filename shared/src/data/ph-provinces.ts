// Official list of the 82 Philippine provinces (post-2022 Maguindanao del Norte / del Sur
// split, ratified by plebiscite). NCR (Metro Manila) is a region, not a province, and is
// intentionally excluded here — see metro-manila-city.ts for that prompt's own rejections.
export const PH_PROVINCES: string[] = [
  // Region I – Ilocos Region
  'Ilocos Norte',
  'Ilocos Sur',
  'La Union',
  'Pangasinan',

  // Region II – Cagayan Valley
  'Batanes',
  'Cagayan',
  'Isabela',
  'Nueva Vizcaya',
  'Quirino',

  // Region III – Central Luzon
  'Aurora',
  'Bataan',
  'Bulacan',
  'Nueva Ecija',
  'Pampanga',
  'Tarlac',
  'Zambales',

  // Region IV-A – CALABARZON
  'Batangas',
  'Cavite',
  'Laguna',
  'Quezon',
  'Rizal',

  // MIMAROPA (Region IV-B)
  'Marinduque',
  'Occidental Mindoro',
  'Oriental Mindoro',
  'Palawan',
  'Romblon',

  // Region V – Bicol Region
  'Albay',
  'Camarines Norte',
  'Camarines Sur',
  'Catanduanes',
  'Masbate',
  'Sorsogon',

  // Region VI – Western Visayas
  'Aklan',
  'Antique',
  'Capiz',
  'Guimaras',
  'Iloilo',
  'Negros Occidental',

  // Region VII – Central Visayas
  'Bohol',
  'Cebu',
  'Negros Oriental',
  'Siquijor',

  // Region VIII – Eastern Visayas
  'Biliran',
  'Eastern Samar',
  'Leyte',
  'Northern Samar',
  'Samar',
  'Southern Leyte',

  // Region IX – Zamboanga Peninsula
  'Zamboanga del Norte',
  'Zamboanga del Sur',
  'Zamboanga Sibugay',

  // Region X – Northern Mindanao
  'Bukidnon',
  'Camiguin',
  'Lanao del Norte',
  'Misamis Occidental',
  'Misamis Oriental',

  // Region XI – Davao Region
  'Davao de Oro',
  'Davao del Norte',
  'Davao del Sur',
  'Davao Occidental',
  'Davao Oriental',

  // Region XII – SOCCSKSARGEN
  'Cotabato',
  'Sarangani',
  'South Cotabato',
  'Sultan Kudarat',

  // Region XIII – Caraga
  'Agusan del Norte',
  'Agusan del Sur',
  'Dinagat Islands',
  'Surigao del Norte',
  'Surigao del Sur',

  // CAR – Cordillera Administrative Region
  'Abra',
  'Apayao',
  'Benguet',
  'Ifugao',
  'Kalinga',
  'Mountain Province',

  // BARMM – Bangsamoro Autonomous Region in Muslim Mindanao
  'Basilan',
  'Lanao del Sur',
  'Maguindanao del Norte',
  'Maguindanao del Sur',
  'Sulu',
  'Tawi-Tawi',
];

export const PH_PROVINCE_ALIASES: Record<string, string> = {
  // Renamed in 2019; still very commonly used.
  'Compostela Valley': 'Davao de Oro',
  // Pre-2012 name; still commonly used.
  'Western Samar': 'Samar',
  // Common disambiguation from Cotabato City / South Cotabato.
  'North Cotabato': 'Cotabato',
  // Common word-order variants.
  'Mindoro Occidental': 'Occidental Mindoro',
  'Mindoro Oriental': 'Oriental Mindoro',

  // NOTE: "Maguindanao" (the pre-2022 undivided province) is deliberately NOT aliased here.
  // It split into Maguindanao del Norte and Maguindanao del Sur, and mapping the old name to
  // just one of the two would be an arbitrary, unverifiable call — flagging this as a judgment
  // call rather than silently picking a side. Revisit if this trips up real players.
};
