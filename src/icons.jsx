// Tiny inline stroke icons (24px grid). Decorative: hidden from screen readers.
const I = (d) => (props) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{d}</svg>
)
export const Users = I(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5" /><path d="M16 5.2a3.5 3.5 0 0 1 0 6.6M18 14.8c2 .6 3.2 2.4 3.5 5.2" /></>)
export const Gavel = I(<><path d="M14 4l6 6M10 8l6 6M3 21l8-8M12 3l-3 3 6 6 3-3z" /></>)
export const Scale = I(<><path d="M12 4v16M6 20h12M4 8h16" /><path d="M7 8l-3 7a3 3 0 0 0 6 0zM17 8l-3 7a3 3 0 0 0 6 0z" /></>)
export const Shield = I(<><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></>)
export const Pin = I(<><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></>)
export const Clock = I(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>)
export const Home = I(<><path d="M3 11l9-8 9 8M5 10v10h14V10" /></>)
export const Car = I(<><path d="M4 16v-4l2-5h12l2 5v4M4 16h16M7 19v-3M17 19v-3" /><circle cx="8" cy="13" r=".8" /><circle cx="16" cy="13" r=".8" /></>)
