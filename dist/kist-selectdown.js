/*! kist-selectdown 0.1.3 - Select with customizable menu. | Author: Ivan Nikolić <niksy5@gmail.com> (http://ivannikolic.com/), 2015 | License: MIT */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
require(5);

var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var meta = require(9);
var dom = require(2);
var events = require(3);
var instance = require(7);
var getClassSelector = require(4);
var emit = require(10)(meta.name);

/**
 * @param  {Number|String} val
 *
 * @return {Number|String}
 */
function valCast ( val ) {
	return $.isNumeric(val) ? Number(val) : val;
}

/**
 * @param  {Number|String} val
 *
 * @return {Function}
 */
function filterOptions ( val ) {

	/**
	 * @param  {Integer} index
	 * @param  {Element} el
	 *
	 * @return {Boolean}
	 */
	return function ( index, el ) {
		return valCast(this.getOptionToggler($(el)).data('val')) === valCast(val);
	};
}

/**
 * @class
 *
 * @param {Element} element
 * @param {Object} options
 */
var Selectdown = module.exports = function ( element, options ) {

	this.element = element;
	this.options = $.extend(true, {}, this.defaults, options);

	this.setupInstance();
	this.setupDom();
	this.setupEvents();

	emit(this, 'create', [this.$el, this.$select]);

};

$.extend(Selectdown.prototype, {

	destroy: function () {
		this.destroyDom();
		this.destroyEvents();
		this.destroyInstance();
	},

	/**
	 * @param {Mixed} val
	 */
	setValue: function ( val ) {
		this.$el.val(val);
	},

	/**
	 * @param  {jQuery} $el
	 *
	 * @return {Mixed}
	 */
	getValue: function ( $el ) {
		$el = $el || this.$el;
		return $el.val();
	},

	/**
	 * @param  {jQuery} $el
	 *
	 * @return {String}
	 */
	getContent: function ( $el ) {
		$el = $el || this.$el.children(':selected');
		return $el.html();
	},

	/**
	 * @param  {Mixed} val
	 *
	 * @return {jQuery}
	 */
	getOriginalOption: function ( val ) {
		return this.$el.children('option').filter(function ( index, el ) {
			return valCast(el.value) === valCast(val);
		});
	},

	/**
	 * @param  {Boolean} state
	 */
	disableSelect: function ( state ) {

		this.$select.prop('disabled', state);

	},

	/**
	 * @param  {String} content
	 */
	renderSelect: function ( content ) {

		this.$select.html(this.options.templates.select.call(this.element, {
			content: content
		}));

	},

	renderOptions: function () {

		this.$optionItem = this.$el.children().map($.proxy(function ( index, el ) {

			var $el = $(el);

			var $optionItem = $('<li />', {
				'class': this.options.classes.optionItem
			});
			var $option = $('<button />', {
				type: 'button',
				'class': this.options.classes.option,
				html: this.options.templates.option.call(this.element, {
					content: $el.html(),
					value: $el.val()
				})
			});

			// Adding this through mapping object cast value to integer
			$option.data('val', $el.val());

			$option.appendTo($optionItem);

			return $optionItem.get();

		}, this));

		this.$optionList.html(this.$optionItem);

	},

	/**
	 * @param {Number|String} val
	 * @param {Boolean} preventEmit
	 */
	setActiveOption: function ( val, preventEmit ) {

		var classes = [this.options.classes.isActive, this.options.classes.isFocused].join(' ');
		var fn = filterOptions(val);

		this.$activeOptionItem = this.$optionItem.filter($.proxy(fn, this));

		this.$optionItem.removeClass(classes);
		this.$activeOptionItem.addClass(classes);

		if ( !preventEmit ) {
			emit(this, 'select', [this.$activeOptionItem, val]);
		}

	},

	/**
	 * @param {Number|String} val
	 */
	setFocusedOption: function ( val ) {

		var classes = [this.options.classes.isFocused].join(' ');
		var fn = filterOptions(val);

		this.$focusedOptionItem = this.$optionItem.filter($.proxy(fn, this));

		this.$optionItem.removeClass(classes);
		this.$focusedOptionItem.addClass(classes);

	},

	/**
	 * @param  {jQuery} $item
	 *
	 * @return {jQuery}
	 */
	getOptionToggler: function ( $item ) {
		return $item.children('button');
	},

	/**
	 * @param  {Boolean} bool
	 */
	displayOptions: function ( bool ) {

		var isHidden = this.$optionList.hasClass(this.options.classes.isHidden);

		if ( bool ) {
			if ( isHidden ) {
				emit(this, 'open', [this.$el, this.$select]);
			}
		} else {
			if ( !isHidden ) {
				emit(this, 'close', [this.$el, this.$select]);
			}
		}

		this.$select[!bool ? 'removeClass' : 'addClass'](this.options.classes.isActive);
		this.$optionList[bool ? 'removeClass' : 'addClass'](this.options.classes.isHidden);

	},

	/**
	 * @param {String} direction
	 */
	navigate: function ( direction ) {

		var $currentOptionItem = this.$optionList.children(getClassSelector(this.options.classes.isFocused));
		var $optionItems = this.$optionList.children();
		var position = $optionItems.index($currentOptionItem);
		var $newOptionItem;

		position = direction === 'down' ? ++position : --position;

		// If we are at the top, we should go to the bottom, and vice versa :)
		if ( position >= $optionItems.length ) {
			position = 0;
		} else if ( position < 0 ) {
			position = $optionItems.length - 1;
		}

		$newOptionItem = $optionItems.eq(position);

		this.setFocusedOption(this.getOptionToggler($newOptionItem).data('val'));

	},

	refresh: function () {

		this.renderOptions();
		this.renderSelect(this.getContent());
		this.setActiveOption(this.getValue());

	},

	defaults: {
		classes: {
			wrapper: meta.ns.htmlClass,
			originalSelect: meta.ns.htmlClass + '-originalSelect',
			select: meta.ns.htmlClass + '-select',
			optionList: meta.ns.htmlClass + '-optionList',
			optionItem: meta.ns.htmlClass + '-optionItem',
			option: meta.ns.htmlClass + '-option',
			isActive: 'is-active',
			isHidden: 'is-hidden',
			isFocused: 'is-focused'
		},
		create: $.noop,
		open: $.noop,
		close: $.noop,
		select: $.noop,
		templates: {
			select: function ( data ) {
				return data.content;
			},
			option: function ( data ) {
				return data.content;
			}
		}
	}

}, dom, events, instance);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"10":10,"2":2,"3":3,"4":4,"5":5,"7":7,"9":9}],2:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

