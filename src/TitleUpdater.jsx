import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const { pathname } = location;

    // 1. Default fallback values
    let currentTitle = 'DigiFarm';
    let currentImg = 'landing.jpg';

    // 2. Logic to detect module based on URL segments
    // This ensures sub-pages like /admin/dashboard or /farmer/settings work
    if (pathname.includes('/admin')) {
      currentTitle = 'Admin Portal';
      currentImg = 'admin.jpg';
    } else if (pathname.includes('/farmer')) {
      currentTitle = 'Farmer Portal';
      currentImg = 'farmer.jpg';
    } else if (pathname.includes('/merchant')) {
      currentTitle = 'Merchant Portal';
      currentImg = 'merchant.jpg';
    } else if (pathname.includes('product') || pathname.includes('cart')) {
      currentTitle = 'Marketplace';
      currentImg = 'inventory.jpg';
    } else if (pathname.includes('chat')) {
      currentTitle = 'Messages';
      currentImg = 'chat.jpg';
    }

    // 3. Update Browser Tab Text
    document.title = `${currentTitle} | DigiFarm`;

    // 4. Circular Favicon Logic
    const updateCircularFavicon = (imagePath) => {
      const img = new Image();
      img.src = imagePath;
      img.crossOrigin = "Anonymous";
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const size = 64; 
        canvas.width = size;
        canvas.height = size;

        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(img, 0, 0, size, size);

        const favicon = document.getElementById('dynamic-favicon');
        if (favicon) {
          favicon.href = canvas.toDataURL('image/png');
        }
      };
    };

    updateCircularFavicon(`/images/${currentImg}`);

    // 5. Update CSS variable for UI backgrounds
    document.documentElement.style.setProperty('--page-hero-image', `url(/images/${currentImg})`);

  }, [location]);

  return null;
};

export default TitleUpdater;