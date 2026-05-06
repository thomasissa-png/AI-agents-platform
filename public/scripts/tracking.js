(function(){var s={};function t(n,p){var k=n+JSON.stringify(p||{});if(s[k])return;s[k]=1;try{var b=JSON.stringify({event_name:n,props:p||{}});navigator.sendBeacon?navigator.sendBeacon("/api/track",b):fetch("/api/track",{method:"POST",body:b,keepalive:true})}catch(_){}}
var d=[25,50,75,100],h={};addEventListener("scroll",function(){var e=document.documentElement,p=(e.scrollTop+innerHeight)/e.scrollHeight*100;d.forEach(function(x){if(p>=x&&!h[x]){h[x]=1;t("scroll_depth",{depth:x})}})},{passive:true});
document.addEventListener("click",function(e){var x=e.target.closest("[data-track]");if(x)t(x.getAttribute("data-track"),{label:x.textContent.slice(0,40)})});
var b=document.querySelector(".theme-toggle");if(b)b.onclick=function(){var c=document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark";document.documentElement.setAttribute("data-theme",c)};
t("page_view",{path:location.pathname})})();
