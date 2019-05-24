var PASSWORD_INPUT_SELECTOR  = "input[type='password'][data-security-validation]";
$.each(["focusin", "focusout", "focus", "blur"], function( index, value ) {
    if (typeof document.addEventListener === "function") {
        /* $(document).on(value, PASSWORD_INPUT_SELECTOR, focusHandler); doesn't work... to be investigated */
        document.addEventListener(value, focusHandler);
    } else {
        /* IE8 (document.addEventListener is missing) */
        $(document).on(value, PASSWORD_INPUT_SELECTOR, focusHandler);
    }
});

function focusHandler(event) {
	var $field = $(event.target);
	if (!$field.is(PASSWORD_INPUT_SELECTOR)) {
		return;
	}
	var pswBox = getPasswordInfoBox($field);
	switch(event.type) {
    case "focus":
    case "focusin":
		var position = $field.position();
		var height = $field.outerHeight();		
	    pswBox.show(position.top + height + 10, position.left);
        break;
    case "blur":
    case "focusout":
	    pswBox.hide();
        break;
	} 
};

$(document).on("keyup", PASSWORD_INPUT_SELECTOR, function(event) {
	var $field = $(event.target);
	var pswBox = getPasswordInfoBox($field);
    var value = $field.val();
    pswBox.validate(value);
});

function getPasswordInfoBox($field) {
	var pswBox = $field.data("wrPasswordBoxValidation");
	if (!pswBox) {
	    var configuration = JSON.parse($("#" +  $field.data("security-validation")).html());
		pswBox = createPasswordInfoBox($field, configuration);	
		$field.data("wrPasswordBoxValidation", pswBox);
	}
	return pswBox;
}

