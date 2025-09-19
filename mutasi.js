document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('mutasiAccountGrid');
  if (!container) return;

  const ambis = window.AMBIS || {};

  function getAccounts() {
    if (typeof ambis.getAccounts === 'function') {
      return ambis.getAccounts({ clone: false }) || [];
    }
    if (Array.isArray(ambis.accounts)) {
      return ambis.accounts;
    }
    return [];
  }

  function renderCards() {
    const accounts = getAccounts();
    container.innerHTML = '';
    accounts.forEach((account, index) => {
      const card = document.createElement('div');
      card.className = 'rounded-2xl border border-slate-200 p-5 bg-white flex flex-col';
      const name = account.name || account.displayName || `Rekening ${index + 1}`;
      const initial = account.initial || (name ? name.charAt(0).toUpperCase() : '');
      const color = account.color || 'bg-cyan-100 text-cyan-600';
      const formattedNumber = account.number
        || (typeof ambis.formatAccountNumber === 'function'
          ? ambis.formatAccountNumber(account.numberRaw)
          : '');

      card.innerHTML = `
        <div class="flex items-center gap-3 mb-3">
          <span class="w-8 h-8 rounded-full ${color} font-semibold grid place-items-center">${initial}</span>
          <span class="font-medium">${name}</span>
        </div>
        <p class="text-slate-500">Nomor Rekening</p>
        <p class="font-bold text-slate-900 tracking-wide mb-4">${formattedNumber || '-'}</p>
        <button class="mt-auto rounded-lg border border-cyan-500 text-cyan-600 px-4 py-2 hover:bg-cyan-50">Pilih Rekening</button>
      `;

      container.appendChild(card);
    });
  }

  renderCards();

  if (typeof ambis.onBrandNameChange === 'function') {
    ambis.onBrandNameChange(renderCards);
  }
});
