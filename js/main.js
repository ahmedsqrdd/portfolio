/* ==========================================================================
   AHMED AHMED — PORTFOLIO
   No dependencies, no modules, no fetch — runs straight off file://

   Three jobs:
     01  Image fallback — a missing photo becomes a labelled slot
     02  Nav active state — the dashed underline tracks the section in view
     03  Nothing else. Smooth scrolling lives in CSS, behind prefers-reduced-motion.
   ========================================================================== */

(function () {
  'use strict';


  /* 01  IMAGE FALLBACK ==================================================== */
  /* Every photo slot ships empty. When the file is absent the wrapper gets
     .is-missing and CSS draws a dashed frame naming the exact path to drop in.
     Add the file, reload, and it renders — no code change needed. */

  function markMissing(img) {
    var hideTarget = img.closest('[data-fallback-hide]');

    if (hideTarget) {
      // Hero background: no placeholder frame — falling back to pure void mode
      // reads as intentional rather than broken.
      hideTarget.classList.add('is-missing');
      var hint = document.querySelector('[data-hero-hint]');
      if (hint) hint.hidden = false;
      return;
    }

    var frame = img.closest('.frame');
    if (frame) frame.classList.add('is-missing');
  }

  function watchImage(img) {
    // The script runs after parsing, so a 404 may already have resolved.
    // A finished load with zero intrinsic width means it failed.
    if (img.complete) {
      if (img.naturalWidth === 0) markMissing(img);
      return;
    }
    img.addEventListener('error', function () { markMissing(img); }, { once: true });
    img.addEventListener('load', function () {
      if (img.naturalWidth === 0) markMissing(img);
    }, { once: true });
  }

  var slots = document.querySelectorAll('img[data-fallback]');
  for (var i = 0; i < slots.length; i++) watchImage(slots[i]);


  /* 02  NAV ACTIVE STATE ================================================== */
  /* Section-tracking for the nav underline — navigation state, not a
     scroll-reveal animation. Several sections can share one nav key
     (three roles all map to WORK). */

  if (!('IntersectionObserver' in window)) return;

  var sections = document.querySelectorAll('[data-nav-section]');
  var links    = document.querySelectorAll('[data-nav-link]');
  if (!sections.length || !links.length) return;

  var visibility = new Map();

  function setCurrent(key) {
    for (var j = 0; j < links.length; j++) {
      if (links[j].dataset.navLink === key) {
        links[j].setAttribute('aria-current', 'true');
      } else {
        links[j].removeAttribute('aria-current');
      }
    }
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      visibility.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
    });

    // Whichever section fills the most of the viewport wins.
    var winner = null;
    var best = 0;
    visibility.forEach(function (ratio, el) {
      if (ratio > best) { best = ratio; winner = el; }
    });

    // The hero and profile map to no nav item — nothing is underlined there.
    setCurrent(winner ? winner.dataset.navSection : null);
  }, { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] });

  for (var k = 0; k < sections.length; k++) observer.observe(sections[k]);

})();
