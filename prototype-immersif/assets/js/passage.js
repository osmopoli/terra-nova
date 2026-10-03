(function(){
  "use strict";
  var launch=document.querySelector("[data-launch]");
  var transit=document.querySelector("[data-transit]");
  if(launch&&transit){
    launch.addEventListener("click",function(){
      launch.disabled=true;
      transit.classList.add("active");
      transit.setAttribute("aria-hidden","false");
      setTimeout(function(){location.href="connexion.html";},3000);
    });
  }
  var form=document.querySelector("[data-login]");
  var reveal=document.querySelector("[data-reveal]");
  if(reveal){
    reveal.addEventListener("click",function(){
      var input=document.getElementById("code");
      var visible=input.type==="text";
      input.type=visible?"password":"text";
      reveal.setAttribute("aria-pressed",String(!visible));
      reveal.textContent=visible?"◉":"○";
    });
  }
  if(form){
    form.addEventListener("submit",function(event){
      event.preventDefault();
      var id=document.getElementById("identifiant");
      var code=document.getElementById("code");
      var state=document.querySelector("[data-form-state]");
      if(!id.value.trim()||!code.value.trim()){
        state.textContent="Renseignez votre identifiant et votre code d’accès.";
        (!id.value.trim()?id:code).focus();
        return;
      }
      state.style.color="#9ff6c5";
      state.textContent="Identité reconnue · ouverture de votre espace…";
      document.querySelector(".login-card").classList.add("success");
      try{sessionStorage.setItem("tn-session-demo","active");}catch(e){}
      setTimeout(function(){location.href="app.html";},700);
    });
  }
})();

