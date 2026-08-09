import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api.js';

export const ProductForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  // Form Fields State
  const [productName, setProductName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [unitPrice, setUnitPrice] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [minimumStock, setMinimumStock] = useState('');
  const [warehouseLocation, setWarehouseLocation] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    if (!isEditMode) return;

    const fetchProduct = async () => {
      setFetchLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        if (res.data && res.data.success) {
          const prod = res.data.data;
          setProductName(prod.productName);
          setSku(prod.sku);
          setCategory(prod.category);
          setUnitPrice(prod.unitPrice);
          setMinimumStock(prod.minimumStock);
          setWarehouseLocation(prod.warehouseLocation);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch product catalog data');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchProduct();
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors([]);
    setLoading(true);

    const price = parseFloat(unitPrice);
    const minStock = parseInt(minimumStock);
    const currStock = parseInt(currentStock) || 0;

    if (isNaN(price) || price <= 0) {
      setError('Base unit price must be a positive number');
      setLoading(false);
      return;
    }

    if (isNaN(minStock) || minStock < 0) {
      setError('Minimum stock level cannot be negative');
      setLoading(false);
      return;
    }

    const productPayload = {
      productName,
      sku,
      category,
      unitPrice: price,
      minimumStock: minStock,
      warehouseLocation,
    };

    // Include stock only in creation mode
    if (!isEditMode) {
      if (isNaN(currStock) || currStock < 0) {
        setError('Starting warehouse stock cannot be negative');
        setLoading(false);
        return;
      }
      productPayload.currentStock = currStock;
    }

    try {
      let res;
      if (isEditMode) {
        res = await api.put(`/products/${id}`, productPayload);
      } else {
        res = await api.post('/products', productPayload);
      }

      if (res.data && res.data.success) {
        navigate(isEditMode ? `/products/${id}` : '/products');
      }
    } catch (err) {
      console.error('Product save error:', err);
      const errData = err.response?.data;
      if (errData?.error === 'VALIDATION_ERROR' && errData?.details) {
        setValidationErrors(errData.details);
      } else {
        setError(errData?.message || 'An unexpected database error occurred while saving the product');
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    const errorObj = validationErrors.find(e => e.field === fieldName);
    return errorObj ? errorObj.message : null;
  };

  if (fetchLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/products" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          ◀ Cancel and Return
        </Link>
        <h2 style={{ margin: '0.25rem 0 0 0' }}>{isEditMode ? 'Modify Product Specifications' : 'Register New Catalogue Product'}</h2>
      </div>

      {error && (
        <div className="card" style={{ borderColor: 'var(--danger-color)', padding: '1rem', marginBottom: '1.5rem', color: 'var(--danger-color)' }}>
          ⚠️ {error}
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="card" style={{ borderColor: 'var(--danger-color)', padding: '1rem', marginBottom: '1.5rem' }}>
          <p style={{ color: 'var(--danger-color)', fontWeight: '700', marginBottom: '0.5rem' }}>Validation Checklist Failed:</p>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {validationErrors.map((err, idx) => (
              <li key={idx}><strong>{err.field}</strong>: {err.message}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="grid-cols-2">
          {/* Product Name */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Product Name</label>
            <input
              type="text"
              className="form-input"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Noise Cancelling Headphones"
              required
              disabled={loading}
              style={getFieldError('productName') ? inputErrorStyle : {}}
            />
            {getFieldError('productName') && <span style={errorSpanStyle}>{getFieldError('productName')}</span>}
          </div>

          {/* SKU */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">SKU Code (Alphanumeric)</label>
            <input
              type="text"
              className="form-input"
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              placeholder="e.g. PROD-HDPH-003"
              required
              disabled={loading || isEditMode} // Lock SKU in edit mode
              style={getFieldError('sku') ? inputErrorStyle : {}}
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {isEditMode ? 'SKU codes cannot be altered once created.' : 'Enter a unique catalog identifier.'}
            </span>
            {getFieldError('sku') && <span style={errorSpanStyle}>{getFieldError('sku')}</span>}
          </div>
        </div>

        <div className="grid-cols-3">
          {/* Category */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category Classification</label>
            <select
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
            >
              <option value="Electronics">Electronics</option>
              <option value="Electricals">Electricals</option>
              <option value="Gadgets">Gadgets</option>
              <option value="Apparel">Apparel</option>
              <option value="Home & Kitchen">Home & Kitchen</option>
            </select>
          </div>

          {/* Unit Price */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Unit Price (INR)</label>
            <input
              type="number"
              className="form-input"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="e.g. 3500.00"
              required
              min="0.01"
              step="0.01"
              disabled={loading}
              style={getFieldError('unitPrice') ? inputErrorStyle : {}}
            />
            {getFieldError('unitPrice') && <span style={errorSpanStyle}>{getFieldError('unitPrice')}</span>}
          </div>

          {/* Minimum Stock level */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Min Stock Threshold Alert</label>
            <input
              type="number"
              className="form-input"
              value={minimumStock}
              onChange={(e) => setMinimumStock(e.target.value)}
              placeholder="e.g. 15"
              required
              min="0"
              disabled={loading}
              style={getFieldError('minimumStock') ? inputErrorStyle : {}}
            />
            {getFieldError('minimumStock') && <span style={errorSpanStyle}>{getFieldError('minimumStock')}</span>}
          </div>
        </div>

        <div className="grid-cols-2">
          {/* Warehouse location */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Warehouse Storage Shelf Location</label>
            <input
              type="text"
              className="form-input"
              value={warehouseLocation}
              onChange={(e) => setWarehouseLocation(e.target.value)}
              placeholder="e.g. Shelf A-5"
              required
              disabled={loading}
              style={getFieldError('warehouseLocation') ? inputErrorStyle : {}}
            />
            {getFieldError('warehouseLocation') && <span style={errorSpanStyle}>{getFieldError('warehouseLocation')}</span>}
          </div>

          {/* Current Stock (Creation mode only) */}
          {!isEditMode && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Starting Warehouse Stock Balance</label>
              <input
                type="number"
                className="form-input"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                placeholder="e.g. 100"
                required
                min="0"
                disabled={loading}
                style={getFieldError('currentStock') ? inputErrorStyle : {}}
              />
              {getFieldError('currentStock') && <span style={errorSpanStyle}>{getFieldError('currentStock')}</span>}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ flexGrow: 1 }}
            disabled={loading}
          >
            {loading ? 'Saving SKU specs...' : '💾 Save Product Configuration'}
          </button>
          <Link to="/products" className="btn btn-secondary" style={{ width: '150px' }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

const inputErrorStyle = {
  borderColor: 'var(--danger-color)',
};

const errorSpanStyle = {
  display: 'block',
  fontSize: '0.75rem',
  color: 'var(--danger-color)',
  marginTop: '0.25rem',
};

export default ProductForm;
