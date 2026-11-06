'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { settingsService } from '../services/settings.service';
import { Skeleton, SectionHeaderSkeleton } from './ui/Skeleton';

export function SpotlightSection() {
  const [spotlights, setSpotlights] = useState([]);
  const [config, setConfig] = useState({
    enabled: true,
    title: 'Curated Spotlights',
    kicker: 'Seasonal highlights',
    subtitle: 'Handpicked deals verified for top value and quality score.',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    settingsService
      .getSettings()
      .then((res) => {
        if (isMounted) {
          if (res?.data?.spotlightConfig) {
            setConfig((prev) => ({ ...prev, ...res.data.spotlightConfig }));
          }
          if (res?.data?.spotlights && Array.isArray(res.data.spotlights)) {
            setSpotlights(res.data.spotlights);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load spotlights:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (config.enabled === false) {
    return null;
  }

  if (loading) {
    return (
      <section className="spotlight-section">
        <div className="container">
          <SectionHeaderSkeleton />
          <div className="spotlight-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="spotlight-card" style={{ padding: '24px', background: '#f8fafc' }}>
                <Skeleton width="70px" height="16px" />
                <Skeleton width="180px" height="24px" style={{ margin: '12px 0 6px' }} />
                <Skeleton width="120px" height="16px" />
                <Skeleton width="100%" height="14px" style={{ margin: '8px 0 16px' }} />
                <Skeleton height="120px" borderRadius="12px" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!spotlights || spotlights.length === 0) {
    return null;
  }

  const itemsToRender = spotlights;

  return (
    <section className="spotlight-section" id="curated-spotlights">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="section-kicker">
              <Sparkles size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              {config.kicker || 'Seasonal highlights'}
            </span>
            <h2>{config.title || 'Curated Spotlights'}</h2>
          </div>
          <small className="section-note">
            {config.subtitle || 'Handpicked deals verified for top value and quality score.'}
          </small>
        </div>

        <div className="spotlight-grid">
          {itemsToRender.map((item, idx) => {
            const themeClass =
              item.themeColor ||
              (idx % 4 === 0
                ? 'coral'
                : idx % 4 === 1
                ? 'lavender-card'
                : idx % 4 === 2
                ? 'mint-card'
                : 'peach-card');

            const itemImage = item.imageUrl || item.image;
            const itemLink = item.linkUrl || item.link || '/products';

            return (
              <article key={item.id || item._id || idx} className={`spotlight-card ${themeClass}`}>
                <div className="spotlight-content">
                  <span className="spotlight-badge">{item.badge || item.tag || 'HOT DEAL'}</span>
                  <h3>{item.title}</h3>
                  {item.discountText && <p className="spotlight-discount">{item.discountText}</p>}
                  {item.description && <small className="spotlight-desc">{item.description}</small>}
                  <Link href={itemLink} className="spotlight-link">
                    {item.ctaText || item.linkText || 'Explore'} <ArrowRight size={13} />
                  </Link>
                </div>

                {itemImage && (
                  <div className="spotlight-img-wrap">
                    <img
                      src={itemImage}
                      alt={item.title}
                      loading="lazy"
                    />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
