/** jQuery Prompt - v0.0.2 - 2013/02/13
 * https://github.com/jpillora/jquery.prompt
 * Copyright (c) 2013 Jaime Pillora - MIT
 */
(function(window,document,undefined) {
'use strict';

var Options, Prompt, arrowDirs, className, create, getAnchorElement, pluginName, pluginOptions;

pluginName = 'prompt';

className = 'jqPrompt';

arrowDirs = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left'
};

pluginOptions = {
  autoHidePrompt: false,
  autoHideDelay: 10000,
  arrowShow: true,
  arrowSize: 5,
  arrowPosition: 'top',
  color: 'red',
  colors: {
    red: '#ee0101',
    green: '#33be40',
    black: '#393939',
    blue: '#00f'
  },
  showAnimation: 'fadeIn',
  showDuration: 200,
  hideAnimation: 'fadeOut',
  hideDuration: 600,
  gap: 2
};

create = function(tag) {
  return $(document.createElement(tag));
};

Options = function(options) {
  if ($.isPlainObject(options)) {
    return $.extend(this, options);
  }
};

Options.prototype = pluginOptions;

getAnchorElement = function(element) {
  var fBefore, radios;
  if (element.is('[type=radio]')) {
    radios = element.parents('form:first').find('[type=radio]').filter(function(i, e) {
      return $(e).attr('name') === element.attr('name');
    });
    element = radios.first();
  }
  fBefore = element.prev();
  if (fBefore.is('span.styled,span.OBS_checkbox')) {
    element = fBefore;
  }
  return element;
};

Prompt = (function() {

  function Prompt(elem, node, options) {
    if ($.type(options) === 'string') {
      options = {
        color: options
      };
    }
    this.options = new Options($.isPlainObject(options) ? options : {});
    this.elementType = elem.attr('type');
    this.originalElement = elem;
    this.elem = getAnchorElement(elem);
    this.elem.data(pluginName, this);
    this.buildWrapper();
    this.buildPrompt();
    this.wrapper.append(this.prompt);
    this.buildContent();
    this.prompt.append(this.content);
    this.prompt.data(pluginName, this);
    this.elem.before(this.wrapper);
    this.prompt.css(this.calculateCSS());
    this.run(node);
  }

  Prompt.prototype.buildArrow = function() {
    var alt, d, dir, showArrow, size;
    dir = this.options.arrowPosition;
    size = this.options.arrowSize;
    alt = arrowDirs[dir];
    this.arrow = create("div");
    this.arrow.addClass(className + 'Arrow').css({
      'margin-top': 2 + (document.documentMode === 5 ? size * -4 : 0),
      'position': 'relative',
      'z-index': '2',
      'margin-left': 10,
      'width': 0,
      'height': 0
    }).css('border-' + alt, size + 'px solid ' + this.getColor());
    for (d in arrowDirs) {
      if (d !== dir && d !== alt) {
        this.arrow.css('border-' + d, size + 'px solid transparent');
      }
    }
    showArrow = this.options.arrowShow && this.elementType !== 'radio';
    if (showArrow) {
      return this.arrow.show();
    } else {
      return this.arrow.hide();
    }
  };

  Prompt.prototype.buildPrompt = function() {
    return this.prompt = create('div').addClass(className).hide().css({
      'z-index': '1',
      'position': 'absolute',
      'cursor': 'pointer'
    });
  };

  Prompt.prototype.buildWrapper = function() {
    return this.wrapper = create('div').addClass("" + className + "Wrapper").css({
      'z-index': '1',
      'position': 'absolute',
      'display': 'inline-block',
      'height': 0,
      'width': 0
    });
  };

  Prompt.prototype.buildContent = function() {
    return this.content = create('div').addClass("" + className + "Content").css({
      'background': '#fff',
      'position': 'relative',
      'font-size': '11px',
      'box-shadow': '0 0 6px #000',
      '-moz-box-shadow': '0 0 6px #000',
      '-webkit-box-shadow': '0 0 6px #000',
      'padding': '4px 10px 4px 8px',
      'border-radius': '6px',
      'border-style': 'solid',
      'border-width': '2px',
      '-moz-border-radius': '6px',
      '-webkit-border-radius': '6px',
      'white-space': 'nowrap'
    });
  };

  Prompt.prototype.showPrompt = function(show) {
    var hidden;
    hidden = this.prompt.parent().parents(':hidden').length > 0;
    if (hidden && show) {
      this.prompt.show();
    }
    if (hidden && !show) {
      this.prompt.hide();
    }
    if (!hidden && show) {
      this.prompt[this.options.showAnimation](this.options.showDuration);
    }
    if (!hidden && !show) {
      return this.prompt[this.options.hideAnimation](this.options.hideDuration);
    }
  };

  Prompt.prototype.calculateCSS = function() {
    var elementPosition, height, left, promptPosition;
    elementPosition = this.elem.position();
    promptPosition = this.prompt.parent().position();
    height = this.elem.outerHeight();
    left = elementPosition.left - promptPosition.left;
    if (!navigator.userAgent.match(/MSIE/)) {
      height += elementPosition.top - promptPosition.top;
    }
    return {
      top: height + this.options.gap,
      left: left
    };
  };

  Prompt.prototype.getColor = function() {
    return this.options.colors[this.options.color] || this.options.color;
  };

  Prompt.prototype.run = function(node, options) {
    var t;
    if ($.isPlainObject(options)) {
      $.extend(this.options, options);
    } else if ($.type(options) === 'string') {
      this.options.color = options;
    }
    if (this.prompt && !node) {
      this.showPrompt(false);
      return;
    } else if (!this.prompt && !node) {
      return;
    }
    if ($.type(node) === 'string') {
      this.content.html(node.replace('\n', '<br/>'));
    } else {
      this.content.empty().append(node);
    }
    this.content.css({
      'color': this.getColor(),
      'border-color': this.getColor()
    });
    if (this.arrow) {
      this.arrow.remove();
    }
    this.buildArrow();
    this.content.before(this.arrow);
    this.showPrompt(true);
    if (this.options.autoHidePrompt) {
      clearTimeout(this.elem.data('promptTimer'));
      t = setTimeout(function() {
        return this.showPrompt(false);
      }, this.options.autoHideDelay);
      return this.elem.data('promptTimer', t);
    }
  };

  return Prompt;

})();

$(function() {
  return $(document).on('click', "." + className, function() {
    var inst;
    inst = getAnchorElement($(this)).data(pluginName);
    if (inst != null) {
      return inst.showPrompt(false);
    }
  });
});

$[pluginName] = function(elem, node, options) {
  return $(elem)[pluginName](node, options);
};

$[pluginName].options = function(options) {
  return $.extend(pluginOptions, options);
};

$.fn[pluginName] = function(node, options) {
  return $(this).each(function() {
    var inst;
    inst = getAnchorElement($(this)).data(pluginName);
    if (inst != null) {
      return inst.run(node, options);
    } else {
      return new Prompt($(this), node, options);
    }
  });
};

}(window,document));