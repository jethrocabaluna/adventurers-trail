window.onload = function () {

  // ----------- functions --------------- //
  function checkScroll() {
    var startY = $('.navbar').height();

    if ($(window).scrollTop() > startY) {
      $('.navbar').addClass("scrolled");
    } else {
      $('.navbar').removeClass("scrolled");
    }
  }

  function htmlEncode(value) {
    //create a in-memory div, set it's inner text(which jQuery automatically encodes)
    //then grab the encoded contents back out.  The div never exists on the page.
    return $('<div/>').text(value).html();
  }

  function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }

  // ---------- main scripts ------------- //
  // navbar fade
  if ($('.navbar').length > 0) {
    $(window).on("scroll load resize", function () {
      checkScroll();
    });
  }
  // profile edit button
  $('#edit-button').click(function () {
    $(".image-form").slideToggle(200);
  });

  $('.post-form').submit(function() {
    $('textarea').val(htmlEncode($('textarea').val()));
    console.log($('textarea').val());
    return true;
  });

  $('#post-content').text(decodeHtml($('#post-content').text()));
  $('#edit-post-textarea').val(decodeHtml($('#edit-post-textarea').val()));

  $("textarea").keydown(function (e) {
    // prevent new line in textarea
    if (e.keyCode == 13) {
      e.preventDefault();
    }
  });

  $('#add-content-btn').click(function() {
    $('.add-content').slideToggle(200);
  });

  $('#close-add-btn').click(function() {
    $('.add-content').hide(200);
  });

  $('.add-header').click(function() {
    if($('.add-paragraph').hasClass('active')) {
      $('.add-paragraph').removeClass('active');
    }
    $('.add-header').addClass('active');
  });
  $('.add-paragraph').click(function () {
    if ($('.add-header').hasClass('active')) {
      $('.add-header').removeClass('active');
    }
    $('.add-paragraph').addClass('active');
  });
  $('#add-content-form').submit(function() {
    $('.add-content').hide();
    var content = $('#add-content-form textarea').val();
    content = content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if($('.add-header').hasClass('active')) {
      $('#add-content-form textarea').val("<h5>" + content + "</h5>");
    } else if ($('.add-paragraph').hasClass('active')) {
      $('#add-content-form textarea').val("<p>" + content + "</p>");
    } else {
      return false;
    }
    return true;
  });

  setTimeout(function () { 
    $('nav + .flash-message').fadeOut(1000);
  }, 1000);
};