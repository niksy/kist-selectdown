var $ = require('jquery');
var meta = require('./meta');
var instance = 0;

module.exports = {
	setupInstance: function () {
		this.uid = instance++;
		this.ens = meta.ns.event + '.' + this.uid;
		this.assignInstanceToChildren();
	},
	destroyInstance: function () {
		$.removeData(this.element, meta.name);
		this.removeInstanceFromChildren();
	},
	assignInstanceToChildren: function () {
		$(this.element).children('option').data(meta.name, this);
	},
	removeInstanceFromChildren: function () {
		$(this.element).children('option').removeData(meta.name);
	}
};