module.exports = {

	$doc: $(document),

	setupDom: function () {

		this.$el = $(this.element);

		this.$el.addClass(this.options.classes.originalSelect);

		// Setup wrapper
		this.$wrapper = $('<div />', {
			'class': this.options.classes.wrapper
		});

		// Setup select
		this.$select = $('<button />', {
			type: 'button',
			'class': this.options.classes.select
		});

		// Setup option list
		this.$optionList = $('<ul />', {
			'class': [this.options.classes.optionList, this.options.classes.isHidden].join(' ')
		});

		this.renderOptions();
		this.renderSelect(this.getContent());
		this.setActiveOption(this.getValue(), true);

		// Go!
		this.$wrapper
			.insertBefore(this.$el)
			.append(this.$el, this.$select, this.$optionList);

	},

	destroyDom: function () {

		this.$el
			.removeClass(this.options.classes.originalSelect)
			.insertBefore(this.$wrapper);

		this.$wrapper.remove();

	}

};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var meta = require(9);
var key = require(8);
var getClassSelector = require(4);

/**
 * @this {Selectdown}
 *
 * @param {Object} e
 */
function globalEventsHandler ( e ) {

	var keycode = e.which;
	var $target = $(e.target);

	if (
		keycode === key.escape ||
		($target.closest(this.$select) && $target.closest(this.$wrapper).length === 0) ||
		(!$target.closest(this.$select) && $target.closest(getClassSelector(this.options.classes.option)).length === 0)
	) {
		this.displayOptions(false);
	}

}

/**
 * @this {Selectdown}
 *
 * @param {Object} e
 */
function keyboardNavigation ( e ) {

	var keycode = e.which;

	switch ( keycode ) {

		case key.up:
		case key.down:
			// Only navigate if list is opened when pressing up/down button
			if ( !this.$optionList.hasClass(this.options.classes.isHidden) ) {
				this.navigate(keycode === key.down ? 'down' : 'up');
			}
			break;

		case key.enter:
			this.setValue(this.getOptionToggler(this.$focusedOptionItem).data('val'));
			break;
	}

}

