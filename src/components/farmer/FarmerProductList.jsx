import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/farmer/FarmerDashboard.css';
import { userApiService } from '../../api/userApi';
import { toast } from 'react-toastify';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [imagesMap, setImagesMap] = useState({});
  const [mainImageMap, setMainImageMap] = useState({});
  const [zoomedImage, setZoomedImage] = useState(null);
  const navigate = useNavigate();

  // ✅ normalize boolean availability
  const normalizeProducts = (data) => {
    return data.map(p => ({
      ...p,
      isAvailable: p.isAvailable === true || p.isAvailable === "true"
    }));
  };

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('session_data'));
    const farmer_id = session?.id;
    
    console.log('FarmerProductList - Session:', session);
    console.log('FarmerProductList - Farmer ID:', farmer_id);

    if (!farmer_id) {
      alert('Unauthorized access. Please login.');
      navigate('/login');
      return;
    }

    userApiService.getFarmerProducts(farmer_id, (data) => {
      console.log('FarmerProductList - Products data:', data);
      setProducts(normalizeProducts(data || []));
    });

  }, [navigate]);

  async function handleImageUpload(event, productId) {
    const files = Array.from(event.target.files);

    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });

    const base64Images = await Promise.all(files.map(toBase64));

    setImagesMap(prev => ({
      ...prev,
      [productId]: [...(prev[productId] || []), ...base64Images],
    }));

    setMainImageMap(prev => ({
      ...prev,
      [productId]: prev[productId] || base64Images[0],
    }));
  }

  const uploadImages = (productId) => {
    const images = imagesMap[productId] || [];

    if (images.length === 0) {
      toast.error("Please select images to upload.");
      return;
    }

    if (images.length > 5) {
      toast.error("Max 5 images allowed.");
      return;
    }

    userApiService.uploadImage(productId, images, () => {
      toast.success("Images uploaded successfully");

      userApiService.updateProductImageStatus(productId, () => {
        setImagesMap(prev => {
          const copy = { ...prev };
          delete copy[productId];
          return copy;
        });

        setMainImageMap(prev => {
          const copy = { ...prev };
          delete copy[productId];
          return copy;
        });

        const session = JSON.parse(localStorage.getItem("session_data"));
        userApiService.getFarmerProducts(session?.id, (data) => {
          setProducts(normalizeProducts(data || []));
        });
      });
    });
  };

  const resetImages = (productId) => {
    setImagesMap(prev => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });

    setMainImageMap(prev => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await userApiService.deleteProduct(productId);
      toast.success("Deleted successfully");
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="main-content">
      <header className="main-header">
        <h1>My Product Listings</h1>

        <div className="header-actions">
          <button onClick={() => navigate('/add-product')} className="btn-primary">
            + Add Product
          </button>

          <button onClick={() => navigate(-1)} className="btn-secondary">
            ← Back
          </button>
        </div>
      </header>

      <section className="content-section">
        {products.length === 0 ? (
          <p className="empty-msg">No products available.</p>
        ) : (
          <div className="products-grid">
            {products.map(product => {
              const uploadedImages = product.images || [];
              const newImages = imagesMap[product.id] || [];
              const mainImage =
                mainImageMap[product.id] || uploadedImages[0]?.image || product.image;

              const isApproved = String(product.status).toLowerCase() === 'approved';

              return (
                <article key={product.id} className="product-card" style={{ opacity: isApproved ? 1 : 0.8 }}>

                  <div className="product-images">

                    <label className={`big-box ${!isApproved ? 'disabled-label' : ''}`} style={{ cursor: isApproved ? 'pointer' : 'not-allowed' }}>
                      {isApproved && (
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, product.id)}
                          hidden
                        />
                      )}

                      {mainImage ? (
                        <img
                          src={mainImage}
                          alt="Main"
                          className="main-image"
                          onClick={() => setZoomedImage(mainImage)}
                        />
                      ) : (
                        <span className="plus">+</span>
                      )}
                    </label>

                    {(newImages.length + uploadedImages.length > 1) && (
                      <div className="thumbnail-images">
                        {newImages.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt=""
                            onClick={() => setMainImageMap(prev => ({
                              ...prev,
                              [product.id]: img,
                            }))}
                          />
                        ))}

                        {uploadedImages.map((img, i) => (
                          <img
                            key={`up_${i}`}
                            src={img.image}
                            alt=""
                            onClick={() => setMainImageMap(prev => ({
                              ...prev,
                              [product.id]: img.image,
                            }))}
                          />
                        ))}
                      </div>
                    )}

                    {isApproved && newImages.length > 0 && (
                      <>
                        <button
                          className="btn btn-success"
                          onClick={() => uploadImages(product.id)}
                        >
                          Upload
                        </button>

                        <button
                          className="btn btn-danger"
                          onClick={() => resetImages(product.id)}
                        >
                          Reset
                        </button>
                      </>
                    )}
                  </div>

                  <div className="product-details">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3>{product.product_name}</h3>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        backgroundColor: String(product.status || "").toLowerCase() === 'approved' ? '#e8f5e9' : String(product.status || "").toLowerCase() === 'rejected' ? '#ffebee' : '#fff3e0',
                        color: String(product.status || "").toLowerCase() === 'approved' ? '#2e7d32' : String(product.status || "").toLowerCase() === 'rejected' ? '#c62828' : '#ef6c00',
                        fontWeight: 'bold',
                        border: `1px solid ${String(product.status || "").toLowerCase() === 'approved' ? '#2e7d32' : String(product.status || "").toLowerCase() === 'rejected' ? '#c62828' : '#ef6c00'}`
                      }}>
                        {product.status || 'Pending'}
                      </span>
                    </div>

                    <p>
                      <strong>Quantity:</strong>{" "}
                      {product.product_Qty} {product.product_Unit}
                    </p>

                    <p>
                      <strong>Price:</strong> ₹
                      {product.product_Unitprice} / {product.product_Unit}
                    </p>

                    <p>
                      <strong>Category:</strong> {product.product_Category || product.productCategory || product.category || "N/A"}
                    </p>

                    <p>
                      <strong>Status:</strong>{" "}
                      <span className={`status-badge ${product.isAvailable === true ? "active" : "inactive"}`}>
                        {product.isAvailable === true ? "Active" : "Inactive"}
                      </span>
                    </p>
                  </div>

                  <div className="product-actions">
                    <button
                      className="btn-edit"
                      onClick={() => isApproved ? navigate(`/edit-product/${product.id}`) : toast.info("Product pending admin approval")}
                      style={{ 
                        opacity: isApproved ? 1 : 0.5, 
                        cursor: isApproved ? 'pointer' : 'not-allowed',
                        filter: isApproved ? 'none' : 'grayscale(1)'
                      }}
                      disabled={!isApproved}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() => isApproved ? handleDelete(product.id) : toast.info("Product pending admin approval")}
                      style={{ 
                        opacity: isApproved ? 1 : 0.5, 
                        cursor: isApproved ? 'pointer' : 'not-allowed',
                        filter: isApproved ? 'none' : 'grayscale(1)'
                      }}
                      disabled={!isApproved}
                    >
                      🗑️ Delete
                    </button>
                  </div>

                </article>
              );
            })}
          </div>
        )}
      </section>

      {zoomedImage && (
        <div className="zoom-modal" onClick={() => setZoomedImage(null)}>
          <div className="zoom-modal-content" onClick={e => e.stopPropagation()}>
            <img src={zoomedImage} alt="Zoomed" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
