
function copyBib() {
  const text = document.getElementById('bib-text').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.copy-btn');
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
  });
}

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Fixed section rail with active-section tracking and a compact mobile menu.
const sectionRail = document.querySelector('.section-rail');
const sectionRailToggle = document.querySelector('.section-rail-toggle');
const sectionRailLinks = [...document.querySelectorAll('.section-rail-link')];
const currentSectionLabel = document.getElementById('current-section-label');
const trackedSections = sectionRailLinks
  .map(link => document.getElementById(link.dataset.section))
  .filter(Boolean);

function setActiveSection(sectionId) {
  sectionRailLinks.forEach(link => {
    const isActive = link.dataset.section === sectionId;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });

  const activeLink = sectionRailLinks.find(link => link.dataset.section === sectionId);
  if (activeLink && currentSectionLabel) {
    currentSectionLabel.textContent = activeLink.textContent.trim();
  }
}

if (sectionRail && sectionRailLinks.length && trackedSections.length) {
  let sectionSyncQueued = false;

  function syncActiveSection() {
    sectionSyncQueued = false;
    const marker = window.innerHeight * 0.38;
    let current = trackedSections[0];

    trackedSections.forEach(section => {
      if (section.getBoundingClientRect().top <= marker) current = section;
    });

    const atPageEnd = window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 4;
    if (atPageEnd) current = trackedSections[trackedSections.length - 1];
    setActiveSection(current.id);
  }

  function queueSectionSync() {
    if (sectionSyncQueued) return;
    sectionSyncQueued = true;
    requestAnimationFrame(syncActiveSection);
  }

  window.addEventListener('scroll', queueSectionSync, { passive: true });
  window.addEventListener('resize', queueSectionSync);
  queueSectionSync();

  sectionRailLinks.forEach(link => {
    link.addEventListener('click', () => {
      setActiveSection(link.dataset.section);
      sectionRail.classList.remove('open');
      sectionRailToggle?.setAttribute('aria-expanded', 'false');
    });
  });
}

sectionRailToggle?.addEventListener('click', () => {
  const isOpen = sectionRail.classList.toggle('open');
  sectionRailToggle.setAttribute('aria-expanded', String(isOpen));
});

document.addEventListener('click', event => {
  if (!sectionRail?.classList.contains('open') || sectionRail.contains(event.target)) return;
  sectionRail.classList.remove('open');
  sectionRailToggle?.setAttribute('aria-expanded', 'false');
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || !sectionRail?.classList.contains('open')) return;
  sectionRail.classList.remove('open');
  sectionRailToggle?.setAttribute('aria-expanded', 'false');
  sectionRailToggle?.focus();
});

// Interactive four-season cover
const seasonCover = document.querySelector('.season-cover');
const seasonScene = document.querySelector('.season-scene');
const seasonPanorama = document.querySelector('.season-panorama');
const seasonName = document.getElementById('season-name');
const seasonDots = [...document.querySelectorAll('.season-dot')];
const seasonCenters = [836, 2008, 3180, 4352];
const performanceInterval = document.getElementById('performance-interval');
const performanceSeries = {
  zeroShot: {
    bar: document.getElementById('score-zero-shot'),
    value: document.getElementById('value-zero-shot')
  },
  accumulated: {
    bar: document.getElementById('score-accumulated'),
    value: document.getElementById('value-accumulated')
  },
  oracle: {
    bar: document.getElementById('score-oracle'),
    value: document.getElementById('value-oracle')
  }
};
const conceptualPerformance = [
  { interval: 'Interval 1', zeroShot: 62, accumulated: 62, oracle: 78 },
  { interval: 'Interval 3', zeroShot: 60, accumulated: 66, oracle: 83 },
  { interval: 'Interval 5', zeroShot: 57, accumulated: 82, oracle: 90 },
  { interval: 'Interval 7', zeroShot: 59, accumulated: 91, oracle: 92 }
];
let activeSeason = 1;
let scoreAnimationFrame = null;

