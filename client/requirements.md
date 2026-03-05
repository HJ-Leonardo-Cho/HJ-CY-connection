## Packages
(none needed)

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["var(--font-display)"],
  sans: ["var(--font-sans)"],
}

WebSocket connects to /ws path for real-time status updates and pairing events.
PWA manifest and theme-color are injected dynamically via a component.
