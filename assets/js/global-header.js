(function () {
  const path = window.location.pathname;

const href = (window.location.href || "");
const isWizard = href.includes("create-lesson-wizard.html");


  let isStudentPage =
  path.includes("student-") ||
  path.includes("lezione-test");

  const isStudentContext = (new URLSearchParams(window.location.search)).get('student') === '1';
  isStudentPage = isStudentPage || isStudentContext;

  const isPages = path.includes("/pages/");

  const isTeacherPage =
  (
    !isStudentPage &&
    (
    isWizard ||
    path.includes("teacher-") ||
    path.includes("create-") ||
    path.includes("guida-docenti") ||
    path.includes("crea-lezione") ||
    path.endsWith("home.html") ||
    (path.endsWith("index.html") || path.endsWith("/") || !path.includes("."))
  )) || (isPages && !isStudentContext);


  const header = document.createElement("header");
  header.className = "global-header";

  const basePath = path.includes("/pages/") ? "../" : "";

  let navLinks = "";

  if (isTeacherPage) {
  const homeHref = `${basePath}index.html`;
  const isHomeDocenti = path.endsWith("index.html");
  const homeAttrs =
    `aria-label="Home" title="Home"` +
    (isHomeDocenti ? ' aria-current="page" class="active"' : "");

  navLinks = `
    <a href="${homeHref}" ${homeAttrs}>Home</a>
    <a href="${basePath}teacher-dashboard.html">Dashboard</a>
    <a href="${basePath}guida-docenti.html">Guida</a>
    <a href="${basePath}student-home.html">Vista studenti</a>
  `;
} else if (isStudentPage) {
  navLinks = `
    <a href="${basePath}student-home.html">Home</a>
    <a href="${basePath}index.html">Vista docenti</a>
  `;
} else {
  navLinks = `
    <a href="${basePath}index.html">Home</a>
  `;
}

  const logoLink = isStudentPage
    ? `${basePath}student-home.html`
    : `${basePath}index.html`;

  header.innerHTML = `
    <div class="global-header-content">
      <a href="${logoLink}" class="global-logo">
        <img src="${basePath}assets/brand/logo_edubot_horizontal.png" alt="Logo AI co-tutor">
      </a>
      <nav class="global-nav">
        ${navLinks}
      </nav>
    </div>
  `;

  document.body.insertBefore(header, document.body.firstChild);

  document.body.classList.add("with-global-header");

  function syncGlobalHeaderPadding() {
    // NON applicare nel wizard
    if (document.body.classList.contains('wizard-page')) return;

    const header = document.querySelector('header.global-header');
    if (!header) return;

    const h = header.offsetHeight || 60;
    document.body.style.paddingTop = (h + 4) + 'px'; // +4px tolleranza
  }

  // Sincronizza immediatamente
  syncGlobalHeaderPadding();

  // Aggiorna su resize
  window.addEventListener('resize', syncGlobalHeaderPadding);

  // Aggiorna su cambio orientamento
  window.addEventListener('orientationchange', syncGlobalHeaderPadding);
})();
