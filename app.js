const observer = new IntersectionObserver((entries) =>{
    entries.forEach((entry) => {
        console.log(entry);
        if (entry.isIntersecting){
            entry.target.classList.add("show");
        } else {
            entry.target.classList.remove("show");
        }
    })
} )

const hiddenEliments = document.querySelectorAll(".hidden");
hiddenEliments.forEach((element) => observer.observe(element))

const menuObserver = new IntersectionObserver((entries) =>{
    entries.forEach((entry) => {
        console.log(entry);
        if (entry.isIntersecting){
            entry.target.classList.add("show-menu");
        } else {
            entry.target.classList.remove("show-menu");
        }
    })
} )

const hiddenMenuEliments = document.querySelectorAll(".menu-transition");
hiddenMenuEliments.forEach((element) => menuObserver.observe(element))
