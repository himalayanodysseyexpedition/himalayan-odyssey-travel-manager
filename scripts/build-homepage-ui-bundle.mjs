import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const paths = [
  "arctic-prestige-motion.css",
  "homepage-mobile-departure-promo.css",
  "windows-fluent-monochrome-sitewide.css",
  "windows-fluent-monochrome-mobile.css",
  "arctic-premium-ux.css",
  "hero-promo-cta-override.css",
  "hero-promo-itinerary-popup.css",
  "homepage-mobile-package-itinerary-popup.css"
];
const css = paths.map(path => {
  const source = readFileSync(resolve(root,path),'utf8');
  if (/@(import|charset|namespace)\\b/i.test(source)) throw new Error('Unsupported CSS prelude in '+path);
  return '/* Source: '+path+' */\\n'+source.trimEnd()+'\\n';
}).join('\\n');
writeFileSync(resolve(root,'homepage-ui-bundle.css'),css);
