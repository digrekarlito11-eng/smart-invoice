/**
 * Smart Invoice — Répertoire des Méthodes de Paiement
 * Support complet du Mobile Money africain et de Stripe
 */

export const PAYMENT_PROVIDERS = [
  {
    id: 'wave',
    name: 'Wave Mobile Money',
    type: 'mobile_money',
    color: '#1dc4e9',
    badgeText: 'Wave',
    icon: '🌊',
    placeholder: '+225 07 XX XX XX XX',
    labelField: 'Numéro Wave ou Lien Wave'
  },
  {
    id: 'orange_money',
    name: 'Orange Money (OM)',
    type: 'mobile_money',
    color: '#ff7900',
    badgeText: 'Orange Money',
    icon: '🍊',
    placeholder: '+221 77 XX XX XX XX',
    labelField: 'Numéro Orange Money'
  },
  {
    id: 'mtn_momo',
    name: 'MTN Mobile Money (MoMo)',
    type: 'mobile_money',
    color: '#ffcc00',
    badgeText: 'MTN MoMo',
    icon: '🟡',
    placeholder: '+237 6 XX XX XX XX',
    labelField: 'Numéro MTN MoMo'
  },
  {
    id: 'moov_money',
    name: 'Moov Money',
    type: 'mobile_money',
    color: '#005baa',
    badgeText: 'Moov Money',
    icon: '🔵',
    placeholder: '+229 97 XX XX XX XX',
    labelField: 'Numéro Moov Money'
  },
  {
    id: 'mpesa',
    name: 'M-Pesa (Safaricom / Vodacom)',
    type: 'mobile_money',
    color: '#2bb656',
    badgeText: 'M-Pesa',
    icon: '🟢',
    placeholder: '+254 7XX XXX XXX / Till Number',
    labelField: 'Numéro M-Pesa / Till Number'
  },
  {
    id: 'airtel_money',
    name: 'Airtel Money',
    type: 'mobile_money',
    color: '#e21f26',
    badgeText: 'Airtel Money',
    icon: '🔴',
    placeholder: '+243 99 XX XX XX XX',
    labelField: 'Numéro Airtel Money'
  },
  {
    id: 'stripe',
    name: 'Paiement en ligne par Carte (Stripe)',
    type: 'card_online',
    color: '#635bff',
    badgeText: 'Stripe / Carte',
    icon: '💳',
    placeholder: 'https://buy.stripe.com/...',
    labelField: 'Lien de paiement Stripe Checkout'
  },
  {
    id: 'bank_transfer',
    name: 'Virement Bancaire (RIB / IBAN)',
    type: 'bank',
    color: '#334155',
    badgeText: 'Virement',
    icon: '🏦',
    placeholder: 'Banque, Titulaire, IBAN / RIB, Code Swift',
    labelField: 'Coordonnées Bancaires'
  },
  {
    id: 'cash',
    name: 'Espèces / À la livraison',
    type: 'cash',
    color: '#10b981',
    badgeText: 'Espèces',
    icon: '💵',
    placeholder: 'Règlement en mains propres à la livraison',
    labelField: 'Instructions de remise'
  }
];

export function getProvider(id) {
  return PAYMENT_PROVIDERS.find(p => p.id === id) || PAYMENT_PROVIDERS[0];
}
