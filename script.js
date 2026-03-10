// Navigation et gestion des sections

function initializeHamburgerMenu() {
  const hamburgerToggle = document.querySelector('.hamburger-toggle');
  const sidebar = document.querySelector('.sidebar');

  if (!hamburgerToggle || !sidebar) return;

  hamburgerToggle.addEventListener('click', function() {
    this.classList.toggle('active');
    sidebar.classList.toggle('open');
  });

  const sidebarLinks = sidebar.querySelectorAll('a');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', function() {
      hamburgerToggle.classList.remove('active');
      sidebar.classList.remove('open');
    });
  });

  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.addEventListener('click', function() {
      hamburgerToggle.classList.remove('active');
      sidebar.classList.remove('open');
    });
  }
}

function clearLegacyDisplayStyles() {
  document.querySelectorAll('.content-section, .subsection').forEach(element => {
    element.style.removeProperty('display');
  });
}

function activateFirstSubsectionInSection(sectionCode) {
  const contentSection = document.getElementById('content-' + sectionCode);
  if (!contentSection) return;

  const subsections = contentSection.querySelectorAll('.subsection');
  subsections.forEach(sub => sub.classList.remove('active'));

  const firstSubsection = subsections[0];
  if (firstSubsection) firstSubsection.classList.add('active');

  const links = document.querySelectorAll('#section-' + sectionCode + '-subs .sidebar-link');
  links.forEach(link => link.classList.remove('active'));
  const firstLink = links[0];
  if (firstLink) firstLink.classList.add('active');
}

function activateSection(sectionCode) {
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

  activateFirstSubsectionInSection(sectionCode);
}

function activateSubsection(subsectionCode, withScroll = true) {
  const sectionCode = subsectionCode.substring(0, 2);
  activateSection(sectionCode);

  const contentSection = document.getElementById('content-' + sectionCode);
  if (!contentSection) return;

  const targetSubsection = document.getElementById('content-' + subsectionCode);
  const allSubsections = contentSection.querySelectorAll('.subsection');
  allSubsections.forEach(sub => sub.classList.remove('active'));

  if (targetSubsection) {
    targetSubsection.classList.add('active');
    if (withScroll) targetSubsection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    const firstSubsection = allSubsections[0];
    if (firstSubsection) firstSubsection.classList.add('active');
  }

  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  sidebarLinks.forEach(link => link.classList.remove('active'));
  const selectedLink = document.querySelector('.sidebar-link[data-subsection="' + subsectionCode + '"]');
  if (selectedLink) selectedLink.classList.add('active');
}

function initializeSidebarNavigation() {
  const sidebarHeadlines = document.querySelectorAll('.sidebar-headline');

  sidebarHeadlines.forEach(headline => {
    headline.addEventListener('click', function(e) {
      e.preventDefault();

      const sectionCode = this.getAttribute('data-section');
      activateSection(sectionCode);
      // save first subsection of that section
      const firstLink = document.querySelector('#section-' + sectionCode + '-subs .sidebar-link');
      if (firstLink) localStorage.setItem('fks-subsection', firstLink.getAttribute('data-subsection'));

      if (window.innerWidth < 900) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.remove('open');
      }

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
      activateSubsection(subsectionCode, true);
      localStorage.setItem('fks-subsection', subsectionCode);

      if (window.innerWidth < 900) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.remove('open');
      }
    });
  });
}

document.addEventListener('click', function(e) {
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.querySelector('.hamburger-toggle');
  if (window.innerWidth < 900 && sidebar) {
    if (!sidebar.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
      sidebar.classList.remove('open');
    }
  }
});

document.addEventListener('DOMContentLoaded', function() {
  initializeHamburgerMenu();
  clearLegacyDisplayStyles();
  initializeSidebarNavigation();
  initializeSubsectionNavigation();

  // Restaure la dernière position ou démarre sur 01-01
  const saved = localStorage.getItem('fks-subsection');
  if (saved && document.querySelector('.sidebar-link[data-subsection="' + saved + '"]')) {
    activateSubsection(saved, false);
  } else {
    activateSection('01');
    activateSubsection('01-01', false);
  }
});
