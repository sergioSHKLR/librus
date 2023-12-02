const scroller = document.getElementById('col2-body');

   function scrolling() {
     let height = scroller.clientHeight;
     let scrollHeight = scroller.scrollHeight - height;
     let scrollTop = scroller.scrollTop;
     let percent = Math.floor(scrollTop / scrollHeight * 100);
     document.getElementById('percent').innerText = 'Percent : ' + percent + '%';
   }