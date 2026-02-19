import React, { useState, useEffect } from 'react';
import AutoScalableText from './components/AutoScalableText';
import ScrollingList from './components/ScrollingList';
import ImageCarousel from './components/ImageCarousel';
import Logo from './components/Logo';

// Product Images (Editorial/Promotional)
import img1 from './assets/promo_oil_wide.png';
import img2 from './assets/promo_honey_wide.png';
import { themes, defaultTheme } from './themes';

import PairingScreen from './components/PairingScreen';

function SignagePlayer() {
  const [needsPairing, setNeedsPairing] = useState(false);

  // Configurable State
  const [number, setNumber] = useState('12');
  const [title, setTitle] = useState('PANTRY');
  const [subtitle, setSubtitle] = useState('OUR SELECTS');
  const [items, setItems] = useState('BROTHS\nGRAINS\nRICE\nSPECIALTY OILS\nVINEGARS\nCONDIMENTS\nSPICES\nSAUCES\nPRESERVES');

  // Theme State
  const [themeName, setThemeName] = useState(defaultTheme);
  const theme = themes[themeName] || themes[defaultTheme];

  const [promos, setPromos] = useState([]);

  // Load configuration from config.json (Runtime Config)
  useEffect(() => {
    // Get Project ID from URL, default to 'nutrition-nest' for static hosting
    const params = new URLSearchParams(window.location.search);
    const projectIdParam = params.get('project') || 'nutrition-nest';

    const projectId = projectIdParam;
    const basePath = import.meta.env.BASE_URL || '/';

    // Load Text Config & Theme
    fetch(`${basePath}projects/${projectId}/config.json`)
      .then(res => res.json())
      .then(data => {
        if (data.number) setNumber(data.number);
        if (data.title) setTitle(data.title);
        if (data.subtitle) setSubtitle(data.subtitle);
        if (data.items) setItems(data.items);
        if (data.theme && themes[data.theme]) setThemeName(data.theme);
      })
      .catch(err => console.error("Failed to load config.json:", err));

    // Load Promotions Data
    fetch(`${basePath}projects/${projectId}/promotions.json`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          console.log("Loaded promotions:", data);
          setPromos(data);
        }
      })
      .catch(err => console.error("Failed to load promotions.json:", err));

    // Load Schedule
    fetch(`${basePath}projects/${projectId}/schedule.json`)
      .then(res => res.json())
      .then(schedules => {
        if (Array.isArray(schedules) && schedules.length > 0) {
          console.log("Loaded schedules:", schedules);
          checkSchedule(schedules);
          // Check every minute
          const interval = setInterval(() => checkSchedule(schedules), 60000);
          return () => clearInterval(interval);
        }
      })
      .catch(err => console.error("Failed to load schedule:", err));



    // Listen for Preview Updates (from Admin)
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'PREVIEW_UPDATE' && event.data.config) {
        const cfg = event.data.config;
        console.log("Received Preview Update:", cfg);
        if (cfg.number) setNumber(cfg.number);
        if (cfg.title) setTitle(cfg.title);
        if (cfg.subtitle) setSubtitle(cfg.subtitle);
        if (cfg.items) setItems(cfg.items);
        if (cfg.theme && themes[cfg.theme]) setThemeName(cfg.theme);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);

  }, []);

  const checkSchedule = (schedules) => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const activeSchedule = schedules.find(s =>
      s.active && currentTime >= s.startTime && currentTime < s.endTime
    );

    if (activeSchedule && activeSchedule.configOverrides) {
      console.log("Applying Schedule Override:", activeSchedule.name);
      const overrides = activeSchedule.configOverrides;
      if (overrides.title) setTitle(overrides.title);
      if (overrides.subtitle) setSubtitle(overrides.subtitle);
      if (overrides.theme && themes[overrides.theme]) setThemeName(overrides.theme);
    }
  };

  if (needsPairing) {
    return <PairingScreen />;
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: theme.background,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        color: theme.textPrimary
      }}
    >
      {/* Top Bar (Matches Background) */}
      <div style={{ height: '40px', backgroundColor: theme.background, width: '100%', flexShrink: 0 }}></div>

      <div style={{ padding: '3vh 4vw 0 4vw', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Number 12 */}
        <div style={{ height: '12vh', marginBottom: '1.5vh', flexShrink: 0 }}>
          <AutoScalableText
            value={number}
            onChange={setNumber}
            minFontSize={24}
            maxFontSize={250}
            className="text-brown-gold animate-gold-shimmer"
            style={{
              background: theme.headerGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: 'Tenor Sans',
              textAlign: 'left'
            }}
          />
        </div>

        {/* PANTRY */}
        <div style={{ height: '6vh', marginBottom: '0.5vh', flexShrink: 0 }}>
          <AutoScalableText
            value={title}
            onChange={setTitle}
            minFontSize={14}
            maxFontSize={100}
            style={{
              background: theme.headerGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: 'Josefin Sans',
              fontWeight: 600,
              textAlign: 'left',
              textTransform: 'uppercase'
            }}
          />
        </div>

        {/* OUR SELECTS */}
        <div style={{ height: '5vh', marginBottom: '2vh', flexShrink: 0 }}>
          <AutoScalableText
            value={subtitle}
            onChange={setSubtitle}
            minFontSize={12}
            maxFontSize={80}
            style={{
              color: theme.textSecondary,
              fontFamily: 'Josefin Sans',
              fontWeight: 300,
              textAlign: 'left',
              textTransform: 'uppercase'
            }}
          />
        </div>

        {/* Scrolling Items List */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          marginBottom: '1vh',
          maskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)'
        }}>
          <ScrollingList
            items={items}
            onChange={setItems}
            borderColor={theme.listDivider}
            itemStyle={{
              color: theme.textPrimary,
              fontFamily: 'Josefin Sans',
              fontWeight: 300,
              textAlign: 'left',
              fontSize: 'clamp(16px, 2.5vw, 36px)',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}
          />
        </div>
      </div>

      {/* Bottom Section (Dots Pattern + Carousel) */}
      <div style={{
        height: '40%',
        position: 'relative',
        width: '100%',
        marginTop: 'auto',
        flexShrink: 0
      }}>
        {/* Carousel Background with Organic Shape */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          borderBottomRightRadius: '50vw',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }}>
          <ImageCarousel
            promos={promos.length > 0 ? promos : [
              { image: '/products/oil.png', title: "Heritage Olive Oil", offer: "New Harvest" },
              { image: '/products/honey.png', title: "Raw Manuka Honey", offer: "Limited Batch" },
              { image: '/products/tomato.png', title: "Heirloom Tomato", offer: "Farm Direct" }
            ]}
            badgeTextColor={theme.promoBadgeText}
            badgeBorderColor={theme.promoBadgeBorder}
            badgeBgColor={theme.promoBadgeBg}
            titleColor={theme.promoTitle}
            gradientOverlay={theme.promoGradient}
          />

          {/* Dots Overlay */}
          <div
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              opacity: 0.3,
              maskImage: 'linear-gradient(to bottom, black 0%, transparent 80%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 80%)'
            }}
          />
        </div>

        {/* 
            Dedicated Logo Pedestal 
            Position: Bottom Right, revealed by the organic curve of the image container above.
        */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          right: '30px',
          zIndex: 10,
          width: '120px',
          height: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Logo
            width="100%"
            height="100%"
            gradientStart={theme.logoGradientStart}
            gradientEnd={theme.logoGradientEnd}
            dropShadow={theme.logoShadow}
          />
        </div>
      </div>
    </div >
  );
}

export default SignagePlayer;
