var $ = require('jquery');
var meta = require('./meta');
var key = require('./keymap');
var getClassSelector = require('./get-class-selector');

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

	// Only navigate if list is opened
	if ( this.$optionList.hasClass(this.options.classes.isHidden) ) {
		return;
	}

	switch ( keycode ) {

		case key.up:
		case key.down:
			this.navigate(keycode === key.down ? 'down' : 'up');
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