function updatePerformance(index, instant = false) {
  const target = conceptualPerformance[index];
  const keys = ['zeroShot', 'accumulated', 'oracle'];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = instant || reducedMotion ? 0 : 900;

  performanceInterval.textContent = target.interval;
  keys.forEach(key => {
    performanceSeries[key].bar.style.setProperty('--score', target[key]);
  });

  if (scoreAnimationFrame) cancelAnimationFrame(scoreAnimationFrame);

  const starts = Object.fromEntries(keys.map(key => {
    const current = Number.parseFloat(performanceSeries[key].value.textContent.replace(/[^\d.]/g, ''));
    return [key, Number.isFinite(current) ? current : target[key]];
  }));

  if (!duration) {
    keys.forEach(key => {
      performanceSeries[key].value.textContent = `~${target[key]}%`;
    });
    return;
  }

  const startTime = performance.now();
  function animateValues(now) {
    const progress = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);

    keys.forEach(key => {
      const value = starts[key] + ((target[key] - starts[key]) * eased);
      performanceSeries[key].value.textContent = `~${Math.round(value)}%`;
    });

    if (progress < 1) {
      scoreAnimationFrame = requestAnimationFrame(animateValues);
    }
  }
  scoreAnimationFrame = requestAnimationFrame(animateValues);
}

function positionSeason(index, instant = false) {
  if (!seasonPanorama || !seasonPanorama.naturalWidth) return;

  const renderedWidth = seasonPanorama.getBoundingClientRect().width;
  const scale = renderedWidth / seasonPanorama.naturalWidth;
  const centeredX = (seasonScene.clientWidth / 2) - (seasonCenters[index] * scale);
  const x = Math.min(0, Math.max(seasonScene.clientWidth - renderedWidth, centeredX));

  if (instant) seasonPanorama.style.transitionDuration = '0ms';
  seasonPanorama.style.transform = `translate3d(${x}px, 0, 0)`;

  if (instant) {
    requestAnimationFrame(() => {
      seasonPanorama.style.transitionDuration = '';
    });
  }
}

function showSeason(dot, instant = false) {
  const index = Number(dot.dataset.season);
  const travelDistance = Math.abs(index - activeSeason);
  const duration = 1050 + (travelDistance * 450);

  seasonPanorama.style.setProperty('--season-duration', `${duration}ms`);
  activeSeason = index;
  seasonName.textContent = dot.dataset.name;
  seasonCover.style.setProperty('--season-color', dot.dataset.color);
  updatePerformance(index, instant);

  seasonDots.forEach(item => {
    const isActive = item === dot;
    item.classList.toggle('active', isActive);
    item.setAttribute('aria-selected', String(isActive));
  });

  positionSeason(index, instant);
}

if (seasonCover && seasonScene && seasonPanorama && seasonName && seasonDots.length) {
  seasonDots.forEach(dot => {
    dot.addEventListener('mouseenter', () => showSeason(dot));
    dot.addEventListener('focus', () => showSeason(dot));
    dot.addEventListener('click', () => showSeason(dot));
  });

  if (seasonPanorama.complete) {
    showSeason(seasonDots[1], true);
  } else {
    seasonPanorama.addEventListener('load', () => showSeason(seasonDots[1], true), { once: true });
  }

  window.addEventListener('resize', () => positionSeason(activeSeason, true));

  let pointerStart = null;
  seasonScene.addEventListener('pointerdown', event => {
    pointerStart = event.clientX;
    seasonScene.setPointerCapture(event.pointerId);
  });
  seasonScene.addEventListener('pointerup', event => {
    if (pointerStart === null) return;
    const distance = event.clientX - pointerStart;
    pointerStart = null;
    if (Math.abs(distance) < 45) return;

    const next = Math.max(0, Math.min(3, activeSeason + (distance < 0 ? 1 : -1)));
    showSeason(seasonDots[next]);
  });
}

