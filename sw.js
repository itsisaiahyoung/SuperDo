if(!self.define){let e,s={};const i=(i,r)=>(i=new URL(i+".js",r).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(r,n)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(s[o])return;let t={};const l=e=>i(e,o),c={module:{uri:o},exports:t,require:l};s[o]=Promise.all(r.map((e=>c[e]||l(e)))).then((e=>(n(...e),t)))}}define(["./workbox-5ffe50d4"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index-BR886rOO.js",revision:null},{url:"assets/index-xrqYgx8I.css",revision:null},{url:"assets/workbox-window.prod.es5-B_6ZJHoI.js",revision:null},{url:"index.html",revision:"1b4d145cb346a3e90268e39c4502d9aa"},{url:"serviceworker.js",revision:"e3bdc43656aecf5adfc3744cd8d49115"},{url:"manifest.webmanifest",revision:"80c98b709c6c7312988c7ada808053a8"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
