var $ = require('jquery');

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
		this.setFocusedOption(this.getValue());

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