// Simple ranked result charts, following the paper's three-part visual story.
function initResultsCharts() {
  const visualization = document.querySelector('.results-visualization');
  const chartSpecs = [
    {
      id: 'zero-shot-distribution',
      type: 'zero-shot',
      field: 'zs',
      min: 0.5,
      max: 1,
      ticks: [0.5, 0.6, 0.7, 0.8, 0.9, 1]
    },
    {
      id: 'oracle-delta',
      type: 'delta',
      field: 'oracle',
      min: -0.6,
      max: 0.6,
      ticks: [-0.6, -0.3, 0, 0.3, 0.6]
    },
    {
      id: 'oracle-star-delta',
      type: 'delta',
      field: 'best oracle',
      min: -0.4,
      max: 0.4,
      ticks: [-0.4, -0.2, 0, 0.2, 0.4]
    }
  ];
  if (!visualization || chartSpecs.some(spec => !document.getElementById(spec.id))) return;

  const palette = {
    ink: '#465144',
    axis: '#7f897d',
    grid: '#e1e6df',
    strong: '#5f8b68',
    middle: '#c4cbc1',
    weak: '#dd9a68',
    gain: '#6e91bf',
    loss: '#d98568'
  };

  function parseCsv(text) {
    const lines = text.trim().split(/\r?\n/);
    const headers = lines.shift().split(',').map(value => value.trim());
    return lines.map(line => {
      const cells = line.split(',');
      return Object.fromEntries(headers.map((header, index) => [header, cells[index]]));
    });
  }

  function normalizedRows(rows) {
    return rows
      .map(row => ({
        zs: Number(row.zs),
        oracle: Number(row.oracle),
        'best oracle': Number(row['best oracle'])
      }))
      .filter(row => Number.isFinite(row.zs) &&
        Number.isFinite(row.oracle) &&
        Number.isFinite(row['best oracle']));
  }

  function prepareValues(rows, spec) {
    const values = spec.type === 'zero-shot'
      ? rows.map(row => row.zs)
      : rows.map(row => row[spec.field] - row.zs);
    return values.sort((a, b) => b - a);
  }

  function drawChart(canvas, values, spec, progress) {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(bounds.width * ratio));
    canvas.height = Math.max(1, Math.round(bounds.height * ratio));
    const context = canvas.getContext('2d');
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, bounds.width, bounds.height);

    const compact = bounds.width < 520;
    const box = {
      left: compact ? 42 : 52,
      right: 12,
      top: 10,
      bottom: 42
    };
    box.width = bounds.width - box.left - box.right;
    box.height = bounds.height - box.top - box.bottom;

    const x = index => box.left + (index / Math.max(1, values.length - 1)) * box.width;
    const y = value => box.top + ((spec.max - value) / (spec.max - spec.min)) * box.height;

    context.font = `${compact ? 10 : 11}px "Google Sans", sans-serif`;
    context.textAlign = 'right';
    context.textBaseline = 'middle';
    spec.ticks.forEach(tick => {
      const tickY = y(tick);
      context.beginPath();
      context.moveTo(box.left, tickY);
      context.lineTo(box.left + box.width, tickY);
      context.strokeStyle = tick === 0 ? palette.axis : palette.grid;
      context.lineWidth = tick === 0 ? 1.2 : 1;
      context.stroke();
      context.fillStyle = palette.ink;
      context.fillText(String(Math.round(tick * 100)), box.left - 7, tickY);
    });

    context.beginPath();
    context.moveTo(box.left, box.top);
    context.lineTo(box.left, box.top + box.height);
    context.lineTo(box.left + box.width, box.top + box.height);
    context.strokeStyle = palette.axis;
    context.lineWidth = 1;
    context.stroke();

    const xTicks = compact ? [0, 250, 500] : [0, 100, 200, 300, 400, 500];
    context.textAlign = 'center';
    context.textBaseline = 'top';
    xTicks.forEach(tick => {
      const tickX = box.left + (tick / Math.max(1, values.length - 1)) * box.width;
      context.fillStyle = palette.ink;
      context.fillText(String(tick), tickX, box.top + box.height + 7);
    });

    context.fillStyle = palette.ink;
    context.font = `600 ${compact ? 10 : 11}px "Google Sans", sans-serif`;
    context.fillText('Camera Trap Index', box.left + box.width / 2, bounds.height - 13);

    const baseline = spec.type === 'zero-shot' ? spec.min : 0;
    const barWidth = Math.max(1, box.width / values.length);
    context.lineWidth = barWidth;
    const paths = spec.type === 'zero-shot'
      ? [
          { color: palette.strong, test: value => value > 0.9, path: new Path2D() },
          { color: palette.middle, test: value => value > 0.8 && value <= 0.9, path: new Path2D() },
          { color: palette.weak, test: value => value <= 0.8, path: new Path2D() }
        ]
      : [
          { color: palette.gain, test: value => value >= 0, path: new Path2D() },
          { color: palette.loss, test: value => value < 0, path: new Path2D() }
        ];

    values.forEach((value, index) => {
      const animatedValue = baseline + (value - baseline) * progress;
      const group = paths.find(item => item.test(value));
      group.path.moveTo(x(index), y(baseline));
      group.path.lineTo(x(index), y(animatedValue));
    });
    paths.forEach(group => {
      context.strokeStyle = group.color;
      context.stroke(group.path);
    });

    context.save();
    context.translate(13, box.top + box.height / 2);
    context.rotate(-Math.PI / 2);
    context.fillStyle = palette.ink;
    context.font = `600 ${compact ? 10 : 11}px "Google Sans", sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(spec.type === 'zero-shot' ? 'Per-Class Accuracy (%)' : 'Accuracy Change (%)', 0, 0);
    context.restore();
  }

  function mountChart(spec, rows) {
    const canvas = document.getElementById(spec.id);
    const values = prepareValues(rows, spec);
    let progress = 0;
    let animationFrame = null;
    let hasAnimated = false;

    function render(nextProgress = progress) {
      progress = nextProgress;
      drawChart(canvas, values, spec, progress);
    }

    function animate() {
      if (hasAnimated) return;
      hasAnimated = true;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        render(1);
        return;
      }
      const startedAt = performance.now();
      const duration = 850;
      function frame(now) {
        const elapsed = Math.min(1, (now - startedAt) / duration);
        render(1 - Math.pow(1 - elapsed, 3));
        if (elapsed < 1) animationFrame = requestAnimationFrame(frame);
      }
      animationFrame = requestAnimationFrame(frame);
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        observer.disconnect();
        animate();
      }, { threshold: 0.18 });
      observer.observe(canvas);
    } else {
      animate();
    }

    if ('ResizeObserver' in window) {
      new ResizeObserver(() => render(hasAnimated ? 1 : 0)).observe(canvas.parentElement);
    } else {
      window.addEventListener('resize', () => render(hasAnimated ? 1 : 0));
    }

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }

  const resultsPromise = Array.isArray(window.STREAMTRAP_RESULTS)
    ? Promise.resolve(window.STREAMTRAP_RESULTS)
    : fetch(visualization.dataset.source)
      .then(response => {
        if (!response.ok) throw new Error(`Could not load results (${response.status})`);
        return response.text();
      })
      .then(parseCsv);

  resultsPromise
    .then(normalizedRows)
    .then(rows => chartSpecs.forEach(spec => mountChart(spec, rows)))
    .catch(error => {
      visualization.innerHTML =
        `<p class="performance-load-error">The result charts could not be loaded. ${error.message}</p>`;
    });
}

initResultsCharts();
