/**
 * Guided Product Tour for Rebrandly Conversion Tracking Demo
 * Healthcare / CareConnect Health Edition
 *
 * A lightweight tooltip tour system that overlays on the actual demo pages.
 * Tour steps are defined per-page and highlight real elements with tooltips
 * explaining the conversion tracking setup flow.
 */

(function () {
  "use strict";

  // ==============================
  // Tour Step Definitions
  // ==============================

  var STEPS = {
    "index.html": [
      {
        target: "head-script",
        title: "Install the Tracking Snippet",
        body:
          'The Rebrandly SDK is installed in the <code>&lt;head&gt;</code> of every page on this health system site. It loads automatically and begins tracking page views -- no extra code needed.' +
          '<div class="tour-code-block"><code>&lt;script\n  src="https://track.rebrandly.click/sdk/latest/rbly.min.js"\n  data-api-key="YOUR_API_KEY"&gt;\n&lt;/script&gt;</code></div>' +
          "This single snippet is all you paste into your CMS header injection (WordPress, Squarespace, Webflow, etc.).",
        position: "bottom",
        highlight: ".nav",
        stepLabel: "Install Snippet",
      },
      {
        target: ".hero",
        title: "Page View Tracked Automatically",
        body: 'When a patient visits this page via a tracked Rebrandly link, the SDK automatically records a <code>page_view</code> event. No code needed -- it fires on every page where the snippet is installed.',
        position: "bottom",
        stepLabel: "Install Snippet",
      },
      {
        target: '.hero-search .btn-primary',
        title: "CTA Click Event",
        body: 'When a patient clicks "Book Appointment", we fire a <code>cta_click</code> event that captures which button was clicked and from which page. This measures intent before the actual conversion.' +
          '<div class="tour-code-block"><code>rbly.track(\"cta_click\", {\n  ctaText: \"Book Appointment\",\n  sourcePage: \"index.html\"\n});</code></div>',
        position: "top",
        stepLabel: "Custom Events",
      },
      {
        target: null,
        title: "Next: Doctor Directory",
        body: "As patients browse services, each page view is recorded and attributed back to the original link click.<br><br>Next, let's see what happens when a patient looks for a doctor.",
        position: "center",
        stepLabel: "Custom Events",
        nextPage: "doctors.html?tour=1&step=0",
      },
    ],

    "doctors.html": [
      {
        target: ".doctors-grid",
        title: "Doctor Directory Viewed",
        body: 'When patients reach the doctor directory, a <code>doctor_directory_viewed</code> event fires -- a high-intent signal that the patient is actively seeking care.' +
          '<div class="tour-code-block"><code>rbly.track(\"doctor_directory_viewed\", {\n  referrer: document.referrer\n});</code></div>',
        position: "top",
        stepLabel: "Custom Events",
      },
      {
        target: null,
        title: "Next: Patient Registration",
        body: "The patient picks a doctor and decides to register. Let's see the signup form and the events it fires.",
        position: "center",
        stepLabel: "Custom Events",
        nextPage: "signup.html?tour=1&step=0",
      },
    ],

    "signup.html": [
      {
        target: "#signup-form",
        title: "Patient Registration Event",
        body: 'When the patient submits registration, a <code>patient_registration</code> event fires with their insurance provider and preferred location -- linking this conversion back to the original Rebrandly link click.' +
          '<div class="tour-code-block"><code>rbly.track(\"patient_registration\", {\n  insuranceProvider: \"blue-cross\",\n  preferredLocation: \"downtown\"\n});</code></div>',
        position: "right",
        stepLabel: "Custom Events",
      },
      {
        target: "#insurance",
        title: "Insurance Selection Event",
        body: 'Selecting an insurance provider fires an <code>insurance_selected</code> event -- useful for segmenting conversions by payer type and understanding which insurance networks drive the most patient acquisitions.' +
          '<div class="tour-code-block"><code>rbly.track(\"insurance_selected\", {\n  provider: \"blue-cross\"\n});</code></div>',
        position: "right",
        stepLabel: "Custom Events",
      },
      {
        target: null,
        title: "Next: Registration Complete",
        body: "After registration, we fire the final conversion event. Let's see the confirmation page.",
        position: "center",
        stepLabel: "Custom Events",
        nextPage: "thank-you.html?tour=1&step=0&insurance=blue-cross&location=downtown",
      },
    ],

    "thank-you.html": [
      {
        target: "#success-section",
        title: "Registration Complete Event",
        body: '<code>registration_complete</code> fires as the final conversion -- this patient acquisition is now fully attributed to the original Rebrandly link.' +
          '<div class="tour-code-block"><code>rbly.track(\"registration_complete\", {\n  insuranceProvider: \"blue-cross\",\n  location: \"downtown\"\n});</code></div>',
        position: "bottom",
        stepLabel: "Custom Events",
      },
      {
        target: null,
        title: "Full Funnel Complete!",
        body: "<strong>That's the complete conversion tracking flow:</strong><br><br>" +
          "1. <strong>Snippet installed</strong> in the site header<br>" +
          "2. <strong>Page views</strong> tracked automatically on every page<br>" +
          "3. <strong>CTA clicks</strong> tracked on the homepage<br>" +
          "4. <strong>Doctor directory viewed</strong> as a high-intent signal<br>" +
          "5. <strong>Insurance selected</strong> for payer segmentation<br>" +
          "6. <strong>Patient registration</strong> captured on form submit<br>" +
          "7. <strong>Registration complete</strong> as the final conversion<br><br>" +
          "All attributed back to the original Rebrandly link click via <code>rbly_click_id</code>.",
        position: "center",
        stepLabel: "Summary",
      },
    ],
  };

  // ==============================
  // Tour Engine
  // ==============================

  var currentStepIndex = 0;
  var pageSteps = [];
  var backdrop, spotlight, tooltip, bar, launchBtn;
  var isActive = false;

  function getPageKey() {
    var path = window.location.pathname;
    var file = path.split("/").pop() || "index.html";
    return file.split("?")[0];
  }

  function init() {
    var pageKey = getPageKey();
    pageSteps = STEPS[pageKey] || [];
    if (pageSteps.length === 0) return;

    createElements();

    // Auto-start if tour param is in URL
    var params = new URLSearchParams(window.location.search);
    if (params.get("tour") === "1") {
      var startStep = parseInt(params.get("step")) || 0;
      startTour(startStep);
    }
  }

  function createElements() {
    // Backdrop (hidden until tour starts)
    backdrop = document.createElement("div");
    backdrop.className = "tour-backdrop";
    backdrop.addEventListener("click", endTour);
    document.body.appendChild(backdrop);

    // Spotlight
    spotlight = document.createElement("div");
    spotlight.className = "tour-spotlight";
    document.body.appendChild(spotlight);

    // Tooltip
    tooltip = document.createElement("div");
    tooltip.className = "tour-tooltip";
    document.body.appendChild(tooltip);

    // Bottom bar
    bar = document.createElement("div");
    bar.className = "tour-bar";
    document.body.appendChild(bar);

    // Launch button
    launchBtn = document.createElement("button");
    launchBtn.className = "tour-launch";
    launchBtn.innerHTML = '<span class="tour-launch-icon">?</span> Start Demo Tour';
    launchBtn.addEventListener("click", function () {
      startTour(0);
    });
    document.body.appendChild(launchBtn);
  }

  function startTour(stepIndex) {
    isActive = true;
    currentStepIndex = stepIndex || 0;
    launchBtn.classList.add("hidden");
    backdrop.classList.add("visible");
    bar.classList.add("visible");
    showStep(currentStepIndex);
  }

  function endTour() {
    isActive = false;
    backdrop.classList.remove("visible");
    tooltip.classList.remove("visible");
    tooltip.classList.remove("tour-tooltip-center");
    bar.classList.remove("visible");
    spotlight.style.display = "none";
    launchBtn.classList.remove("hidden");

    // Remove highlight from any element
    var highlighted = document.querySelector(".tour-highlight");
    if (highlighted) highlighted.classList.remove("tour-highlight");
  }

  function showStep(index) {
    if (index < 0 || index >= pageSteps.length) return;
    currentStepIndex = index;
    var step = pageSteps[index];

    // Remove previous highlight
    var prev = document.querySelector(".tour-highlight");
    if (prev) prev.classList.remove("tour-highlight");

    // Find target element
    var targetEl = null;
    if (step.target === "head-script") {
      targetEl = document.querySelector(".nav");
    } else if (step.target) {
      targetEl = document.querySelector(step.target);
    }

    // Position spotlight and tooltip
    if (targetEl && step.position !== "center") {
      targetEl.classList.add("tour-highlight");
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });

      setTimeout(function () {
        positionTooltip(targetEl, step);
        positionSpotlight(targetEl);
      }, 350);
    } else {
      // Center tooltip (no target)
      spotlight.style.display = "none";
      positionCenter(step);
    }

    updateBar(index);
  }

  function positionSpotlight(el) {
    var rect = el.getBoundingClientRect();
    var pad = 8;
    spotlight.style.display = "block";
    spotlight.style.top = (rect.top + window.scrollY - pad) + "px";
    spotlight.style.left = (rect.left + window.scrollX - pad) + "px";
    spotlight.style.width = (rect.width + pad * 2) + "px";
    spotlight.style.height = (rect.height + pad * 2) + "px";
  }

  function positionTooltip(el, step) {
    var rect = el.getBoundingClientRect();
    renderTooltipContent(step);

    tooltip.className = "tour-tooltip visible";
    tooltip.style.position = "absolute";
    var pos = step.position || "bottom";

    // Reset positioning
    tooltip.style.top = "";
    tooltip.style.bottom = "";
    tooltip.style.left = "";
    tooltip.style.right = "";

    var gap = 16;

    if (pos === "bottom") {
      tooltip.classList.add("arrow-top");
      tooltip.style.top = (rect.bottom + window.scrollY + gap) + "px";
      tooltip.style.left = Math.max(16, rect.left + window.scrollX) + "px";
    } else if (pos === "top") {
      tooltip.classList.add("arrow-bottom");
      tooltip.style.top = (rect.top + window.scrollY - tooltip.offsetHeight - gap) + "px";
      tooltip.style.left = Math.max(16, rect.left + window.scrollX) + "px";
    } else if (pos === "left") {
      tooltip.classList.add("arrow-right");
      tooltip.style.top = (rect.top + window.scrollY) + "px";
      tooltip.style.left = Math.max(16, rect.left + window.scrollX - tooltip.offsetWidth - gap) + "px";
    } else if (pos === "right") {
      tooltip.classList.add("arrow-left");
      tooltip.style.top = (rect.top + window.scrollY) + "px";
      tooltip.style.left = (rect.right + window.scrollX + gap) + "px";
    }

    // Clamp to viewport
    var tooltipRect = tooltip.getBoundingClientRect();
    if (tooltipRect.right > window.innerWidth - 16) {
      tooltip.style.left = (window.innerWidth - tooltip.offsetWidth - 16) + "px";
    }
    if (tooltipRect.left < 16) {
      tooltip.style.left = "16px";
    }
  }

  function positionCenter(step) {
    renderTooltipContent(step);
    tooltip.className = "tour-tooltip tour-tooltip-center visible";
  }

  function renderTooltipContent(step) {
    // Reset inline position styles
    tooltip.style.top = "";
    tooltip.style.left = "";
    tooltip.style.right = "";
    tooltip.style.bottom = "";
    tooltip.classList.remove("tour-tooltip-center");

    // Calculate overall progress across all pages
    var allPages = ["index.html", "doctors.html", "signup.html", "thank-you.html"];
    var pageKey = getPageKey();
    var totalSteps = 0;
    var currentGlobal = 0;
    for (var i = 0; i < allPages.length; i++) {
      var pSteps = STEPS[allPages[i]] || [];
      if (allPages[i] === pageKey) {
        currentGlobal = totalSteps + currentStepIndex;
      }
      totalSteps += pSteps.length;
    }

    // Build progress dots
    var dots = "";
    for (var d = 0; d < totalSteps; d++) {
      var cls = "tour-progress-dot";
      if (d === currentGlobal) cls += " active";
      else if (d < currentGlobal) cls += " done";
      dots += '<span class="' + cls + '"></span>';
    }

    // Determine if this is the last step across all pages
    var isLastPage = pageKey === "thank-you.html";
    var isLastStep = currentStepIndex === pageSteps.length - 1;
    var isVeryLast = isLastPage && isLastStep;

    // Next button logic
    var nextBtnHtml;
    if (isVeryLast) {
      nextBtnHtml = '<button class="tour-btn tour-btn-primary" onclick="window._tour.end()">Finish Tour</button>';
    } else if (step.nextPage) {
      nextBtnHtml = '<button class="tour-btn tour-btn-primary" onclick="window._tour.goPage(\'' + step.nextPage + '\')">Next</button>';
    } else {
      nextBtnHtml = '<button class="tour-btn tour-btn-primary" onclick="window._tour.next()">Next</button>';
    }

    var backBtnHtml = currentGlobal > 0
      ? '<button class="tour-btn tour-btn-secondary" onclick="window._tour.prev()">Back</button>'
      : "";

    tooltip.innerHTML =
      '<button class="tour-btn-close" onclick="window._tour.end()">&times;</button>' +
      '<div class="tour-tooltip-header">' +
        '<span class="tour-step-badge">' + step.stepLabel + '</span>' +
        '<span class="tour-tooltip-title">' + step.title + "</span>" +
      "</div>" +
      '<div class="tour-tooltip-body">' + step.body + "</div>" +
      '<div class="tour-tooltip-footer">' +
        '<div class="tour-progress">' + dots + "</div>" +
        '<div class="tour-nav">' + backBtnHtml + nextBtnHtml + "</div>" +
      "</div>";
  }

  function updateBar(index) {
    var stepLabels = ["Install Snippet", "Custom Events", "Summary"];
    var pageKey = getPageKey();
    var allPages = ["index.html", "doctors.html", "signup.html", "thank-you.html"];
    var pageIndex = allPages.indexOf(pageKey);

    // Map to simplified bar steps: 0=snippet (index step 0-1), 1=events (rest), 2=summary
    var barStep = 0;
    if (pageKey === "thank-you.html" && index === pageSteps.length - 1) {
      barStep = 2;
    } else if (pageIndex > 0 || index >= 2) {
      barStep = 1;
    }

    var html = "";
    for (var i = 0; i < stepLabels.length; i++) {
      var cls = "tour-bar-step";
      if (i === barStep) cls += " active";
      else if (i < barStep) cls += " done";

      var numContent = i < barStep ? "\u2713" : (i + 1);

      html +=
        '<div class="' + cls + '">' +
          '<span class="tour-bar-step-num">' + numContent + '</span>' +
          '<span>' + stepLabels[i] + '</span>' +
        '</div>';

      if (i < stepLabels.length - 1) {
        var connCls = "tour-bar-connector";
        if (i < barStep) connCls += " done";
        html += '<div class="' + connCls + '"></div>';
      }
    }

    bar.innerHTML = html;
  }

  // ==============================
  // Public API (for button onclick handlers)
  // ==============================

  window._tour = {
    start: function (step) { startTour(step); },
    end: function () { endTour(); },
    next: function () {
      if (currentStepIndex < pageSteps.length - 1) {
        showStep(currentStepIndex + 1);
      }
    },
    prev: function () {
      if (currentStepIndex > 0) {
        showStep(currentStepIndex - 1);
      }
    },
    goPage: function (url) {
      window.location.href = url;
    },
  };

  // ==============================
  // Keyboard navigation
  // ==============================

  document.addEventListener("keydown", function (e) {
    if (!isActive) return;
    if (e.key === "Escape") endTour();
    if (e.key === "ArrowRight" || e.key === "Enter") {
      var step = pageSteps[currentStepIndex];
      if (step && step.nextPage) {
        window.location.href = step.nextPage;
      } else {
        window._tour.next();
      }
    }
    if (e.key === "ArrowLeft") window._tour.prev();
  });

  // ==============================
  // Init on DOM ready
  // ==============================

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
