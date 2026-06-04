const toggle = document.querySelector('.nav-toggle');
const nav    = document.querySelector('.main-nav');

toggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('active');
  toggle.setAttribute('aria-expanded', isOpen);
});
