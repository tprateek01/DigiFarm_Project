import React, { useState, useEffect } from 'react';
import '../styles/index.css'; // Import the main CSS for sidebar styles

const Sidebar = ({ onFilterProducts }) => {
  const [openCategories, setOpenCategories] = useState({});

  const handleToggle = (category) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  useEffect(() => {
    // This effect ensures the max-height transition works correctly
    // by re-calculating scrollHeight if content changes or on initial render.
    // For simplicity, we're relying on CSS transition and state.
  }, [openCategories]);

  return (
    <div className="sidebar">
      <h2>Category</h2>
      <ul className="category-list">
        <li className="category-item">
          <span className="toggle" onClick={() => handleToggle('Grains')}>Grains</span>
          <ul className="subcategory-list" style={{ maxHeight: openCategories['Grains'] ? '200px' : '0px' }}>
            <li data-product="Wheat" onClick={() => onFilterProducts('Wheat')}>Wheat</li>
            <li data-product="Rice" onClick={() => onFilterProducts('Rice')}>Rice</li>
            <li data-product="Maize" onClick={() => onFilterProducts('Maize')}>Maize</li>
          </ul>
        </li>
        <li className="category-item">
          <span className="toggle" onClick={() => handleToggle('Fruits')}>Fruits</span>
          <ul className="subcategory-list" style={{ maxHeight: openCategories['Fruits'] ? '200px' : '0px' }}>
            <li data-product="Apple" onClick={() => onFilterProducts('Apple')}>Apple</li>
            <li data-product="Mango" onClick={() => onFilterProducts('Mango')}>Mango</li>
            <li data-product="Banana" onClick={() => onFilterProducts('Banana')}>Banana</li>
          </ul>
        </li>
        <li className="category-item">
          <span className="toggle" onClick={() => handleToggle('Vegetables')}>Vegetables</span>
          <ul className="subcategory-list" style={{ maxHeight: openCategories['Vegetables'] ? '200px' : '0px' }}>
            <li data-product="Tomato" onClick={() => onFilterProducts('Tomato')}>Tomato</li>
            <li data-product="Potato" onClick={() => onFilterProducts('Potato')}>Potato</li>
            <li data-product="Carrot" onClick={() => onFilterProducts('Carrot')}>Carrot</li>
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
