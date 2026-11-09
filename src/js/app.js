/**
 * Smart Invoice — Application Principale
 * Gestion d'état réactive, calculs dynamiques, stockage local & export.
 */

import { CURRENCIES, formatAmount } from './currencies.js';
import { PAYMENT_PROVIDERS, getProvider } from './payment-methods.js';
import { generateInvoicePDF } from './pdf-engine.js';

// État par défaut de la facture / devis
const DEFAULT_STATE = {
  docType: 'FACTURE', // 'FACTURE' ou 'DEVIS'
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
      <div class="grid grid-cols-12 gap-2 items-center bg-slate-50 p-3 rounded-lg border border-slate-200" data-index="${index}">
        <div class="col-span-6">
          <input type="text" class="item-description w-full px-2.5 py-1.5 text-sm rounded border border-slate-300 focus:ring-1 focus:ring-blue-500 focus:outline-none" 
            placeholder="Description de la prestation / produit" value="${this.escapeHTML(item.description)}">
        </div>
        <div class="col-span-2">
          <input type="number" min="1" class="item-quantity w-full px-2.5 py-1.5 text-sm rounded border border-slate-300 focus:ring-1 focus:ring-blue-500 focus:outline-none text-center" 
            placeholder="Qté" value="${item.quantity}">
        </div>
        <div class="col-span-3">
          <input type="number" min="0" step="any" class="item-price w-full px-2.5 py-1.5 text-sm rounded border border-slate-300 focus:ring-1 focus:ring-blue-500 focus:outline-none text-right" 
            placeholder="Prix Unit." value="${item.unitPrice}">
        </div>
        <div class="col-span-1 text-center">
          <button type="button" class="btn-remove-item text-slate-400 hover:text-red-500 transition-colors p-1" title="Supprimer la ligne">
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

    previewContainer.innerHTML = `
      <div class="p-8 md:p-12 text-slate-800 text-sm leading-relaxed">
        
        <!-- EN-TÊTE : Titre & Émetteur -->
        <div class="flex justify-between items-start border-b border-slate-200 pb-8 mb-8">
          <div>
            <span class="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-2 ${isDevis ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}">
              ${this.state.docType}
            </span>
            <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">${this.escapeHTML(this.state.sender.name || 'Votre Entreprise')}</h1>
            <p class="text-slate-500 font-medium">${this.escapeHTML(this.state.sender.title || '')}</p>
            <div class="mt-3 text-xs text-slate-500 space-y-0.5">
              ${this.state.sender.address ? `<p>📍 ${this.escapeHTML(this.state.sender.address)}</p>` : ''}
              ${this.state.sender.phone ? `<p>📞 ${this.escapeHTML(this.state.sender.phone)}</p>` : ''}
              ${this.state.sender.email ? `<p>✉️ ${this.escapeHTML(this.state.sender.email)}</p>` : ''}
            </div>
          </div>
          
          <div class="text-right">
            <div class="text-xl font-bold text-slate-900 mb-1">${this.escapeHTML(this.state.invoiceNumber)}</div>
            <div class="text-xs text-slate-500 space-y-1">
              <p><span class="font-semibold text-slate-700">Date d'émission :</span> ${this.formatDate(this.state.issueDate)}</p>
              <p><span class="font-semibold text-slate-700">Échéance :</span> ${this.formatDate(this.state.dueDate)}</p>
            </div>
          </div>
        </div>

        <!-- BLOC DESTINATAIRE (CLIENT) -->
        <div class="bg-slate-50 rounded-xl p-5 mb-8 border border-slate-200 flex justify-between items-start">
          <div>
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Facturé à / Destinataire</span>
            <div class="text-base font-bold text-slate-900">${this.escapeHTML(this.state.client.name || 'Nom du Client')}</div>
            <div class="text-xs text-slate-600 mt-1 space-y-0.5">
              ${this.state.client.address ? `<p>${this.escapeHTML(this.state.client.address)}</p>` : ''}
              ${this.state.client.phone ? `<p>Tél : ${this.escapeHTML(this.state.client.phone)}</p>` : ''}
              ${this.state.client.email ? `<p>Email : ${this.escapeHTML(this.state.client.email)}</p>` : ''}
            </div>
          </div>
          <div class="text-right">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Montant Total Dû</span>
            <span class="text-2xl font-black text-blue-600 font-heading">${formatAmount(totals.grandTotal, curr)}</span>
          </div>
        </div>

        <!-- TABLEAU DES PRESTATIONS -->
        <div class="overflow-x-auto mb-8">
          <table class="w-full text-left">
            <thead>
              <tr class="border-b-2 border-slate-300 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th class="py-3 px-2">Description</th>
                <th class="py-3 px-2 text-center w-20">Qté</th>
                <th class="py-3 px-2 text-right w-36">Prix Unitaire</th>
                <th class="py-3 px-2 text-right w-36">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm">
              ${this.state.items.map(item => {
                const rowTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                return `
                  <tr>
                    <td class="py-3 px-2 font-medium text-slate-800">${this.escapeHTML(item.description || 'Prestation')}</td>
                    <td class="py-3 px-2 text-center text-slate-600">${item.quantity}</td>
                    <td class="py-3 px-2 text-right text-slate-600">${formatAmount(item.unitPrice, curr)}</td>
                    <td class="py-3 px-2 text-right font-bold text-slate-900">${formatAmount(rowTotal, curr)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- TOTALS & CALCULS -->
        <div class="flex justify-end mb-8">
          <div class="w-72 space-y-2 text-xs">
            <div class="flex justify-between text-slate-600">
              <span>Sous-total HT :</span>
              <span class="font-semibold text-slate-800">${formatAmount(totals.subtotal, curr)}</span>
            </div>
            ${totals.discount > 0 ? `
              <div class="flex justify-between text-emerald-600">
                <span>Remise commerciale :</span>
                <span class="font-semibold">- ${formatAmount(totals.discount, curr)}</span>
              </div>
            ` : ''}
            ${this.state.taxRate > 0 ? `
              <div class="flex justify-between text-slate-600">
                <span>TVA (${this.state.taxRate} %) :</span>
                <span class="font-semibold text-slate-800">+ ${formatAmount(totals.taxAmount, curr)}</span>
              </div>
            ` : ''}
            <div class="flex justify-between border-t-2 border-slate-900 pt-2 text-base font-extrabold text-slate-900 font-heading">
              <span>Total TTC :</span>
              <span class="text-blue-600">${formatAmount(totals.grandTotal, curr)}</span>
            </div>
          </div>
        </div>

        <!-- BLOC DE RÈGLEMENT (MOBILE MONEY / STRIPE) -->
        <div class="bg-blue-50/70 border border-blue-200 rounded-xl p-5 mb-8">
          <div class="flex items-center space-x-2 mb-2">
            <span class="text-lg">${provider.icon}</span>
            <span class="text-xs font-bold uppercase tracking-wider text-blue-900">Modalités de Paiement — ${provider.name}</span>
          </div>
          <div class="text-sm font-semibold text-slate-800 bg-white p-3 rounded-lg border border-blue-100 flex items-center justify-between">
            <div>
              <span class="text-xs text-slate-500 block">${provider.labelField} :</span>
              <span class="text-base font-bold text-slate-900 font-mono">${this.escapeHTML(this.state.paymentDetails || 'Non spécifié')}</span>
            </div>
            <span class="px-2.5 py-1 rounded text-xs font-bold text-white shadow-sm" style="background-color: ${provider.color};">
              ${provider.badgeText}
            </span>
          </div>
        </div>

        <!-- NOTES & SIGNATURE -->
        ${this.state.notes ? `
          <div class="text-xs text-slate-500 mb-8 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span class="font-bold text-slate-700 block mb-0.5">Notes & Conditions :</span>
            ${this.escapeHTML(this.state.notes)}
          </div>
        ` : ''}

        <!-- PIED DE PAGE : Filigrane de conversion -->
        <div class="border-t border-slate-200 pt-4 text-center text-xs text-slate-400 flex justify-between items-center">
          <span>${this.escapeHTML(this.state.sender.name)} • Document officiel</span>
          <span class="text-[11px] font-medium text-slate-400">⚡ Émis avec <strong>Smart Invoice</strong> — Solution de facturation pro</span>
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

    // Lignes de facturation : Modification & Suppression déléguée
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

    // Réinitialisation / Nouveau document
    document.getElementById('btn-reset')?.addEventListener('click', () => {
      if (confirm('Voulez-vous créer une nouvelle facture vide ?')) {
        this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
        this.state.invoiceNumber = `FAC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
        this.syncFormFields();
        this.render();
      }
    });

    // Gestion des onglets Mobile (Éditeur vs Aperçu)
    const tabEdit = document.getElementById('tab-edit');
    const tabPreview = document.getElementById('tab-preview');
    const panelEdit = document.getElementById('panel-editor');
    const panelPreview = document.getElementById('panel-preview');

    if (tabEdit && tabPreview && panelEdit && panelPreview) {
      tabEdit.addEventListener('click', () => {
        tabEdit.classList.add('bg-blue-600', 'text-white');
        tabEdit.classList.remove('bg-slate-100', 'text-slate-600');
        tabPreview.classList.add('bg-slate-100', 'text-slate-600');
        tabPreview.classList.remove('bg-blue-600', 'text-white');

        panelEdit.classList.remove('hidden');
        panelPreview.classList.add('hidden');
      });

      tabPreview.addEventListener('click', () => {
        tabPreview.classList.add('bg-blue-600', 'text-white');
        tabPreview.classList.remove('bg-slate-100', 'text-slate-600');
        tabEdit.classList.add('bg-slate-100', 'text-slate-600');
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
      `Voici votre *${this.state.docType} N° ${this.state.invoiceNumber}* de la part de *${this.state.sender.name}* :`,
      `💰 *Montant Total :* ${formatAmount(totals.grandTotal, curr)}`,
      `📅 *Échéance :* ${this.formatDate(this.state.dueDate)}`,
      ``,
      `📲 *Moyen de règlement recommandé :*`,
      `${provider.name} : *${this.state.paymentDetails}*`,
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

// Initialisation dès chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  new SmartInvoiceApp();
});
