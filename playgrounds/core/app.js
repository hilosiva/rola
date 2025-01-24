new Rola("[data-rola-trigger]", { once: false, rootMargin: "0px 0px -50%" });
new Rola("[data-trigger2]", { once: false, rootMargin: "0px 0px 0% 0px" });
new Rola("[data-trigger3]", { rootMargin: "0px 0px 0%", once: true });
new Rola("[data-rola-scrub]", { once: false, scrub: true });
new Rola("[data-rola-scrub-parara]", { once: false, scrub: true, rootMargin: "50% 0px" });

console.log(Rola.version);
