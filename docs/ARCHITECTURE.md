# 🏗️ Architecture Technique — Smart Invoice

Ce document explique en termes simples et clairs comment fonctionne **Smart Invoice**, les choix technologiques retenus, et pourquoi cette architecture garantit **0 € de coût de serveur**, une vitesse maximale et une sécurité totale pour les utilisateurs.

---

## 🎯 1. La Philosophie : "Zero-Cost & Offline-First"

### Pourquoi pas de serveur lourd ?
Dans les applications traditionnelles, chaque facture créée est envoyée sur un serveur distant qui coûte de l'argent chaque mois (base de données, puissance de calcul pour générer les PDF).

**Smart Invoice adopte l'architecture moderne "Client-Side" (côté navigateur) :**
- L'application tourne directement dans le navigateur du smartphone ou de l'ordinateur de l'utilisateur.
- La génération du fichier PDF est effectuée localement sur l'appareil via JavaScript (`html2pdf.js`).
- Aucune donnée financière sensible (nom des clients, montants, numéros de téléphone) ne transite ni n'est stockée sur nos serveurs. **La confidentialité des utilisateurs est totale.**

---

## 📂 2. Organisation des Fichiers

```text
smart-invoice/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Déploiement automatique sur GitHub Pages à chaque commit
├── assets/                     # Ressources graphiques (logos, maquettes, icônes)
│   ├── icons/                  # Logos Mobile Money (Wave, Orange, MTN, Moov) et Stripe
│   └── images/                 # Bannières et captures d'écran
├── docs/                       # Documentation stratégique & technique
│   ├── ARCHITECTURE.md         # Ce guide technique vulgarisé
│   ├── BUSINESS_MODEL.md       # Stratégie de rentabilité, prix et partenariats
│   └── USER_GUIDE.md           # Guide pas à pas pour l'utilisateur final
├── src/                        # Le code source de l'application
│   ├── css/
│   │   └── styles.css          # Feuille de style (responsive mobile-first & impression)
│   ├── js/
│   │   ├── currencies.js       # Dictionnaire complet des devises africaines & formats
│   │   ├── payment-methods.js  # Gestion des opérateurs de paiement (MoMo, Stripe, RIB)
│   │   ├── pdf-engine.js       # Moteur de rendu et d'exportation PDF haute définition
│   │   └── app.js              # Cœur interactif : calculs temps réel, stockage local
│   └── index.html              # Interface utilisateur complète (Éditeur + Aperçu direct)
├── scripts/
│   └── test-local.sh           # Script utilitaire pour tester en local
├── .gitignore                  # Protection contre les fichiers temporaires
├── LICENSE                     # Licence MIT (Open Source)
└── README.md                   # Vitrine officielle du projet
```

---

## ⚙️ 3. Les Briques Techniques Vulgarisées

| Composant | Technologie | Rôle en français simple |
| :--- | :--- | :--- |
| **Interface & Design** | HTML5 + Tailwind CSS | Permet d'avoir une application ultra-moderne, épurée et utilisable confortablement sur un écran de smartphone de 5 pouces comme sur un écran 4K. |
| **Moteur Multi-Devises** | `currencies.js` | Gère automatiquement les symboles et séparateurs de milliers pour 20+ devises africaines (XOF, XAF, NGN, GHS, KES, MAD, ZAR, etc.) et internationales (€, $). |
| **Paiements Intégrés** | `payment-methods.js` | Injecte proprement le moyen de paiement choisi par le vendeur (numéro Mobile Money Wave/Orange/MTN ou lien Stripe) directement au bas de la facture avec instructions claires. |
| **Générateur PDF** | `html2pdf.js` & CSS Print | Transforme l'aperçu HTML de la facture en un document PDF vectoriel de qualité imprimerie, téléchargeable en 1 seconde. |
| **Sauvegarde Automatique** | `localStorage` | Même si l'utilisateur ferme son navigateur par erreur ou reçoit un appel téléphonique, son brouillon de facture est conservé intact sur son appareil. |

---

## 🔒 4. Sécurité & Respect de la Vie Privée

1. **Pas de fuite de données :** Puisqu'aucune base de données centrale n'existe, il n'y a aucun risque de piratage de données bancaires ou de listes de clients.
2. **Conformité RGPD / Protection des données :** L'utilisateur est le seul et unique propriétaire de ses données.
3. **Disponibilité 100 % garantie :** L'hébergement statique via GitHub Pages garantit que le site ne tombe jamais en panne, même en cas de fort trafic.
