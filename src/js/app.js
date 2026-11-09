/**
 * Smart Invoice — Application Principale
 * Gestion d'état réactive, calculs dynamiques, thèmes visuels disruptifs & export.
 */

import { CURRENCIES, formatAmount } from './currencies.js';
import { PAYMENT_PROVIDERS, getProvider } from './payment-methods.js';
import { generateInvoicePDF } from './pdf-engine.js';

// État par défaut de la facture / devis
const DEFAULT_STATE = {
  docType: 'FACTURE', // 'FACTURE' ou 'DEVIS'
  theme: 'fintech',   // 'fintech', 'sahara', 'vibrant', 'editorial'
  pattern: 'dots',    // 'none', 'dots', 'grid', 'watermark'
  invoiceNumber: 'FAC-2026-001',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  currency: 'XOF', // Franc CFA UEMOA par défaut

  // Émetteur
  sender: {
    name: 'Karl Studio & Co',
    title: 'Création Digitale & Micro-SaaS',
    email: 'contact@karl-studio.com',
    phone: '+225 07 00 00 00 00',
    address: 'Abidjan, Côte d\'Ivoire'
  },

  // Client
  client: {
    name: 'Entreprise Partenaire',
    email: 'client@partenaire.com',
    phone: '+221 77 000 00 00',
    address: 'Dakar, Sénégal'
  },

  // Lignes de facturation
  items: [
    {
      id: 1,
      description: 'Développement d\'une Landing Page Haute Performance & Mobile-First',
      quantity: 1,
      unitPrice: 250000
    },
    {
      id: 2,
      description: 'Configuration & Intégration Passerelle Mobile Money (Wave / Orange)',
      quantity: 1,
      unitPrice: 100000
    }
  ],

  // Taxes & Remises
  taxRate: 0, // En % (TVA)
  discount: 0, // En valeur absolue

  // Moyen de paiement choisi
  paymentMethod: 'wave',
  paymentDetails: '+225 07 12 34 56 78 (Karl)',
  notes: 'Merci pour votre confiance. En cas de questions, contactez-nous directement par WhatsApp ou email.'
};

class SmartInvoiceApp {
  constructor() {
    this.state = this.loadState();
    this.initDOM();
    this.render();
    this.bindEvents();
  }

