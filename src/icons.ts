const paths:Record<string,string>={
  brand:'<path fill="currentColor" stroke="none" d="M1 19 9 3h5L6 19zm9 0 8-16h5l-8 16z"/><path d="M3 22h12"/>',
  play:'<path d="m8 4 11 8-11 8z" fill="currentColor" stroke="none"/>',
  grid:'<path d="m3 7 9-5 9 5-9 5zM3 12l9 5 9-5M3 17l9 5 9-5"/>',
  settings:'<path d="M3 6h7m5 0h6M3 12h11m5 0h2M3 18h3m5 0h10"/><circle cx="12" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>',
  sound:'<path d="m3 9 4 0 5-4v14l-5-4H3zM16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  mute:'<path d="m3 9 4 0 5-4v14l-5-4H3zM16 9l5 6m0-6-5 6"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9 9c0-4 7-4 7 0 0 2-4 2-4 5m0 3h.01"/>',
  pause:'<path stroke-width="3.5" d="M8 5v14m8-14v14"/>', close:'<path d="m6 6 12 12M18 6 6 18"/>',
  charge:'<path d="m14 2-10 12h7l-1 8 10-13h-7z"/>', medal:'<path d="m12 2 7 4v8l-7 4-7-4V6zM8 16l-1 6 5-3 5 3-1-6"/><path d="m9 10 2 2 4-5"/>',
  shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z"/>', target:'<circle cx="12" cy="12" r="7"/><path d="M12 1v6m0 10v6M1 12h6m10 0h6"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>', check:'<path d="m4 12 5 5L20 6"/>',
  speed:'<path d="m2 5 8 7-8 7zm10 0 8 7-8 7z"/>', reset:'<path d="M3 10a9 9 0 1 1 2 9M3 3v7h7"/>',
  crystal:'<path d="m12 2 8 10-8 10L4 12zM4 12h16M12 2v20"/>', mirror:'<path d="m3 20 16-16 2 2L5 22zM4 4l5 5m6 6 5 5"/>',
  wave:'<path d="M2 12h5l2-7 4 14 3-10 2 3h4"/>', globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>'
};
export function icon(name:string){return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+paths[name]+'</svg>';}
