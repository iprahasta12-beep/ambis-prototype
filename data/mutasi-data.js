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
              amount: 250000000,
              detail: {
                activity: 'Transfer Saldo',
                method: 'BI Fast',
                reference: '1234567890',
                datetime: '2024-01-03T20:56:00+07:00',
                category: 'Pemindahan Dana',
                note: 'Kesalahan Transfer',
                total: 250000000,
                source: {
                  name: 'Operasional',
                  subtitle: 'PT ABC Indonesia',
                  account: 'Amar Indonesia - 000967895483'
                },
                destination: {
                  name: 'Supplier Baja',
                  subtitle: 'PT XYZ Indonesia',
                  account: 'BCA - 4750278562'
                }
              }
            },
            {
              id: 'UTM-12002',
              type: 'keluar',
              title: 'Pembayaran Vendor',
              note: 'Ke PT Sinar Abadi Makmur',
              amount: 175000000,
              detail: {
                activity: 'Transfer Saldo',
                method: 'SKN',
                reference: 'TRX-UTM12002',
                datetime: '2024-02-14T09:30:00+07:00',
                category: 'Pembayaran Vendor',
                note: 'Pelunasan invoice bulanan',
                total: 175000000,
                source: {
                  name: 'Operasional',
                  subtitle: 'PT ABC Indonesia',
                  account: 'BCA - 0987654321'
                },
                destination: {
                  name: 'PT Sinar Abadi Makmur',
                  subtitle: 'Vendor Utama',
                  account: 'Mandiri - 1234567890'
                }
              }
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
              amount: 96000000,
              detail: {
                activity: 'Transfer Saldo',
                method: 'Online Transfer',
                reference: 'TRX-UTM11951',
                datetime: '2024-02-01T16:20:00+07:00',
                category: 'Pengembalian Dana',
                note: 'Refund biaya operasional cabang',
                total: 96000000,
                source: {
                  name: 'Rekening Refund',
                  subtitle: 'PT Nusantara Logistics',
                  account: 'BRI - 5566778899'
                },
                destination: {
                  name: 'Utama',
                  subtitle: 'PT Sarana Pancing Indonesia',
                  account: 'Amar Indonesia - 000967895410'
                }
              }
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
              amount: 1000000000000,
              detail: {
                activity: 'Transfer Saldo',
                method: 'RTGS',
                reference: 'TRX-OPR23001',
                datetime: '2024-03-05T11:00:00+07:00',
                category: 'Investasi',
                note: 'Pemindahan dana antar rekening korporat',
                total: 1000000000000,
                source: {
                  name: 'Operasional',
                  subtitle: 'PT Sarana Pancing Indonesia',
                  account: 'Amar Indonesia - 000967895483'
                },
                destination: {
                  name: 'Rekening Investasi',
                  subtitle: 'PT Sarana Pancing Indonesia',
                  account: 'BCA - 8899001122'
                }
              }
            },
            {
              id: 'OPR-23002',
              type: 'masuk',
              title: 'TRCDESC',
              note: 'Description/Notes/Description/Note',
              amount: 1000000000000,
              detail: {
                activity: 'Transfer Saldo',
                method: 'Transfer Internal',
                reference: 'TRX-OPR23002',
                datetime: '2024-03-06T14:45:00+07:00',
                category: 'Pengembalian Dana',
                note: 'Pengembalian modal investasi jangka pendek',
                total: 1000000000000,
                source: {
                  name: 'Rekening Investasi',
                  subtitle: 'PT Sarana Pancing Indonesia',
                  account: 'BCA - 8899001122'
                },
                destination: {
                  name: 'Operasional',
                  subtitle: 'PT Sarana Pancing Indonesia',
                  account: 'Amar Indonesia - 000967895483'
                }
              }
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
              amount: 850000000,
              detail: {
                activity: 'Transfer Saldo',
                method: 'Payroll Bulk',
                reference: 'TRX-OPR22987',
                datetime: '2024-08-25T08:00:00+07:00',
                category: 'Pembayaran Gaji',
                note: 'Pembayaran gaji seluruh karyawan',
                total: 850000000,
                source: {
                  name: 'Operasional',
                  subtitle: 'PT Sarana Pancing Indonesia',
                  account: 'Amar Indonesia - 000967895483'
                },
                destination: {
                  name: 'Karyawan',
                  subtitle: 'Berbagai rekening',
                  account: 'Multi-bank'
                }
              }
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
              amount: 420000000,
              detail: {
                activity: 'Transfer Saldo',
                method: 'Virtual Account',
                reference: 'TRX-DST11841',
                datetime: '2024-05-10T13:10:00+07:00',
                category: 'Pembayaran Distributor',
                note: 'Pembayaran invoice #INV-8721',
                total: 420000000,
                source: {
                  name: 'Pembayaran Distributor',
                  subtitle: 'PT Sarana Pancing Indonesia',
                  account: 'Amar Indonesia - 000967895450'
                },
                destination: {
                  name: 'Distributor Wilayah Barat',
                  subtitle: 'PT Samudra Niaga',
                  account: 'BNI - 7788990011'
                }
              }
            },
            {
              id: 'DST-11842',
              type: 'masuk',
              title: 'Pembayaran Distributor Wilayah Timur',
              note: 'Setoran penjualan cabang Makassar',
              amount: 570000000,
              detail: {
                activity: 'Transfer Saldo',
                method: 'BI Fast',
                reference: 'TRX-DST11842',
                datetime: '2024-05-11T15:05:00+07:00',
                category: 'Setoran Penjualan',
                note: 'Setoran penjualan cabang Makassar',
                total: 570000000,
                source: {
                  name: 'Distributor Wilayah Timur',
                  subtitle: 'PT Makassar Prima',
                  account: 'BCA - 6677889900'
                },
                destination: {
                  name: 'Pembayaran Distributor',
                  subtitle: 'PT Sarana Pancing Indonesia',
                  account: 'Amar Indonesia - 000967895450'
                }
              }
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
