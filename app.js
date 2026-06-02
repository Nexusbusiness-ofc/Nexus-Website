document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize Lucide Icons
    lucide.createIcons();

    // 1. Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            const icon = menuToggle.querySelector('i');
            if (navMenu.classList.contains('open')) {
                icon.setAttribute('data-lucide', 'x');
            } else {
                icon.setAttribute('data-lucide', 'menu');
            }
            lucide.createIcons();
        });
    }

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu && navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                const icon = menuToggle.querySelector('i');
                icon.setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            }
        });
    });

    // 2. Navbar Scroll Behavior
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Active Link Highlighter on Scroll
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // 4. Reveal Animations on Scroll
    const elementsToReveal = document.querySelectorAll('.service-card, .ebook-visual-card, .ebook-info-card, .simulator-card, .contact-info, .contact-form-card');
    
    // Add reveal class to targets
    elementsToReveal.forEach(el => el.classList.add('reveal'));

    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.85;
        elementsToReveal.forEach(el => {
            const elTop = el.getBoundingClientRect().top;
            if (elTop < triggerBottom) {
                el.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Run once initially

    // 5. Interactive Budget Simulator
    
    // Elements
    const checkWebSite = document.getElementById('calc-web-site');
    const checkWebSeo = document.getElementById('calc-web-seo');
    const rangeVideoQty = document.getElementById('calc-video-qty');
    const videoCountLabel = document.getElementById('video-count-label');
    const selectVideoStyle = document.getElementById('calc-video-style');
    const rangeSlidesQty = document.getElementById('calc-slides-qty');
    const slidesCountLabel = document.getElementById('slides-count-label');
    const checkSlidesDesign = document.getElementById('calc-slides-design');
    
    const calculatedTotal = document.getElementById('calculated-total');
    const resultSummaryList = document.getElementById('result-summary-list');
    
    const btnWhatsappOrder = document.getElementById('btn-whatsapp-order');
    const btnEmailOrder = document.getElementById('btn-email-order');

    // Values & Math Config
    const SLIDE_UNIT_PRICE = 4; // 4€ per slide

    function updateCalculator() {
        let total = 0;
        let summaryHTML = '';
        
        // Website Checkbox
        if (checkWebSite.checked) {
            const price = parseFloat(checkWebSite.dataset.price);
            total += price;
            summaryHTML += `
                <div class="summary-item">
                    <span>Website Corporativo</span>
                    <span class="price">${price.toFixed(2)} €</span>
                </div>`;
            // SEO checkbox only valid if website is checked
            checkWebSeo.disabled = false;
        } else {
            checkWebSeo.checked = false;
            checkWebSeo.disabled = true;
        }

        if (checkWebSeo.checked && !checkWebSeo.disabled) {
            const price = parseFloat(checkWebSeo.dataset.price);
            total += price;
            summaryHTML += `
                <div class="summary-item">
                    <span>Otimização SEO & Google</span>
                    <span class="price">${price.toFixed(2)} €</span>
                </div>`;
        }

        // Video Range
        const videoQty = parseInt(rangeVideoQty.value);
        videoCountLabel.textContent = videoQty === 1 ? '1 vídeo' : `${videoQty} vídeos`;
        
        if (videoQty > 0) {
            const selectedOption = selectVideoStyle.options[selectVideoStyle.selectedIndex];
            const multiplier = parseFloat(selectedOption.dataset.multiplier);
            const price = videoQty * multiplier;
            total += price;
            
            let styleName = 'Simples';
            if (selectedOption.value === 'advanced') styleName = 'Dinâmica';
            if (selectedOption.value === 'premium') styleName = 'Corporativa';
            
            summaryHTML += `
                <div class="summary-item">
                    <span>Edição de Vídeo (${videoQty}x - ${styleName})</span>
                    <span class="price">${price.toFixed(2)} €</span>
                </div>`;
        }

        // Slides Range
        const slidesQty = parseInt(rangeSlidesQty.value);
        slidesCountLabel.textContent = slidesQty === 1 ? '1 slide/página' : `${slidesQty} slides/páginas`;
        
        if (slidesQty > 0) {
            const price = slidesQty * SLIDE_UNIT_PRICE;
            total += price;
            summaryHTML += `
                <div class="summary-item">
                    <span>Apresentações (${slidesQty} slides)</span>
                    <span class="price">${price.toFixed(2)} €</span>
                </div>`;
        }

        // Slides Master Design template
        if (checkSlidesDesign.checked) {
            const price = parseFloat(checkSlidesDesign.dataset.price);
            total += price;
            summaryHTML += `
                <div class="summary-item">
                    <span>Template Slide Personalizado</span>
                    <span class="price">${price.toFixed(2)} €</span>
                </div>`;
        }

        // Update display
        calculatedTotal.textContent = `${total.toFixed(2).replace('.', ',')} €`;
        
        if (summaryHTML === '') {
            resultSummaryList.innerHTML = '<p class="empty-summary-text">Nenhum serviço selecionado ainda.</p>';
        } else {
            resultSummaryList.innerHTML = summaryHTML;
        }
    }

    // Attach Event Listeners to simulator controls
    const simulatorTriggers = [
        checkWebSite, checkWebSeo, rangeVideoQty, selectVideoStyle, rangeSlidesQty, checkSlidesDesign
    ];

    simulatorTriggers.forEach(trigger => {
        if (trigger) {
            trigger.addEventListener('input', updateCalculator);
            trigger.addEventListener('change', updateCalculator);
        }
    });

    // Run once on load
    updateCalculator();

    // 6. WhatsApp & Email Message Constructors
    function buildOrderSummaryText() {
        let details = [];
        let total = 0;

        if (checkWebSite.checked) {
            details.push(`- Website Corporativo / Landing Page (250,00 €)`);
            total += 250;
        }
        if (checkWebSeo.checked && !checkWebSeo.disabled) {
            details.push(`- Otimização SEO & Performance (+75,00 €)`);
            total += 75;
        }
        
        const videoQty = parseInt(rangeVideoQty.value);
        if (videoQty > 0) {
            const selectedOption = selectVideoStyle.options[selectVideoStyle.selectedIndex];
            const multiplier = parseFloat(selectedOption.dataset.multiplier);
            const price = videoQty * multiplier;
            total += price;
            let styleName = 'Simples';
            if (selectedOption.value === 'advanced') styleName = 'Dinâmica';
            if (selectedOption.value === 'premium') styleName = 'Corporativa';
            details.push(`- Edição de Vídeos: ${videoQty} vídeos (${styleName}) (${price.toFixed(2)} €)`);
        }

        const slidesQty = parseInt(rangeSlidesQty.value);
        if (slidesQty > 0) {
            const price = slidesQty * SLIDE_UNIT_PRICE;
            total += price;
            details.push(`- Apresentações/Documentos: ${slidesQty} slides (${price.toFixed(2)} €)`);
        }

        if (checkSlidesDesign.checked) {
            details.push(`- Template Master Slide Personalizado (+40,00 €)`);
            total += 40;
        }

        return {
            items: details,
            total: total
        };
    }

    if (btnWhatsappOrder) {
        btnWhatsappOrder.addEventListener('click', () => {
            const summary = buildOrderSummaryText();
            if (summary.items.length === 0) {
                alert('Por favor, selecione pelo menos um serviço no simulador antes de enviar!');
                return;
            }

            const header = `Olá André! Estive a visitar o site da *Nexus* e fiz uma simulação de orçamento:\n\n`;
            const body = summary.items.join('\n') + `\n\n`;
            const footer = `*Total Estimado:* ${summary.total.toFixed(2).replace('.', ',')} €\n\nGostaria de discutir os detalhes deste projeto. Como podemos proceder?`;
            
            const fullMessage = encodeURIComponent(header + body + footer);
            const whatsappUrl = `https://wa.me/351966391852?text=${fullMessage}`;
            
            window.open(whatsappUrl, '_blank');
        });
    }

    if (btnEmailOrder) {
        btnEmailOrder.addEventListener('click', () => {
            const summary = buildOrderSummaryText();
            if (summary.items.length === 0) {
                alert('Por favor, selecione pelo menos um serviço no simulador antes de enviar!');
                return;
            }

            const subject = encodeURIComponent('Solicitação de Orçamento - Nexus');
            const header = `Olá André,\n\nEstive no site da Nexus e elaborei a seguinte simulação de orçamento:\n\n`;
            const body = summary.items.join('\n') + `\n\n`;
            const footer = `Total Estimado: ${summary.total.toFixed(2).replace('.', ',')} €\n\nGostaria de obter mais informações e agendar uma reunião ou chamada para acertarmos os detalhes.\n\nCom os melhores cumprimentos.`;
            
            const fullBody = encodeURIComponent(header + body + footer);
            const mailtoUrl = `mailto:andresantosalves2008@gmail.com?subject=${subject}&body=${fullBody}`;
            
            window.location.href = mailtoUrl;
        });
    }

    // 7. Direct Contact Form Submission Handling
    const contactForm = document.getElementById('direct-contact-form');
    const feedbackMessage = document.getElementById('form-feedback-message');

    if (contactForm && feedbackMessage) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('form-name');
            const emailInput = document.getElementById('form-email');
            const messageInput = document.getElementById('form-message');
            const submitBtn = document.getElementById('form-submit-btn');

            if (!nameInput.value || !emailInput.value || !messageInput.value) {
                feedbackMessage.className = 'form-feedback error';
                feedbackMessage.textContent = 'Por favor, preencha todos os campos obrigatórios.';
                feedbackMessage.classList.remove('hidden');
                return;
            }

            // UI Feedback during send simulation
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>A enviar...</span> <i data-lucide="loader" class="spin"></i>`;
            lucide.createIcons();

            setTimeout(() => {
                feedbackMessage.className = 'form-feedback success';
                feedbackMessage.textContent = `Obrigado pelo seu contacto, ${nameInput.value}! A sua mensagem foi processada com sucesso. Entraremos em contacto brevemente.`;
                feedbackMessage.classList.remove('hidden');
                
                // Clear Form
                contactForm.reset();
                
                // Restore button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                lucide.createIcons();
                
                // Hide feedback after 8 seconds
                setTimeout(() => {
                    feedbackMessage.classList.add('hidden');
                }, 8000);

            }, 1500);
        });
    }

    // Optional: Dynamic 3D tilt effect on Ebook Cover & Service Cards
    const cards = document.querySelectorAll('.service-card, .ebook-visual-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const xc = rect.width / 2;
            const yc = rect.height / 2;
            
            const angleX = (yc - y) / 15; // tilt strength
            const angleY = (x - xc) / 15; 
            
            card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateY(-8px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
});
