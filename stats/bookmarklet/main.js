define([
  "./ui",
  "./util/create",
  "//apis.google.com/js/client.js",
  "//raw.github.com/jpillora/jquery.prompt/gh-pages/dist/jquery.prompt.js"
], function(ui,create) {

  "use strict";

  var clientId = '387345054506.apps.googleusercontent.com',
      apiKey = 'AIzaSyBiXegqHVr-13O09vy1Zx4s8YrEtlGdwwY',
      scopes = 'https://www.googleapis.com/auth/analytics.readonly',
      fields = null;

  $(document).ready(init);

  function init() {
    console.log("init");
    initElements();
    apiReadyCheck();
  }

  function initElements() {
    ui.refresh.click(run);
    ui.auth.click(auth);

    var yesterday = new Date(new Date().getTime() - 1000*60*60*24),
        yesterdayStr = $.datepicker.formatDate( "yy-mm-dd", yesterday);

    ui.startDate.val(yesterdayStr);
    ui.endDate.val(yesterdayStr);

    ui.extraToggle.click(function() {
      ui.extra.toggle('fast');
    });

    $("body").prepend(ui.container);

    ui.container.fadeIn(2000);
  }



  function apiReadyCheck() {
    if(window.gapi === undefined ||
       window.gapi.client === undefined) {
      setTimeout(apiReadyCheck, 100);
    } else {
      gapi.client.setApiKey(apiKey);
      setTimeout(auth,1000);
    }
  }

  function auth(e) {
    gapi.auth.authorize({
      client_id: clientId,
      scope: scopes,
      immediate: !e
    }, authResult);
  }

  function authResult(hasUser) {
    //console.log("result: " + !!hasUser);
    if(hasUser) {
      ui.main.fadeIn();
      ui.refresh.add(ui.startDate).add(ui.endDate).prop('disabled',false);
      ui.auth.prop('disabled',true);
      gapi.client.load('analytics', 'v3', userReady);
    }
  }

  function userReady() {
    run();
  }

  function run() {
    ui.refresh.prop('disabled',true);
    fetch();
  }

  function fetch() {

    var startDate = ui.startDate.val(),
        endDate = ui.endDate.val();

    if(!startDate || !endDate)
      return alert("Missing date fields");

    var pathRegex = '^' + location.pathname
        .replace(/\//g,'\\/')
        .replace(/\\\/\d+\\\//g, '\\/\\d+\\/');

    console.log("Filter Events on Page: " + pathRegex);    

    gapi.client.analytics.data.ga.get({
      'ids': 'ga:47934797',
      'start-date': startDate,
      'end-date': endDate,
      'metrics': 'ga:uniqueEvents',
      'dimensions': 'ga:eventAction,ga:eventLabel',
      'sort': '-ga:eventAction',
      'filters': 'ga:eventCategory=~^Validate;ga:pagePath=~'+pathRegex,
      'max-results': 500
    }).execute(fetched);
  }

  function fetched(data) {
    ui.refresh.prop('disabled',false);
    console.log("fetched data");
    if(data.error) {
      if(data.error.message.match(/login/i))
        auth(true);
      else
        alert(data.error.message);
      return;
    }

    if(!data.totalResults) {
      alert("No results for this page");
      return;
    }

    fields = {};
    $.each(data.rows, function(i,row) {
      var f = row[0].split(' ')[1];

      if(!fields[f])
        fields[f] = {
          msgs: {},
          stats: { passes: 0, fails: 0}
        };

      var msg = row[1],
          count = parseInt(row[2], 10);

      if(isNaN(count)) return;

      fields[f].msgs[msg] = count;

      if(msg === 'Skip' || msg === 'Valid')
        fields[f].stats.passes += count;
      else
        fields[f].stats.fails += count;
    });

    ui.missingFields.empty();
    for(var f in fields) {
      var elem = $("[name="+ f.replace(/(\[|\])/g, "\\$1") +"]");
      showResult(elem, f, fields[f]);
    }

    ui.refresh.prop('disabled',false);
  }

  function showResult(elem, name, data) {

    var skipOnly = true, numMsgs = 0,
        results = create("div"),
        stats = create("div"),
        msgs = create("div");


    //build msgs
    for(var msg in data.msgs) {
      if(msg !== 'Skip') skipOnly = false;
      numMsgs++;
      var container = create("div");
      container.append(create("div").html(msg));
      container.append(create("div").html(data.msgs[msg]).css('margin-left', 10));
      msgs.append(container);
    }

    if(skipOnly || numMsgs === 0) return;

    //build stats
    var raw = data.stats.passes/(data.stats.fails+data.stats.passes),
        successRate = Math.round(raw*10000)/100;

    stats.html(create("span").html(successRate + "%"));

    msgs.hide();

    results.append(stats);
    results.append(msgs);

    setTimeout(function() {
      results.hover(function() {
        results.closest('.jqPromptWrapper').css('z-index', 1000);
        msgs.slideDown();
      }, function() {
        results.closest('.jqPromptWrapper').css('z-index', 1);
        msgs.slideUp();
      });
    }, 1000);

    var color = successRate >= 70 ? 'green' : 'red';

    if(elem.length) {
      elem.prompt(results, color);
    } else {
      results.css({
        border:'thin solid #999', 
        'border-radius':5, 
        padding: 10,
        color: color
      });
      stats.prepend(create("span").html(name + ": "));
      ui.missingFields.append(results);
    }
  }
  
});



