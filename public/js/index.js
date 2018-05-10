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

};