// $(document).ready(function() {
//     $('#registrationForm').submit(function(event) {
//         event.preventDefault();

//         var formData = {
//             email: $('#email').val(),
//             password: $('#password').val()
//         };

//         $.ajax({
//             type: 'POST',
//             url: '/register',
//             data: JSON.stringify(formData),
//             contentType: 'application/json',
//             success: function(response) {
//                 $('#message').text(response);
//             },
//             error: function(xhr, status, error) {
//                 console.error(xhr.responseText);
//             }
//         });
//     });
// });


$(document).ready(function() {
    $('#registrationForm').submit(function(event) {
        event.preventDefault();

        var formData = {
            email: $('#email').val(),
            password: $('#password').val()
        };

        $.ajax({
            type: 'POST',
            url: '/register',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function(response) {
                $('#message').text(response);
            },
            error: function(xhr, status, error) {
                console.error(xhr.responseText);
            }
        });
    });
});
