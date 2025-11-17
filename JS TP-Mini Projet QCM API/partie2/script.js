var index = 0;
var questions = [];
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
    questionEl.innerHTML = q.question;
    optionsEl.innerHTML = "";

    var opts = q.incorrect_answers.concat(q.correct_answer);

    for(var i=0;i<opts.length;i++){
        var opt = document.createElement("div");
        opt.classList.add("option");
        opt.innerHTML = opts[i];
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
        var rep = selected.innerHTML;
        if(rep == questions[index].correct_answer){
            score++;
        }
    }
}

function afficherScore(){
    clearInterval(timer); // stop le chrono
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

// API
document.getElementById("startQuiz").onclick = function(){
    var amount = document.getElementById("amount").value;
    var category = document.getElementById("category").value;
    var difficulty = document.getElementById("difficulty").value;
    var type = document.getElementById("type").value;

    var url = `https://opentdb.com/api.php?amount=${amount}`;
    if(category) url += `&category=${category}`;
    if(difficulty) url += `&difficulty=${difficulty}`;
    if(type) url += `&type=${type}`;

    fetch(url)
    .then(res => res.json())
    .then(data => {
    questions = data.results;
    index = 0;
    score = 0;
    document.getElementById("configForm").style.display = "none";
    document.getElementById("quizBox").style.display = "block";

    chargerQuestion();
    });
}