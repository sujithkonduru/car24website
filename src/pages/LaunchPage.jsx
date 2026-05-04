import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { 
  Car, 
  Clock, 
  Shield, 
  MapPin, 
  Smartphone, 
  ChevronRight, 
  Star, 
  Users, 
  Calendar,
  Fuel,
  Key,
  Headphones,
  Gift,
  Rocket,
  CheckCircle,
  ArrowRight,
  Play,
  X
} from 'lucide-react';
import './LaunchPage.css';

const LaunchPage = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
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

  // Set launch date (example: 30 days from now)
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

  const features = [
    {
      icon: Car,
      title: "Wide Range of Cars",
      description: "Choose from economy to luxury cars from trusted owners across India"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer support for all your travel needs"
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "All vehicles are verified and insured for your safety"
    },
    {
      icon: MapPin,
      title: "Pan India Presence",
      description: "Available in 100+ cities with pickup & drop facilities"
    },
    {
      icon: Smartphone,
      title: "Easy Booking",
      description: "Book your car in minutes with our user-friendly app"
    },
    {
      icon: Fuel,
      title: "Fuel Included",
      description: "All rentals come with full fuel tank - return with full tank"
    }
  ];

  const benefits = [
    { icon: CheckCircle, text: "No security deposit required" },
    { icon: CheckCircle, text: "Free cancellation up to 24 hours" },
    { icon: CheckCircle, text: "24x7 roadside assistance" },
    { icon: CheckCircle, text: "Unlimited kilometers available" },
    { icon: CheckCircle, text: "GPS enabled vehicles" },
    { icon: CheckCircle, text: "Contactless pickup & drop" }
  ];

  const stats = [
    { value: "500+", label: "Car Models", icon: Car },
    { value: "50K+", label: "Happy Customers", icon: Users },
    { value: "100+", label: "Cities Covered", icon: MapPin },
    { value: "24/7", label: "Customer Support", icon: Headphones }
  ];

  const handleNotifyMe = () => {
    const email = prompt("Enter your email address to get notified when we launch:");
    if (email && email.includes('@')) {
      alert(`Thank you! We'll notify you at ${email} when Car24 launches.`);
      // Here you would typically send this to your backend
    } else if (email) {
      alert("Please enter a valid email address.");
    }
  };

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
              <Rocket size={16} />
              <span>Coming Soon</span>
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
              India's most trusted peer-to-peer car sharing marketplace. 
              Rent cars from verified owners or earn extra income by sharing your idle vehicle.
            </motion.p>

            {/* Countdown Timer */}
            <motion.div 
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
            </motion.div>

            <motion.div 
              className="hero-buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <button className="btn-primary" onClick={handleNotifyMe}>
                Notify Me When Live
                <ChevronRight size={18} />
              </button>
              <button className="btn-secondary" onClick={() => setIsVideoModalOpen(true)}>
                <Play size={18} />
                Watch Demo
              </button>
            </motion.div>

            {/* Early Access Badge */}
            <motion.div 
              className="early-access"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Gift size={20} />
              <span>Early access users get 20% off on first booking + Free GPS tracking</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="stat-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <stat.icon size={32} className="stat-icon" />
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-badge">✦ Why Choose Car24</span>
            <h2 className="section-title">Everything You Need for a<br /><span className="gradient-text">Perfect Road Trip</span></h2>
            <p className="section-subtitle">We've thought of everything to make your car rental experience seamless and enjoyable</p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="feature-icon">
                  <feature.icon size={28} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <div className="benefits-wrapper">
            <motion.div 
              className="benefits-content"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="section-badge">✦ Exclusive Benefits</span>
              <h2 className="section-title">What Makes Us<br /><span className="gradient-text">Different?</span></h2>
              <div className="benefits-list">
                {benefits.map((benefit, index) => (
                  <motion.div 
                    key={index} 
                    className="benefit-item"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <benefit.icon size={20} className="benefit-icon" />
                    <span>{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
              <button className="btn-primary-outline" onClick={handleNotifyMe}>
                Get Early Access
                <ArrowRight size={18} />
              </button>
            </motion.div>

            <motion.div 
              className="benefits-image"
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="image-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Car24 App Preview"
                />
                <div className="image-overlay">
                  <div className="play-button" onClick={() => setIsVideoModalOpen(true)}>
                    <Play size={24} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-badge">✦ Testimonials</span>
            <h2 className="section-title">What Our <span className="gradient-text">Beta Users</span> Say</h2>
          </motion.div>

          <div className="testimonials-grid">
            {[
              { name: "Rajesh Kumar", role: "Frequent Traveler", text: "Car24 has completely changed how I travel. The cars are always in perfect condition and the booking process is effortless.", rating: 5, avatar: "RK" },
              { name: "Priya Sharma", role: "Car Owner", text: "I've earned over ₹50,000 by sharing my idle car. The platform handles everything - from insurance to customer verification.", rating: 5, avatar: "PS" },
              { name: "Amit Patel", role: "Business Professional", text: "The 24/7 support is amazing. Once I had an issue at midnight, and they resolved it within 10 minutes!", rating: 5, avatar: "AP" }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="testimonial-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.avatar}</div>
                  <div>
                    <div className="author-name">{testimonial.name}</div>
                    <div className="author-role">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div 
            className="cta-wrapper"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2>Ready to Experience Car24?</h2>
            <p>Join the waitlist and be the first to know when we launch in your city</p>
            <div className="cta-form">
              <input 
                type="email" 
                placeholder="Enter your email address"
                className="cta-input"
              />
              <button className="cta-button" onClick={handleNotifyMe}>
                Notify Me
                <ChevronRight size={18} />
              </button>
            </div>
            <p className="cta-note">No spam, unsubscribe anytime. We respect your privacy.</p>
          </motion.div>
        </div>
      </section>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="video-modal" onClick={() => setIsVideoModalOpen(false)}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsVideoModalOpen(false)}>
              <X size={24} />
            </button>
            <div className="video-wrapper">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Car24 Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LaunchPage;