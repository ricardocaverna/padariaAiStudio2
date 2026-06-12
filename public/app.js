/**
 * Padaria - Engine Interativa de Única Página (Vanilla JS)
 */

document.addEventListener("DOMContentLoaded", () => {
  // Inicializa os ícones Lucide carregados via CDN
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // ELEMENTOS DO DOM
  const mainHeader = document.getElementById("main-header");
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenuDropdown = document.getElementById("mobile-menu-dropdown");
  const menuIconClosed = document.getElementById("menu-icon-closed");
  const menuIconOpened = document.getElementById("menu-icon-opened");
  
  // Elementos do Fornômetro
  const timerHours = document.getElementById("timer-hours");
  const timerMinutes = document.getElementById("timer-minutes");
  const timerSeconds = document.getElementById("timer-seconds");
  const currentClockSpan = document.getElementById("current-clock-span");
  const fornometroStatusAlert = document.getElementById("fornometro-status-alert");

  // Elementos de Feedback de E-mail
  const alertEmailInput = document.getElementById("alert-email");
  const alertSubscribeBtn = document.getElementById("alert-subscribe-btn");
  const alertFormBox = document.getElementById("alert-form-box");

  // Elementos de Status de Funcionamento
  const statusDotDesktop = document.getElementById("status-dot-desktop");
  const statusTextDesktop = document.getElementById("status-text-desktop");
  const statusDotMobile = document.getElementById("status-dot-mobile");
  const statusTextMobile = document.getElementById("status-text-mobile");
  const liveStatusBadge = document.getElementById("live-status-badge");
  const liveStatusDot = document.getElementById("live-status-dot");
  const liveStatusText = document.getElementById("live-status-text");
  const liveStatusDesc = document.getElementById("live-status-desc");

  // 1. COMPORTAMENTO DO CABEÇALHO AO ROLAR (NAVBAR SCROLL)
  function handleHeaderScroll() {
    if (window.scrollY > 40) {
      mainHeader.classList.add("header-scrolled");
    } else {
      mainHeader.classList.remove("header-scrolled");
    }
  }
  window.addEventListener("scroll", handleHeaderScroll);
  handleHeaderScroll(); // Executa ao carregar para caso comece no meio

  // 2. MENU MOBILE COM FUNDO SÓLIDO (PREVINE TRANSPARÊNCIAS CONFUSAS)
  if (mobileMenuBtn && mobileMenuDropdown) {
    mobileMenuBtn.addEventListener("click", () => {
      const isExpanded = mobileMenuBtn.getAttribute("aria-expanded") === "true";
      
      if (isExpanded) {
        // Fecha Menu
        mobileMenuBtn.setAttribute("aria-expanded", "false");
        mobileMenuDropdown.classList.add("hidden");
        menuIconClosed.classList.remove("hidden");
        menuIconOpened.classList.add("hidden");
      } else {
        // Abre Menu
        mobileMenuBtn.setAttribute("aria-expanded", "true");
        mobileMenuDropdown.classList.remove("hidden");
        menuIconClosed.classList.add("hidden");
        menuIconOpened.classList.remove("hidden");
      }
    });

    // Fecha ao clicar em algum link interno do menu mobile
    const mobileLinks = mobileMenuDropdown.querySelectorAll("a");
    mobileLinks.forEach(link => {
      link.addEventListener("click", () => {
        mobileMenuBtn.setAttribute("aria-expanded", "false");
        mobileMenuDropdown.classList.add("hidden");
        menuIconClosed.classList.remove("hidden");
        menuIconOpened.classList.add("hidden");
      });
    });
  }

  // 3. MONITOR DO FORNO (FORNÔMETRO DE PÃO FRANCÊS ÀS 06h e 17h)
  function updateFornometro() {
    const now = new Date();
    
    // Atualiza relógio digital de controle
    const formattedHour = String(now.getHours()).padStart(2, '0');
    const formattedMin = String(now.getMinutes()).padStart(2, '0');
    const formattedSec = String(now.getSeconds()).padStart(2, '0');
    if (currentClockSpan) {
      currentClockSpan.textContent = `${formattedHour}:${formattedMin}:${formattedSec}`;
    }

    // Calcula os alvos de hoje: 06:00 e 17:00
    const targetA = new Date();
    targetA.setHours(6, 0, 0, 0);

    const targetB = new Date();
    targetB.setHours(17, 0, 0, 0);

    let nextTarget = null;
    let isFreshNow = false;

    // Se estivermos dentro da janela de "Pão Quentinho" (ex: até 15 minutos depois do horário da fornada)
    // 06:00 - 06:15 ou 17:00 - 17:15
    const diffFromA = now.getTime() - targetA.getTime();
    const diffFromB = now.getTime() - targetB.getTime();
    
    const minutesAfterA = diffFromA / (1000 * 60);
    const minutesAfterB = diffFromB / (1000 * 60);

    if ((minutesAfterA >= 0 && minutesAfterA <= 15) || (minutesAfterB >= 0 && minutesAfterB <= 15)) {
      isFreshNow = true;
    }

    if (isFreshNow) {
      // Estado Festivo: Fornada saindo agora!
      timerHours.textContent = "00";
      timerMinutes.textContent = "00";
      timerSeconds.textContent = "00";
      fornometroStatusAlert.innerHTML = `
        <span class="text-amberQuente font-bold tracking-wider uppercase inline-flex items-center gap-1 animate-bounce">
          <i data-lucide="flame" class="w-4 h-4"></i> FORNADA QUENTINHA SAINDO AGORA! <i data-lucide="flame" class="w-4 h-4"></i>
        </span><br>
        <span class="text-xs text-cream-250">Corra para buscar seu pão direto do forno!</span>
      `;
      return;
    }

    // Se já passou das 17:00, o próximo é às 06:00 de AMANHÃ
    if (now.getTime() > targetB.getTime()) {
      nextTarget = new Date();
      nextTarget.setDate(now.getDate() + 1);
      nextTarget.setHours(6, 0, 0, 0);
    } 
    // Se passou das 06:00 mas é antes das 17:00, o próximo é às 17:00 de HOJE
    else if (now.getTime() > targetA.getTime()) {
      nextTarget = targetB;
    } 
    // Se é antes das 06:00, o próximo é às 06:00 de HOJE
    else {
      nextTarget = targetA;
    }

    // Calcula diferença de tempo até o próximo lançamento
    const timeDiff = nextTarget.getTime() - now.getTime();
    
    const hrs = Math.floor(timeDiff / (1000 * 60 * 60));
    const mins = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((timeDiff % (1000 * 60)) / 1000);

    // Renderiza nos timers virtuais
    timerHours.textContent = String(hrs).padStart(2, '0');
    timerMinutes.textContent = String(mins).padStart(2, '0');
    timerSeconds.textContent = String(secs).padStart(2, '0');

    // Mensagem descritiva amigável do estado
    if (hrs >= 5) {
      fornometroStatusAlert.textContent = "Nossos padeiros estão preparando os ingredientes e iniciando a massa.";
    } else if (hrs >= 2) {
      fornometroStatusAlert.textContent = "A massa está descansando e crescendo lentamente em nosso fermentador rústico.";
    } else if (hrs >= 1) {
      fornometroStatusAlert.textContent = "Aquecendo os fornos artesanais... O cheiro gostoso está prestes a invadir a rua!";
    } else {
      fornometroStatusAlert.innerHTML = `Pão artesanal sovado e assando. Falta pouquíssimo para sair do forno!`;
    }
  }

  // Roda de imediato e estabelece intervalo a cada 1 segundo
  setInterval(updateFornometro, 1000);
  updateFornometro();


  // 4. VERIFICADOR DE STATUS DE FUNCIONAMENTO (DINÂMICO)
  function checkBusinessStatus() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    
    const currentTimeInMins = currentHour * 60 + currentMin;

    let isOpen = false;
    let scheduleText = "";
    let nextOpeningInfo = "";

    // Horários da padaria:
    // Seg a Sex: 06h-20h (360 a 1200 minutos)
    // Sábado: 06h-19h (360 a 1140 minutos)
    // Domingo: 06h-18h (360 a 1080 minutos)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      scheduleText = "Funcionamento hoje: Segunda a Sexta, 06h - 20h";
      if (currentTimeInMins >= 360 && currentTimeInMins < 1200) {
        isOpen = true;
      }
      nextOpeningInfo = "Abrimos amanhã às 06h00";
    } else if (dayOfWeek === 6) {
      scheduleText = "Funcionamento hoje: Sábado, 06h - 19h";
      if (currentTimeInMins >= 360 && currentTimeInMins < 1140) {
        isOpen = true;
      }
      nextOpeningInfo = "Abrimos amanhã às 06h00";
    } else {
      scheduleText = "Funcionamento hoje: Domingo, 06h - 18h";
      if (currentTimeInMins >= 360 && currentTimeInMins < 1080) {
        isOpen = true;
      }
      nextOpeningInfo = "Abrimos amanhã às 06h00";
    }

    // Atualiza Navbar Desktop Status
    if (isOpen) {
      statusDotDesktop.className = "w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse-glow";
      statusTextDesktop.textContent = "Aberto Agora";
      statusTextDesktop.className = "font-bold text-emerald-800 text-[11px] uppercase tracking-wider";
    } else {
      statusDotDesktop.className = "w-2.5 h-2.5 rounded-full bg-amberQuente";
      statusTextDesktop.textContent = "Fechado";
      statusTextDesktop.className = "font-bold text-amberQuente-dark text-[11px] uppercase tracking-wider";
    }

    // Atualiza Navbar Mobile Status
    if (isOpen) {
      statusDotMobile.className = "w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse";
      statusTextMobile.textContent = "Aberto Agora";
    } else {
      statusDotMobile.className = "w-2.5 h-2.5 rounded-full bg-amberQuente-light";
      statusTextMobile.textContent = "Fechado Agora";
    }

    // Atualiza Card de Funcionamento na Seção Prática
    if (isOpen) {
      liveStatusBadge.className = "inline-flex items-center gap-2 rounded-full py-2.5 px-6 text-sm font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-200/50 shadow-md shadow-emerald-700/5 transition-all hover:scale-105 duration-300";
      liveStatusDot.className = "w-3 h-3 rounded-full bg-emerald-500 animate-pulse";
      liveStatusText.textContent = "ABERTO AGORA";
      liveStatusDesc.innerHTML = `Passe aqui e monte seu café da tarde! <br><span class="text-[10px] text-rustic-light/80 block mt-1">${scheduleText}</span>`;
    } else {
      liveStatusBadge.className = "inline-flex items-center gap-2 rounded-full py-2.5 px-6 text-sm font-bold bg-amber-50 text-amber-800 border border-amber-200/50 shadow-md shadow-amber-900/5 transition-all hover:scale-105 duration-300";
      liveStatusDot.className = "w-3 h-3 rounded-full bg-amberQuente";
      liveStatusText.textContent = "FECHADO AGORA";
      liveStatusDesc.innerHTML = `${nextOpeningInfo}!<br><span class="text-[10px] text-rustic-light/80 block mt-1">${scheduleText}</span>`;
    }
  }

  // Executa e atualiza a cada 30 segundos
  checkBusinessStatus();
  setInterval(checkBusinessStatus, 30000);


  // 5. REGISTRO DE ALERTAS POR E-MAIL (FEEDBACK VISUAL SIMULADO)
  if (alertSubscribeBtn && alertEmailInput) {
    alertSubscribeBtn.addEventListener("click", () => {
      const emailVal = alertEmailInput.value.trim();
      if (!emailVal || !emailVal.includes("@")) {
        alertEmailInput.classList.add("ring-red-500", "border-red-500");
        alertEmailInput.focus();
        setTimeout(() => {
          alertEmailInput.classList.remove("ring-red-500", "border-red-500");
        }, 1500);
        return;
      }

      // Sucesso simulado
      alertFormBox.innerHTML = `
        <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-xl py-2 px-4 shadow-inner text-xs text-emerald-400 font-semibold flex items-center gap-2">
          <i data-lucide="check" class="w-4 h-4"></i> Pronto! Avisaremos você em ${emailVal}
        </div>
      `;
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    });
  }


  // 6. EFEITO REVEAL AO ROLAR A PÁGINA (SCROLL REVEAL ARTISANAL)
  const sectionsToReveal = [
    document.getElementById("destaques-section"),
    document.getElementById("sobre-section"),
    document.getElementById("fornadas-section"),
    document.getElementById("info-section")
  ];

  // Adiciona a classe base de reveal
  sectionsToReveal.forEach(section => {
    if (section) {
      section.classList.add("reveal-on-scroll");
    }
  });

  const observerOptions = {
    root: null,
    threshold: 0.12, // Gatilho dispara quando 12% da seção entra na tela
    rootMargin: "0px"
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-visible");
        observer.unobserve(entry.target); // Deixa de observar para parar animações duplicadas
      }
    });
  }, observerOptions);

  sectionsToReveal.forEach(section => {
    if (section) {
      revealObserver.observe(section);
    }
  });


  // 7. SMOOTH SCALING NO BG DO HERO DURANTE ROLAGEM
  const heroSection = document.getElementById("hero-section");
  const heroBgImg = document.getElementById("hero-bg-img");
  
  if (heroSection && heroBgImg) {
    window.addEventListener("scroll", () => {
      const offsetTop = window.scrollY;
      const heroHeight = heroSection.offsetHeight;
      if (offsetTop <= heroHeight) {
        const scaleVal = 1.05 + (offsetTop / heroHeight) * 0.08;
        heroBgImg.style.transform = `scale(${scaleVal})`;
      }
    });
  }

});
