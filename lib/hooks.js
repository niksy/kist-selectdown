var $ = require('jquery');
var meta = require('./meta');

var valHooks = $.valHooks;
var propHooks = $.propHooks;

var hooks = {
	set: function ( el, val, prop ) {

		var self = $.data(el, meta.name);
		var $el;

		if ( self ) {

			if ( prop === 'disabled' ) {

				$el = $(el);

				if ( $el.is('select') ) {
					self.disableSelect(val);
				} else {
					self.disableOption(self.getOptionToggler(self.getOption(el.value)), val);
				}

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
