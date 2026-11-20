/* ---------- أدوات ---------- */
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

/* ---------- قائمة الموبايل ---------- */
function mobile() {
  const b = document.querySelector('.mobile-menu'),
    n = document.querySelector('.nav');

  if (!b || !n) return;

  b.addEventListener('click', () => n.classList.toggle('mobile-open'));

  n.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => n.classList.remove('mobile-open'))
  );
}

/* ---------- بحث وفلترة الصفوف ---------- */
function search() {
  const s = document.getElementById('courseSearch'),
    g = document.getElementById('gradeFilter');

  if (!s || !g) return;

  const cards = [...document.querySelectorAll('.searchable')],
    empty = document.getElementById('noResults');

  const f = () => {
    const q = s.value.trim().toLowerCase(),
      v = g.value;

    let shown = 0;

    cards.forEach(c => {
      const ok =
        c.textContent.toLowerCase().includes(q) &&
        (!v || c.dataset.grade === v);

      c.style.display = ok ? '' : 'none';

      if (ok) shown++;
    });

    if (empty) empty.hidden = shown > 0;
  };

  s.addEventListener('input', f);
  g.addEventListener('change', f);
}

/* ---------- صفحة الصف الدراسي (ملفات PDF) ---------- */
function gradePage() {
  const list = document.getElementById('chapterList');

  if (!list || !window.LIBRARY) return;

  const key = new URLSearchParams(location.search).get('grade'),
    id = LIBRARY[key] ? key : 'third',
    g = LIBRARY[id];

  const chaptersCount = g.terms.reduce((n, t) => n + t.chapters.length, 0),
    filesCount = g.terms.reduce(
      (n, t) => n + t.chapters.reduce((m, c) => m + c.pdfs.length, 0),
      0
    );

  document.title = g.title + ' | البروف';

  document.getElementById('gradeEyebrow').textContent =
    g.subject + ' • ' + g.grade;
  document.getElementById('gradeTitle').textContent = g.title;
  document.getElementById('gradeDesc').textContent = g.desc;
  document.getElementById('gradeChapters').textContent = chaptersCount;
  document.getElementById('gradeFiles').textContent = filesCount;

  /* الصفوف التانية */
  document.getElementById('otherGrades').innerHTML = Object.keys(LIBRARY)
    .filter(k => k !== id)
    .map(
      k =>
        `<a class="btn ghost full" href="course.html?grade=${k}">${esc(
          LIBRARY[k].title
        )}</a>`
    )
    .join('');

  /* الفصول */
  const pdfRow = p =>
    p.file
      ? `<div class="lesson-row">
           <span class="lesson-number">📄</span>
           <div><b>${esc(p.title)}</b><small>ملف PDF</small></div>
           <div class="pdf-actions">
             <a class="btn ghost small" href="${esc(p.file)}" target="_blank" rel="noopener">عرض</a>
             <a class="btn primary small" href="${esc(p.file)}" download>تحميل</a>
           </div>
         </div>`
      : `<div class="lesson-row locked">
           <span class="lesson-number">📄</span>
           <div><b>${esc(p.title)}</b><small>ملف PDF</small></div>
           <em>قريبًا</em>
         </div>`;

  const showTerm = i => {
    const t = g.terms[i];

    list.innerHTML = t.chapters
      .map(
        (c, n) => `<div class="unit">
          <div class="unit-title">
            <span>${esc(t.name)}</span>
            <h2>${esc(c.title)}</h2>
            <small>${c.pdfs.length} ملفات</small>
          </div>
          ${c.pdfs.map(pdfRow).join('')}
        </div>`
      )
      .join('');
  };

  /* تبويبات الترمين (تظهر بس لو في أكتر من ترم) */
  const tabs = document.getElementById('termTabs');

  if (g.terms.length > 1) {
    tabs.innerHTML = g.terms
      .map(
        (t, i) =>
          `<button type="button" class="tab${i ? '' : ' active'}" data-term="${i}">${esc(
            t.name
          )}</button>`
      )
      .join('');

    tabs.addEventListener('click', e => {
      const b = e.target.closest('.tab');

      if (!b) return;

      tabs.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      b.classList.add('active');

      showTerm(+b.dataset.term);
    });
  } else {
    tabs.innerHTML = `<button type="button" class="tab active">${esc(
      g.terms[0].name
    )}</button>`;
  }

  showTerm(0);
}

