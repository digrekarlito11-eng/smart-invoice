/**
 * Smart Invoice — Répertoire Complet des Devises Africaines & Internationales
 * Permet un formatage précis des montants selon la zone monétaire.
 */

export const CURRENCIES = [
  // --- AFRIQUE DE L'OUEST & CENTRALE (ZONE FRANC CFA) ---
  {
    code: 'XOF',
    name: 'Franc CFA (UEMOA / Ouest)',
    symbol: 'FCFA',
    flag: '🌍',
    decimals: 0,
    countries: 'Sénégal, Côte d\'Ivoire, Bénin, Burkina Faso, Mali, Niger, Togo, Guinée-Bissau'
  },
  {
    code: 'XAF',
    name: 'Franc CFA (CEMAC / Centrale)',
    symbol: 'FCFA',
    flag: '🌍',
    decimals: 0,
    countries: 'Cameroun, Gabon, Congo, Tchad, Centrafrique, Guinée Équatoriale'
  },
  {
    code: 'GNF',
    name: 'Franc Guinéen',
    symbol: 'FG',
    flag: '🇬🇳',
    decimals: 0,
    countries: 'Guinée'
  },

  // --- NIGERIA & GHANA ---
  {
    code: 'NGN',
    name: 'Naira Nigérian',
    symbol: '₦',
    flag: '🇳🇬',
    decimals: 2,
    countries: 'Nigeria'
  },
  {
    code: 'GHS',
    name: 'Cedi Ghanéen',
    symbol: 'GH₵',
    flag: '🇬🇭',
    decimals: 2,
    countries: 'Ghana'
  },

  // --- AFRIQUE DU NORD (MAGHREB & ÉGYPTE) ---
  {
    code: 'MAD',
    name: 'Dirham Marocain',
    symbol: 'DH',
    flag: '🇲🇦',
    decimals: 2,
    countries: 'Maroc'
  },
  {
    code: 'DZD',
    name: 'Dinar Algérien',
    symbol: 'DA',
    flag: '🇩🇿',
    decimals: 2,
    countries: 'Algérie'
  },
  {
    code: 'TND',
    name: 'Dinar Tunisien',
    symbol: 'DT',
    flag: '🇹🇳',
    decimals: 3,
    countries: 'Tunisie'
  },
  {
    code: 'EGP',
    name: 'Livre Égyptienne',
    symbol: 'E£',
    flag: '🇪🇬',
    decimals: 2,
    countries: 'Égypte'
  },

  // --- AFRIQUE CENTRALE & DES GRANDS LACS ---
  {
    code: 'CDF',
    name: 'Franc Congolais',
    symbol: 'FC',
    flag: '🇨🇩',
    decimals: 2,
    countries: 'RD Congo'
  },
  {
    code: 'RWF',
    name: 'Franc Rwandais',
    symbol: 'FRw',
    flag: '🇷🇼',
    decimals: 0,
    countries: 'Rwanda'
  },
  {
    code: 'BIF',
    name: 'Franc Burundais',
    symbol: 'FBu',
    flag: '🇧🇮',
    decimals: 0,
    countries: 'Burundi'
  },

  // --- AFRIQUE DE L'EST ---
  {
    code: 'KES',
    name: 'Shilling Kenyan',
    symbol: 'KSh',
    flag: '🇰🇪',
    decimals: 2,
    countries: 'Kenya'
  },
  {
    code: 'UGX',
    name: 'Shilling Ougandais',
    symbol: 'USh',
    flag: '🇺🇬',
    decimals: 0,
    countries: 'Ouganda'
  },
  {
    code: 'TZS',
    name: 'Shilling Tanzanien',
    symbol: 'TSh',
    flag: '🇹🇿',
    decimals: 0,
    countries: 'Tanzanie'
  },
  {
    code: 'ETB',
    name: 'Birr Éthiopien',
    symbol: 'Br',
    flag: '🇪🇹',
    decimals: 2,
    countries: 'Éthiopie'
  },

  // --- OCÉAN INDIEN & AFRIQUE AUSTRALE ---
  {
    code: 'MGA',
    name: 'Ariary Malgache',
    symbol: 'Ar',
    flag: '🇲🇬',
    decimals: 0,
    countries: 'Madagascar'
  },
  {
    code: 'MUR',
    name: 'Roupie Mauricienne',
    symbol: 'Rs',
    flag: '🇲🇺',
    decimals: 2,
    countries: 'Île Maurice'
  },
  {
    code: 'ZAR',
    name: 'Rand Sud-Africain',
    symbol: 'R',
    flag: '🇿🇦',
    decimals: 2,
    countries: 'Afrique du Sud'
  },

  // --- INTERNATIONAL & DIASPORA ---
  {
    code: 'EUR',
    name: 'Euro (Zone Euro)',
    symbol: '€',
    flag: '🇪🇺',
    decimals: 2,
    countries: 'France, Belgique, Zone Euro'
  },
  {
    code: 'USD',
    name: 'Dollar US',
    symbol: '$',
    flag: '🇺🇸',
    decimals: 2,
    countries: 'États-Unis, International'
  },
  {
    code: 'GBP',
    name: 'Livre Sterling',
    symbol: '£',
    flag: '🇬🇧',
    decimals: 2,
    countries: 'Royaume-Uni'
  },
  {
    code: 'CAD',
    name: 'Dollar Canadien',
    symbol: 'CA$',
    flag: '🇨🇦',
    decimals: 2,
    countries: 'Canada'
  }
];

/**
 * Formate un nombre selon la devise choisie
 * @param {number} amount - Montant numérique
 * @param {string} currencyCode - Code ISO (XOF, USD, EUR, etc.)
 * @returns {string} - Montant formaté avec symbole
 */
export function formatAmount(amount, currencyCode = 'XOF') {
  const curr = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
  const num = Number(amount) || 0;
  
  const formatted = num.toLocaleString('fr-FR', {
    minimumFractionDigits: curr.decimals,
    maximumFractionDigits: curr.decimals
  });

  // Pour le Franc CFA, on place le symbole après avec espace (ex: 25 000 FCFA)
  if (['XOF', 'XAF', 'GNF', 'CDF', 'RWF', 'MAD', 'DZD', 'TND'].includes(curr.code)) {
    return `${formatted} ${curr.symbol}`;
  }
  
  // Pour le Dollar, la Livre, le Naira ou le Cedi, on place souvent le symbole avant
  if (['USD', 'GBP', 'CAD'].includes(curr.code)) {
    return `${curr.symbol}${formatted}`;
  }

  return `${formatted} ${curr.symbol}`;
}
