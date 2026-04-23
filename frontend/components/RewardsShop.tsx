// daniel q. added 4/22/26
import React, { useState, useEffect } from 'react';

interface ShopItem {
  id: string;
  name: string;
  category: string;
  cost: number;
  description: string;
  icon: string;
}

interface PurchasedItem {
  itemId: string;
  name: string;
  category: string;
  cost: number;
  purchasedAt: string;
}

interface ActiveCustomizations {
  avatarFrame: { itemId: string; name: string; equippedAt: string } | null;
  profileTheme: string | { itemId: string; name: string; equippedAt: string };
  badge: { itemId: string; name: string; equippedAt: string } | null;
}

interface UserRewards {
  points: number;
  totalPointsEarned: number;
  purchasedItems: PurchasedItem[];
  activeCustomizations: ActiveCustomizations;
}

interface ShopResponse {
  frames: ShopItem[];
  themes: ShopItem[];
  badges: ShopItem[];
}

const RewardsShop: React.FC<{ userEmail: string }> = ({ userEmail }) => {
  const [userRewards, setUserRewards] = useState<UserRewards | null>(null);
  const [shopItems, setShopItems] = useState<ShopResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

  useEffect(() => {
    if (userEmail) {
      fetchUserPoints();
      fetchShopItems();
    }
  }, [userEmail]);

  const fetchUserPoints = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/rewards/points/${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.success) {
        setUserRewards({
          points: data.points || 0,
          totalPointsEarned: data.totalPointsEarned || 0,
          purchasedItems: data.purchasedItems || [],
          activeCustomizations: data.activeCustomizations || {
            avatarFrame: null,
            profileTheme: 'default',
            badge: null
          }
        });
      }
    } catch (error) {
      console.error('Error fetching points:', error);
      showMessage('Error loading points', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchShopItems = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/rewards/shop`);
      const data = await res.json();
      if (data.success) {
        setShopItems(data.shop);
      }
    } catch (error) {
      console.error('Error fetching shop:', error);
      showMessage('Error loading shop items', 'error');
    }
  };

  const purchaseItem = async (item: ShopItem) => {
    // Check if userRewards exists and has enough points
    if (!userRewards) {
      showMessage('Please wait, loading user data...', 'error');
      return;
    }
    
    if (userRewards.points < item.cost) {
      showMessage(`Not enough points! Need ${item.cost} points. You have ${userRewards.points}.`, 'error');
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/rewards/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, itemId: item.id })
      });
      const data = await res.json();
      
      if (data.success) {
        showMessage(`Successfully purchased ${item.name}!`, 'success');
        fetchUserPoints(); // Refresh points
      } else {
        showMessage(data.message, 'error');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      showMessage('Error purchasing item', 'error');
    }
  };

  const equipItem = async (category: string, itemId: string, itemName: string) => {
    if (!userRewards) {
      showMessage('Please wait, loading user data...', 'error');
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/rewards/equip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userEmail, 
          category, 
          itemId, 
          itemName 
        })
      });
      const data = await res.json();
      
      if (data.success) {
        showMessage(`Equipped ${itemName}!`, 'success');
        fetchUserPoints(); // Refresh to get updated active customizations
      } else {
        showMessage(data.message, 'error');
      }
    } catch (error) {
      console.error('Equip error:', error);
      showMessage('Error equipping item', 'error');
    }
  };

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const isItemPurchased = (itemId: string): boolean => {
    return userRewards?.purchasedItems?.some(item => item.itemId === itemId) || false;
  };

  const isItemEquipped = (category: string, itemId: string): boolean => {
    const active = userRewards?.activeCustomizations;
    if (!active) return false;
    
    switch(category) {
      case 'avatarFrame':
        return active.avatarFrame?.itemId === itemId;
      case 'profileTheme':
        // Handle both string and object cases
        if (typeof active.profileTheme === 'string') {
          return active.profileTheme === itemId;
        }
        return active.profileTheme?.itemId === itemId;
      case 'badge':
        return active.badge?.itemId === itemId;
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="rewards-shop-loading">
        <div className="spinner"></div>
        <p>Loading rewards shop...</p>
      </div>
    );
  }

  return (
    <div className="rewards-shop">
      <div className="points-display">
        <h3>Your Points: 🪙 {userRewards?.points ?? 0}</h3>
        <p>Total earned: {userRewards?.totalPointsEarned ?? 0} points</p>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      {!userRewards && (
        <div className="error-message">
          Unable to load user rewards data. Please try again later.
        </div>
      )}

      <div className="shop-categories">
        {/* Avatar Frames Section */}
        <section className="shop-section">
          <h2>Avatar Frames</h2>
          <div className="items-grid">
            {shopItems?.frames?.map((item: ShopItem) => (
              <div key={item.id} className="shop-item">
                <div className="item-icon">{item.icon}</div>
                <h4>{item.name}</h4>
                <p>{item.description}</p>
                <p className="item-cost">Cost: 🪙 {item.cost}</p>
                {isItemPurchased(item.id) ? (
                  <div className="purchased-actions">
                    <span className="purchased-badge">✓ Purchased</span>
                    {!isItemEquipped('avatarFrame', item.id) && (
                      <button 
                        className="equip-btn"
                        onClick={() => equipItem('avatarFrame', item.id, item.name)}
                      >
                        Equip
                      </button>
                    )}
                    {isItemEquipped('avatarFrame', item.id) && (
                      <span className="equipped-badge">Currently Equipped</span>
                    )}
                  </div>
                ) : (
                  <button 
                    className="purchase-btn"
                    onClick={() => purchaseItem(item)}
                    disabled={!userRewards || userRewards.points < item.cost}
                  >
                    Purchase
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Profile Themes Section */}
        <section className="shop-section">
          <h2>Profile Themes</h2>
          <div className="items-grid">
            {shopItems?.themes?.map((item: ShopItem) => (
              <div key={item.id} className="shop-item">
                <div className="item-icon">{item.icon}</div>
                <h4>{item.name}</h4>
                <p>{item.description}</p>
                <p className="item-cost">Cost: 🪙 {item.cost}</p>
                {isItemPurchased(item.id) ? (
                  <div className="purchased-actions">
                    <span className="purchased-badge">✓ Purchased</span>
                    {!isItemEquipped('profileTheme', item.id) && (
                      <button 
                        className="equip-btn"
                        onClick={() => equipItem('profileTheme', item.id, item.name)}
                      >
                        Apply Theme
                      </button>
                    )}
                    {isItemEquipped('profileTheme', item.id) && (
                      <span className="equipped-badge">Currently Active</span>
                    )}
                  </div>
                ) : (
                  <button 
                    className="purchase-btn"
                    onClick={() => purchaseItem(item)}
                    disabled={!userRewards || userRewards.points < item.cost}
                  >
                    Purchase
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Badges Section */}
        <section className="shop-section">
          <h2>Badges</h2>
          <div className="items-grid">
            {shopItems?.badges?.map((item: ShopItem) => (
              <div key={item.id} className="shop-item">
                <div className="item-icon">{item.icon}</div>
                <h4>{item.name}</h4>
                <p>{item.description}</p>
                <p className="item-cost">Cost: 🪙 {item.cost}</p>
                {isItemPurchased(item.id) ? (
                  <div className="purchased-actions">
                    <span className="purchased-badge">✓ Purchased</span>
                    {!isItemEquipped('badge', item.id) && (
                      <button 
                        className="equip-btn"
                        onClick={() => equipItem('badge', item.id, item.name)}
                      >
                        Display Badge
                      </button>
                    )}
                    {isItemEquipped('badge', item.id) && (
                      <span className="equipped-badge">Currently Displayed</span>
                    )}
                  </div>
                ) : (
                  <button 
                    className="purchase-btn"
                    onClick={() => purchaseItem(item)}
                    disabled={!userRewards || userRewards.points < item.cost}
                  >
                    Purchase
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <style jsx>{`
        .rewards-shop {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }

        .points-display {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
          text-align: center;
        }

        .points-display h3 {
          margin: 0 0 10px 0;
          font-size: 24px;
        }

        .points-display p {
          margin: 0;
          opacity: 0.9;
        }

        .message {
          padding: 10px 20px;
          border-radius: 5px;
          margin-bottom: 20px;
          text-align: center;
          animation: slideDown 0.3s ease-out;
        }

        .message.success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message.error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
          text-align: center;
          border: 1px solid #f5c6cb;
        }

        .shop-section {
          margin-bottom: 40px;
        }

        .shop-section h2 {
          color: #797979;
          border-bottom: 2px solid #667eea;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }

        .items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }

        .shop-item {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          padding: 20px;
          text-align: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .shop-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }

        .item-icon {
          font-size: 48px;
          margin-bottom: 10px;
        }

        .shop-item h4 {
          margin: 10px 0;
          color: #333;
        }

        .shop-item p {
          color: #666;
          font-size: 14px;
          margin: 10px 0;
        }

        .item-cost {
          font-weight: bold;
          color: #764ba2;
          font-size: 18px;
        }

        .purchase-btn, .equip-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 10px;
          transition: opacity 0.2s;
        }

        .purchase-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .purchase-btn:hover:not(:disabled), .equip-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .purchased-badge {
          display: inline-block;
          background-color: #28a745;
          color: white;
          padding: 5px 10px;
          border-radius: 5px;
          font-size: 12px;
          margin-right: 10px;
        }

        .equipped-badge {
          display: inline-block;
          background-color: #17a2b8;
          color: white;
          padding: 5px 10px;
          border-radius: 5px;
          font-size: 12px;
        }

        .purchased-actions {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
          flex-wrap: wrap;
        }

        .rewards-shop-loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .rewards-shop {
            padding: 10px;
          }
          
          .items-grid {
            grid-template-columns: 1fr;
          }
          
          .shop-item {
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default RewardsShop;