  loadState() {
    try {
      const saved = localStorage.getItem('smart_invoice_state');
      if (saved) {
        return { ...DEFAULT_STATE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Impossible de charger le stockage local, utilisation des valeurs par défaut.');
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  saveState() {
    try {
      localStorage.setItem('smart_invoice_state', JSON.stringify(this.state));
    } catch (e) {
      console.warn('Erreur lors de la sauvegarde locale');
    }
  }

  initDOM() {
    // Remplir le sélecteur de devises
    const currencySelect = document.getElementById('currency-select');
    if (currencySelect) {
      currencySelect.innerHTML = CURRENCIES.map(c => `
        <option value="${c.code}" ${c.code === this.state.currency ? 'selected' : ''}>
          ${c.flag} ${c.code} — ${c.name} (${c.symbol})
        </option>
      `).join('');
    }

    // Remplir le sélecteur de moyens de paiement
    const paymentSelect = document.getElementById('payment-method-select');
    if (paymentSelect) {
      paymentSelect.innerHTML = PAYMENT_PROVIDERS.map(p => `
        <option value="${p.id}" ${p.id === this.state.paymentMethod ? 'selected' : ''}>
          ${p.icon} ${p.name}
        </option>
      `).join('');
    }

    this.syncFormFields();
  }

  syncFormFields() {
    // Type de document
    document.querySelectorAll('input[name="docType"]').forEach(radio => {
      radio.checked = radio.value === this.state.docType;
    });

    // Thème visuel
    document.querySelectorAll('.theme-btn').forEach(btn => {
      const themeVal = btn.dataset.theme;
      if (themeVal === this.state.theme) {
        btn.classList.add('ring-2', 'ring-blue-500', 'border-transparent');
      } else {
        btn.classList.remove('ring-2', 'ring-blue-500', 'border-transparent');
      }
    });

    // Motif d'arrière-plan
    const patternSelect = document.getElementById('pattern-select');
    if (patternSelect) {
      patternSelect.value = this.state.pattern || 'dots';
    }

    // Numéro et dates
    document.getElementById('invoice-number').value = this.state.invoiceNumber;
    document.getElementById('issue-date').value = this.state.issueDate;
    document.getElementById('due-date').value = this.state.dueDate;

    // Émetteur
    document.getElementById('sender-name').value = this.state.sender.name;
    document.getElementById('sender-title').value = this.state.sender.title;
    document.getElementById('sender-phone').value = this.state.sender.phone;
    document.getElementById('sender-email').value = this.state.sender.email;
    document.getElementById('sender-address').value = this.state.sender.address;

    // Client
    document.getElementById('client-name').value = this.state.client.name;
    document.getElementById('client-phone').value = this.state.client.phone;
    document.getElementById('client-email').value = this.state.client.email;
    document.getElementById('client-address').value = this.state.client.address;

    // Paiement & Notes
    document.getElementById('payment-details').value = this.state.paymentDetails;
    document.getElementById('invoice-notes').value = this.state.notes;
    document.getElementById('tax-rate').value = this.state.taxRate;
    document.getElementById('discount-amount').value = this.state.discount;

    this.updatePaymentLabel();
  }

  updatePaymentLabel() {
    const provider = getProvider(this.state.paymentMethod);
    const label = document.getElementById('payment-details-label');
    const input = document.getElementById('payment-details');
    if (label && provider) {
      label.textContent = provider.labelField;
    }
    if (input && provider) {
      input.placeholder = provider.placeholder;
    }
  }

  calculateTotals() {
    const subtotal = this.state.items.reduce((acc, item) => {
      const q = Number(item.quantity) || 0;
      const p = Number(item.unitPrice) || 0;
      return acc + (q * p);
    }, 0);

    const discount = Number(this.state.discount) || 0;
    const taxableAmount = Math.max(0, subtotal - discount);
    const taxRate = Number(this.state.taxRate) || 0;
    const taxAmount = (taxableAmount * taxRate) / 100;
    const grandTotal = taxableAmount + taxAmount;

    return { subtotal, discount, taxAmount, grandTotal };
  }

  render() {
    this.renderItemsEditor();
    this.renderInvoicePreview();
    this.saveState();
  }

  renderItemsEditor() {
    const container = document.getElementById('items-editor-container');
    if (!container) return;

    container.innerHTML = this.state.items.map((item, index) => `
      <div class="grid grid-cols-12 gap-2 items-center bg-slate-900/60 p-3 rounded-xl border border-slate-700/80" data-index="${index}">
        <div class="col-span-6">
          <input type="text" class="item-description w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-blue-500 focus:outline-none" 
            placeholder="Description de la prestation / produit" value="${this.escapeHTML(item.description)}">
        </div>
        <div class="col-span-2">
          <input type="number" min="1" class="item-quantity w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-blue-500 focus:outline-none text-center font-mono" 
            placeholder="Qté" value="${item.quantity}">
        </div>
        <div class="col-span-3">
          <input type="number" min="0" step="any" class="item-price w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-blue-500 focus:outline-none text-right font-mono" 
            placeholder="Prix Unit." value="${item.unitPrice}">
        </div>
        <div class="col-span-1 text-center">
          <button type="button" class="btn-remove-item text-slate-500 hover:text-red-400 transition-colors p-1" title="Supprimer la ligne">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  renderInvoicePreview() {
    const previewContainer = document.getElementById('invoice-preview-container');
    if (!previewContainer) return;

    const totals = this.calculateTotals();
    const curr = this.state.currency;
    const provider = getProvider(this.state.paymentMethod);
    const isDevis = this.state.docType === 'DEVIS';

    // Classes de style dynamique
    const themeClass = `theme-${this.state.theme || 'fintech'}`;
    const patternClass = this.state.pattern === 'dots' 
      ? 'bg-pattern-dots' 
      : this.state.pattern === 'grid' 
      ? 'bg-pattern-grid' 
      : '';

    previewContainer.className = `invoice-paper ${themeClass} ${patternClass} rounded-2xl relative`;

    previewContainer.innerHTML = `
      <!-- BANDEAU SUPÉRIEUR GÉOMÉTRIQUE DISRUPTIF -->
      <div class="theme-header-band w-full"></div>

      <!-- FILIGRANE GÉANT ARRIÈRE-PLAN (si option activée) -->
      ${this.state.pattern === 'watermark' ? `
        <div class="watermark-bg-number">${this.escapeHTML(this.state.invoiceNumber)}</div>
      ` : ''}

      <div class="p-8 md:p-12 text-slate-800 text-sm leading-relaxed relative z-10">
        
        <!-- EN-TÊTE MODERNE : Identité, Titre & Statut -->
        <div class="flex flex-col md:flex-row justify-between items-start border-b border-slate-200/80 pb-8 mb-8 gap-6">
          <div>
            <div class="flex items-center space-x-2.5 mb-2.5">
              <span class="inline-block px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase theme-accent-badge shadow-sm">
                ${this.state.docType}
              </span>
              <span class="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                Statut : En attente
              </span>
            </div>
            <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">${this.escapeHTML(this.state.sender.name || 'Votre Entreprise')}</h1>
            <p class="text-slate-500 font-medium text-xs mt-0.5">${this.escapeHTML(this.state.sender.title || 'Prestations de services & Produits')}</p>
            
            <div class="mt-4 text-xs text-slate-500 space-y-1">
              ${this.state.sender.address ? `<p class="flex items-center space-x-1.5"><span class="opacity-70">📍</span> <span>${this.escapeHTML(this.state.sender.address)}</span></p>` : ''}
              ${this.state.sender.phone ? `<p class="flex items-center space-x-1.5"><span class="opacity-70">📞</span> <span>${this.escapeHTML(this.state.sender.phone)}</span></p>` : ''}
              ${this.state.sender.email ? `<p class="flex items-center space-x-1.5"><span class="opacity-70">✉️</span> <span>${this.escapeHTML(this.state.sender.email)}</span></p>` : ''}
            </div>
          </div>
          
          <div class="text-left md:text-right bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-xl border md:border-0 border-slate-200 w-full md:w-auto">
            <div class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">Identifiant Unique</div>
            <div class="text-2xl font-black text-slate-900 font-mono tracking-tight mb-2.5">${this.escapeHTML(this.state.invoiceNumber)}</div>
            <div class="text-xs text-slate-500 space-y-1">
              <p><span class="font-medium text-slate-400">Émission :</span> <strong class="text-slate-700">${this.formatDate(this.state.issueDate)}</strong></p>
              <p><span class="font-medium text-slate-400">Échéance :</span> <strong class="text-slate-700">${this.formatDate(this.state.dueDate)}</strong></p>
            </div>
          </div>
        </div>

        <!-- CARTES DESTINATAIRE & TOTAL DU -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-5 mb-8">
          
          <!-- Carte Client -->
          <div class="md:col-span-7 bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
            <div class="absolute top-0 left-0 w-1 h-full bg-slate-300"></div>
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Destinataire / Client</span>
            <div class="text-base font-extrabold text-slate-900">${this.escapeHTML(this.state.client.name || 'Nom du Client')}</div>
            <div class="text-xs text-slate-600 mt-2 space-y-1">
              ${this.state.client.address ? `<p class="flex items-center space-x-1.5"><span class="text-slate-400">🏢</span> <span>${this.escapeHTML(this.state.client.address)}</span></p>` : ''}
              ${this.state.client.phone ? `<p class="flex items-center space-x-1.5"><span class="text-slate-400">📲</span> <span>${this.escapeHTML(this.state.client.phone)}</span></p>` : ''}
              ${this.state.client.email ? `<p class="flex items-center space-x-1.5"><span class="text-slate-400">✉️</span> <span>${this.escapeHTML(this.state.client.email)}</span></p>` : ''}
            </div>
          </div>

          <!-- Total Due Box (Design Impactant) -->
          <div class="md:col-span-5 theme-total-box flex flex-col justify-between shadow-md">
            <div>
              <span class="text-[11px] font-bold tracking-wider uppercase opacity-80 block mb-1">Net à Payer</span>
              <div class="text-2xl md:text-3xl font-black font-heading tracking-tight">${formatAmount(totals.grandTotal, curr)}</div>
            </div>
            <div class="pt-3 border-t border-white/15 text-[11px] opacity-80 flex justify-between items-center">
              <span>Devise : <strong>${curr}</strong></span>
              <span>${this.state.items.length} prestation(s)</span>
            </div>
          </div>

        </div>

        <!-- TABLEAU DES PRESTATIONS DISRUPTIF (Cartes aérées & Pill Quantité) -->
        <div class="overflow-x-auto mb-8 rounded-xl border border-slate-200 shadow-sm">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th class="py-3 px-4">Désignation</th>
                <th class="py-3 px-3 text-center w-20">Qté</th>
                <th class="py-3 px-4 text-right w-36">Prix Unitaire</th>
                <th class="py-3 px-4 text-right w-36">Montant Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs md:text-sm bg-white">
              ${this.state.items.map((item, i) => {
                const rowTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                return `
                  <tr class="${i % 2 === 1 ? 'bg-slate-50/40' : ''} hover:bg-slate-50 transition-colors">
                    <td class="py-3.5 px-4 font-semibold text-slate-800">
                      ${this.escapeHTML(item.description || 'Prestation')}
                    </td>
                    <td class="py-3.5 px-3 text-center">
                      <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        ${item.quantity}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-right text-slate-600 font-mono">
                      ${formatAmount(item.unitPrice, curr)}
                    </td>
                    <td class="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                      ${formatAmount(rowTotal, curr)}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- SOUS-TOTALS & DÉCOMPTE -->
        <div class="flex justify-end mb-8">
          <div class="w-full md:w-80 space-y-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div class="flex justify-between text-slate-600">
              <span>Sous-total HT :</span>
              <span class="font-bold text-slate-800 font-mono">${formatAmount(totals.subtotal, curr)}</span>
            </div>
            ${totals.discount > 0 ? `
              <div class="flex justify-between text-emerald-600">
                <span>Remise commerciale accordée :</span>
                <span class="font-bold font-mono">- ${formatAmount(totals.discount, curr)}</span>
              </div>
            ` : ''}
            ${this.state.taxRate > 0 ? `
              <div class="flex justify-between text-slate-600">
                <span>TVA (${this.state.taxRate} %) :</span>
                <span class="font-bold text-slate-800 font-mono">+ ${formatAmount(totals.taxAmount, curr)}</span>
              </div>
            ` : ''}
            <div class="flex justify-between border-t border-slate-300 pt-2.5 text-sm font-black text-slate-900">
              <span>Total Général :</span>
              <span class="theme-highlight-text font-mono">${formatAmount(totals.grandTotal, curr)}</span>
            </div>
          </div>
        </div>

        <!-- LE "PAYMENT PASS" DISRUPTIF (MOBILE MONEY & STRIPE) -->
        <div class="theme-payment-card rounded-xl p-5 mb-8 shadow-sm">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div class="flex items-center space-x-2">
              <span class="text-xl">${provider.icon}</span>
              <div>
                <span class="text-xs font-black uppercase tracking-wider text-slate-800 block">Règlement Recommandé</span>
                <span class="text-[11px] text-slate-500">${provider.name}</span>
              </div>
            </div>
            <span class="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm" style="background-color: ${provider.color};">
              ${provider.badgeText}
            </span>
          </div>

          <div class="bg-white/90 backdrop-blur-sm p-3.5 rounded-lg border border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <span class="text-[11px] text-slate-400 font-medium block">${provider.labelField} :</span>
              <span class="text-sm sm:text-base font-black text-slate-900 font-mono tracking-wide">${this.escapeHTML(this.state.paymentDetails || 'Non spécifié')}</span>
            </div>
            <div class="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              ⚡ Paiement direct sécurisé
            </div>
          </div>
        </div>

        <!-- NOTES & CONDITIONS -->
        ${this.state.notes ? `
          <div class="text-xs text-slate-500 mb-8 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70">
            <strong class="text-slate-700 block mb-1">Notes & Conditions :</strong>
            <p class="leading-relaxed">${this.escapeHTML(this.state.notes)}</p>
          </div>
        ` : ''}

        <!-- PIED DE PAGE & FILIGRANE DE CONVERSION -->
        <div class="border-t border-slate-200/80 pt-4 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 gap-2">
          <span>${this.escapeHTML(this.state.sender.name)} • Document officiel</span>
          <span class="font-medium">⚡ Facture émise avec <strong>Smart Invoice</strong> — Facturation Pro pour Créateurs</span>
        </div>

      </div>
    `;
  }

  bindEvents() {
    // Changement de type de document (Facture / Devis)
    document.querySelectorAll('input[name="docType"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.state.docType = e.target.value;
        this.render();
      });
    });

    // Sélecteur de Thème Visuel
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.theme-btn');
        if (!targetBtn) return;
        this.state.theme = targetBtn.dataset.theme;
        this.syncFormFields();
        this.render();
      });
    });

    // Sélecteur de Motif d'Arrière-plan
    document.getElementById('pattern-select')?.addEventListener('change', (e) => {
      this.state.pattern = e.target.value;
      this.render();
    });

    // Numéro et dates
    document.getElementById('invoice-number')?.addEventListener('input', (e) => {
      this.state.invoiceNumber = e.target.value;
      this.render();
    });
    document.getElementById('issue-date')?.addEventListener('change', (e) => {
      this.state.issueDate = e.target.value;
      this.render();
    });
    document.getElementById('due-date')?.addEventListener('change', (e) => {
      this.state.dueDate = e.target.value;
      this.render();
    });

    // Devises
    document.getElementById('currency-select')?.addEventListener('change', (e) => {
      this.state.currency = e.target.value;
      this.render();
    });

    // Moyen de paiement
    document.getElementById('payment-method-select')?.addEventListener('change', (e) => {
      this.state.paymentMethod = e.target.value;
      this.updatePaymentLabel();
      this.render();
    });

    document.getElementById('payment-details')?.addEventListener('input', (e) => {
      this.state.paymentDetails = e.target.value;
      this.render();
    });

    // Émetteur
    ['name', 'title', 'phone', 'email', 'address'].forEach(field => {
      document.getElementById(`sender-${field}`)?.addEventListener('input', (e) => {
        this.state.sender[field] = e.target.value;
        this.render();
      });
    });

    // Client
    ['name', 'phone', 'email', 'address'].forEach(field => {
      document.getElementById(`client-${field}`)?.addEventListener('input', (e) => {
        this.state.client[field] = e.target.value;
        this.render();
      });
    });

    // Taxes & Remises
    document.getElementById('tax-rate')?.addEventListener('input', (e) => {
      this.state.taxRate = Number(e.target.value) || 0;
      this.render();
    });
    document.getElementById('discount-amount')?.addEventListener('input', (e) => {
      this.state.discount = Number(e.target.value) || 0;
      this.render();
    });

    // Notes
    document.getElementById('invoice-notes')?.addEventListener('input', (e) => {
      this.state.notes = e.target.value;
      this.render();
    });

    // Lignes de facturation : Ajout
    document.getElementById('btn-add-item')?.addEventListener('click', () => {
      this.state.items.push({
        id: Date.now(),
        description: '',
        quantity: 1,
        unitPrice: 0
      });
      this.render();
    });

    // Lignes de facturation : Modification & Suppression
    const itemsContainer = document.getElementById('items-editor-container');
    if (itemsContainer) {
      itemsContainer.addEventListener('input', (e) => {
        const row = e.target.closest('[data-index]');
        if (!row) return;
        const index = parseInt(row.dataset.index, 10);
        if (e.target.classList.contains('item-description')) {
          this.state.items[index].description = e.target.value;
        } else if (e.target.classList.contains('item-quantity')) {
          this.state.items[index].quantity = Number(e.target.value) || 0;
        } else if (e.target.classList.contains('item-price')) {
          this.state.items[index].unitPrice = Number(e.target.value) || 0;
        }
        this.renderInvoicePreview();
        this.saveState();
      });

      itemsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-remove-item');
        if (!btn) return;
        const row = btn.closest('[data-index]');
        if (!row) return;
        const index = parseInt(row.dataset.index, 10);
        if (this.state.items.length > 1) {
          this.state.items.splice(index, 1);
          this.render();
        } else {
          alert('Votre facture doit contenir au moins une ligne.');
        }
      });
    }

