const GUIDE_START_SUBSECTION = '01-01';
const GUIDE_STORAGE_KEY = 'fks-last-subsection';
let guideSearchIndex = [];
let newsletterAdminConfigPromise;

function loadNewsletterAdminConfig() {
  if (newsletterAdminConfigPromise) return newsletterAdminConfigPromise;

  newsletterAdminConfigPromise = fetch('newsletter-admin.json', { cache: 'no-store' })
    .then(function(response) {
      if (!response.ok) throw new Error('admin config unavailable');
      return response.json();
    })
    .catch(function() {
      return {
        brevoSubscriptionFormUrl: '',
        enabled: true
      };
    });

  return newsletterAdminConfigPromise;
}

function closeMobileSidebar() {
  if (window.innerWidth >= 900) return;

  const sidebar = document.querySelector('.sidebar');
  const hamburgerToggle = document.querySelector('.hamburger-toggle');

  if (sidebar) sidebar.classList.remove('open');
  document.body.classList.remove('sidebar-open');

  if (hamburgerToggle) {
    hamburgerToggle.classList.remove('active');
    hamburgerToggle.setAttribute('aria-expanded', 'false');
  }
}

function initializeHamburgerMenu() {
  const hamburgerToggle = document.querySelector('.hamburger-toggle');
  const sidebar = document.querySelector('.sidebar');

  if (!hamburgerToggle || !sidebar) return;

  const syncMenuState = (isOpen) => {
    hamburgerToggle.classList.toggle('active', isOpen);
    hamburgerToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    sidebar.classList.toggle('open', isOpen);
    document.body.classList.toggle('sidebar-open', isOpen && window.innerWidth < 900);
  };

  hamburgerToggle.addEventListener('click', function() {
    syncMenuState(!sidebar.classList.contains('open'));
  });

  const sidebarLinks = sidebar.querySelectorAll('a');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', function() {
      syncMenuState(false);
    });
  });

  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.addEventListener('click', function() {
      syncMenuState(false);
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') syncMenuState(false);
  });

  window.addEventListener('resize', function() {
    if (window.innerWidth >= 900) {
      document.body.classList.remove('sidebar-open');
      hamburgerToggle.classList.remove('active');
      hamburgerToggle.setAttribute('aria-expanded', 'false');
      sidebar.classList.remove('open');
    }
  });
}

function clearLegacyDisplayStyles() {
  document.querySelectorAll('.content-section, .subsection').forEach(element => {
    element.style.removeProperty('display');
  });
}

function getSectionTitle(sectionCode) {
  const headline = document.querySelector('.sidebar-headline[data-section="' + sectionCode + '"] .sidebar-title');
  return headline ? headline.textContent.trim() : '';
}

function getSubsectionTitle(subsectionCode) {
  const link = document.querySelector('.sidebar-link[data-subsection="' + subsectionCode + '"]');
  if (link) return link.textContent.trim();

  const subsection = document.getElementById('content-' + subsectionCode);
  const heading = subsection ? subsection.querySelector('h2') : null;
  return heading ? heading.textContent.trim() : '';
}

function saveLastSubsection(subsectionCode) {
  localStorage.setItem(GUIDE_STORAGE_KEY, subsectionCode);
  updateResumeButton();
}

function getSavedSubsection() {
  return localStorage.getItem(GUIDE_STORAGE_KEY);
}

function clearSavedSubsection() {
  localStorage.removeItem(GUIDE_STORAGE_KEY);
  updateResumeButton();
}

function updateBreadcrumb(subsectionCode) {
  const breadcrumb = document.getElementById('active-breadcrumb');
  if (!breadcrumb || !subsectionCode) return;

  const sectionCode = subsectionCode.substring(0, 2);
  const sectionTitle = getSectionTitle(sectionCode);
  const subsectionTitle = getSubsectionTitle(subsectionCode);
  breadcrumb.textContent = subsectionTitle
    ? sectionCode + ' — ' + sectionTitle + ' / ' + subsectionTitle
    : sectionCode + ' — ' + sectionTitle;
}

