var $ = require('jquery');
var meta = require('./meta');
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
