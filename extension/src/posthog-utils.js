// PostHog utility for Chrome Extension
// Using no-external bundle to avoid CSP issues in Chrome extensions

import posthog from "posthog-js/dist/module.no-external";

// Initialize PostHog
// Replace with your actual PostHog API key and host
const POSTHOG_KEY = "phc_JvMfSFp5z6gwVKIDPehchTVloebrjn2x4b1U93txCt4";
const POSTHOG_HOST = "https://eu.i.posthog.com";

let isInitialized = false;

export function initPostHog() {
  if (isInitialized) {
    return posthog;
  }

  posthog.init(POSTHOG_KEY, {
    // https://posthog.com/docs/libraries/js/config
    api_host: POSTHOG_HOST,
    defaults: "2025-11-30",
    // Disable autocapture for Chrome extension
    autocapture: false,
    // Disable session recording for Chrome extension
    disable_session_recording: true,
    // Capture pageview and pageleave events
    capture_pageview: false,
    capture_pageleave: false,
    // Persistence
    persistence: "localStorage",
    // Debug mode (set to false in production)
    loaded: (posthog) => {
      if (isDev) {
        posthog.debug();
      }
    },
  });

  isInitialized = true;
  return posthog;
}

// Check if we're in development mode
const isDev = false;

// Export posthog instance
export { posthog };

// Tracking helper functions
export function trackEvent(eventName, properties = {}) {
  if (!isInitialized) {
    initPostHog();
  }
  posthog.capture(eventName, properties);
}

export function identifyUser(userId, properties = {}) {
  if (!isInitialized) {
    initPostHog();
  }
  posthog.identify(userId, properties);
}

export function setUserProperty(property, value) {
  if (!isInitialized) {
    initPostHog();
  }
  posthog.setPersonProperties({ [property]: value });
}

export function resetUser() {
  if (!isInitialized) {
    return;
  }
  posthog.reset();
}
