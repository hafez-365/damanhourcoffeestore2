
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Products from '@/components/Products';
import About from '@/components/About';
import Contact from '@/components/Contact';
import WhatsAppButton from '@/components/WhatsAppButton';

const Index = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      <Hero />
      <Products />
      <About />
      <Contact />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
