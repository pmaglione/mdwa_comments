var locale = require("sdk/l10n").get;
var woa = require("./extensionManager").getInstance(locale);
	woa.devMode();

exports.onUnload = function (reason) {
	if(reason == 'uninstall' || reason == 'upgrade' || reason == 'downgrade'){
		woa.askUserToKeepDatabase();
	}
};