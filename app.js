// CORE WEBSITE INTERACTION LOGIC (LIGHT THEME & ULTRA-PREMIUM INTERACTION)

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Initialize Discord widget
    if (window.initDiscordWidget) {
        window.initDiscordWidget();
    }

    // DOM Elements
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebarNav = document.getElementById('sidebar-nav');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    const logoNav = document.getElementById('logo-nav');
    const quoteForm = document.getElementById('quote-form');
    const serviceSelect = document.getElementById('contact-service');
    
    // Premium Features Elements
    const customCursor = document.getElementById('custom-cursor');
    const customCursorDot = document.getElementById('custom-cursor-dot');
    const scrollProgress = document.getElementById('scroll-progress');
    const timelineProgress = document.getElementById('timeline-progress');
    const workflowSection = document.getElementById('workflow');
    const workflowSteps = document.querySelectorAll('.workflow-step');

    // 1. PREMIUM CUSTOM CURSOR TRACKING (DESKTOP)
    if (customCursor && customCursorDot) {
        document.addEventListener('mousemove', (e) => {
            // Use requestAnimationFrame for lag-free performance
            window.requestAnimationFrame(() => {
                customCursor.style.left = `${e.clientX}px`;
                customCursor.style.top = `${e.clientY}px`;
                
                customCursorDot.style.left = `${e.clientX}px`;
                customCursorDot.style.top = `${e.clientY}px`;
            });
        });

        // Hover expanders
        const hoverables = document.querySelectorAll('a, button, select, input, textarea, .logo-container, .service-card, .discord-member-card');
        hoverables.forEach(item => {
            item.addEventListener('mouseenter', () => {
                customCursor.classList.add('hovered');
            });
            item.addEventListener('mouseleave', () => {
                customCursor.classList.remove('hovered');
            });
        });
    }

    // 2. SCROLL PROGRESS & TIMELINE PROGRESS ANIMATION
    window.addEventListener('scroll', () => {
        // Page Scroll progress
        const windowScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (windowScroll / height) * 100;
        if (scrollProgress) {
            scrollProgress.style.width = `${scrolled}%`;
        }

        // Timeline progress line filling on scroll
        if (workflowSection && timelineProgress) {
            const rect = workflowSection.getBoundingClientRect();
            const sectionHeight = rect.height;
            // Calculate progress relative to screen center
            const scrollOffset = (window.innerHeight * 0.5) - rect.top;
            const progress = Math.max(0, Math.min(100, (scrollOffset / (sectionHeight - 150)) * 100));
            timelineProgress.style.height = `${progress}%`;
        }
    });

    // 3. SIDEBAR DRAWER MENU TOGGLE
    function openMenu() {
        hamburgerBtn.classList.add('active');
        sidebarNav.classList.add('active');
        sidebarBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden'; // prevent scroll
    }

    function closeMenu() {
        hamburgerBtn.classList.remove('active');
        sidebarNav.classList.remove('active');
        sidebarBackdrop.classList.remove('active');
        document.body.style.overflow = ''; // restore scroll
    }

    hamburgerBtn.addEventListener('click', () => {
        if (sidebarNav.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    sidebarBackdrop.addEventListener('click', closeMenu);

    // 4. SMOOTH SCROLL NAVIGATION
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                closeMenu();
                
                // Smooth scroll to section
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Backup update hash
                window.history.pushState(null, null, `#${targetId}`);
            }
        });
    });

    // Logo click scrolls to top
    logoNav.addEventListener('click', () => {
        const homeSection = document.getElementById('home');
        if (homeSection) {
            homeSection.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // 5. SCROLL REVEAL OBSERVER & SCROLL SPY
    // Reveal sections when scrolling into view
    const revealOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px', // trigger slightly before entering viewport
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
            }
        });
    }, revealOptions);

    const revealSections = document.querySelectorAll('.scroll-reveal');
    revealSections.forEach(section => {
        revealObserver.observe(section);
    });

    // Scroll Spy: Detect centered section to update Three.js & links active classes
    const spyOptions = {
        root: null,
        rootMargin: '-30% 0px -50% 0px',
        threshold: 0
    };

    const spyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                
                // Update active navigation link class
                navLinks.forEach(link => {
                    if (link.getAttribute('data-target') === sectionId) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });

                // Update Three.js 3D Logo position
                if (window.updateThreeSceneForSection) {
                    window.updateThreeSceneForSection(sectionId);
                }
            }
        });
    }, spyOptions);

    sections.forEach(section => {
        spyObserver.observe(section);
    });

    // Workflow Steps Observer: activate milestones as they cross screen center
    const stepOptions = {
        root: null,
        rootMargin: '0px 0px -50% 0px', // trigger when step enters upper half of screen
        threshold: 0
    };

    const stepObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('step-active');
            } else {
                entry.target.classList.remove('step-active');
            }
        });
    }, stepOptions);

    workflowSteps.forEach(step => {
        stepObserver.observe(step);
    });

    // 6. CTA NAVIGATION ACTIONS
    const homeCtas = document.querySelectorAll('[data-nav]');
    homeCtas.forEach(cta => {
        cta.addEventListener('click', (e) => {
            e.preventDefault();
            const target = cta.getAttribute('data-nav');
            const targetSection = document.getElementById(target);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Service card buttons: smooth scroll to contact, auto-select service
    const serviceButtons = document.querySelectorAll('[data-go-contact]');
    serviceButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const serviceType = btn.getAttribute('data-go-contact');
            
            if (serviceSelect) {
                serviceSelect.value = serviceType;
            }

            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
            
            // Focus on name input field
            setTimeout(() => {
                const nameInput = document.getElementById('contact-name');
                if (nameInput) nameInput.focus();
            }, 600);
        });
    });

    // 7. CONTACT FORM SUBMISSION WITH PREMIUM FEEDBACK
    if (quoteForm) {
        quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = quoteForm.querySelector('.btn-submit');
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <div class="spinner"></div>
                <span>Enviando proposta...</span>
            `;

            // Mock submission delay
            setTimeout(() => {
                const formWrapper = document.querySelector('.contact-form-wrapper');
                
                if (formWrapper) {
                    formWrapper.style.transition = 'opacity 0.4s ease';
                    formWrapper.style.opacity = '0';
                    
                    setTimeout(() => {
                        formWrapper.innerHTML = `
                            <div class="form-success-message" style="text-align: center; padding: 3rem 1.5rem;">
                                <div class="success-icon-wrapper" style="width: 70px; height: 70px; border-radius: 50%; background: rgba(35, 165, 90, 0.1); border: 2px solid #23a55a; color: #23a55a; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem auto; animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                                    <i data-lucide="check" style="width: 36px; height: 36px;"></i>
                                </div>
                                <h3 style="font-family: var(--font-title); font-size: 1.8rem; font-weight: 700; color: var(--color-text); margin-bottom: 1rem;">Proposta Enviada!</h3>
                                <p style="color: var(--color-text-muted); font-size: 0.95rem; max-width: 380px; margin: 0 auto 2rem auto;">
                                    Agradecemos o seu contato. A equipe Nexus analisará as especificações do seu projeto e responderá nas próximas horas.
                                </p>
                                <button class="btn btn-secondary" id="reset-form-btn">Enviar Outra Mensagem</button>
                            </div>
                        `;
                        
                        if (window.lucide) {
                            window.lucide.createIcons();
                        }
                        
                        formWrapper.style.opacity = '1';

                        const resetFormBtn = document.getElementById('reset-form-btn');
                        resetFormBtn.addEventListener('click', () => {
                            location.reload();
                        });
                    }, 400);
                }
            }, 2000);
        });
    }

    // Styles for spinner and animations inside buttons dynamically
    const style = document.createElement('style');
    style.innerHTML = `
        .spinner {
            width: 18px;
            height: 18px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: #ffffff;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            display: inline-block;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        @keyframes scaleIn {
            from { transform: scale(0); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .discord-server-initials {
            font-family: var(--font-title);
            font-weight: 800;
            font-size: 1.25rem;
            color: #5865F2;
            letter-spacing: 1px;
            text-shadow: 0 0 10px rgba(88, 101, 242, 0.25);
        }
        .discord-channel-item-wrapper {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
        }
        .voice-users-list {
            display: flex;
            flex-direction: column;
            gap: 0.3rem;
            padding-left: 2rem;
            margin-bottom: 0.5rem;
        }
        .voice-user {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.8rem;
            color: var(--color-text-muted);
        }
        .voice-avatar {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            object-fit: cover;
        }
        .voice-badge {
            background: rgba(239, 68, 68, 0.1);
            color: #dc2626;
            border: 1px solid rgba(239, 68, 68, 0.2);
            font-size: 0.65rem;
            font-weight: 700;
            padding: 0.1rem 0.4rem;
            border-radius: 4px;
            margin-left: auto;
            letter-spacing: 0.5px;
        }
        .discord-no-members, .discord-error-box {
            grid-column: 1 / -1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: var(--color-text-muted);
            font-size: 0.9rem;
            padding: 2rem;
            border: 1px dashed rgba(0,0,0,0.06);
            border-radius: 12px;
            background: rgba(0,0,0,0.01);
        }
    `;
    document.head.appendChild(style);

});