function setActiveSidebarLink(subsectionCode) {
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  sidebarLinks.forEach(link => link.classList.remove('active'));

  const selectedLink = document.querySelector('.sidebar-link[data-subsection="' + subsectionCode + '"]');
  if (selectedLink) selectedLink.classList.add('active');
}

function activateFirstSubsectionInSection(sectionCode, persist = true) {
  const contentSection = document.getElementById('content-' + sectionCode);
  if (!contentSection) return;

  const subsections = contentSection.querySelectorAll('.subsection');
  subsections.forEach(sub => sub.classList.remove('active'));

  const firstSubsection = subsections[0];
  if (!firstSubsection) return;

  firstSubsection.classList.add('active');

  const subsectionCode = firstSubsection.id.replace('content-', '');
  setActiveSidebarLink(subsectionCode);
  updateBreadcrumb(subsectionCode);
  if (persist) saveLastSubsection(subsectionCode);
}

function activateSection(sectionCode, persist = true) {
  const sidebarHeadlines = document.querySelectorAll('.sidebar-headline');
  const contentSections = document.querySelectorAll('.content-section');
  const sidebarSubsections = document.querySelectorAll('.sidebar-subsections');

  sidebarHeadlines.forEach(headline => headline.classList.remove('active'));
  contentSections.forEach(section => section.classList.remove('active'));
  sidebarSubsections.forEach(container => container.classList.remove('visible'));

  const selectedHeadline = document.querySelector('.sidebar-headline[data-section="' + sectionCode + '"]');
  const selectedSection = document.getElementById('content-' + sectionCode);
  const selectedSubContainer = document.getElementById('section-' + sectionCode + '-subs');

  if (selectedHeadline) selectedHeadline.classList.add('active');
  if (selectedSection) selectedSection.classList.add('active');
  if (selectedSubContainer) selectedSubContainer.classList.add('visible');

  activateFirstSubsectionInSection(sectionCode, persist);
}

