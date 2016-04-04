require('./hooks');

var $ = require('jquery');
var meta = require('./meta');
var dom = require('./dom');
var events = require('./events');
var instance = require('./instance');
var getClassSelector = require('./get-class-selector');
var emit = require('./emit')(meta.name);

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
	 * Disable select button
	 *
	 * @param  {Boolean} state
	 */
	disableSelect: function ( state ) {
		this.$select.prop('disabled', state);
	},

	/**
	 * Disable option button
	 *
	 * @param  {jQuery} $option
	 * @param  {Boolean} state
	 */
	disableOption: function ( $option, state ) {
		$option.prop('disabled', state);
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

			// If this option is disabled, we should render it like that
			this.disableOption($option, $el.prop('disabled'));

			$option.appendTo($optionItem);

			return $optionItem.get();

		}, this));

		this.$optionList.html(this.$optionItem);

	},

	/**
	 * @param  {Number|String} val
	 *
	 * @return {jQuery}
	 */
	getOption: function ( val ) {
		var fn = filterOptions(val);
		return this.$optionItem.filter($.proxy(fn, this));
	},

	/**
	 * @param {Number|String} val
	 * @param {Boolean} preventEmit
	 */
	setActiveOption: function ( val, preventEmit ) {

		var classes = [this.options.classes.isActive, this.options.classes.isFocused].join(' ');

		this.$activeOptionItem = this.getOption(val);

		this.$optionItem.removeClass(classes);
		this.$activeOptionItem.addClass(classes);

		if ( !preventEmit ) {
			emit(this, 'select', [this.$activeOptionItem, val, this.getOriginalOption(val)]);
		}

	},

	/**
	 * @param {Number|String} val
	 */
	setFocusedOption: function ( val ) {

		var classes = [this.options.classes.isFocused].join(' ');

		this.$focusedOptionItem = this.getOption(val);

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
		var $newOptionItem, $newOptionToggler;

		position = direction === 'down' ? ++position : --position;

		// If we are at the top, we should go to the bottom, and vice versa :)
		if ( position >= $optionItems.length ) {
			position = 0;
		} else if ( position < 0 ) {
			position = $optionItems.length - 1;
		}

		$newOptionItem = $optionItems.eq(position);
		$newOptionToggler = this.getOptionToggler($newOptionItem);


		this.setFocusedOption($newOptionToggler.data('val'));

		// If this option is disabled, navigate again in the same direction
		// until enabled one is found
		if ( $newOptionToggler.prop('disabled') ) {
			this.navigate(direction);
		}

	},

	refresh: function () {

		this.assignInstanceToChildren();
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
