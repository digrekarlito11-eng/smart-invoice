# ⚡ Smart Invoice — Le Mini-SaaS de Facturation & Devis

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/deployment-GitHub%20Pages-brightgreen.svg)](https://digrekarlito11-eng.github.io/smart-invoice/)
[![Status](https://img.shields.io/badge/status-active%20%2F%20production-success.svg)]()
[![Architecture](https://img.shields.io/badge/architecture-zero--cost%20%26%20offline--first-orange.svg)]()

> **Smart Invoice** est la solution de facturation et devis ultra-rapide taillée pour les entrepreneurs, créateurs, indépendants et commerçants en Afrique et à l'international. Génération instantanée de PDF de qualité professionnelle, support natif de toutes les devises africaines, et règlement direct par **Mobile Money (Wave, Orange, MTN, Moov, M-Pesa)** ou **Stripe**.

---

## 🎯 Pourquoi Smart Invoice ?

En Afrique et dans les marchés émergents, 90 % des petites transactions se font entre indépendants et clients via smartphone et WhatsApp. Les solutions occidentales classiques (Quickbooks, Freshbooks, etc.) sont inadaptées :
1. Elles sont chères (15 $ à 50 $/mois).
2. Elles ignorent le **Mobile Money**, pourtant moyen de paiement numéro 1.
3. Elles sont lentes et nécessitent une connexion Internet puissante.

**Smart Invoice règle ces 3 problèmes :**
- ⚡ **Génération en 60 secondes :** Calcul automatique des totaux, remises et TVA.
- 📱 **Mobile-First & Partage WhatsApp :** Téléchargement PDF ou envoi du récapitulatif directement sur WhatsApp en 1 clic.
- 🌍 **Toutes les Devises Africaines & Internationales :** FCFA (XOF & XAF), Naira, Cedi, Dirham, Shilling, EUR, USD...
- 📲 **Paiement Direct :** Affichage élégant de votre compte Mobile Money ou de votre lien Stripe au bas de la facture.
- 🔒 **Zero-Cost & 100 % Confidentiel :** Zéro euro de serveur (hébergé gratuitement sur GitHub Pages) et vos données financières restent stockées sur votre appareil.

---

## 🌍 Devises Supportées

| Zone | Monnaies Disponibles |
| :--- | :--- |
| **Afrique de l'Ouest & Centrale** | Franc CFA UEMOA (`XOF`), Franc CFA CEMAC (`XAF`), Franc Guinéen (`GNF`) |
| **Nigeria & Ghana** | Naira Nigérian (`NGN`), Cedi Ghanéen (`GHS`) |
| **Afrique du Nord** | Dirham Marocain (`MAD`), Dinar Algérien (`DZD`), Dinar Tunisien (`TND`), Livre Égyptienne (`EGP`) |
| **Afrique Centrale & Grands Lacs** | Franc Congolais (`CDF`), Franc Rwandais (`RWF`), Franc Burundais (`BIF`) |
| **Afrique de l'Est** | Shilling Kenyan (`KES`), Shilling Ougandais (`UGX`), Shilling Tanzanien (`TZS`), Birr (`ETB`) |
| **Afrique Australe & Océan Indien** | Rand Sud-Africain (`ZAR`), Ariary (`MGA`), Roupie (`MUR`) |
| **International** | Euro (`EUR`), Dollar US (`USD`), Livre Sterling (`GBP`), Dollar Canadien (`CAD`) |

---

## 💳 Méthodes de Paiement Intégrées

Les vendeurs peuvent choisir leur mode de règlement qui apparaîtra clairement sur la facture :
* 🌊 **Wave Mobile Money**
* 🍊 **Orange Money (OM)**
* 🟡 **MTN Mobile Money (MoMo)**
* 🔵 **Moov Money**
* 🟢 **M-Pesa** (Safaricom / Vodacom)
* 🔴 **Airtel Money**
* 💳 **Stripe** (Cartes bancaires internationales Visa, Mastercard, Apple Pay)
* 🏦 **Virement Bancaire** (RIB / IBAN / SWIFT)
* 💵 **Espèces / À la livraison**

---

## 🏗️ Architecture du Projet

Le dépôt suit notre standard d'organisation rigoureux :

```text
smart-invoice/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automatisation du déploiement GitHub Pages
├── assets/
│   ├── icons/                  # Logos Mobile Money, Stripe et devises
│   └── images/                 # Bannières et captures d'écran
├── docs/
│   ├── ARCHITECTURE.md         # Guide technique vulgarisé
│   ├── BUSINESS_MODEL.md       # Stratégie de rentabilité et boucle virale
│   └── USER_GUIDE.md           # Guide pas à pas pour l'utilisateur
├── src/
│   ├── css/
│   │   └── styles.css          # Design responsive et styles d'impression A4
│   ├── js/
│   │   ├── currencies.js       # Répertoire des 25+ devises et formatage
│   │   ├── payment-methods.js  # Définition des opérateurs MoMo et Stripe
│   │   ├── pdf-engine.js       # Moteur d'exportation PDF vectoriel client
│   │   └── app.js              # Cœur interactif et sauvegarde locale
│   └── index.html              # Application complète (Éditeur + Aperçu direct)
├── scripts/
│   └── test-local.sh           # Script d'audit d'intégrité local
├── .gitignore                  # Protection contre les fichiers inutiles
├── LICENSE                     # Licence MIT
└── README.md                   # Ce document officiel
```

---

## 🚀 Démarrage Rapide

### Option 1 : Utiliser l'application en ligne (Production)
👉 **[https://digrekarlito11-eng.github.io/smart-invoice/](https://digrekarlito11-eng.github.io/smart-invoice/)**

### Option 2 : Tester en local sur sa machine
Ouvrez simplement le fichier `src/index.html` dans n'importe quel navigateur, ou lancez un serveur léger :
```bash
# Exemple avec Python
cd smart-invoice/src
python3 -m http.server 8000
```
Puis accédez à `http://localhost:8000`.

---

## 📈 Roadmap & Prochaines Évolutions

- [x] Éditeur en direct avec calculs automatiques (TVA, remises)
- [x] Intégration de toutes les devises africaines majeures
- [x] Support des encaissements Mobile Money & Stripe
- [x] Exportation PDF vectorielle A4 & Partage WhatsApp
- [ ] Générateur de QR Code Mobile Money automatique directement sur le PDF
- [ ] Version Pro avec synchronisation multi-appareils et carnet d'adresses clients
- [ ] Intégration directe de l'API Paystack / CinetPay pour encaissement automatique

---

## 📄 Licence

Ce projet est sous licence libre **MIT** — voir le fichier [LICENSE](LICENSE) pour plus de détails.  
Développé avec vision et ambition par **Karl** ([@digrekarlito11-eng](https://github.com/digrekarlito11-eng)).