    // Export PDF
    document.getElementById('btn-download-pdf')?.addEventListener('click', () => {
      const filename = `${this.state.docType}-${this.state.invoiceNumber || 'Document'}.pdf`;
      generateInvoicePDF('invoice-preview-container', filename);
    });

    // Partage WhatsApp direct
    document.getElementById('btn-share-whatsapp')?.addEventListener('click', () => {
      this.shareViaWhatsApp();
    });

    // Réinitialisation
    document.getElementById('btn-reset')?.addEventListener('click', () => {
      if (confirm('Voulez-vous créer une nouvelle facture vide ?')) {
        this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
        this.state.invoiceNumber = `FAC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
        this.syncFormFields();
        this.render();
      }
    });

    // Onglets Mobile (Éditeur vs Aperçu)
    const tabEdit = document.getElementById('tab-edit');
    const tabPreview = document.getElementById('tab-preview');
    const panelEdit = document.getElementById('panel-editor');
    const panelPreview = document.getElementById('panel-preview');

    if (tabEdit && tabPreview && panelEdit && panelPreview) {
      tabEdit.addEventListener('click', () => {
        tabEdit.classList.add('bg-blue-600', 'text-white');
        tabEdit.classList.remove('bg-slate-700', 'text-slate-300');
        tabPreview.classList.add('bg-slate-700', 'text-slate-300');
        tabPreview.classList.remove('bg-blue-600', 'text-white');

        panelEdit.classList.remove('hidden');
        panelPreview.classList.add('hidden');
      });

      tabPreview.addEventListener('click', () => {
        tabPreview.classList.add('bg-blue-600', 'text-white');
        tabPreview.classList.remove('bg-slate-700', 'text-slate-300');
        tabEdit.classList.add('bg-slate-700', 'text-slate-300');
        tabEdit.classList.remove('bg-blue-600', 'text-white');

        panelPreview.classList.remove('hidden');
        panelEdit.classList.add('hidden');
      });
    }
  }

  shareViaWhatsApp() {
    const totals = this.calculateTotals();
    const curr = this.state.currency;
    const provider = getProvider(this.state.paymentMethod);

    const message = [
      `Bonjour *${this.state.client.name || 'Cher client'}*,`,
      ``,
      `Voici votre *${this.state.docType} N° ${this.state.invoiceNumber}* émise par *${this.state.sender.name}* :`,
      `💰 *Montant Net à Payer :* ${formatAmount(totals.grandTotal, curr)}`,
      `📅 *Date d'Échéance :* ${this.formatDate(this.state.dueDate)}`,
      ``,
      `📲 *Règlement par ${provider.name} :*`,
      `👉 *${this.state.paymentDetails}*`,
      ``,
      `Merci pour votre confiance !`
    ].join('\n');

    const encoded = encodeURIComponent(message);
    const phone = (this.state.client.phone || '').replace(/[^0-9]/g, '');
    const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  }

  formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateStr;
    }
  }

  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
  new SmartInvoiceApp();
});
