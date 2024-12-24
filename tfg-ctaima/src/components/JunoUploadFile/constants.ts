// src/components/Upload/constants.ts

// Opciones de tipo de documento
export const documentTypes = [
    { value: 'invoice', label: 'Factura' },
    { value: 'receipt', label: 'Recibo' },
    { value: 'report', label: 'Informe' },
    // Agrega más tipos de documento según necesites
];

// Opciones de campos a validar según el tipo de documento
export const validationFields = {
    invoice: [
        { value: 'date', label: 'Fecha' },
        { value: 'amount', label: 'Monto' },
        { value: 'client', label: 'Cliente' },
        { value: 'address', label: 'Dirección' },
    ],
    receipt: [
        { value: 'date', label: 'Fecha' },
        { value: 'amount', label: 'Monto' },
        { value: 'vendor', label: 'Vendedor' },
    ],
    report: [
        { value: 'date', label: 'Fecha' },
        { value: 'summary', label: 'Resumen' },
        { value: 'author', label: 'Autor' },
    ],
    // Agrega más campos según necesites
};