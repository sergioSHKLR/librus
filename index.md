---
title: librus.app
layout: splash
version: 23.12.22
---

 <!-- GOOGLE PRECONNECT -->
 <link rel="preconnect" href="https://fonts.googleapis.com">
 <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

 <!-- GOOGLE EMOJI -->
 <link href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap" rel="stylesheet">

<style>
    span.emoji {
  font-family: 'Noto Color Emoji', sans-serif;
}
</style>

><br>
><br>
><br>
> A one-of-a-kind<br>study & research<br>platform.
><br>
><br>
><br>
><br>
{:class="hero"}

 <small>Soft launch on Apr 18, 2024<br>
 (in <span id="demo"></span>)</small>
 {:.banner}

<script>
    // Set the date we're counting down to
var countDownDate = new Date("Apr 18, 2024 09:00").getTime();

// Update the count down every 1 second
var x = setInterval(function() {

  // Get today's date and time
  var now = new Date().getTime();
    
  // Find the distance between now and the count down date
  var distance = countDownDate - now;
    
  // Time calculations for days, hours, minutes and seconds
  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    
  // Output the result in an element with id="demo"
  document.getElementById("demo").innerHTML = days + " days" ;
    
  // If the count down is over, write some text 
  if (distance < 0) {
    clearInterval(x);
    document.getElementById("demo").innerHTML = "Oficialmente Aberto";
  }
}, 1000);
</script>


