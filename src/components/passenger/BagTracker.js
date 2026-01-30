import React from 'react';
import { getBagLocationDisplayName, formatDate } from '../../utils/helpers';
import { BAG_LOCATIONS } from '../../utils/constants';
import '../../styles/dashboard.css';

const BagTracker = ({ bags }) => {
  const getProgressPercentage = (location) => {
    const locations = [
      BAG_LOCATIONS.CHECK_IN,
      BAG_LOCATIONS.SECURITY,
      BAG_LOCATIONS.GATE,
      BAG_LOCATIONS.LOADED
    ];
    const index = locations.indexOf(location);
    return ((index + 1) / locations.length) * 100;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      {bags.map((bag) => (
        <div key={bag.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ margin: 0 }}>Bag ID: {bag.id}</h3>
            <span className={`status-badge status-${bag.location}`}>
              {getBagLocationDisplayName(bag.location)}
            </span>
          </div>

          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'var(--border)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div
                style={{
                  width: `${getProgressPercentage(bag.location)}%`,
                  height: '100%',
                  backgroundColor: bag.location === BAG_LOCATIONS.LOADED ? 'var(--success-color)' : 'var(--primary-color)',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              marginTop: 'var(--spacing-sm)',
              fontSize: 'var(--text-sm)'
            }}>
              <div className={bag.location === BAG_LOCATIONS.CHECK_IN || bag.location === BAG_LOCATIONS.SECURITY || bag.location === BAG_LOCATIONS.GATE || bag.location === BAG_LOCATIONS.LOADED ? 'text-primary' : 'text-muted'}>
                Check-In
              </div>
              <div className={bag.location === BAG_LOCATIONS.SECURITY || bag.location === BAG_LOCATIONS.GATE || bag.location === BAG_LOCATIONS.LOADED ? 'text-primary' : 'text-muted'}>
                Security
              </div>
              <div className={bag.location === BAG_LOCATIONS.GATE || bag.location === BAG_LOCATIONS.LOADED ? 'text-primary' : 'text-muted'}>
                Gate
              </div>
              <div className={bag.location === BAG_LOCATIONS.LOADED ? 'text-primary' : 'text-muted'}>
                Loaded
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Journey Timeline</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {bag.timeline.map((entry, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 'var(--spacing-sm)',
                    backgroundColor: 'var(--surface)',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: `3px solid var(--success-color)`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'var(--weight-semibold)' }}>
                        {getBagLocationDisplayName(entry.location)}
                      </div>
                      <div className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                        {formatDate(entry.timestamp)}
                      </div>
                    </div>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--success-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--weight-bold)'
                      }}
                    >
                      ✓
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BagTracker;
