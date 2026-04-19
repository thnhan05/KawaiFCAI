// Initialize AOS Animation
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 100
    });
});

// Header scroll effect optimized
const header = document.querySelector('.header');
let lastScrollY = window.scrollY;
let ticking = false;

function updateHeader() {
    if (lastScrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    ticking = false;
}

window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
    }
});

// Scroll Spy: Highlight active nav link smoothly
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.nav-links a');

const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
};

const navSlider = document.querySelector('.nav-slider');
const navLinksUl = document.querySelector('.nav-links');

function moveSliderTo(element) {
    if (!element || !navSlider) return;
    
    // Ignore on mobile screens where nav is stacked
    if (window.innerWidth <= 768) {
        navSlider.style.opacity = 0;
        return;
    }
    
    const rect = element.getBoundingClientRect();
    const parentRect = navLinksUl.getBoundingClientRect();
    
    navSlider.style.width = `${rect.width}px`;
    navSlider.style.transform = `translateX(${rect.left - parentRect.left}px)`;
    navSlider.style.opacity = 1;
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const currentId = entry.target.getAttribute('id');
            navItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href') === `#${currentId}`) {
                    item.classList.add('active');
                    moveSliderTo(item);
                }
            });
        }
    });
}, observerOptions);

sections.forEach(section => observer.observe(section));

// Hover states for sliding pill
navItems.forEach(item => {
    item.addEventListener('mouseenter', (e) => {
        moveSliderTo(e.target);
    });
});

if (navLinksUl) {
    navLinksUl.addEventListener('mouseleave', () => {
        const activeItem = document.querySelector('.nav-links a.active');
        if (activeItem) {
            moveSliderTo(activeItem);
        } else {
            navSlider.style.opacity = 0;
        }
    });
}

// Adjust pill on window resize
window.addEventListener('resize', () => {
    const activeItem = document.querySelector('.nav-links a.active');
    if (activeItem) moveSliderTo(activeItem);
});

// Smooth Scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if (this.getAttribute('href') !== '#') {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Determine exact offset
                const headerHeight = document.querySelector('.header').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 10;
  
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Mobile menu toggle (simple interaction)
const mobileBtn = document.querySelector('.mobile-menu-btn');
mobileBtn.addEventListener('click', () => {
    // Basic interaction for mobile click
    mobileBtn.classList.toggle('active');
    
    // In a full app, you would toggle a nav menu here
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');
    
    if (navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
        navActions.style.display = 'none';
    } else {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = 'white';
        navLinks.style.padding = '1rem';
        navLinks.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
        
        navActions.style.display = 'flex';
        navActions.style.position = 'absolute';
        navActions.style.top = 'calc(100% + 200px)';
        navActions.style.left = '0';
        navActions.style.width = '100%';
        navActions.style.background = 'white';
        navActions.style.padding = '1rem';
        navActions.style.justifyContent = 'center';
        navActions.style.paddingBottom = '2rem';
    }
});
