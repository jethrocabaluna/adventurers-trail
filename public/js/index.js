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
};