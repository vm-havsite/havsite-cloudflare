let lastScrollY = window.scrollY;
let ticking = false;

function updateNav(){
 const nav = document.getElementById("myTopnav");
 const isResponsive = nav.classList.contains("responsive");
 let scrollup = lastScrollY - window.scrollY > 5;

   if (isResponsive){
     if (window.scrollY - lastScrollY > 40 && window.pageYOffset > 380) {
       // scrolling down → hide nav
       nav.classList.remove("responsive");
       nav.classList.add("hidden");
     }
     if (scrollup) {
       // scrolling up → show nav
       nav.classList.remove("hidden");
     }
   }

else{
   if (window.scrollY - lastScrollY > 10 && window.pageYOffset > 100){
      // scrolling down → hide nav
      nav.classList.add("hidden");
    }

  if (scrollup) {
    // scrolling up → show nav
    nav.classList.remove("hidden");
  }
}

  lastScrollY = window.scrollY;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateNav();   // all DOM reads & writes here
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });