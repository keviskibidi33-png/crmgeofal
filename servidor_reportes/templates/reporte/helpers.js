function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatCurrency(number) {
    const num = parseFloat(number);
    if (isNaN(num)) return "0.00";
    return num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function calculateTotals(items, type) {
    if (!items || !Array.isArray(items)) return '0.00';
    const subtotal = items.reduce((sum, item) => {
        const cost = parseFloat(item.costoParcial);
        return sum + (isNaN(cost) ? 0 : cost);
    }, 0);
    const igv = subtotal * 0.18;
    const total = subtotal + igv;
    switch (type) {
        case 'subtotal': return formatCurrency(subtotal);
        case 'igv': return formatCurrency(igv);
        case 'total': return formatCurrency(total);
        default: return '0.00';
    }
}