function createPasswordInfoBox($field, securityConfig){

   var pswSecInfoBox = $($.parseHTML("<div class='pswd_sec_info' style='position:absolute'></div>"));
   var pswSecInfoBoxTitle = $($.parseHTML("<h4></h4>")).text(securityConfig.messages.title);
   var pswSecInfoBoxCriteriaList = $($.parseHTML("<ul></ul>"));

   var pswLengthLI = $($.parseHTML("<li class='length invalid'></li>"))
   var pswLowerCaseLI = $($.parseHTML("<li class='letter invalid'></li>")).html(securityConfig.messages.useLowerLetters)
   var pswUpperCaseLI = $($.parseHTML("<li class='capital invalid'></li>")).html(securityConfig.messages.useCapitalLetters)
   var pswNumberLI = $($.parseHTML("<li class='number invalid'></li>")).html(securityConfig.messages.useNumbers)
   var pswSpecialCharLI = $($.parseHTML("<li class='special invalid'></li>")).html(securityConfig.messages.useSpecialCharacters)
   var pswNoRepetitionLI = $($.parseHTML("<li class='repetition invalid'></li>")).html(securityConfig.messages.noRepetitions);
   
   var config;
	if(securityConfig.securityLevel === "low"){

		/* add number criteria */
		pswSecInfoBoxCriteriaList.append(pswNumberLI);
		/* add lower case letter criteria */
		pswSecInfoBoxCriteriaList.append(pswLowerCaseLI);
		/* add upper case letter criteria */
		pswSecInfoBoxCriteriaList.append(pswUpperCaseLI);
		/* add min and max length criteria */
		pswLengthLI.text("4-9 " + securityConfig.messages.charactersWord);
		pswSecInfoBoxCriteriaList.append(pswLengthLI);

		config = {
			rules: [
				{validate: validateNumberCriteria, li: pswNumberLI, optional:false},
				{validate: validateLowerLetterCriteria, li: pswLowerCaseLI, optional:false},
				{validate: validateCapitalLetterCriteria, li: pswUpperCaseLI, optional:false},
				{validate: $.proxy(validateLengthCriteria, null, 4, 9), li: pswLengthLI, optional:false}
			]
		}	

	} else if(securityConfig.securityLevel === "medium"){

		/* add number criteria */
		pswSecInfoBoxCriteriaList.append(pswNumberLI);
		/* add lower case letter criteria */
		pswSecInfoBoxCriteriaList.append(pswLowerCaseLI);
		/* add upper case letter criteria */
		pswSecInfoBoxCriteriaList.append(pswUpperCaseLI);
		/* add special character criteria */
		pswSecInfoBoxCriteriaList.append(pswSpecialCharLI);	
		/* add no repetition criteria */
		pswSecInfoBoxCriteriaList.append(pswNoRepetitionLI);	
		/* add min and max length criteria */
		pswLengthLI.text("10-32 " + securityConfig.messages.charactersWord);
		pswSecInfoBoxCriteriaList.append(pswLengthLI);

		config = {
			rules: [
				{validate: validateNumberCriteria, li: pswNumberLI, optional: true},
				{validate: validateLowerLetterCriteria, li: pswLowerCaseLI, optional: true},
				{validate: validateCapitalLetterCriteria, li: pswUpperCaseLI, optional: true},
				{validate: validateSpecialCharacterCriteria, li: pswSpecialCharLI, optional: true},
				{validate: validateRepetitionCriteria, li: pswNoRepetitionLI, optional:false},
				{validate: $.proxy(validateLengthCriteria, null, 10, 32), li: pswLengthLI, optional:false}
			],
			minOptional: 3
		}				


	} else if(securityConfig.securityLevel === "high"){

		/* add number criteria */
		pswSecInfoBoxCriteriaList.append(pswNumberLI);
		/* add lower case letter criteria */
		pswSecInfoBoxCriteriaList.append(pswLowerCaseLI);
		/* add upper case letter criteria */
		pswSecInfoBoxCriteriaList.append(pswUpperCaseLI);
		/* add special character criteria */
		pswSecInfoBoxCriteriaList.append(pswSpecialCharLI);
		/* add no repetition criteria */
		pswSecInfoBoxCriteriaList.append(pswNoRepetitionLI);
		/* add min and max length criteria */
		pswLengthLI.text("10-128 " + securityConfig.messages.charactersWord);
		pswSecInfoBoxCriteriaList.append(pswLengthLI);

		config = {
			rules: [
				{validate: validateNumberCriteria, li: pswNumberLI, optional: true},
				{validate: validateLowerLetterCriteria, li: pswLowerCaseLI, optional: true},
				{validate: validateCapitalLetterCriteria, li: pswUpperCaseLI, optional: true},
				{validate: validateSpecialCharacterCriteria, li: pswSpecialCharLI, optional: true},
				{validate: validateRepetitionCriteria, li: pswNoRepetitionLI, optional:false},
				{validate: $.proxy(validateLengthCriteria, null, 10, 128), li: pswLengthLI, optional:false}
			],
			minOptional: 3
		}			

	} else {

		config = {rules: []};

		/* add number criteria */
		if(securityConfig.customOptions.useNumbers){
			pswSecInfoBoxCriteriaList.append(pswNumberLI);
			config.rules.push({validate: validateNumberCriteria, li: pswNumberLI, optional:false});
		}
		/* add lower case letter criteria */
		if(securityConfig.customOptions.useLowerLetters){
			pswSecInfoBoxCriteriaList.append(pswLowerCaseLI);
			config.rules.push({validate: validateLowerLetterCriteria, li: pswLowerCaseLI, optional:false});
		}
		if(securityConfig.customOptions.useCapitalLetters){
			/* add upper case letter criteria */
			pswSecInfoBoxCriteriaList.append(pswUpperCaseLI);
			config.rules.push({validate: validateCapitalLetterCriteria, li: pswUpperCaseLI, optional:false});
		}
		if(securityConfig.customOptions.useSpecialCharacters){
			/* add special character criteria */
			pswSecInfoBoxCriteriaList.append(pswSpecialCharLI);
			config.rules.push({validate: validateSpecialCharacterCriteria, li: pswSpecialCharLI, optional: false});
		}	
		/* add min and max length criteria */
		pswLengthLI.text(securityConfig.customOptions.minLength + "-" + securityConfig.customOptions.maxLength + " " + securityConfig.messages.charactersWord);
		config.rules.push({validate: $.proxy(validateLengthCriteria, null, securityConfig.customOptions.minLength , securityConfig.customOptions.maxLength), li: pswLengthLI, optional:false});
		pswSecInfoBoxCriteriaList.append(pswLengthLI);
				
	}

	pswSecInfoBox.append(pswSecInfoBoxTitle);
	pswSecInfoBox.append(pswSecInfoBoxCriteriaList);
	return { 
		validate: function(value){
			validatePassword(config, value);
		},	
		show: function(top, left){
			pswSecInfoBox.css({
			    "left": left + "px",
			    "top": top + "px"
			}); 
			if (!!pswSecInfoBox.parent()[0]) {
				return; //already added
			}
			pswSecInfoBox.insertAfter($field);
			pswSecInfoBox.show();
		},
		hide: function(){
			pswSecInfoBox.remove();
		}
	};
}

function validatePassword(config, value){
	var results = [];
	var requiredOptional = config.minOptional || 0;
	$.each(config.rules, function(){
		var v = this.validate(value);
		results.push({valid: v, rule: this});
		if(this.optional && v) {
			requiredOptional--;
		}
	});

	$.each(results, function(){
		this.rule.li.toggleClass("valid", this.valid)
				.toggleClass("invalid", !this.valid && (!this.rule.optional || requiredOptional > 0))		
				.toggleClass("optional", !this.valid && this.rule.optional && requiredOptional <= 0);
	});	

}

function validateNumberCriteria(value){
	return (/\d/).test(value);
}

function validateLowerLetterCriteria(value){
	return (/[a-z]/).test(value);
}

function validateCapitalLetterCriteria(value){
	return (/[A-Z]/).test(value);
}

function validateSpecialCharacterCriteria(value){
	return (/[^A-Za-z0-9]/).test(value);
}

function validateRepetitionCriteria(value){
	return (/^(?!.*(.)\1{2,})/).test(value);
}

function validateLengthCriteria(minLength, maxLength, value){
	var pswLength = value.length;
	return !(pswLength < minLength || pswLength > maxLength ); 
}
