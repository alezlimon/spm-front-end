import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  createInvoice,
  ENABLE_BILLING,
  getInvoiceById,
  listInvoices,
  recordInvoicePayment
} from '../api/billingApi';
import { formatDisplayDate } from '../utils/date';
import { formatCurrency } from '../utils/money';
import { EmptyState, ErrorState, LoadingState } from './PageState';
import '../App.css';

const STATUS_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'issued', label: 'Issued' },
  { key: 'partially_paid', label: 'Partially paid' },
  { key: 'paid', label: 'Paid' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'void', label: 'Void' }
];

const getStatusLabel = (status) => {
  const safeStatus = String(status || '').toLowerCase();

  if (safeStatus === 'partially_paid') return 'Partially Paid';
  if (safeStatus === 'checked_out') return 'Checked Out';

  return safeStatus
    .split('_')
    .filter(Boolean)
    .map((segment) => segment[0].toUpperCase() + segment.slice(1))
    .join(' ') || 'Unknown';
};

const getStatusClass = (status) => {
  const safeStatus = String(status || '').toLowerCase();
  return `invoice-status-${safeStatus || 'unknown'}`;
};

function BillingPage() {
  const { propertyId } = useParams();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [createForm, setCreateForm] = useState({
    guestName: '',
    bookingId: '',
    subtotal: '',
    taxes: '',
    discounts: '',
    dueDate: ''
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'card',
    reference: '',
    notes: ''
  });

  const refreshInvoices = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await listInvoices({
        propertyId,
        status: statusFilter,
        search
      });

      setInvoices(Array.isArray(data) ? data : []);
    } catch {
      setInvoices([]);
      setError('Could not load invoices');
    } finally {
      setLoading(false);
    }
  }, [propertyId, search, statusFilter]);

  useEffect(() => {
    if (!ENABLE_BILLING) {
      return;
    }

    refreshInvoices();
  }, [refreshInvoices]);

  useEffect(() => {
    if (!selectedInvoiceId) {
      setSelectedInvoice(null);
      setDetailError('');
      return;
    }

    const loadInvoiceDetail = async () => {
      setDetailLoading(true);
      setDetailError('');

      try {
        const data = await getInvoiceById(selectedInvoiceId);
        setSelectedInvoice(data);
      } catch {
        setDetailError('Could not load invoice detail');
        setSelectedInvoice(null);
      } finally {
        setDetailLoading(false);
      }
    };

    loadInvoiceDetail();
  }, [selectedInvoiceId]);

  const summary = useMemo(() => {
    const totals = invoices.reduce(
      (acc, invoice) => {
        const total = Number(invoice.total || 0);
        const paid = Number(invoice.amountPaid || 0);
        const due = Number(invoice.balanceDue || 0);

        acc.totalInvoiced += total;
        acc.totalPaid += paid;
        acc.totalOutstanding += due;

        if (invoice.status === 'overdue') {
          acc.overdueCount += 1;
        }

        return acc;
      },
      {
        totalInvoiced: 0,
        totalPaid: 0,
        totalOutstanding: 0,
        overdueCount: 0
      }
    );

    return totals;
  }, [invoices]);

  const handleCreateInvoice = async (event) => {
    event.preventDefault();
    setCreateError('');

    if (!createForm.guestName.trim()) {
      setCreateError('Guest name is required');
      return;
    }

    if (!createForm.subtotal || Number(createForm.subtotal) <= 0) {
      setCreateError('Subtotal must be greater than zero');
      return;
    }

    setCreateLoading(true);

    try {
      await createInvoice({
        propertyId,
        guestName: createForm.guestName.trim(),
        bookingId: createForm.bookingId.trim(),
        subtotal: Number(createForm.subtotal),
        taxes: Number(createForm.taxes || 0),
        discounts: Number(createForm.discounts || 0),
        dueDate: createForm.dueDate || new Date().toISOString(),
        status: 'issued'
      });

      setShowCreateModal(false);
      setCreateForm({
        guestName: '',
        bookingId: '',
        subtotal: '',
        taxes: '',
        discounts: '',
        dueDate: ''
      });

      await refreshInvoices();
    } catch (err) {
      setCreateError(err.message || 'Could not create invoice');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleRecordPayment = async (event) => {
    event.preventDefault();

    if (!selectedInvoice) return;

    setPaymentError('');

    const amount = Number(paymentForm.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setPaymentError('Payment amount must be greater than zero');
      return;
    }

    setRecordingPayment(true);

    try {
      const updated = await recordInvoicePayment(selectedInvoice._id, {
        amount,
        method: paymentForm.method,
        reference: paymentForm.reference,
        notes: paymentForm.notes,
        paidAt: new Date().toISOString()
      });

      setSelectedInvoice(updated);
      setPaymentForm({
        amount: '',
        method: 'card',
        reference: '',
        notes: ''
      });

      await refreshInvoices();
    } catch (err) {
      setPaymentError(err.message || 'Could not record payment');
    } finally {
      setRecordingPayment(false);
    }
  };

  if (!ENABLE_BILLING) {
    return (
      <div className="app">
        <header className="header">
          <h1>Billing</h1>
          <p>Billing is currently disabled by configuration.</p>
        </header>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header billing-header-row">
        <div>
          <h1>Billing</h1>
          <p>Issue invoices, track outstanding balances, and register payments from one place.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => {
            setCreateError('');
            setShowCreateModal(true);
          }}
        >
          New Invoice
        </button>
      </header>

      <section className="billing-kpi-grid">
        <div className="summary-card">
          <h3>Invoiced</h3>
          <p>{formatCurrency(summary.totalInvoiced)}</p>
        </div>
        <div className="summary-card">
          <h3>Paid</h3>
          <p>{formatCurrency(summary.totalPaid)}</p>
        </div>
        <div className="summary-card">
          <h3>Outstanding</h3>
          <p>{formatCurrency(summary.totalOutstanding)}</p>
        </div>
        <div className="summary-card">
          <h3>Overdue</h3>
          <p>{summary.overdueCount}</p>
        </div>
      </section>

      <section className="billing-controls">
        <div className="rooms-filter-pills" role="tablist" aria-label="Invoice status filters">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`rooms-filter-pill ${statusFilter === option.key ? 'active' : ''}`}
              onClick={() => setStatusFilter(option.key)}
            >
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by invoice number, guest, or booking"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </section>

      <section>
        {loading && <LoadingState message="Loading invoices..." />}
        {!loading && <ErrorState message={error} />}

        {!loading && !error && invoices.length === 0 && (
          <EmptyState message="No invoices found for this filter." />
        )}

        {!loading && !error && invoices.length > 0 && (
          <div className="billing-table-wrap">
            <table className="billing-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Guest</th>
                  <th>Status</th>
                  <th>Issued</th>
                  <th>Due</th>
                  <th>Total</th>
                  <th>Balance</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td>
                      <strong>{invoice.invoiceNumber || '—'}</strong>
                      <div className="billing-table-subtext">{invoice.bookingId || 'No booking link'}</div>
                    </td>
                    <td>{invoice.guestName || '—'}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(invoice.status)}`}>
                        {getStatusLabel(invoice.status)}
                      </span>
                    </td>
                    <td>{formatDisplayDate(invoice.issuedAt)}</td>
                    <td>{formatDisplayDate(invoice.dueDate)}</td>
                    <td>{formatCurrency(invoice.total, { currency: invoice.currency || 'EUR' })}</td>
                    <td>{formatCurrency(invoice.balanceDue, { currency: invoice.currency || 'EUR' })}</td>
                    <td>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => setSelectedInvoiceId(invoice._id)}
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showCreateModal && (
        <div className="room-clean-modal-backdrop" role="presentation">
          <div className="room-clean-modal billing-modal" role="dialog" aria-modal="true">
            <h4>Create Invoice</h4>

            <form className="billing-form-grid" onSubmit={handleCreateInvoice}>
              <input
                type="text"
                placeholder="Guest name"
                value={createForm.guestName}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, guestName: event.target.value }))}
                required
              />
              <input
                type="text"
                placeholder="Booking id (optional)"
                value={createForm.bookingId}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, bookingId: event.target.value }))}
              />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Subtotal"
                value={createForm.subtotal}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, subtotal: event.target.value }))}
                required
              />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Taxes"
                value={createForm.taxes}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, taxes: event.target.value }))}
              />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Discounts"
                value={createForm.discounts}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, discounts: event.target.value }))}
              />
              <input
                type="date"
                value={createForm.dueDate}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, dueDate: event.target.value }))}
              />

              {createError && <p className="form-feedback form-feedback-error">{createError}</p>}

              <div className="room-clean-modal-actions">
                <button
                  type="button"
                  className="room-clean-modal-cancel"
                  onClick={() => setShowCreateModal(false)}
                  disabled={createLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="room-clean-modal-ok"
                  disabled={createLoading}
                >
                  {createLoading ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedInvoiceId && (
        <div className="room-clean-modal-backdrop" role="presentation">
          <div className="room-clean-modal billing-modal" role="dialog" aria-modal="true">
            <h4>Invoice Detail</h4>

            {detailLoading && <LoadingState message="Loading invoice detail..." />}
            {!detailLoading && detailError && <ErrorState message={detailError} />}

            {!detailLoading && !detailError && selectedInvoice && (
              <div className="billing-detail-wrap">
                <div className="billing-detail-top">
                  <div>
                    <strong>{selectedInvoice.invoiceNumber}</strong>
                    <p>{selectedInvoice.guestName || 'Guest'}</p>
                  </div>
                  <span className={`status-badge ${getStatusClass(selectedInvoice.status)}`}>
                    {getStatusLabel(selectedInvoice.status)}
                  </span>
                </div>

                <div className="billing-detail-grid">
                  <div>
                    <span>Issued</span>
                    <strong>{formatDisplayDate(selectedInvoice.issuedAt)}</strong>
                  </div>
                  <div>
                    <span>Due</span>
                    <strong>{formatDisplayDate(selectedInvoice.dueDate)}</strong>
                  </div>
                  <div>
                    <span>Total</span>
                    <strong>{formatCurrency(selectedInvoice.total, { currency: selectedInvoice.currency || 'EUR' })}</strong>
                  </div>
                  <div>
                    <span>Paid</span>
                    <strong>{formatCurrency(selectedInvoice.amountPaid, { currency: selectedInvoice.currency || 'EUR' })}</strong>
                  </div>
                  <div>
                    <span>Balance</span>
                    <strong>{formatCurrency(selectedInvoice.balanceDue, { currency: selectedInvoice.currency || 'EUR' })}</strong>
                  </div>
                </div>

                <form className="billing-payment-form" onSubmit={handleRecordPayment}>
                  <h5>Record Payment</h5>

                  <div className="billing-form-grid billing-form-grid-payments">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Amount"
                      value={paymentForm.amount}
                      onChange={(event) => setPaymentForm((prev) => ({ ...prev, amount: event.target.value }))}
                    />
                    <select
                      value={paymentForm.method}
                      onChange={(event) => setPaymentForm((prev) => ({ ...prev, method: event.target.value }))}
                    >
                      <option value="card">Card</option>
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank transfer</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Reference"
                      value={paymentForm.reference}
                      onChange={(event) => setPaymentForm((prev) => ({ ...prev, reference: event.target.value }))}
                    />
                    <input
                      type="text"
                      placeholder="Notes"
                      value={paymentForm.notes}
                      onChange={(event) => setPaymentForm((prev) => ({ ...prev, notes: event.target.value }))}
                    />
                  </div>

                  {paymentError && <p className="form-feedback form-feedback-error">{paymentError}</p>}

                  <div className="room-clean-modal-actions">
                    <button
                      type="submit"
                      className="room-clean-modal-ok"
                      disabled={recordingPayment}
                    >
                      {recordingPayment ? 'Posting...' : 'Post Payment'}
                    </button>
                  </div>
                </form>

                <div className="billing-payments-list">
                  <h5>Payments</h5>

                  {!selectedInvoice.payments || selectedInvoice.payments.length === 0 ? (
                    <p className="page-feedback">No payments registered yet.</p>
                  ) : (
                    <ul>
                      {selectedInvoice.payments.map((payment) => (
                        <li key={payment._id}>
                          <span>
                            {formatCurrency(payment.amount, {
                              currency: payment.currency || selectedInvoice.currency || 'EUR'
                            })}
                          </span>
                          <span>{String(payment.method || 'unknown').replace('_', ' ')}</span>
                          <span>{formatDisplayDate(payment.paidAt)}</span>
                          <span>{payment.reference || '—'}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            <div className="room-clean-modal-actions">
              <button
                type="button"
                className="room-clean-modal-cancel"
                onClick={() => {
                  setSelectedInvoiceId(null);
                  setPaymentError('');
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillingPage;
