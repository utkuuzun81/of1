import React from 'react';
import { Box } from '@mui/material';
import KeypadHero from './Home/KeypadHero.jsx';
import LogosMarquee from './Home/LogosMarquee.jsx';
import Stats from './Home/Stats.jsx';
import HowItWorks from './Home/HowItWorks.jsx';
import Advantages from './Home/Advantages.jsx';
import LoyaltyTeaser from './Home/LoyaltyTeaser.jsx';
import Security from './Home/Security.jsx';
import Integrations from './Home/Integrations.jsx';
import LockedShowcase from './Home/LockedShowcase.jsx';
import FinalCTA from './Home/FinalCTA.jsx';
import SEOJsonLd from './Home/SEOJsonLd.jsx';
import AnnouncementBar from './Home/AnnouncementBar.jsx';
import FAQ from './Home/FAQ.jsx';

export default function Home(){
  return (
    <Box>
  <AnnouncementBar />
  <SEOJsonLd />
      <KeypadHero />
  <LogosMarquee />
  <Stats />
  <HowItWorks />
      <Advantages />
  <LoyaltyTeaser />
  <Security />
  <Integrations />
  <LockedShowcase />
  <FinalCTA />
      <FAQ />
  <Box sx={{ py:4, textAlign:'center', color:'#94a3b8' }}>© {new Date().getFullYear()} Odyostore</Box>
    </Box>
  );
}
