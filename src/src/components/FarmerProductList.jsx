import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FarmerDashboard.css';
import { userApiService } from '../api/userApi';
import { toast } from 'react-toastify';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [imagesMap, setImagesMap] = useState({});
  const [mainImageMap, setMainImageMap] = useState({});
  const [zoomedImage, setZoomedImage] = useState(null);
  const navigate = useNavigate();

  // 🖼️ Handle image upload
  async function handleImageUpload(event, productId) {
    const files = Array.from(event.target.files);

    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });

    const base64Images = await Promise.all(files.map(toBase64));

    setImagesMap((prev) => ({
      ...prev,
      [productId]: [...(prev[productId] || []), ...base64Images],
    }));

    setMainImageMap((prev) => ({
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
      toast.error("You can upload a maximum of 5 images.");
      return;
    }

    userApiService.uploadImage(productId, images, (data, index) => {
      toast.success(`${index} image(s) uploaded successfully`);

      userApiService.updateProductImageStatus(productId, () => {
        setImagesMap((prev) => {
          const newMap = { ...prev };
          delete newMap[productId];
          return newMap;
        });

        setMainImageMap((prev) => {
          const newMap = { ...prev };
          delete newMap[productId];
          return newMap;
        });

        const session = JSON.parse(localStorage.getItem('session_data'));
        userApiService.getFarmerProducts(session?.id, setProducts);
      });
    });
  };

  const resetImages = (productId) => {
    setImagesMap((prev) => {
      const newMap = { ...prev };
      delete newMap[productId];
      return newMap;
    });

    setMainImageMap((prev) => {
      const newMap = { ...prev };
      delete newMap[productId];
      return newMap;
    });
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await userApiService.deleteProduct(productId);
      toast.success("Product deleted successfully");
      setProducts((prev) => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete product");
    }
  };

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('session_data'));
    const farmer_id = session?.id;

    if (!farmer_id) {
      alert('Unauthorized access. Please login.');
      navigate('/login');
      return;
    }

    userApiService.getFarmerProducts(farmer_id, setProducts);
  }, [navigate]);

  return (
    <div className="main-content">
      <header className="main-header">
        <h1>My Product Listings</h1>
        <div className="header-actions">
    <button
      onClick={() => navigate('/add-product')}
      className="btn-primary"
    >
      + Add Product
    </button>

    <button
      onClick={() => navigate(-1)}
      className="btn-secondary"
    >
      ← Back
    </button></div>
      </header>

      <section className="content-section">
        {products.length === 0 ? (
          <p className="empty-msg">No products available.</p>
        ) : (
          <div className="products-grid">
            {products.map((product) => {
              const uploadedImages = product.images || [];
              const newImages = imagesMap[product.id] || [];
              const mainImage = mainImageMap[product.id] || uploadedImages[0]?.image;

              return (
                <article key={product.id} className="product-card">
                  <div className="product-images">
                    <div className="image-upload-container">
                      {uploadedImages.length === 0 ? (
                        <label className="big-box">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, product.id)}
                            style={{ display: "none" }}
                          />
                          {mainImage ? (
                            <img
                              src={mainImage}
                              alt="Main"
                              className="main-image"
                              onClick={() => setZoomedImage(mainImage)}
                              style={{ cursor: 'zoom-in' }}
                            />
                          ) : (
                            <span className="plus">+</span>
                          )}
                        </label>
                      ) : (
                        <div className="main-image-wrapper">
                          <img
                            src={mainImage}
                            alt="Main"
                            className="main-image"
                            onClick={() => setZoomedImage(mainImage)}
                            style={{ cursor: 'zoom-in' }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="thumbnail-images">
                      {newImages.map((img, i) => (
                        <div
                          key={`new-${i}`}
                          className="small-images"
                          onClick={() => setMainImageMap(prev => ({
                            ...prev,
                            [product.id]: img,
                          }))}
                        >
                          <img
                            src={img}
                            alt={`thumb-new-${i}`}
                            onClick={() => setZoomedImage(img)}
                            style={{ cursor: 'zoom-in' }}
                          />
                        </div>
                      ))}

                      {uploadedImages.slice(0, 4).map((img, i) => (
                        <div
                          key={`uploaded-${i}`}
                          className="small-images"
                          onClick={() => setMainImageMap(prev => ({
                            ...prev,
                            [product.id]: img.image,
                          }))}
                        >
                          <img
                            src={img.image}
                            alt={`thumb-uploaded-${i}`}
                            onClick={() => setZoomedImage(img.image)}
                            style={{ cursor: 'zoom-in' }}
                          />
                        </div>
                      ))}
                    </div>

                    {newImages.length > 0 && (
                      <>
                        <button
                          className="btn btn-success"
                          onClick={() => uploadImages(product.id)}
                        >
                          Upload Images
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
                    <h3>{product.product_name}</h3>
                    <p><strong>Quantity:</strong> {product.product_Qty} {product.product_Unit}</p>
                    <p><strong>Price:</strong> ₹{product.product_Unitprice} per {product.product_Unit}</p>
                    <p><strong>Category:</strong> {product.product_Category}</p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className={`status-badge ${product.isAvailable ? "active" : "inactive"}`}>
                        {product.isAvailable ? "Active" : "Inactive"}
                      </span>
                    </p>
                  </div>

                  <div className="product-actions">
                    <button
                      className="btn-edit"
                      onClick={() => navigate(`/edit-product/${product.id}`)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(product.id)}
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

      {/* 🔍 Zoom Modal */}
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
