function clear(ai) {
    console.log(ai);
    document.getElementById("logo").remove();
    document.getElementById("desc").remove();
    document.getElementById("btn1").remove();
    document.getElementById("btn2").remove();
    startGame(ai);
}

function generateMenu() {

    // tvorba jednotlivych HTML elementu
    // element pro "logo"
    let logo = document.createElement("img");
    logo.setAttribute("id", "logo");
    logo.src = "textures/logo.png";
    logo.style.width = "100%";
    logo.style.height = "auto";
    logo.style.paddingTop = "5%";
    logo.style.paddingBottom = "5%";
    document.body.appendChild(logo);

    // element pro popis hry
    let text = document.createElement("p");
    text.setAttribute("id", "desc");
    text.innerText = "Řešení úlohy 7 pro předmět PG1. Vytvořil Martin Čížek. Hráč vlevo (P1) ovládá pomocí kláves 'W' a 'S'. Hráč vpravo (P2) ovládá pomocí kláves šipek nahoru a dolu. Hraje se do 5 bodů.";
    text.style.color = "white";
    text.style.fontSize="25px";
    document.body.appendChild(text);

    // tlacitko pro spusteni hry pro jednoho hrace
    let but1 = document.createElement("button");
    but1.setAttribute("id", "btn1");
    but1.innerText = "Jeden hráč";
    document.body.appendChild(but1);

    // tlacitko pro spusteni hry pro dva hrace
    let but2 = document.createElement("button");
    but2.setAttribute("id", "btn2");
    but2.innerText = "Dva hráči";
    document.body.appendChild(but2);

    //eventListener pro stisknuti tlacitka
    document.getElementById("btn1").addEventListener("click", function(){clear(1);});
    document.getElementById("btn2").addEventListener("click", function(){clear(0);});
}

window.onload = generateMenu();