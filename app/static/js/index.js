$(document).ready(function(){ 
    $('form').each(function(index, element) {
        $(element).hide();
      });
    $("#homeForm").show();  
    
    // Back Button Handlers
    $("#back-mwForm").click(() =>   $("#mwForm").fadeOut(300, () => $("#homeForm").fadeIn()));
    $("#back-fwForm").click(() =>   $("#fwForm").fadeOut(300, () => $("#homeForm").fadeIn()));
    $("#back-infoForm").click(() => $("#infoForm").fadeOut(300, () => $("#homeForm").fadeIn()));
    $("#newWhistle").click(() =>    $("#form-message-success").fadeOut(300, () => $("#homeForm").fadeIn()));									

    //Home menu Button Handlers
    $("#secret").click(() => $("#homeForm").fadeOut(300, () => $("#mwForm").fadeIn()));
    $("#file").click(() => $("#homeForm").fadeOut(300, () => $("#fwForm").fadeIn()));
    $("#info").click(() => $("#homeForm").fadeOut(300, () => $("#infoForm").fadeIn()));

    //Submission Handlers
    $("#submitFile").on('click', function() { 
        var $submit = $('.submitting'),
        waitText = 'Sending your whistle sshhh...';
        var fd = new FormData();
        var file = document.getElementById("myFile"); 
        fd.append("file",file.files[0]); 
        fd.append("hours_ttl", $('#hours_ttl').val()); 
        fd.append("minutes_ttl", $('#minutes_ttl').val());
        $.ajax({ xhr: function () {
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", function (evt) {
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total;
                    console.log(percentComplete);
                    $('.progress').css({
                        width: percentComplete * 100 + '%'
                    });
                    if (percentComplete === 1) {
                        $('.progress').addClass('hide');
                    }
                }
            }, false);
            xhr.addEventListener("progress", function (evt) {
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total;
                    console.log(percentComplete);
                    $('.progress').css({
                        width: percentComplete * 100 + '%'
                    });
                }
            }, false);
            return xhr;
        },
            url: '/api/v1/save/file', 
            type : "POST", 	
            data : fd,
            processData: false,
            contentType: false,
            beforeSend: function() { 
                $submit.css('display', 'block').text(waitText);
            },
            success : function(data, textStatus, xhr) {
                $('#form-message-warning').hide();
                setTimeout(function(){
                   $('#fwForm').fadeOut();
                   $('#fwForm').trigger('reset');   
               }, 1000);
                setTimeout(function(){
    
                    const decodedString = atob(data);
                    const array = new Uint8Array(decodedString.length);
                    for (let i = 0; i < decodedString.length; i++) {
                          array[i] = decodedString.charCodeAt(i);
                        }
                    const fileBlob = new Blob([ array ], { type: 'application/zip' });
                    const url = window.URL.createObjectURL(fileBlob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = 'secured_file.zip';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    $('#link').text(window.location.protocol + "//" + window.location.host + "/s/" + xhr.getResponseHeader('uuid'));
                    $submit.css('display', 'none');
                    $('#form-message-success').fadeIn();
                    $('.progress').removeClass('hide');
                    $('.progress').css({ width: '0%' }); 
               }, 1400);
               
            },
            error: function(xhr, resp, text) {
                $('#form-message-warning').html(xhr.responseJSON.detail[0].msg);
                $('#form-message-warning').fadeIn();
                $submit.css('display', 'none');
                $('.progress').removeClass('hide');
                $('.progress').css({ width: '0%' }); 
            }
        }) });
    

        $("#submitSecret").on('click', function(){
            var $submit = $('.submitting'),
            waitText = 'Sending your whistle sshhh...';
            $.ajax({ xhr: function () {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = evt.loaded / evt.total;
                        console.log(percentComplete);
                        $('.progress').css({
                            width: percentComplete * 100 + '%'
                        });
                        if (percentComplete === 1) {
                            $('.progress').addClass('hide');
                        }
                    }
                }, false);
                xhr.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = evt.loaded / evt.total;
                        console.log(percentComplete);
                        $('.progress').css({
                            width: percentComplete * 100 + '%'
                        });
                    }
                }, false);
                return xhr;
            },
                url: '/api/v1/save/whistle',
                type : "POST", 
                dataType : 'json', 
                contentType: 'application/json;charset=UTF-8',
                data : JSON.stringify({ 'secret_message': $('#secret_message').val(), 
                         'hours_ttl':  $('#secret_hours_ttl').val(), 
                         'minutes_ttl':  $('#secret_minutes_ttl').val()	
                        }), // post data 
                beforeSend: function() { 
                    $submit.css('display', 'block').text(waitText);
                },
                success : function(xhr, resp, text) {
                    $('#form-message-warning').hide();
                    setTimeout(function(){
                       $('#mwForm').fadeOut();
                       $('#mwForm').trigger('reset'); 
                   }, 1000);
                    setTimeout(function(){
                        $('#link').text(window.location.protocol + "//" + window.location.host + "/s/" + text.responseJSON.url)
                        $submit.css('display', 'none');
                        $('#form-message-success').fadeIn();
                   }, 1400);
                   $('.progress').removeClass('hide');
                   $('.progress').css({ width: '0%' }); 
                   
                },
                error: function(xhr, resp, text) {
                    $('#form-message-warning').html(xhr.responseJSON.detail[0].msg);
                    $('#form-message-warning').fadeIn();
                    $submit.css('display', 'none');
                    $('.progress').removeClass('hide');
                    $('.progress').css({ width: '0%' }); 
                }
            })
            
        });


    //Copy Button Handler 
    $("#copy").on('click', function(){ 
            
        navigator.clipboard.writeText($('#link').text())
        .then(() => { 
                        $("#copy-message-success").text("Link Copied to Clipboard!");
                        $("#copy-message-success").removeAttr("hidden");	
                        $("#copy-message-success").hide().fadeIn(1000, () => $("#copy-message-success").fadeOut(1000));
        })
        .catch(() => { 
                        $("#copy-message-danger").text("Something Went Wrong");
                        $("#copy-message-danger").removeAttr("hidden");	
                        $("#copy-message-danger").hide().fadeIn(1000, () => $("#copy-message-danger").fadeOut(1000));
        }) });

    
    });
