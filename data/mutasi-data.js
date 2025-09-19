(function () {
  const dataset = {
    utama: {
      status: 'success',
      groups: [
        {
          date: '2025-09-02',
          label: 'Selasa, 2 September 2025',
          transactions: [
            {
              id: 'UTM-12001',
              type: 'masuk',
              title: 'Setoran Dana Penjualan',
              note: 'Transfer dari PT Nusantara Maju',
              amount: 250000000
            },
            {
              id: 'UTM-12002',
              type: 'keluar',
              title: 'Pembayaran Vendor',
              note: 'Ke PT Sinar Abadi Makmur',
              amount: 175000000
            }
          ]
        },
        {
          date: '2025-09-01',
          label: 'Senin, 1 September 2025',
          transactions: [
            {
              id: 'UTM-11951',
              type: 'masuk',
              title: 'Penerimaan Refund',
              note: 'Pengembalian biaya operasional',
              amount: 96000000
            }
          ]
        }
      ]
    },
    operasional: {
      status: 'success',
      groups: [
        {
          date: '2025-08-02',
          label: 'Sabtu, 2 Agustus 2025',
          transactions: [
            {
              id: 'OPR-23001',
              type: 'keluar',
              title: 'TRCDESC',
              note: 'Description/Notes/Description/Note',
              amount: 1000000000000
            },
            {
              id: 'OPR-23002',
              type: 'masuk',
              title: 'TRCDESC',
              note: 'Description/Notes/Description/Note',
              amount: 1000000000000
            }
          ]
        },
        {
          date: '2025-08-01',
          label: 'Jumat, 1 Agustus 2025',
          transactions: [
            {
              id: 'OPR-22987',
              type: 'keluar',
              title: 'Pembayaran Gaji Karyawan',
              note: 'Payroll Agustus 2025',
              amount: 850000000
            }
          ]
        }
      ]
    },
    'pembayaran-distributor': {
      status: 'success',
      groups: [
        {
          date: '2025-07-28',
          label: 'Senin, 28 Juli 2025',
          transactions: [
            {
              id: 'DST-11841',
              type: 'keluar',
              title: 'Pembayaran Distributor Wilayah Barat',
              note: 'Invoice #INV-8721',
              amount: 420000000
            },
            {
              id: 'DST-11842',
              type: 'masuk',
              title: 'Pembayaran Distributor Wilayah Timur',
              note: 'Setoran penjualan cabang Makassar',
              amount: 570000000
            }
          ]
        }
      ]
    }
  };

  function cloneGroups(groups) {
    return (groups || []).map((group) => ({
      date: group.date,
      label: group.label,
      transactions: (group.transactions || []).map((tx) => ({ ...tx }))
    }));
  }

  function normaliseKey(key) {
    if (!key) return '';
    return key.toString().replace(/[^a-z0-9]/gi, '').toLowerCase();
  }

  function get(accountId) {
    const key = normaliseKey(accountId);
    const entry = dataset[key] || dataset[accountId] || dataset.default;
    if (!entry) {
      return { status: 'empty', groups: [] };
    }
    return {
      status: entry.status || 'success',
      groups: cloneGroups(entry.groups)
    };
  }

  window.MUTASI_DATA = {
    get,
    all() {
      return Object.keys(dataset).reduce((acc, key) => {
        acc[key] = { status: dataset[key].status, groups: cloneGroups(dataset[key].groups) };
        return acc;
      }, {});
    },
    set(accountId, value) {
      if (!accountId || typeof value !== 'object') return;
      dataset[normaliseKey(accountId)] = {
        status: value.status || 'success',
        groups: cloneGroups(value.groups)
      };
    }
  };
})();
