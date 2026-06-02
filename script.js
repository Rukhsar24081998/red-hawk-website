/**
 * RED HAWK INVESTMENT - INTERACTIVE WEB LOGIC
 * Headquartered in Sohar, Oman
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. STICKY HEADER & SCROLL PROGRESS BAR
     ========================================================================== */
  const mainHeader = document.getElementById('mainHeader');
  const scrollProgress = document.getElementById('scrollProgress');

  window.addEventListener('scroll', () => {
    // Add/remove class to shrink header height on scroll
    if (window.scrollY > 50) {
      mainHeader.classList.add('scrolled');
    } else {
      mainHeader.classList.remove('scrolled');
    }

    // Scroll progress bar calculation
    const windowScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolledPercent = height > 0 ? (windowScroll / height) * 100 : 0;
    scrollProgress.style.width = scrolledPercent + '%';
  });


  /* ==========================================================================
     2. MOBILE NAVIGATION DRAWERS
     ========================================================================== */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Toggle mobile navigation visibility
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close mobile navigation drawer when clicking any link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // Close drawer if clicking anywhere outside the menu
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    }
  });


  /* ==========================================================================
     3. HERO BANNER AUTOPLAY CAROUSEL
     ========================================================================== */
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.dot');
  let currentSlide = 0;
  let slideInterval;

  const showSlide = (index) => {
    // Clean current active states
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    // Apply active state
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlide = index;
  };

  const nextSlide = () => {
    let nextIndex = currentSlide + 1;
    if (nextIndex >= slides.length) {
      nextIndex = 0;
    }
    showSlide(nextIndex);
  };

  // Autoplay functionality
  const startAutoplay = () => {
    slideInterval = setInterval(nextSlide, 6000); // 6 seconds per slide
  };

  const resetAutoplay = () => {
    clearInterval(slideInterval);
    startAutoplay();
  };

  // Support click triggers on navigation dots
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      resetAutoplay();
    });
  });

  // Initialize Slider autoplay
  startAutoplay();


  /* ==========================================================================
     4. ANIMATED STATISTICS COUNT-UP
     ========================================================================== */
  const statNumbers = document.querySelectorAll('.stat-number');
  
  const countUp = (element) => {
    const target = parseInt(element.getAttribute('data-target'), 10);
    const duration = 2000; // 2 seconds animation
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out quadratic function
      const easeProgress = progress * (2 - progress);
      const currentValue = Math.floor(easeProgress * target);

      element.textContent = currentValue;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = target; // Ensure exact final value
      }
    };

    requestAnimationFrame(animate);
  };

  // Intersection Observer to run numbers count-up when visible
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statNumbers.forEach(num => countUp(num));
        statsObserver.disconnect(); // Fire once and clean up
      }
    });
  }, { threshold: 0.25 });

  // Target observing section containing stats
  const statsSection = document.querySelector('.stats-section');
  if (statsSection) {
    statsObserver.observe(statsSection);
  }


  /* ==========================================================================
     5. SERVICES & STAFFING TAB SWITCHER
     ========================================================================== */
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedTab = btn.getAttribute('data-tab');

      // Reset active button state
      tabButtons.forEach(button => button.classList.remove('active'));
      btn.classList.add('active');

      // Hide other contents and show matching tab panel
      tabContents.forEach(content => {
        if (content.id === selectedTab) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    });
  });


  /* ==========================================================================
     6. FORM VALIDATION & SUCCESS MODAL OVERLAY
     ========================================================================== */
  const inquiryForm = document.getElementById('inquiryForm');
  const successModal = document.getElementById('successModal');
  const modalClose = document.getElementById('modalClose');
  const modalOkBtn = document.getElementById('modalOkBtn');
  const inquiryIdDisplay = document.getElementById('inquiryId');

  // Input elements
  const inputName = document.getElementById('formName');
  const inputEmail = document.getElementById('formEmail');
  const inputMessage = document.getElementById('formMessage');

  // Clear visual validation errors as user types
  const clearError = (inputElement) => {
    const formGroup = inputElement.parentElement;
    formGroup.classList.remove('invalid');
  };

  const triggerError = (inputElement) => {
    const formGroup = inputElement.parentElement;
    formGroup.classList.add('invalid');
  };

  [inputName, inputEmail, inputMessage].forEach(input => {
    input.addEventListener('input', () => clearError(input));
  });

  // Client side inquiry form processing
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // Validate Full Name
      if (inputName.value.trim().length < 2) {
        triggerError(inputName);
        isValid = false;
      }

      // Validate Email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inputEmail.value.trim())) {
        triggerError(inputEmail);
        isValid = false;
      }

      // Validate message length
      if (inputMessage.value.trim().length < 8) {
        triggerError(inputMessage);
        isValid = false;
      }

      // If all inputs pass validation, trigger successful submission modal
      if (isValid) {
        // Generate random inquiry confirmation ID
        const randomId = 'RHI-' + Math.floor(10000 + Math.random() * 90000);
        inquiryIdDisplay.textContent = randomId;

        // Display Success Overlay
        successModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Stop background scroll
      }
    });
  }

  // Modal dismissing controls
  const closeModalHandler = () => {
    successModal.classList.remove('active');
    document.body.style.overflow = 'auto'; // Re-enable scroll
    
    // Reset form inputs & visual classes
    if (inquiryForm) {
      inquiryForm.reset();
      document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('invalid');
      });
    }
  };

  if (modalClose) modalClose.addEventListener('click', closeModalHandler);
  if (modalOkBtn) modalOkBtn.addEventListener('click', closeModalHandler);

  // Close modal when clicking on the blurred backdrop background
  window.addEventListener('click', (e) => {
    if (e.target === successModal) {
      closeModalHandler();
    }
  });


  /* ==========================================================================
     7. ACTIVE NAVIGATION LINKS BY SCROLL SEGMENT
     ========================================================================== */
  const navSectionIds = ['home', 'about', 'services', 'hse', 'projects'];
  const sections = navSectionIds.map(id => document.getElementById(id)).filter(el => el !== null);

  window.addEventListener('scroll', () => {
    let currentActiveId = '';
    const scrollPosition = window.scrollY + 150; // offset for sticky header

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        currentActiveId = section.getAttribute('id');
      }
    });

    // Fallback if at the very top of page
    if (window.scrollY < 100) {
      currentActiveId = 'home';
    }

    // Apply active class to matching nav item
    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === `#${currentActiveId}`) {
        link.classList.add('active');
      }
    });
  });


  /* ==========================================================================
     8. SIMPLE NEWSLETTER SUBMISSION HANDLER
     ========================================================================== */
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input');
      if (input && input.value.trim() !== '') {
        alert(`Thank you for subscribing! We've registered ${input.value} to receive updates.`);
        newsletterForm.reset();
      }
    });
  }

});
