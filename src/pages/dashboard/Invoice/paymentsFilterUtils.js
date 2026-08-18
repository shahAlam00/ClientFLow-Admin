export const filterPayments = (payments = [], searchTerm = '', statusFilter = 'All') => {
    const query = String(searchTerm || '').trim().toLowerCase();
    const normalizedStatus = String(statusFilter || 'All').trim().toLowerCase();

    return payments.filter((payment) => {
        const clientName = (payment.client?.name || payment.clientSearch || payment.client || '').toString().toLowerCase();
        const paymentNo = (payment.paymentNumber || payment._id || payment.id || '').toString().toLowerCase();
        const status = (payment.paymentStatus || payment.status || '').toString().toLowerCase();

        const matchesQuery = !query || clientName.includes(query) || paymentNo.includes(query) || status.includes(query);
        const matchesStatus = normalizedStatus === 'all' || !normalizedStatus || status === normalizedStatus;

        return matchesQuery && matchesStatus;
    });
};