/* ---------- الذرة ثلاثية الأبعاد ---------- */
function atom(id) {
  const el = document.getElementById(id);

  if (!el || !window.THREE) return null;

  let r;

  try {
    r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (err) {
    return null; // الجهاز مش بيدعم WebGL
  }

  const w = () => el.clientWidth || 300,
    h = () => el.clientHeight || 300;

  const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(45, w() / h(), 0.1, 100);

  camera.position.set(0, 0, 7);

  r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  r.setSize(w(), h());

  el.appendChild(r.domElement);

  const group = new THREE.Group();

  scene.add(group);

  const red = new THREE.MeshStandardMaterial({
      color: 0xe52e56,
      metalness: 0.35,
      roughness: 0.22
    }),
    blue = new THREE.MeshStandardMaterial({
      color: 0x087cff,
      metalness: 0.4,
      roughness: 0.2
    });

  for (let i = 0; i < 36; i++) {
    const a = i * 2.39996,
      rad = 0.3 + (i % 6) * 0.09,
      m = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 16, 16),
        i % 2 ? red : blue
      );

    m.position.set(
      Math.cos(a) * rad,
      Math.sin(a * 1.7) * 0.42,
      Math.sin(a) * rad
    );

    group.add(m);
  }

  const em = new THREE.MeshStandardMaterial({
    color: 0x25a8ff,
    emissive: 0x075dff,
    emissiveIntensity: 3
  });

  for (let i = 0; i < 4; i++) {
    const pts = [];

    for (let j = 0; j <= 100; j++) {
      const a = (j / 100) * Math.PI * 2;

      pts.push(new THREE.Vector3(Math.cos(a) * 2.2, 0, Math.sin(a) * 1.2));
    }

    const line = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({
        color: 0x1590ff,
        transparent: true,
        opacity: 0.9
      })
    );

    line.rotation.x = 0.25 + i * 0.38;
    line.rotation.z = i * 0.5;

    group.add(line);

    const e = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), em);

    e.userData = {
      a: i * 1.57,
      s: 0.012 + i * 0.002,
      rx: 2.2,
      rz: 1.2,
      rxr: line.rotation.x,
      rzr: line.rotation.z
    };

    group.add(e);
  }

  scene.add(new THREE.AmbientLight(0x7db6ff, 1.8));

  const l = new THREE.PointLight(0x178cff, 30, 20);
  l.position.set(3, 3, 4);
  scene.add(l);

  const rl = new THREE.PointLight(0xff174f, 10, 10);
  rl.position.set(-3, 1, 2);
  scene.add(rl);

  /* السحب بالماوس / اللمس
     (اتصلّح: كان بيستخدم window.onpointerup فبتتكتب فوق بعضها لما يبقى في أكتر من ذرة) */
  let drag = false,
    last = 0;

  el.addEventListener('pointerdown', e => {
    drag = true;
    last = e.clientX;
  });

  const stopDrag = () => (drag = false);

  window.addEventListener('pointerup', stopDrag);
  window.addEventListener('pointercancel', stopDrag);

  el.addEventListener('pointermove', e => {
    if (!drag) return;

    group.rotation.y += (e.clientX - last) * 0.008;
    last = e.clientX;
  });

  const resize = () => {
    camera.aspect = w() / h();
    camera.updateProjectionMatrix();
    r.setSize(w(), h());
  };

  window.addEventListener('resize', resize);

  const axisY = new THREE.Vector3(0, 1, 0),
    axisX = new THREE.Vector3(1, 0, 0);

  let raf = 0,
    running = true;

  function loop() {
    if (!running) return;

    raf = requestAnimationFrame(loop);

    group.rotation.y += 0.0025;
    group.rotation.x = Math.sin(Date.now() * 0.00035) * 0.07;

    group.children.forEach(o => {
      if (!o.userData.s) return;

      o.userData.a += o.userData.s;

      const a = o.userData.a;

      o.position.set(
        Math.cos(a) * o.userData.rx,
        Math.sin(a * 1.7) * 0.55,
        Math.sin(a) * o.userData.rz
      );

      o.position.applyAxisAngle(axisY, o.userData.rzr);
      o.position.applyAxisAngle(axisX, o.userData.rxr);
    });

    r.render(scene, camera);
  }

  loop();

  /* دالة إيقاف (بتتنده لما شاشة التحميل تختفي عشان نوفر أداء) */
  return () => {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointerup', stopDrag);
    window.removeEventListener('pointercancel', stopDrag);
    r.dispose();
  };
}

/* ---------- شاشة التحميل ---------- */
function loader() {
  const x = document.getElementById('loader');

  if (!x) return;

  const stopAtom = atom('atom-loader');

  const bar = document.getElementById('load-bar'),
    num = document.getElementById('load-number');

  let p = 0;

  const t = setInterval(() => {
    p += Math.floor(Math.random() * 6) + 2;

    if (p >= 100) {
      p = 100;

      clearInterval(t);

      setTimeout(() => {
        x.classList.add('loader-hide');
        document.body.classList.remove('loading');

        setTimeout(() => {
          if (stopAtom) stopAtom();
          x.remove();
        }, 900);
      }, 450);
    }

    if (bar) bar.style.width = p + '%';
    if (num) num.textContent = p + '%';
  }, 90);
}

document.addEventListener('DOMContentLoaded', () => {
  mobile();
  search();
  gradePage();

  ['atom-home', 'atom-about'].forEach(atom);

  loader();
});
