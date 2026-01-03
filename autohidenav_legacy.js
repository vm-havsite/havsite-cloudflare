let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
  const nav = document.getElementById("myTopnav");
  if (nav.classList.contains("responsive")){
    if (window.pageYOffset > 350) {
      if (window.scrollY - lastScrollY > 50) {
        nav.classList.remove("responsive");
        nav.classList.add("hidden");
      }
    }
    else if (lastScrollY - window.scrollY > 5) {
      // scrolling up → show nav
      nav.classList.remove("hidden");
    }
   }

  if (window.scrollY - lastScrollY > 10) {
    if (window.pageYOffset > 100) {
      // scrolling down → hide nav
      nav.classList.add("hidden");
    }
  } else if (lastScrollY - window.scrollY > 5) {
    // scrolling up → show nav
    nav.classList.remove("hidden");
  }
  lastScrollY = window.scrollY;
});