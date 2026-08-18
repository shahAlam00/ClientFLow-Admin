import { describe, it, expect } from 'vitest';
import { filterPayments } from '../pages/dashboard/Invoice/paymentsFilterUtils';

describe('filterPayments', () => {
    const payments = [
        {
            _id: '1',
            paymentNumber: 'PAY-100',
            client: { name: 'John Doe' },
            paymentStatus: 'Completed',
            amount: 5000,
            receivedDate: '2026-07-13',
        },
        {
            _id: '2',
            paymentNumber: 'PAY-200',
            client: { name: 'Jane Smith' },
            paymentStatus: 'Pending',
            amount: 3500,
            receivedDate: '2026-07-15',
        },
    ];

    it('matches search text across client, payment number and status', () => {
        const result = filterPayments(payments, 'jane');
        expect(result).toHaveLength(1);
        expect(result[0]._id).toBe('2');
    });

    it('applies the selected status filter alongside the search term', () => {
        const result = filterPayments(payments, 'pay', 'Completed');
        expect(result).toHaveLength(1);
        expect(result[0].paymentStatus).toBe('Completed');
    });

    it('returns all items when both search and status filters are cleared', () => {
        const result = filterPayments(payments, '', 'All');
        expect(result).toHaveLength(2);
    });
});
