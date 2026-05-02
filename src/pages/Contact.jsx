import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, MessageCircle, ArrowUp } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import styles from './Contact.module.css';

const Contact = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll to top when component mounts (coming from any page)
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []); // Empty dependency array ensures this runs only once when component mounts

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, rotateY: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    hover: {
      scale: 1.05,
      y: -10,
      transition: { duration: 0.3 }
    }
  };

  const iconVariants = {
    hover: {
      rotate: [0, -10, 10, -5, 5, 0],
      transition: { duration: 0.5 }
    }
  };

  const contactDetails = [
    {
      icon: Mail,
      title: "Email Us",
      info: "support@car24.com",
      detail: "Response within 24 hours",
      link: "mailto:support@car24.com",
      color: "#10b981"
    },
    {
      icon: Phone,
      title: "Call Us",
      info: "+91 98765 43210",
      detail: "24/7 Customer Support",
      link: "tel:+919876543210",
      color: "#3b82f6"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      info: "Hyderabad, India",
      detail: "Multiple branches across India",
      link: "#",
      color: "#f59e0b"
    },
    {
      icon: Clock,
      title: "Business Hours",
      info: "Mon - Sat: 9 AM - 8 PM",
      detail: "Sunday: 10 AM - 4 PM",
      link: null,
      color: "#8b5cf6"
    }
  ];

  const socialLinks = [
    { icon: FaFacebook, name: "Facebook", url: "https://facebook.com/car24", color: "#1877f2" },
    { icon: FaTwitter, name: "Twitter", url: "https://twitter.com/car24", color: "#1da1f2" },
    { icon: FaInstagram, name: "Instagram", url: "https://instagram.com/car24", color: "#e4405f" },
    { icon: FaLinkedin, name: "LinkedIn", url: "https://linkedin.com/company/car24", color: "#0a66c2" }
  ];

  return (
    <>
      <motion.div
        className={styles.contact}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero Section with Parallax */}
        <motion.section 
          className={styles.hero}
          style={{ opacity, scale }}
          ref={sectionRef}
        >
          <div className={styles.heroBackground}>
            <motion.div 
              className={styles.heroOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 1 }}
            />
          </div>
          
          <div className={styles.heroContent}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className={styles.heroBadge}>✦ Get in Touch</span>
              <h1 className={styles.heroTitle}>
                Let's Start a{" "}
                <motion.span
                  className={styles.gradientText}
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  Conversation
                </motion.span>
              </h1>
              <p className={styles.heroSubtitle}>
                Have questions about our services? Need assistance with a booking? 
                We're here to help. Reach out to us through any of the channels below.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Contact Information Cards - Centered Layout */}
        <motion.div 
          className={styles.mainContainer}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className={styles.infoSection} variants={itemVariants}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleIcon}>📞</span>
              Contact Information
            </h2>
            <div className={styles.cardsGrid}>
              {contactDetails.map((detail, index) => (
                <motion.a
                  key={index}
                  href={detail.link}
                  className={styles.contactCard}
                  variants={cardVariants}
                  whileHover="hover"
                  custom={index}
                  style={{ textDecoration: detail.link ? 'none' : 'none', cursor: detail.link ? 'pointer' : 'default' }}
                >
                  <motion.div 
                    className={styles.cardIcon}
                    variants={iconVariants}
                    whileHover="hover"
                    style={{ background: `${detail.color}15` }}
                  >
                    <detail.icon size={28} style={{ color: detail.color }} />
                  </motion.div>
                  <h3>{detail.title}</h3>
                  <p className={styles.cardInfo}>{detail.info}</p>
                  <p className={styles.cardDetail}>{detail.detail}</p>
                  {detail.link && (
                    <motion.span 
                      className={styles.cardArrow}
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  )}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Map Section with Animation */}
        <motion.section
          className={styles.mapSection}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className={styles.mapContainer}>
            <motion.div 
              className={styles.mapOverlay}
              whileHover={{ opacity: 0 }}
            >
              <div className={styles.mapOverlayContent}>
                <MapPin size={48} />
                <h3>Find Us Here</h3>
                <p>Multiple branches across India</p>
              </div>
            </motion.div>
            <iframe
              title="Car24 Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243647.62668247777!2d78.24399772031738!3d17.4123483078615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb99daeaebd2c7%3A0xae93b78392bafbc2!2sHyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1641234567890!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              className={styles.mapIframe}
            />
          </div>
        </motion.section>

        {/* Social Media Section */}
        <motion.section
          className={styles.socialSection}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className={styles.socialContent}>
            <h2>Connect With Us</h2>
            <p>Follow us on social media for updates, offers, and more</p>
            <div className={styles.socialLinks}>
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  whileHover={{ y: -5, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={styles.socialIcon} style={{ background: `${social.color}15` }}>
                    <social.icon size={24} style={{ color: social.color }} />
                  </div>
                  <span>{social.name}</span>
                </motion.a>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Floating Chat Button */}
        <motion.a
          href="#"
          className={styles.chatButton}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring" }}
        >
          <MessageCircle size={24} />
          <span className={styles.chatTooltip}>Chat with us</span>
        </motion.a>
      </motion.div>

      {/* Scroll to Top Button */}
      {/* {showScrollTop && (
        <motion.button
          className={styles.scrollTopButton}
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowUp size={24} />
          <span className={styles.scrollTopTooltip}>Back to Top</span>
        </motion.button>
      )} */}
    </>
  );
};

export default Contact;