function activateSubsection(subsectionCode, withScroll = true, persist = true) {
  const sectionCode = subsectionCode.substring(0, 2);
  const sidebarHeadlines = document.querySelectorAll('.sidebar-headline');
  const contentSections = document.querySelectorAll('.content-section');
  const sidebarSubsections = document.querySelectorAll('.sidebar-subsections');

  sidebarHeadlines.forEach(headline => headline.classList.remove('active'));
  contentSections.forEach(section => section.classList.remove('active'));
  sidebarSubsections.forEach(container => container.classList.remove('visible'));

  const selectedHeadline = document.querySelector('.sidebar-headline[data-section="' + sectionCode + '"]');
  const selectedSection = document.getElementById('content-' + sectionCode);
  const selectedSubContainer = document.getElementById('section-' + sectionCode + '-subs');

  if (selectedHeadline) selectedHeadline.classList.add('active');
  if (selectedSection) selectedSection.classList.add('active');
  if (selectedSubContainer) selectedSubContainer.classList.add('visible');

  const contentSection = document.getElementById('content-' + sectionCode);
  if (!contentSection) return;

  const targetSubsection = document.getElementById('content-' + subsectionCode);
  const allSubsections = contentSection.querySelectorAll('.subsection');
  allSubsections.forEach(sub => sub.classList.remove('active'));

  if (targetSubsection) {
    targetSubsection.classList.add('active');
    if (withScroll) {
      targetSubsection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } else {
    const firstSubsection = allSubsections[0];
    if (firstSubsection) firstSubsection.classList.add('active');
  }

  setActiveSidebarLink(subsectionCode);
  updateBreadcrumb(subsectionCode);
  if (persist) saveLastSubsection(subsectionCode);
}

function handleGuideNavigationState(sectionId, subsectionId, options = {}) {
  const subsectionCode = subsectionId || sectionId + '-01';
  activateSubsection(subsectionCode, options.withScroll !== false, options.persist !== false);
}

function updateResumeButton() {
  const resumeBtn = document.getElementById('resume-reading-btn');
  if (!resumeBtn) return;

  const saved = getSavedSubsection();
  const shouldShow = Boolean(saved && saved !== GUIDE_START_SUBSECTION);
  resumeBtn.hidden = !shouldShow;

  if (shouldShow) {
    resumeBtn.textContent = 'Reprendre : ' + getSubsectionTitle(saved);
  }
}

function initializeSidebarNavigation() {
  const sidebarHeadlines = document.querySelectorAll('.sidebar-headline');

  sidebarHeadlines.forEach(headline => {
    headline.addEventListener('click', function(e) {
      e.preventDefault();

      const sectionCode = this.getAttribute('data-section');
      const selectedSubContainer = document.getElementById('section-' + sectionCode + '-subs');
      const isExpanded = this.classList.contains('active')
        && selectedSubContainer
        && selectedSubContainer.classList.contains('visible');

      // Toggle collapse on second click of an already open section.
      if (isExpanded) {
        this.classList.remove('active');
        selectedSubContainer.classList.remove('visible');
        return;
      }

      activateSection(sectionCode, true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function initializeSubsectionNavigation() {
  const sidebarLinks = document.querySelectorAll('.sidebar-link');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const subsectionCode = this.getAttribute('data-subsection');
      activateSubsection(subsectionCode, true, true);
      closeMobileSidebar();
    });
  });
}

function initializeReadingActions() {
  const resumeBtn = document.getElementById('resume-reading-btn');
  const resetBtn = document.getElementById('reset-reading-btn');
  const printBtn = document.getElementById('print-section-btn');

  if (resumeBtn) {
    resumeBtn.addEventListener('click', function() {
      const saved = getSavedSubsection();
      if (saved) activateSubsection(saved, true, true);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      clearSavedSubsection();
      activateSubsection(GUIDE_START_SUBSECTION, true, false);
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', function() {
      window.print();
    });
  }
}

function buildSearchIndex() {
  guideSearchIndex = Array.from(document.querySelectorAll('.content-section .subsection')).map(subsection => {
    const subsectionCode = subsection.id.replace('content-', '');
    const sectionCode = subsectionCode.substring(0, 2);
    const title = subsection.querySelector('h2') ? subsection.querySelector('h2').textContent.trim() : subsectionCode;
    const text = subsection.innerText.replace(/\s+/g, ' ').trim();

    return {
      subsectionCode,
      sectionCode,
      title,
      sectionTitle: getSectionTitle(sectionCode),
      text,
      haystack: (title + ' ' + getSectionTitle(sectionCode) + ' ' + text).toLowerCase()
    };
  });
}

function scoreSearchEntry(entry, tokens) {
  let score = 0;

  tokens.forEach(token => {
    if (entry.title.toLowerCase().includes(token)) score += 8;
    if (entry.sectionTitle.toLowerCase().includes(token)) score += 5;

    const matches = entry.haystack.split(token).length - 1;
    score += matches;
  });

  return score;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightMatch(text, tokens) {
  let highlighted = text;
  tokens.forEach(token => {
    if (!token) return;
    const pattern = new RegExp('(' + escapeRegExp(token) + ')', 'ig');
    highlighted = highlighted.replace(pattern, '<mark>$1</mark>');
  });
  return highlighted;
}

function renderSearchResults(query) {
  const resultsBox = document.getElementById('guide-search-results');
  if (!resultsBox) return;

  const cleaned = query.trim().toLowerCase();
  if (!cleaned) {
    resultsBox.hidden = true;
    resultsBox.innerHTML = '';
    return;
  }

  const tokens = cleaned.split(/\s+/).filter(Boolean);
  const results = guideSearchIndex
    .map(entry => ({ entry, score: scoreSearchEntry(entry, tokens) }))
    .filter(item => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 6);

  if (!results.length) {
    resultsBox.hidden = false;
    resultsBox.innerHTML = '<div class="guide-search-result"><span class="guide-search-result-title">Aucun résultat direct</span><span class="guide-search-result-text">Essayez avec un mot-clé plus simple : lead, foyer, Outlook, facture...</span></div>';
    return;
  }

  resultsBox.hidden = false;
  resultsBox.innerHTML = results.map(item => {
    const excerpt = item.entry.text.slice(0, 130) + (item.entry.text.length > 130 ? '...' : '');
    const title = item.entry.sectionCode + ' — ' + item.entry.sectionTitle + ' / ' + item.entry.title;
    return [
      '<button type="button" class="guide-search-result" data-subsection="',
      item.entry.subsectionCode,
      '">',
      '<span class="guide-search-result-title">',
      highlightMatch(title, tokens),
      '</span>',
      '<span class="guide-search-result-text">',
      highlightMatch(excerpt, tokens),
      '</span>',
      '</button>'
    ].join('');
  }).join('');

  resultsBox.querySelectorAll('.guide-search-result[data-subsection]').forEach(button => {
    button.addEventListener('click', function() {
      const subsectionCode = this.getAttribute('data-subsection');
      activateSubsection(subsectionCode, true, true);
      resultsBox.hidden = true;
      resultsBox.innerHTML = '';
    });
  });
}

function initializeSearch() {
  const input = document.getElementById('guide-search-input');
  const clearBtn = document.getElementById('guide-search-clear');
  const resultsBox = document.getElementById('guide-search-results');

  if (!input || !clearBtn || !resultsBox) return;

  buildSearchIndex();

  input.addEventListener('input', function() {
    renderSearchResults(this.value);
  });

  input.addEventListener('keydown', function(event) {
    const buttons = Array.from(resultsBox.querySelectorAll('.guide-search-result[data-subsection]'));
    const currentIndex = buttons.findIndex(button => button.classList.contains('guide-search-result-active'));

    if (event.key === 'ArrowDown' && buttons.length) {
      event.preventDefault();
      const nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
      buttons.forEach(button => button.classList.remove('guide-search-result-active'));
      buttons[nextIndex].classList.add('guide-search-result-active');
      buttons[nextIndex].focus();
      return;
    }

    if (event.key === 'ArrowUp' && buttons.length) {
      event.preventDefault();
      const previousIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
      buttons.forEach(button => button.classList.remove('guide-search-result-active'));
      buttons[previousIndex].classList.add('guide-search-result-active');
      buttons[previousIndex].focus();
      return;
    }

    if (event.key === 'Enter') {
      const active = resultsBox.querySelector('.guide-search-result-active[data-subsection]');
      const firstResult = resultsBox.querySelector('.guide-search-result[data-subsection]');
      if (active) active.click();
      else if (firstResult) firstResult.click();
    }
  });

  clearBtn.addEventListener('click', function() {
    input.value = '';
    input.focus();
    renderSearchResults('');
  });

  document.addEventListener('click', function(event) {
    const searchBlock = document.querySelector('.guide-search-block');
    if (searchBlock && !searchBlock.contains(event.target)) {
      resultsBox.hidden = true;
    }
  });
}

function listToClipboardText(list, subsection) {
  const title = subsection.querySelector('h2') ? subsection.querySelector('h2').textContent.trim() : 'Procédure';
  const items = Array.from(list.querySelectorAll('li')).map((item, index) => {
    const value = item.textContent.replace(/\s+/g, ' ').trim();
    if (list.tagName === 'OL') return (index + 1) + '. ' + value;
    return '- ' + value;
  });

  return title + '\n\n' + items.join('\n');
}

function copyText(text, button) {
  const done = () => {
    const original = button.textContent;
    button.textContent = 'Copié';
    setTimeout(function() {
      button.textContent = original;
    }, 1600);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
  done();
}

function initializeCopyButtons() {
  document.querySelectorAll('.subsection').forEach(subsection => {
    const candidateLists = subsection.querySelectorAll('ol, ul');

    candidateLists.forEach(list => {
      if (list.closest('.sidebar') || list.closest('.guide-search-results')) return;
      if (list.querySelectorAll('li').length < 2) return;
      if (list.previousElementSibling && list.previousElementSibling.classList.contains('subsection-list-tools')) return;

      const tools = document.createElement('div');
      tools.className = 'subsection-list-tools';

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-steps-btn';
      button.textContent = 'Copier les étapes';
      button.addEventListener('click', function() {
        copyText(listToClipboardText(list, subsection), button);
      });

      tools.appendChild(button);
      list.parentNode.insertBefore(tools, list);
    });
  });
}

function initializeImageLightbox() {
  const targets = document.querySelectorAll('.quick-visual-card img, .crm-screenshot-wrap img, .crm-step-shot img, .fks-screenshot img');
  if (!targets.length) return;

  const overlay = document.createElement('div');
  overlay.className = 'image-lightbox';
  overlay.hidden = true;
  overlay.innerHTML = [
    '<div class="image-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Agrandissement image">',
    '<button type="button" class="image-lightbox-close" aria-label="Fermer">✕</button>',
    '<img class="image-lightbox-img" alt="">',
    '<div class="image-lightbox-caption"></div>',
    '</div>'
  ].join('');
  document.body.appendChild(overlay);

  const dialog = overlay.querySelector('.image-lightbox-dialog');
  const closeBtn = overlay.querySelector('.image-lightbox-close');
  const lightboxImg = overlay.querySelector('.image-lightbox-img');
  const caption = overlay.querySelector('.image-lightbox-caption');

  let previousActiveElement = null;

  const close = () => {
    overlay.hidden = true;
    lightboxImg.src = '';
    document.body.style.overflow = '';
    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
      previousActiveElement.focus();
    }
  };

  targets.forEach(img => {
    img.addEventListener('click', function() {
      previousActiveElement = img;
      const figure = img.closest('figure');
      const figcaption = figure ? figure.querySelector('figcaption') : null;
      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.alt || '';
      caption.textContent = figcaption ? figcaption.textContent.trim() : (img.alt || '');
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    });
  });

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', function(event) {
    if (!dialog.contains(event.target) || event.target === overlay) {
      close();
    }
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && !overlay.hidden) {
      close();
    }
  });
}

function initializeSmartImageLoading() {
  document.querySelectorAll('img').forEach(img => {
    if (img.closest('.brand-logo')) return;
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
    if (!img.hasAttribute('draggable')) img.setAttribute('draggable', 'false');
  });
}

function initializeReleaseModal() {
  const modal = document.getElementById('release-modal');
  const openBtn = document.getElementById('release-open-modal');
  const closeBtn = document.getElementById('release-close-modal');
  if (!modal || !openBtn || !closeBtn) return;

  const open = () => {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
  };

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);

  modal.addEventListener('click', function(event) {
    if (event.target === modal) close();
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && !modal.hidden) close();
  });
}

