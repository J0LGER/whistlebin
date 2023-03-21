$(document).ready(function(){ 
					
    function notify(id, message) {
        $(id).text(message); 
        $(id).removeAttr("hidden");	
        $(id).hide().fadeIn(1000);
        setTimeout(() => { 
            $(id).fadeOut();
            },1000);
        }

    const secretText = document.getElementById('secret');	
    $("#reveal-button").on('click', () => { 
    if (secretText.type == 'password')
        secretText.type = 'text'
    else 
        secretText.type = 'password'
      });

    $("#copy").on('click', () => {
    navigator.clipboard.writeText(secretText.value.trim())
    .then(() =>  notify("#copy-message-success", "Secret Copied to Clipboard!"))
    .catch(() => notify("#copy-message-danger", "Something Went Wrong."));

  });
 
  $("#back").on('click', function(){ 
        window.location.href = '/';
  });
  
 
  $("#burn").on('click', function(){ 
        
    fetch(window.location.pathname + '/burn')
    .then(() =>   { notify("#copy-message-success", "Secret will be burned!"); window.location.href = '/'; })
    .catch(() => notify("#copy-message-danger", "Something Went Wrong.")); 
    
    
  });
            
    });
        