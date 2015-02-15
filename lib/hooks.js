var $ = require('jquery');
var meta = require('./meta');

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
