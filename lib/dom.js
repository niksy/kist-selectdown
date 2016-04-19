var $ = require('jquery');
var meta = require('./meta');

module.exports = {

	$doc: $(document),

	setupDom: function () {

		var listId = meta.ns.htmlClass + '-list-' + this.uid;

		this.$el = $(this.element);

		this.$el
			.addClass(this.options.classes.originalSelect)
			.attr({
				tabindex: -1,
				'aria-autocomplete': 'list',
				'aria-owns': listId,
				'aria-readonly': true
			});

		// Setup wrapper
		this.$wrapper = $('<div />', {
			'class': this.options.classes.wrapper,
			role: 'combobox',
			'aria-activedescendant': ''
		});

		// Setup select
		this.$select = $('<button />', {
			type: 'button',
			'class': this.options.classes.select,
			'aria-controls': listId
		});

		// Setup option list
		this.$optionList = $('<ul />', {
			id: listId,
			'class': [this.options.classes.optionList, this.options.classes.isHidden].join(' '),
			role: 'listbox',
			'aria-expanded': false
		});

		this.renderOptions();
		this.renderSelect(this.getContent());
		this.setActiveOption(this.getValue(), true);
		this.setFocusedOption(this.getValue());

		// If select is disabled at start, we should render it like that
		this.disableSelect(this.$el.prop('disabled'));

		// Go!
		this.$wrapper
			.insertBefore(this.$el)
			.append(this.$el, this.$select, this.$optionList);

	},

	destroyDom: function () {

		this.$el
			.removeClass(this.options.classes.originalSelect)
			.insertBefore(this.$wrapper)
			.removeAttr('aria-autocomplete aria-owns aria-readonly tabindex');

		this.$wrapper.remove();

	}

};
