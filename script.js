/* =========================================================
   Cabañas Cara Carü — interacciones
   ========================================================= */

// WhatsApp oficial de Cabañas Cara Carü
const WHATSAPP = "56993262121";

const waLink = (texto = "¡Hola! Quisiera información sobre las Cabañas Cara Carü 🌿") =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;

document.getElementById("waFloat").href = waLink();
document.getElementById("waDirect").href = waLink();
document.getElementById("waLabel").textContent =
  "+" + WHATSAPP.replace(/^(\d{2})(\d)(\d{4})(\d{4})$/, "$1 $2 $3 $4");
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Navegación ---------- */
const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");

const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", open);
  document.body.style.overflow = open ? "hidden" : "";
});
document.querySelectorAll("#navLinks a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  })
);

/* ---------- Slider del hero ---------- */
const slides = [...document.querySelectorAll(".hero__slide")];
const dotsWrap = document.getElementById("heroDots");
let current = 0;
let timer;

slides.forEach((_, i) => {
  const b = document.createElement("button");
  b.setAttribute("aria-label", `Foto ${i + 1}`);
  b.addEventListener("click", () => { goTo(i); restart(); });
  dotsWrap.appendChild(b);
});
const dots = [...dotsWrap.children];

function goTo(i) {
  slides[current].classList.remove("is-active");
  dots[current].classList.remove("is-active");
  current = (i + slides.length) % slides.length;
  slides[current].classList.add("is-active");
  dots[current].classList.add("is-active");
}
function restart() {
  clearInterval(timer);
  timer = setInterval(() => goTo(current + 1), 6000);
}
dots[0].classList.add("is-active");
restart();

/* ---------- Parallax suave del banner ---------- */
const banner = document.querySelector(".banner");
const bannerBg = document.querySelector(".banner__bg");
const parallax = () => {
  const r = banner.getBoundingClientRect();
  if (r.bottom < 0 || r.top > innerHeight) return;
  const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; // -1 … 1
  bannerBg.style.transform = `translateY(${p * -60}px)`;
};
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  window.addEventListener("scroll", () => requestAnimationFrame(parallax), { passive: true });
  parallax();
}

/* ---------- Aparición al hacer scroll ---------- */
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    }),
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 3) * 90}ms`;
  io.observe(el);
});

/* ---------- Galería / Lightbox ---------- */
const items = [...document.querySelectorAll("#gallery .g")];
const lb = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCap = document.getElementById("lbCap");
let lbIndex = 0;

function openLb(i) {
  lbIndex = (i + items.length) % items.length;
  const img = items[lbIndex].querySelector("img");
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lbCap.textContent = items[lbIndex].querySelector("figcaption").textContent;
  lb.hidden = false;
  document.body.style.overflow = "hidden";
}
function closeLb() {
  lb.hidden = true;
  document.body.style.overflow = "";
}
items.forEach((fig, i) => fig.addEventListener("click", () => openLb(i)));
document.getElementById("lbClose").addEventListener("click", closeLb);
document.getElementById("lbPrev").addEventListener("click", () => openLb(lbIndex - 1));
document.getElementById("lbNext").addEventListener("click", () => openLb(lbIndex + 1));
lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
document.addEventListener("keydown", (e) => {
  if (lb.hidden) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowLeft") openLb(lbIndex - 1);
  if (e.key === "ArrowRight") openLb(lbIndex + 1);
});

// deslizar con el dedo en el lightbox
let touchX = null;
lb.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
lb.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) openLb(lbIndex + (dx < 0 ? 1 : -1));
  touchX = null;
});

/* ---------- Formulario de reserva → WhatsApp ---------- */
const form = document.getElementById("bookingForm");
const errorBox = document.getElementById("formError");
const llegada = form.llegada;
const salida = form.salida;

const hoy = new Date().toISOString().split("T")[0];
llegada.min = hoy;
salida.min = hoy;
llegada.addEventListener("change", () => {
  salida.min = llegada.value || hoy;
  if (salida.value && salida.value <= llegada.value) salida.value = "";
});

const fmt = (iso) => iso.split("-").reverse().join("/");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  errorBox.textContent = "";
  form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));

  const faltan = ["nombre", "llegada", "salida"].filter((n) => !form[n].value.trim());
  if (faltan.length) {
    faltan.forEach((n) => form[n].classList.add("is-invalid"));
    errorBox.textContent = "Por favor completa tu nombre y las fechas.";
    return;
  }
  if (salida.value <= llegada.value) {
    salida.classList.add("is-invalid");
    errorBox.textContent = "La fecha de salida debe ser posterior a la de llegada.";
    return;
  }

  const noches = Math.round((new Date(salida.value) - new Date(llegada.value)) / 86400000);
  const msg = [
    `¡Hola! Soy ${form.nombre.value.trim()} y quiero consultar en Cabañas Cara Carü 🌿`,
    ``,
    `📌 Motivo: ${form.tipo.value}`,
    `📅 Fechas: ${fmt(llegada.value)} al ${fmt(salida.value)} (${noches} noche${noches > 1 ? "s" : ""})`,
    `👥 Asistentes: ${form.adultos.value} adultos · ${form.ninos.value} niños`,
    form.mensaje.value.trim() ? `💬 Detalle: ${form.mensaje.value.trim()}` : "",
  ].filter((linea, i) => i === 1 || linea).join("\n");

  window.open(waLink(msg), "_blank", "noopener");
});
