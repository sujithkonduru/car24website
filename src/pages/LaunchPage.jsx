import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { 
  Car, 
  MapPin, 
  PhoneCall,
  Building2,
  Mail
} from 'lucide-react';
import './LaunchPage.css';

const LaunchPage = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Countdown timer for launch
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Set launch date (30 days from now)
  const launchDate = new Date();
  launchDate.setDate(launchDate.getDate() + 30);
  launchDate.setHours(0, 0, 0, 0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Branch data
  const branches = [
    {
      id: "nellore",
      name: "Nellore",
      address: "Manumasiddi nagar , Mp Nagar 1st Steeet, - 524003",
      phone: "+91 9100633677",
      email: "nellore@car24.com"
    },
    {
      id: "guntur",
      name: "Guntur",
      address: "innerring road,narshimha nagar 6th line,near ushodya store,Guntur - 522034",
      phone: "+91 9666442449",
      email: "guntur@car24.com"
    }
  ];

  return (
    <div className="launch-page">
      {/* Hero Section */}
      <motion.section 
        className="hero-section"
        style={{ y: heroY, opacity: heroOpacity }}
        ref={sectionRef}
      >
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-particles"></div>
        </div>
        
        <div className="container">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="launch-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <Car size={16} />
              <span>Car24</span>
            </motion.div>

            <motion.h1 
              className="hero-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <span className="gradient-text">Car24</span> is Almost Here
            </motion.h1>

            <motion.p 
              className="hero-subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              India's most trusted car rental marketplace is launching soon.
              Get ready to experience hassle-free car rentals.
            </motion.p>

            {/* Countdown Timer */}
            {/* <motion.div 
              className="countdown-section"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="countdown-timer">
                <div className="countdown-item">
                  <span className="countdown-value">{String(timeLeft.days).padStart(2, '0')}</span>
                  <span className="countdown-label">Days</span>
                </div>
                <div className="countdown-separator">:</div>
                <div className="countdown-item">
                  <span className="countdown-value">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="countdown-label">Hours</span>
                </div>
                <div className="countdown-separator">:</div>
                <div className="countdown-item">
                  <span className="countdown-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="countdown-label">Minutes</span>
                </div>
                <div className="countdown-separator">:</div>
                <div className="countdown-item">
                  <span className="countdown-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="countdown-label">Seconds</span>
                </div>
              </div>
            </motion.div> */}
          </motion.div>
        </div>
      </motion.section>

      {/* Branch Section */}
      <section className="branch-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Our <span className="gradient-text">Branches</span></h2>
            <p className="section-subtitle">Contact our branches for bookings and inquiries</p>
          </motion.div>

          <div className="branches-grid">
            {branches.map((branch, index) => (
              <motion.div
                key={branch.id}
                className="branch-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="branch-icon">
                  <Building2 size={32} />
                </div>
                <h3 className="branch-name">{branch.name} Branch</h3>
                <div className="branch-detail">
                  <MapPin size={16} />
                  <span>{branch.address}</span>
                </div>
                <div className="branch-detail">
                  <PhoneCall size={16} />
                  <a href={`tel:${branch.phone}`}>{branch.phone}</a>
                </div>
                <div className="branch-detail">
                  <Mail size={16} />
                  <a href={`mailto:${branch.email}`}>{branch.email}</a>
                </div>
                <button 
                  className="branch-contact-btn"
                  onClick={() => window.location.href = `tel:${branch.phone}`}
                >
                  <PhoneCall size={16} />
                  Call Now
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 Car24travels. All rights reserved.</p>
          <p className="footer-note">Launching soon across India</p>
        </div>
      </footer>
    </div>
  );
};

export default LaunchPage;