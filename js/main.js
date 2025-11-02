/* js/main.js
   Central JS for Flow with Dignity site: dynamic campaigns, maps, gallery lightbox,
   modal/contact handling, form validation (enquiry & contact).
   Author: ChatGPT (adapted for your project)
*/

/* ---------------- Dynamic campaigns (used on index.html) ---------------- */
const campaigns = [
  { id: 1, date: '2025-10-07', title: 'Pads Progress drive', location: 'Local schools', desc: 'Distribution of sanitary packs to local primary schools.' },
  { id: 2, date: '2025-12-12', title: 'Holiday donation event', location: 'Community Centre', desc: 'Sponsor a hygiene kit for a girl in need.' }
];

function renderCampaigns(containerId, searchInputId) {
  const container = document.getElementById(containerId);
  if(!container) return;
  const render = (list) => {
    if(!list.length) { container.innerHTML = '<p>No campaigns match your search.</p>'; return; }
    container.innerHTML = '<ul>' + list.map(c => `
      <li>
        <strong>${new Date(c.date).toLocaleDateString(undefined,{day:'2-digit',month:'short',year:'numeric'})}:</strong>
        <span> ${c.title} — ${c.location}</span>
        <p style="margin:.25rem 0">${c.desc}</p>
      </li>
    `).join('') + '</ul>';
  };
  render(campaigns);

  const input = document.getElementById(searchInputId);
  if(!input) return;
  input.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    render(campaigns.filter(c => (c.title + ' ' + c.desc + ' ' + c.location + ' ' + c.date).toLowerCase().includes(q)));
  });
}

/* ---------------- Leaflet map init (index + contact pages) ---------------- */
function initLeaflet(mapId, lat = -26.2041, lng = 28.0473, label = 'Flow with Dignity HQ') {
  const el = document.getElementById(mapId);
  if(!el || typeof L === 'undefined') return;
  try {
    const map = L.map(mapId).setView([lat, lng], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    L.marker([lat,lng]).addTo(map).bindPopup(`<strong>${label}</strong>`).openPopup();
  } catch(e) {
    console.warn('Leaflet map failed to init', e);
  }
}

/* ---------------- Lightbox for galleries ---------------- */
function initLightbox(gallerySelector = '.gallery') {
  const gallery = document.querySelector(gallerySelector);
  if(!gallery) return;
  // create lightbox elements if not present
  let lb = document.getElementById('lightbox');
  if(!lb) {
    lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.className = 'lightbox';
    lb.setAttribute('aria-hidden','true');
    lb.style.display = 'none';
    lb.innerHTML = '<button id="lightboxClose" class="lightbox-close" aria-label="Close image">✕</button><img id="lightboxImage" src="" alt="">';
    document.body.appendChild(lb);
  }
  const lbImg = document.getElementById('lightboxImage');
  const lbClose = document.getElementById('lightboxClose');

  gallery.querySelectorAll('img[data-full]').forEach(img=>{
    img.addEventListener('click', () => {
      lbImg.src = img.dataset.full;
      lbImg.alt = img.alt || '';
      lb.style.display = 'flex';
      lb.setAttribute('aria-hidden','false');
    });
  });
  function close() {
    lb.style.display = 'none';
    lb.setAttribute('aria-hidden','true');
    lbImg.src = '';
  }
  lbClose.addEventListener('click', close);
  lb.addEventListener('click', (e) => { if(e.target === lb) close(); });
  window.addEventListener('keydown', (e) => { if(e.key === 'Escape') close(); });
}

/* ---------------- Modal (quick contact) ---------------- */
function initModal(openSelector, modalId, closeSelector, cancelSelector) {
  const open = document.querySelector(openSelector);
  const modal = document.getElementById(modalId);
  const close = modal ? modal.querySelector(closeSelector) : null;
  const cancel = modal ? modal.querySelector(cancelSelector) : null;
  if(!open || !modal) return;
  function show(){ modal.style.display='flex'; modal.setAttribute('aria-hidden','false'); modal.querySelector('input, textarea')?.focus(); }
  function hide(){ modal.style.display='none'; modal.setAttribute('aria-hidden','true'); }
  open.addEventListener('click', (e)=>{ e.preventDefault(); show(); });
  close?.addEventListener('click', hide);
  cancel?.addEventListener('click', hide);
  window.addEventListener('keydown', (e) => { if(e.key === 'Escape') hide(); });
}

/* ---------------- Contact / enquiry form validation + simulated submit ---------------- */
function initQuickContact(formId, resultId) {
  const form = document.getElementById(formId);
  if(!form) return;
  const result = document.getElementById(resultId);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    result.textContent = '';
    const name = form.querySelector('[name="qname"]')?.value.trim() || '';
    const email = form.querySelector('[name="qemail"]')?.value.trim() || '';
    const message = form.querySelector('[name="qmessage"]')?.value.trim() || '';
    if(name.length<2){ result.style.color='red'; result.textContent='Please enter your name.'; return; }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ result.style.color='red'; result.textContent='Please enter a valid email.'; return; }
    if(message.length<10){ result.style.color='red'; result.textContent='Message must be at least 10 characters.'; return; }

    result.style.color='green'; result.textContent='Sending...';
    // Simulated AJAX send (replace URL with your endpoint)
    setTimeout(()=> {
      result.textContent = 'Thanks! Your message has been received. We will reply to ' + email + ' soon.';
      form.reset();
      setTimeout(()=>{ result.textContent=''; }, 3000);
    }, 900);
  });
}

function initContactPageForm(formId, resultId) {
  // Contact page uses mailto fallback or Formspree; this is a Formspree example placeholder
  const form = document.getElementById(formId);
  const result = document.getElementById(resultId);
  if(!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    result.textContent = '';
    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const subject = form.querySelector('[name="subject"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();
    if(!name || !email || !subject || message.length < 10) {
      result.style.color='red'; result.textContent = 'Please complete all fields and ensure message is long enough.';
      return;
    }
    result.style.color='green'; result.textContent = 'Sending...';
    // Replace following block with real POST to your endpoint.
    setTimeout(()=>{ result.textContent = 'Message sent — thank you!'; form.reset(); }, 900);
  });
}

/* ---------------- Utility: share action ---------------- */
function initShare(selector) {
  const el = document.querySelector(selector);
  if(!el) return;
  el.addEventListener('click', (e) => {
    e.preventDefault();
    const shareData = { title: 'Flow with Dignity', text: 'Support Flow with Dignity — helping girls manage their periods with dignity.', url: location.href };
    if(navigator.share) navigator.share(shareData).catch(()=>alert('Share failed.'));
    else navigator.clipboard?.writeText(location.href).then(()=>alert('Link copied to clipboard.'));
  });
}

/* ---------------- Export functions for pages to call ---------------- */
window.FlowSite = {
  renderCampaigns,
  initLeaflet,
  initLightbox,
  initModal,
  initQuickContact,
  initContactPageForm,
  initShare
};
