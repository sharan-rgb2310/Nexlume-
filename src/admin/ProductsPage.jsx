import { useEffect, useState } from 'react'
import {
  Package, Plus, Search, Filter, Pencil, Trash2, X, Check,
  AlertTriangle, Upload, Eye, Image as ImageIcon, Loader2,
  RefreshCw, CheckCircle2,
} from 'lucide-react'
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  computeProductStatus,
} from '../services/productService'
import { getShops } from '../services/shopService'
import { getPanels } from '../services/panelService'
import { getCommodityGraphic, formatUnitLabel } from '../data/stock'
import { useStore } from './useStore'

const UNIT_OPTIONS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'L', label: 'Litre (L)' },
  { value: 'ml', label: 'Millilitre (ml)' },
  { value: 'oz', label: 'Ounce (oz)' },
  { value: 'pcs', label: 'Piece / Count (pcs)' },
]

export default function ProductsPage() {
  const { notify } = useStore()
  const [products, setProducts] = useState([])
  const [shops, setShops] = useState([])
  const [panels, setPanels] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterShop, setFilterShop] = useState('All Shops')
  const [filterPanel, setFilterPanel] = useState('All Panels')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null) // { mode: 'add' | 'edit' | 'view', product?: object }
  const [isDeleting, setIsDeleting] = useState(null)

  // 1. Fetch products, shops, and panels
  const loadData = async () => {
    setLoading(true)
    try {
      const [prods, shopList, panelList] = await Promise.all([
        getProducts(),
        getShops(),
        getPanels(),
      ])
      setProducts(prods)
      setShops(shopList)
      setPanels(panelList)
    } catch (err) {
      notify(err.message || 'Failed to load products from database.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // 2. Filter & paginate
  const filtered = products.filter((p) => {
    const shop = shops.find((s) => s.id === p.shop_id)
    const panel = panels.find((pan) => pan.id === p.panel_id)

    const matchesSearch = `${p.name} ${p.name_ta || ''} ${p.category || ''} ${shop?.name || ''} ${panel?.name || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesShop = filterShop === 'All Shops' || p.shop_id === filterShop
    const matchesPanel = filterPanel === 'All Panels' || p.panel_id === filterPanel

    return matchesSearch && matchesShop && matchesPanel
  })

  const pageSize = 10
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginatedRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  // 3. Delete handler
  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"? This action will remove it from both admin and public dashboards.`)) {
      return
    }

    setIsDeleting(product.id)
    try {
      await deleteProduct(product.id)
      setProducts((current) => current.filter((p) => p.id !== product.id))
      notify(`Product "${product.name}" deleted successfully.`)
    } catch (err) {
      notify(err.message || 'Failed to delete product from database.', 'error')
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <>
      <div className="page-heading">
        <div className="heading-icon">
          <Package size={24} />
        </div>
        <div className="heading-copy">
          <h1>Product Catalogue Management</h1>
          <p>Add, edit, and manage public distribution commodities backed by Supabase.</p>
        </div>
        <button
          type="button"
          className="primary-button add-new-button"
          onClick={() => setModal({ mode: 'add' })}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Summary Highlights */}
      <div className="summary-grid dashboard-summary-grid">
        <div className="summary-card blue">
          <div className="summary-icon"><Package size={19} /></div>
          <div className="summary-text">
            <span>Total Commodities</span>
            <b>{products.length}</b>
            <small>Active in catalogue</small>
          </div>
        </div>
        <div className="summary-card green">
          <div className="summary-icon"><CheckCircle2 size={19} /></div>
          <div className="summary-text">
            <span>In Stock</span>
            <b>{products.filter((p) => computeProductStatus(p.quantity, p.low_stock_threshold) === 'in_stock').length}</b>
            <small>Above minimum threshold</small>
          </div>
        </div>
        <div className="summary-card red">
          <div className="summary-icon"><AlertTriangle size={19} /></div>
          <div className="summary-text">
            <span>Low / Out of Stock</span>
            <b>{products.filter((p) => computeProductStatus(p.quantity, p.low_stock_threshold) !== 'in_stock').length}</b>
            <small>Requires restocking</small>
          </div>
        </div>
      </div>

      {/* Main Table Panel */}
      <section className="panel dashboard-table-panel">
        <div className="panel-heading">
          <h2>
            <Package size={20} /> Commodities List
            <span className="count-label" style={{ fontSize: '11px', background: '#e0edff', color: '#075ec4', padding: '2px 8px', borderRadius: '12px', marginLeft: '6px' }}>
              {filtered.length} records
            </span>
          </h2>
          <div className="table-tools">
            <label className="search-box">
              <Search size={15} />
              <input
                placeholder="Search commodity, category, shop..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
              {search && (
                <button type="button" aria-label="Clear" onClick={() => setSearch('')}>
                  <X size={13} />
                </button>
              )}
            </label>

            <select
              className="toolbar-select"
              value={filterShop}
              onChange={(e) => {
                setFilterShop(e.target.value)
                setPage(1)
              }}
            >
              <option>All Shops</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select
              className="toolbar-select"
              value={filterPanel}
              onChange={(e) => {
                setFilterPanel(e.target.value)
                setPage(1)
              }}
            >
              <option>All Panels</option>
              {panels.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <button
              type="button"
              className="outline-button"
              onClick={loadData}
              title="Refresh database records"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '56px', textAlign: 'center' }}>Image</th>
                <th>Commodity Name</th>
                <th style={{ textAlign: 'right' }}>Stock Quantity</th>
                <th>Unit</th>
                <th>Assigned Shop</th>
                <th>Display Panel</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th className="actions-header" style={{ textAlign: 'center', width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && !products.length ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 8px', color: '#0877ed' }} />
                    <span>Loading products from Supabase…</span>
                  </td>
                </tr>
              ) : paginatedRows.length > 0 ? (
                paginatedRows.map((prod) => {
                  const shop = shops.find((s) => s.id === prod.shop_id)
                  const panel = panels.find((pan) => pan.id === prod.panel_id)
                  const Graphic = getCommodityGraphic(prod.name)
                  const unitLabel = formatUnitLabel(prod.unit)
                  const status = computeProductStatus(prod.quantity, prod.low_stock_threshold)
                  const statusClass = status === 'in_stock' ? 'green' : status === 'low_stock' ? 'amber' : 'red'
                  const statusText = status === 'in_stock' ? 'In Stock' : status === 'low_stock' ? 'Limited Stock' : 'Out of Stock'

                  const updatedDate = prod.updated_at
                    ? new Date(prod.updated_at).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })
                    : '—'

                  return (
                    <tr key={prod.id}>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: '#f1f5f9',
                          overflow: 'hidden',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          {prod.image_url ? (
                            <img
                              src={prod.image_url}
                              alt={prod.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.nextSibling && (e.currentTarget.nextSibling.style.display = '')
                              }}
                            />
                          ) : null}
                          <span style={{ display: prod.image_url ? 'none' : '' }}>
                            <Graphic size={28} />
                          </span>
                        </div>
                      </td>

                      <td className="strong-cell">
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '11px', color: '#0e438a', fontWeight: 650 }}>{prod.name}</span>
                          {prod.name_ta && (
                            <small style={{ fontSize: '9px', color: '#64748b' }}>{prod.name_ta}</small>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '12px', color: '#103769' }}>
                        {Number(prod.quantity || 0).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span style={{ fontSize: '10px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          {unitLabel.en}
                        </span>
                      </td>
                      <td>
                        {shop ? (
                          <span title={shop.id} style={{ color: '#1e293b' }}>
                            {shop.name}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>All Outlets</span>
                        )}
                      </td>
                      <td>
                        {panel ? (
                          <span title={panel.id} style={{ color: '#1e293b' }}>
                            {panel.name}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>Default Panel</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${statusClass}`}>
                          <i /> {statusText}
                        </span>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '9px' }}>
                        {updatedDate}
                      </td>
                      <td>
                        <div className="row-actions" style={{ justifyContent: 'center' }}>
                          <button
                            type="button"
                            title="Edit Commodity"
                            aria-label="Edit Commodity"
                            onClick={() => setModal({ mode: 'edit', product: prod })}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            title="Delete Commodity"
                            aria-label="Delete Commodity"
                            className="delete-action"
                            disabled={isDeleting === prod.id}
                            onClick={() => handleDelete(prod)}
                          >
                            {isDeleting === prod.id ? (
                              <Loader2 className="animate-spin" size={15} />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={9} className="empty-cell">
                    <Package size={28} />
                    <b>No products found</b>
                    <span>Adjust your search or click "Add Product" to create one in Supabase.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <span>
            Showing {filtered.length ? (page - 1) * pageSize + 1 : 0} - {Math.min(page * pageSize, filtered.length)} of {filtered.length} commodities
          </span>
          <div className="page-controls">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span style={{ padding: '0 8px', fontWeight: 600 }}>Page {page} of {pages}</span>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Add / Edit Product Modal */}
      {modal && (
        <ProductFormModal
          mode={modal.mode}
          product={modal.product}
          shops={shops}
          panels={panels}
          onClose={() => setModal(null)}
          onSuccess={(savedProduct) => {
            setModal(null)
            loadData()
            notify(
              modal.mode === 'add'
                ? `Commodity "${savedProduct.name}" added to Supabase.`
                : `Commodity "${savedProduct.name}" updated successfully.`
            )
          }}
        />
      )}
    </>
  )
}

function ProductFormModal({ mode, product, shops, panels, onClose, onSuccess }) {
  const isEdit = mode === 'edit'

  const [name, setName] = useState(product?.name || '')
  const [nameTa, setNameTa] = useState(product?.name_ta || '')
  const [quantity, setQuantity] = useState(product?.quantity ?? '')
  const [unit, setUnit] = useState(product?.unit || 'kg')
  const [shopId, setShopId] = useState(product?.shop_id || '')
  const [panelId, setPanelId] = useState(product?.panel_id || '')
  const [category, setCategory] = useState(product?.category || 'Grains')
  const [description, setDescription] = useState(product?.description || '')
  const [lowStockThreshold, setLowStockThreshold] = useState(product?.low_stock_threshold || 20)

  // Image Upload state
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(product?.image_url || null)
  const [uploadError, setUploadError] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    setUploadError('')
    if (!file) return

    // Type validation
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/jpg']
    if (!allowed.includes(file.type)) {
      setUploadError('Invalid format. Please select JPG, PNG, WEBP, or SVG.')
      return
    }

    // Size validation (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File is too large. Maximum image size is 5MB.')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    try {
      const payload = {
        name: (name || '').trim() || 'Commodity',
        name_ta: (nameTa || '').trim() || undefined,
        quantity: quantity !== '' && !isNaN(Number(quantity)) ? Math.max(0, Number(quantity)) : 0,
        unit: unit || 'kg',
        shop_id: shopId || null,
        panel_id: panelId || null,
        category: (category || '').trim() || 'General',
        description: (description || '').trim() || '',
        low_stock_threshold: Number(lowStockThreshold) || 20,
        image_url: product?.image_url || null,
        image_path: product?.image_path || null,
      }

      let saved
      if (isEdit) {
        saved = await updateProduct(product.id, payload, imageFile)
      } else {
        saved = await createProduct(payload, imageFile)
      }
      onSuccess(saved)
    } catch (err) {
      // Log the error but still attempt local save so the admin flow never hard-blocks
      console.warn('Product save notice:', err.message)
      // If createProduct/updateProduct already returned a value via local fallback, onSuccess
      // was already called before this catch. Only show error if it truly threw without saving.
      setErrors({ form: err.message || 'Failed to save product. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const Graphic = getCommodityGraphic(name)

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose()
      }}
    >
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        style={{ maxWidth: '640px' }}
      >
        <div className="modal-header">
          <div>
            <h2 id="product-modal-title">
              {isEdit ? 'Edit Commodity' : 'Add New Commodity'}
            </h2>
            <p>
              {isEdit
                ? 'Update commodity details, stock quantity, and assigned shop.'
                : 'Enter commodity information to store in the Supabase catalogue.'}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            className="icon-button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            {/* Image Preview & Upload */}
            <div className="field-wrap field-wide" style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span className="field-label" style={{ marginBottom: '8px', display: 'block' }}>
                Product Image (Supabase Storage)
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '12px',
                  background: '#fff',
                  border: '1.5px dashed #cbd5e1',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : Graphic ? (
                    <Graphic size={54} />
                  ) : (
                    <ImageIcon size={32} color="#94a3b8" />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: '#fff',
                      border: '1px solid #cbd5e1',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#0b3a8c',
                      cursor: 'pointer',
                    }}
                  >
                    <Upload size={14} />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                      disabled={isSubmitting}
                    />
                  </label>
                  <small style={{ display: 'block', marginTop: '6px', fontSize: '10px', color: '#64748b' }}>
                    JPG, PNG, WEBP, or SVG up to 5MB. Previews live on both user &amp; admin screens.
                  </small>
                  {uploadError && (
                    <small className="field-error" style={{ display: 'block', marginTop: '4px' }}>
                      {uploadError}
                    </small>
                  )}
                </div>
              </div>
            </div>

            {/* Commodity Name (EN) */}
            <label className="field-wrap">
              <span className="field-label">
                Product Name (English) <i>*</i>
              </span>
              <input
                className="form-input"
                placeholder="e.g. Rice, Sugar, Wheat, Toor Dal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
              />
            </label>

            {/* Commodity Name (Tamil) */}
            <label className="field-wrap">
              <span className="field-label">Product Name (Tamil)</span>
              <input
                className="form-input"
                placeholder="எ.கா. அரிசி, சர்க்கரை"
                value={nameTa}
                onChange={(e) => setNameTa(e.target.value)}
                disabled={isSubmitting}
              />
            </label>

            {/* Stock Quantity */}
            <label className="field-wrap">
              <span className="field-label">
                Stock Quantity <i>*</i>
              </span>
              <input
                className="form-input"
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 1800"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={isSubmitting}
              />
            </label>

            {/* Unit Dropdown */}
            <label className="field-wrap">
              <span className="field-label">
                Unit of Measurement <i>*</i>
              </span>
              <select
                className="form-input"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                disabled={isSubmitting}
              >
                {UNIT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Shop Dropdown */}
            <label className="field-wrap">
              <span className="field-label">Assigned Shop (Supabase)</span>
              <select
                className="form-input"
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="">All / Unassigned</option>
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.shop_code || s.id})
                  </option>
                ))}
              </select>
            </label>

            {/* Panel Dropdown */}
            <label className="field-wrap">
              <span className="field-label">Display Panel (Supabase)</span>
              <select
                className="form-input"
                value={panelId}
                onChange={(e) => setPanelId(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="">Default / All Panels</option>
                {panels.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.panel_code || p.id})
                  </option>
                ))}
              </select>
            </label>

            {/* Category */}
            <label className="field-wrap">
              <span className="field-label">Category</span>
              <input
                className="form-input"
                placeholder="e.g. Grains, Pulses, Oils"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isSubmitting}
              />
            </label>

            {/* Low Stock Threshold */}
            <label className="field-wrap">
              <span className="field-label">Low Stock Threshold</span>
              <input
                className="form-input"
                type="number"
                min="1"
                placeholder="e.g. 20"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                disabled={isSubmitting}
              />
            </label>

            {/* Description */}
            <label className="field-wrap field-wide">
              <span className="field-label">Description / Public Notes</span>
              <textarea
                className="form-input"
                rows="2"
                placeholder="Public distribution details, scheme notes, or specifications..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </label>
          </div>

          {errors.form && (
            <p className="form-error-summary" style={{ color: '#ef4444', margin: '12px 0 0' }}>
              {errors.form}
            </p>
          )}

          <div className="modal-footer" style={{ marginTop: '20px' }}>
            <button
              type="button"
              className="outline-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Saving to Supabase…</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>{isEdit ? 'Update Commodity' : 'Save Commodity'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
