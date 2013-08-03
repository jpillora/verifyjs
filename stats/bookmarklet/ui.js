define(["./util/create"], function(create) {

  "use strict";

  var ui = {};

  //top row title
  ui.title = create("strong").html("Async Validator Stats").css('margin', 20);

  //date fields
  ui.startDate = create("input").css({'margin-right': 5, width: 80 }).prop('disabled', true);
  ui.endDate = create("input").css({'margin-right': 5, width: 80 }).prop('disabled', true);

  ui.refresh = create("button").css('margin-right', 5).html("Refresh").prop('disabled', true);
  ui.auth = create("button").html("Authenticate");
  ui.extraToggle = create("button").html("Extras");

  //top row span
  ui.main = create("span")
    .append(ui.startDate)
    .append(ui.endDate)
    .append(ui.refresh)
    .append(ui.auth)
    .append(ui.extraToggle);

  //
  ui.missingFields = create("div");

  //second row extra fields
  ui.extra = create("div").css({
      'font-size': '14px'
    }).append(
      create("div").html("Missing Fields:"),
      ui.missingFields
    ).hide();

  //content body
  ui.content = create("div").css({margin: 10})
    .append(create("div")
      .append(ui.title)
      .append(ui.main))
    .append(ui.extra);

  //main container
  ui.container = create("div").css({
    position: 'fixed',
    top: 0,
    left: 0,
    'z-index': 2000,
    width: '100%',
    opacity: 0.85,
    background: 'whiteSmoke'
  }).append(ui.content).hide();

  return ui;
});