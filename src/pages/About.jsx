import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  Shield,
  Clock,
  Users,
  Award,
  MapPin,
  Headphones,
  Car,
  Heart,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Star,
  Zap,
  Sparkles,
  TrendingUp,
  PhoneCall,
  CheckCircle,
  ThumbsUp,
  UserCheck,
  Calendar,
  Key,
  Fuel,
  Settings,
  Globe,
  Target,
  Eye,
  Briefcase,
  Smile,
  ThumbsUp as ThumbsUpIcon,
  Truck,
  CreditCard,
  Headphones as HeadphonesIcon,
  CheckCircle as CheckCircleIcon
} from 'lucide-react'
import styles from './About.module.css'
import { motion, AnimatePresence } from 'framer-motion'

const About = () => {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [counters, setCounters] = useState({
    cars: 0,
    customers: 0,
    cities: 0,
    bookings: 0
  });
  const timerRef = useRef(null);
  const statsRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const handleGoBack = () => {
    navigate(-1);
  };

  // Animated counters
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 2000;
          const step = 20;
          const targets = {
            cars: 500,
            customers: 25000,
            cities: 100,
            bookings: 50000
          };
          
          const increments = {
            cars: targets.cars / (duration / step),
            customers: targets.customers / (duration / step),
            cities: targets.cities / (duration / step),
            bookings: targets.bookings / (duration / step)
          };
          
          let current = { cars: 0, customers: 0, cities: 0, bookings: 0 };
          const interval = setInterval(() => {
            current = {
              cars: Math.min(current.cars + increments.cars, targets.cars),
              customers: Math.min(current.customers + increments.customers, targets.customers),
              cities: Math.min(current.cities + increments.cities, targets.cities),
              bookings: Math.min(current.bookings + increments.bookings, targets.bookings)
            };
            setCounters(current);
            if (current.cars >= targets.cars && current.customers >= targets.customers && 
                current.cities >= targets.cities && current.bookings >= targets.bookings) {
              clearInterval(interval);
            }
          }, step);
        }
      },
      { threshold: 0.5 }
    );
    
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    return () => observer.disconnect();
  }, [hasAnimated]);

  // Features data
  const FEATURES = [
    {
      icon: Shield,
      title: 'Certified Quality',
      description: 'Every car undergoes a rigorous 45-point quality check and owner verification for your peace of mind.',
      color: '#10b981'
    },
    {
      icon: Clock,
      title: '24/7 Roadside Support',
      description: 'Round-the-clock assistance for any emergencies, ensuring you\'re never stranded.',
      color: '#3b82f6'
    },
    {
      icon: Users,
      title: 'Flexible Rentals',
      description: 'Choose from hourly, daily, weekly, or monthly rentals with instant booking confirmation.',
      color: '#f59e0b'
    },
    {
      icon: Award,
      title: 'Best Price Promise',
      description: 'Competitive rates with zero hidden charges. What you see is what you pay.',
      color: '#8b5cf6'
    },
    {
      icon: CheckCircle,
      title: 'No Deposits',
      description: 'Drive with confidence! No security deposits required for verified users.',
      color: '#06b6d4'
    },
    {
      icon: MapPin,
      title: 'Pan India Network',
      description: 'Available in 100+ cities with pickup & drop at your convenience.',
      color: '#ef4444'
    }
  ];

  // Stats data for display
  const STATS_DISPLAY = [
    { value: Math.floor(counters.cars), label: 'Car Models', icon: Car, suffix: '+' },
    { value: Math.floor(counters.customers), label: 'Happy Customers', icon: Users, suffix: '+' },
    { value: Math.floor(counters.cities), label: 'Cities Covered', icon: MapPin, suffix: '+' },
    { value: Math.floor(counters.bookings), label: 'Bookings Completed', icon: Calendar, suffix: '+' }
  ];

  const VALUES = [
    {
      icon: Shield,
      title: 'Trust & Transparency',
      description: 'Complete transparency from pricing to vehicle condition. No surprises, no hidden costs.',
    },
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Your satisfaction drives everything we do. We go the extra mile for a seamless experience.',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Leveraging cutting-edge technology to simplify rentals and provide real-time updates.',
    },
    {
      icon: TrendingUp,
      title: 'Empowering Owners',
      description: 'Help car owners earn extra income by listing their idle vehicles on our platform.',
    }
  ];

  const HOW_IT_WORKS = [
    {
      step: '01',
      title: 'Choose Your Ride',
      description: 'Browse hundreds of cars across multiple categories - from economy to luxury.',
      icon: Car,
      color: '#10b981'
    },
    {
      step: '02',
      title: 'Book Instantly',
      description: 'Select your dates, pay securely, and get instant confirmation.',
      icon: Calendar,
      color: '#3b82f6'
    },
    {
      step: '03',
      title: 'Pick Up',
      description: 'Get the keys at your preferred location with our seamless pickup process.',
      icon: Key,
      color: '#f59e0b'
    },
    {
      step: '04',
      title: 'Drive & Return',
      description: 'Enjoy your journey and return the car hassle-free at any of our locations.',
      icon: Fuel,
      color: '#8b5cf6'
    }
  ];

  const TESTIMONIALS = [
    {
      initials: 'RK',
      name: 'Rahul Kumar',
      city: 'Nellore',
      quote: 'Amazing experience! The car was in perfect condition and the pickup was seamless. The app is super intuitive and the support team was very responsive. Will definitely use Car24 again!',
      rating: 5,
      role: 'Frequent Traveler'
    },
    {
      initials: 'PR',
      name: 'Priya Reddy',
      city: 'Kavali',
      quote: 'Best car rental platform in India! The process was smooth, and customer support was extremely helpful. I\'ve rented multiple times and never had any issues.',
      rating: 5,
      role: 'Business Professional'
    },
    {
      initials: 'AG',
      name: 'Amit Gowd',
      city: 'Ongole',
      quote: 'As a car owner, Car24 helped me earn extra income from my idle car. The platform handles everything - from insurance to customer verification. Great platform!',
      rating: 5,
      role: 'Car Owner'
    },
    {
      initials: 'SN',
      name: 'Sneha Nair',
      city: 'Chennai',
      quote: 'I was skeptical about renting a car online, but Car24 exceeded my expectations. The car was spotless, the booking was easy, and the prices were reasonable.',
      rating: 5,
      role: 'First-time Renter'
    },
    {
      initials: 'MK',
      name: 'Manoj Kumar',
      city: 'Hyderabad',
      quote: 'Excellent service! The car was delivered on time and the condition was perfect. Customer support was very helpful throughout the process.',
      rating: 5,
      role: 'Business Traveler'
    },
    {
      initials: 'AS',
      name: 'Anjali Sharma',
      city: 'Bangalore',
      quote: 'Car24 made my road trip memorable. The booking process was smooth, and the car was in pristine condition. Highly recommended!',
      rating: 5,
      role: 'Weekend Explorer'
    }
  ];

  // Carousel functions
  const nextTestimonial = () => {
    setDirection(1);
    setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    resetAutoPlay();
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
    resetAutoPlay();
  };

  const goToTestimonial = (index) => {
    setDirection(index > currentTestimonial ? 1 : -1);
    setCurrentTestimonial(index);
    resetAutoPlay();
  };

  const resetAutoPlay = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (isAutoPlaying) {
      timerRef.current = setInterval(() => {
        nextTestimonial();
      }, 5000);
    }
  };

  useEffect(() => {
    resetAutoPlay();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isAutoPlaying]);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.4,
        ease: "easeIn"
      }
    })
  };

  return (
    <div className={styles.about}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <motion.img
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Car24 hero background"
            className={styles.heroBgImage}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 8, ease: "easeOut" }}
          />
          <button onClick={handleGoBack} className={styles.backButton} aria-label="Go back">
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <motion.div
            className={styles.heroOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          />
        </div>

        <div className={styles.heroContent}>
          <motion.span
            className={styles.heroEyebrow}
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            ✦ India's Most Trusted Car Rental Platform
          </motion.span>

          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            About <span className={styles.highlight}>Car24</span>
          </motion.h1>

          <motion.p
            className={styles.heroSubtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            Revolutionizing car rentals across India by connecting vehicle owners
            with travellers. Safe, reliable, and hassle-free.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link to="/cars" className={styles.heroBtn}>
              Browse Cars
              <ChevronRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection} ref={statsRef}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {STATS_DISPLAY.map((stat, i) => (
              <motion.div
                key={i}
                className={styles.statCardLarge}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={styles.statIconLarge}>
                  <stat.icon size={32} />
                </div>
                <div className={styles.statValueLarge}>
                  {stat.value.toLocaleString()}{stat.suffix}
                </div>
                <div className={styles.statLabelLarge}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className={styles.missionVision}>
        <div className={styles.container}>
          <div className={styles.missionVisionGrid}>
            <motion.div
              className={styles.missionCard}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className={styles.missionIcon}>
                <Target size={32} />
              </div>
              <h3>Our Mission</h3>
              <p>
                To make car rentals accessible, affordable, and hassle-free for everyone 
                by creating India's most trusted peer-to-peer car sharing marketplace.
              </p>
            </motion.div>

            <motion.div
              className={styles.visionCard}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className={styles.visionIcon}>
                <Eye size={32} />
              </div>
              <h3>Our Vision</h3>
              <p>
                To revolutionize urban mobility by making car ownership optional and 
                car sharing the preferred choice for millions of Indians.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Company Overview Section */}
      <section className={styles.overview}>
        <div className={styles.container}>
          <div className={styles.overviewContent}>
            <motion.div
              className={styles.overviewText}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className={styles.sectionEyebrow}>✦ Who We Are</span>
              <h2 className={styles.sectionTitle}>India's Fastest Growing<br /><span className={styles.gradientText}>Car Rental Platform</span></h2>
              <p>
                Founded with a vision to transform how India travels, Car24 has emerged as 
                the country's most trusted self-drive car rental marketplace. We connect 
                car owners with travellers, creating a seamless ecosystem that benefits everyone.
              </p>
              <p>
                With our innovative technology platform, we've simplified the entire rental 
                process — from booking to key handover. Today, we're proud to have facilitated 
                over 50,000 happy journeys across 100+ cities.
              </p>
              <div className={styles.overviewFeatures}>
                <div className={styles.overviewFeature}>
                  <CheckCircleIcon size={18} />
                  <span>100% Verified Cars</span>
                </div>
                <div className={styles.overviewFeature}>
                  <CheckCircleIcon size={18} />
                  <span>Contactless Pickup</span>
                </div>
                <div className={styles.overviewFeature}>
                  <CheckCircleIcon size={18} />
                  <span>Real-time Tracking</span>
                </div>
                <div className={styles.overviewFeature}>
                  <CheckCircleIcon size={18} />
                  <span>Instant Support</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className={styles.overviewImage}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className={styles.imageWrapper}>
                <img 
                  src="https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Car24 fleet"
                />
                <div className={styles.imageGlow} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className={styles.features}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <motion.span
              className={styles.sectionEyebrow}
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              ✦ Why Choose Us
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              What Makes <span className={styles.gradientText}>Car24 Special</span>
            </motion.h2>
          </div>

          <div className={styles.featuresGrid}>
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                className={styles.featureCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className={styles.featureIconWrapper} style={{ background: `${feature.color}15` }}>
                  <feature.icon className={styles.featureIcon} style={{ color: feature.color }} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorks}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <motion.span
              className={styles.sectionEyebrow}
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              ✦ Simple Process
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              How Car24 Works
            </motion.h2>
            <motion.p
              className={styles.sectionSubtitle}
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Get on the road in just a few simple steps
            </motion.p>
          </div>

          <div className={styles.howItWorksGrid}>
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={i}
                className={styles.stepCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className={styles.stepNumber} style={{ background: step.color }}>
                  {step.step}
                </div>
                <div className={styles.stepIconWrapper} style={{ background: `${step.color}15` }}>
                  <step.icon className={styles.stepIcon} style={{ color: step.color }} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={styles.values}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <motion.span
              className={styles.sectionEyebrow}
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              ✦ Our Core Values
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              What Drives <span className={styles.gradientText}>Us Forward</span>
            </motion.h2>
            <motion.p
              className={styles.sectionSubtitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              The principles that guide every decision we make
            </motion.p>
          </div>

          <div className={styles.valuesGrid}>
            {VALUES.map((value, i) => (
              <motion.div
                key={i}
                className={styles.valueCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.2 }
                }}
              >
                <div className={styles.valueIconWrapper}>
                  <value.icon className={styles.valueIcon} />
                  <div className={styles.valueIconGlow}></div>
                </div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
                <div className={styles.valueCardBorder}></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel Section */}
      <section className={styles.testimonials}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <motion.span
              className={styles.sectionEyebrow}
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              ✦ Testimonials
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              What Our <span className={styles.gradientText}>Customers Say</span>
            </motion.h2>
            <motion.p
              className={styles.testimonialsSubtitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Join thousands of satisfied customers who trust Car24
            </motion.p>
          </div>

          <div className={styles.carouselContainer}>
            {/* <button 
              className={`${styles.carouselNav} ${styles.carouselNavPrev}`}
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} />
            </button> */}

            {/* <button 
              className={`${styles.carouselNav} ${styles.carouselNavNext}`}
              onClick={nextTestimonial}
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} />
            </button> */}

            <div className={styles.carouselWrapper}>
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentTestimonial}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className={styles.testimonialCard}
                >
                  <div className={styles.ratingStars}>
                    {[...Array(TESTIMONIALS[currentTestimonial].rating)].map((_, j) => (
                      <Star key={j} size={18} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                  <p className={styles.testimonialText}>"{TESTIMONIALS[currentTestimonial].quote}"</p>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.authorAvatar}>
                      <span>{TESTIMONIALS[currentTestimonial].initials}</span>
                    </div>
                    <div>
                      <div className={styles.authorName}>{TESTIMONIALS[currentTestimonial].name}</div>
                      <div className={styles.authorRole}>{TESTIMONIALS[currentTestimonial].role}</div>
                      <div className={styles.authorLocation}>
                        <MapPin size={12} />
                        {TESTIMONIALS[currentTestimonial].city}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className={styles.carouselDots}>
              {TESTIMONIALS.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.carouselDot} ${currentTestimonial === index ? styles.carouselDotActive : ''}`}
                  onClick={() => goToTestimonial(index)}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            {/* <button 
              className={styles.autoPlayToggle}
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              aria-label={isAutoPlaying ? "Pause auto-play" : "Start auto-play"}
            >
              {isAutoPlaying ? '⏸' : '▶'}
            </button> */}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <motion.div
            className={styles.ctaContent}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles className={styles.ctaIcon} />
            <h2>Ready to Hit the Road?</h2>
            <p>
              Join thousands of happy travellers who trust Car24 for their journeys.
              Whether you're looking to rent or earn, we've got you covered.
            </p>
            <div className={styles.ctaButtons}>
              <Link to="/cars" className={styles.primaryBtn}>
                Book a Car
                <ChevronRight size={18} />
              </Link>
              <Link to="/register-owner" className={styles.secondaryBtn}>
                List Your Car
                <ChevronRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
};

export default About;