function initializeReleaseBadges() {
  const releaseCards = Array.from(document.querySelectorAll('.release-card[data-release-date]'));
  if (!releaseCards.length) return;

  const now = new Date();
  let newCount = 0;

  releaseCards.forEach(card => {
    const rawDate = card.getAttribute('data-release-date');
    if (!rawDate) return;

    const releaseDate = new Date(rawDate + 'T00:00:00');
    if (Number.isNaN(releaseDate.getTime())) return;

    const diffMs = now.getTime() - releaseDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const isNew = diffDays >= 0 && diffDays <= 7;

    if (isNew) newCount += 1;

    card.classList.toggle('release-card-new-highlight', isNew);
    card.querySelectorAll('.release-card-badge').forEach(badge => {
      badge.hidden = !isNew;
    });
  });

  ['release-badge-sidebar', 'release-badge-hero'].forEach(id => {
    const badge = document.getElementById(id);
    if (badge) badge.hidden = newCount === 0;
  });

  const countBadge = document.getElementById('updates-count-badge');
  if (countBadge) {
    countBadge.hidden = newCount === 0;
    countBadge.textContent = String(newCount);
  }
}

function initializeReleaseSubscription() {
  const form = document.getElementById('newsletter-subscribe-form');
  const emailInput = document.getElementById('newsletter-email-input');
  const feedback = document.getElementById('newsletter-subscribe-feedback');
  const btn = document.getElementById('newsletter-subscribe-btn');
  if (!form || !emailInput || !feedback) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const adminConfigPromise = loadNewsletterAdminConfig();

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    if (!emailRegex.test(email)) {
      feedback.textContent = 'Veuillez saisir une adresse email valide.';
      emailInput.focus();
      return;
    }

    if (btn) { btn.disabled = true; btn.textContent = '\u2026'; }

    try {
      const adminConfig = await adminConfigPromise;
      if (adminConfig && adminConfig.enabled === false) {
        feedback.textContent = 'Les inscriptions newsletter sont temporairement desactivees.';
        return;
      }

      const urlFromForm = (form.getAttribute('data-brevo-form-url') || '').trim();
      const urlFromAdmin = adminConfig && adminConfig.brevoSubscriptionFormUrl
        ? String(adminConfig.brevoSubscriptionFormUrl).trim()
        : '';
      const brevoFormUrl = urlFromForm || urlFromAdmin;
      const hasBrevoForm = brevoFormUrl && brevoFormUrl.indexOf('FORM_ID_ICI') === -1;

      if (hasBrevoForm) {
        const body = new URLSearchParams({ EMAIL: email, email_address_check: '', locale: 'fr' });
        await fetch(brevoFormUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
          mode: 'no-cors'
        });
      } else if (window.Brevo && typeof window.Brevo.push === 'function') {
        // Fallback mode if no public Brevo form endpoint is configured yet.
        window.Brevo.push(['identify', { email: email }]);
        window.Brevo.push(['track', 'newsletter_subscribed', { email: email }]);
      } else if (window.sendinblue && typeof window.sendinblue.identify === 'function') {
        window.sendinblue.identify(email);
      } else {
        throw new Error('No subscription connector available');
      }

      feedback.textContent = '\u2713 Inscription enregistr\u00e9e ! Vous recevrez les prochaines mises \u00e0 jour.';
      form.reset();
    } catch (_e) {
      feedback.textContent = 'Erreur. R\u00e9essayez dans un moment.';
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "S'abonner"; }
    }
  });
}

document.addEventListener('click', function(e) {
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.querySelector('.hamburger-toggle');
  if (window.innerWidth < 900 && sidebar) {
    if (!sidebar.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
      sidebar.classList.remove('open');
      document.body.classList.remove('sidebar-open');
      if (toggleBtn) {
        toggleBtn.classList.remove('active');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    }
  }
});

window.handleGuideNavigationState = handleGuideNavigationState;

document.addEventListener('finke:navigation-change', function(event) {
  const detail = event.detail || {};
  if (detail.subsectionCode) {
    activateSubsection(detail.subsectionCode, false, true);
  }
});

document.addEventListener('DOMContentLoaded', function() {
  initializeHamburgerMenu();
  clearLegacyDisplayStyles();
  initializeSidebarNavigation();
  initializeSubsectionNavigation();
  initializeReadingActions();
  initializeSearch();
  initializeCopyButtons();
  initializeImageLightbox();
  initializeSmartImageLoading();
  initializeReleaseModal();
  initializeReleaseBadges();
  initializeReleaseSubscription();

  activateSubsection(GUIDE_START_SUBSECTION, false, false);
  updateResumeButton();
});