module.exports = {

	setupEvents: function () {

		this.$el
			.on('change' + this.ens, $.proxy(function ( e, type ) {

				if ( type !== meta.name + 'syntheticChange' ) {
					this.renderSelect(this.getContent());
					this.setActiveOption(this.getValue());
				}

			}, this));

		this.$select
			.on('click' + this.ens, $.proxy(function () {

				this.displayOptions(this.$optionList.hasClass(this.options.classes.isHidden));

			}, this));

		this.$wrapper.on('click' + this.ens, getClassSelector(this.options.classes.option), $.proxy(function ( e ) {

			var $el = $(e.currentTarget);
			var val = $el.data('val');

			this.setValue(val);
			this.displayOptions(false);
			this.$el.trigger('change', [meta.name + 'syntheticChange']);

		}, this));

		this.$doc
			.on('click' + this.ens, $.proxy(globalEventsHandler, this))
			.on('keydown' + this.ens, $.proxy(globalEventsHandler, this))
			.on('keydown' + this.ens, $.proxy(keyboardNavigation, this));

	},

	destroyEvents: function () {
		this.$el.off(this.ens);
		this.$select.off(this.ens);
		this.$wrapper.off(this.ens);
		this.$doc.off(this.ens);
	}

};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"4":4,"8":8,"9":9}],4:[function(require,module,exports){
/**
 * @param  {String} className
 *
 * @return {String}
 */
module.exports = function ( className ) {
	return '.' + className.split(' ').join('.');
};

},{}],5:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var meta = require(9);

var valHooks = $.valHooks;
var propHooks = $.propHooks;

var hooks = {
	set: function ( el, val, prop ) {

		var self = $.data(el, meta.name);

		if ( self ) {

			if ( prop === 'disabled' ) {

				self.disableSelect(val);

			} else {

				var $option = self.getOriginalOption(val);

				self.renderSelect(self.getContent($option));
				self.setActiveOption(self.getValue($option));

			}

		}

		return undefined;
	}
};

valHooks.select = hooks;
propHooks.value = hooks;
propHooks.disabled = hooks;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"9":9}],6:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var Ctor = require(1);
var meta = require(9);
var isPublicMethod = require(11)(meta.publicMethods);

/**
 * @param  {Object|String} options
 *
 * @return {jQuery}
 */
var plugin = $.fn[meta.name] = module.exports = function ( options ) {

	options = options || {};

	return this.each(function () {

		var instance = $.data(this, meta.name);

		if ( isPublicMethod(options) && instance ) {
			instance[options]();
		} else if ( typeof(options) === 'object' && !instance ) {
			$.data(this, meta.name, new Ctor(this, options));
		}

	});

};
plugin.defaults = Ctor.prototype.defaults;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"1":1,"11":11,"9":9}],7:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var meta = require(9);
var instance = 0;

module.exports = {
	setupInstance: function () {
		this.uid = instance++;
		this.ens = meta.ns.event + '.' + this.uid;
	},
	destroyInstance: function () {
		$.removeData(this.element, meta.name);
	}
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"9":9}],8:[function(require,module,exports){
module.exports = {
	enter: 13,
	escape: 27,
	up: 38,
	down: 40
};

},{}],9:[function(require,module,exports){
module.exports = {
	name: 'selectdown',
	ns: {
		htmlClass: 'kist-Selectdown',
		event: '.kist.selectdown',
		dataAttr: 'kist-selectdown'
	},
	publicMethods: ['destroy','refresh']
};

},{}],10:[function(require,module,exports){
(function (global){
/* jshint maxparams:false */

var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

/**
 * @param  {String} name
 *
 * @return {Function}
 */
module.exports = function ( name ) {

	/**
	 * @param  {Object}   ctx
	 * @param  {String}   eventName
	 * @param  {Array}    data
	 * @param  {jQuery}   triggerEl
	 */
	return function ( ctx, eventName, data, triggerEl ) {
		var el = (ctx.dom && ctx.dom.el) || ctx.$el || $({});
		if ( ctx.options[eventName] ) {
			ctx.options[eventName].apply((el.length === 1 ? el[0] : el.toArray()), data);
		}
		(triggerEl || el).trigger(((name || '') + eventName).toLowerCase(), data);
	};

};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],11:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

/**
 * @param  {Array} methods
 *
 * @return {Function}
 */
module.exports = function ( methods ) {

	/**
	 * @param  {String} name
	 *
	 * @return {Boolean}
	 */
	return function ( name ) {
		return typeof(name) === 'string' && $.inArray(name, methods || []) !== -1;
	};

};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[6]);
