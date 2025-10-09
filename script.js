var questions = [
  {
      question : "En quelle année la Seconde Guerre mondiale s'est-elle terminée ?",
      options : ["1941","1945","1937","1950"],
      reponse : "1945"
  },
  {
      question : "Quel est l'élément chimique symbolisé par Fe ?",
      options : ["Fluor","Cuivre","Or","Fer"],
      reponse : "Fer"
  },
  {
      question : "La capitale de la France est :",
      options : ["Berlin","Madrid","Paris","Rome"],
      reponse : "Paris"
  },
  {
    question : "Quel est le nom du plus grand océan sur Terre ?",
    options : ["Océan Atlantique","Océan Pacifique","Océan Indien","Océan Arctique"],
    reponse : "Paris"
},
{
    question : "En CSS, quelle propriété utilise-t-on pour changer la couleur du texte d'un élément ?",
    options:["text-color","background-color","font-color","color"],
    reponse: "color"
}
];

var index = 0;
var score = 0;
var temps = 20;
var timer;

var questionEl = document.getElementById("question").querySelector("span");
var optionsEl = document.querySelector(".option_list");
var scoreEl = document.getElementById("score");
var suivantBtn = document.querySelector(".btn_suivant");
var validerBtn = document.getElementById("btn");
var timerEl = document.querySelector(".timer_time");


function chargerQuestion(){
  temps = 20;
  clearInterval(timer);
  demarrerTimer();
  var q = questions[index];
  questionEl.textContent = q.question;
  optionsEl.innerHTML = "";
  for(var i=0;i<q.options.length;i++){
      var opt = document.createElement("div");
      opt.classList.add("option");
      opt.textContent = q.options[i];
      opt.onclick = function(){
          var selected = document.querySelector(".option.selected");
          if(selected){
              selected.classList.remove("selected");
          }
          this.classList.add("selected");
      }
      optionsEl.appendChild(opt);
  }
}


function verifier(){
  var selected = document.querySelector(".option.selected");
  if(selected){
      var rep = selected.textContent;
      if(rep == questions[index].reponse){
          score++;
      }
  }
}


function afficherScore(){
  clearInterval(timer); // stop le chronomètre
  scoreEl.textContent = "Votre score est : " + score + " / " + questions.length;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}



suivantBtn.onclick = function(){
  verifier();
  index++;
  if(index < questions.length){
      chargerQuestion();
  }else{
      afficherScore();
  }
}


validerBtn.onclick = function(){
  afficherScore();
}


function demarrerTimer(){
  timerEl.textContent = temps;
  timer = setInterval(function(){
      temps--;
      timerEl.textContent = temps;
      if(temps <= 0){
          clearInterval(timer);
          suivantBtn.click();
      }
  },1000);
}


chargerQuestion();