import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import AboutSection from '../components/AboutSection'
import WhyChooseUs from '../components/WhyChooseUs'
import Tips from '../components/Tips'
import Started from '../components/Started'
import Footer from '../components/Footer'

const LandingPage = () => {
  return (
    <div>
        <Navbar />
        <Hero />
        <AboutSection />
        <WhyChooseUs />
        <Tips />
        <Started />
        <Footer />
    </div>
  )
}

export default LandingPage

