import api from './api';

export const productService = {
    getAll: async () => {
        const { data } = await api.get('/products');
        return data;
    },

    getById: async (id) => {
        const { data } = await api.get(`/products/${id}`);
        return data;
    },

    create: async (productData) => {
        const { data } = await api.post('/products', productData);
        return data;
    },

    update: async (id, productData) => {
        const { data } = await api.put(`/products/${id}`, productData);
        return data;
    },

    delete: async (id) => {
        const { data } = await api.delete(`/products/${id}`);
        return data;
    }
};

export const purchaseService = {
    getAll: async () => {
        const { data } = await api.get('/purchases');
        return data;
    },

    getById: async (id) => {
        const { data } = await api.get(`/purchases/${id}`);
        return data;
    },

    create: async (purchaseData) => {
        const { data } = await api.post('/purchases', purchaseData);
        return data;
    },

    delete: async (id) => {
        const { data } = await api.delete(`/purchases/${id}`);
        return data;
    }
};

export const saleService = {
    getAll: async () => {
        const { data } = await api.get('/sales');
        return data;
    },

    getById: async (id) => {
        const { data } = await api.get(`/sales/${id}`);
        return data;
    },

    create: async (saleData) => {
        const { data } = await api.post('/sales', saleData);
        return data;
    },

    delete: async (id) => {
        const { data } = await api.delete(`/sales/${id}`);
        return data;
    }
};

export const reportService = {
    getProfitReport: async (startDate, endDate) => {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const { data } = await api.get('/reports/profit', { params });
        return data;
    },

    getDashboardStats: async () => {
        const { data } = await api.get('/reports/dashboard');
        return data;
    }
};
