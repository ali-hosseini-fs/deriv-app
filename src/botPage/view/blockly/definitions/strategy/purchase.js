'use strict';
// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#pbvgpo
import { utils } from '../../../blockly/utils';
import { relationChecker } from '../../relationChecker';
import { translator } from '../../../../../common/translator';


Blockly.Blocks.purchase = {
	init: function() {
		this.appendDummyInput()
			.appendField(translator.translateText("Purchase"))
			.appendField(new Blockly.FieldDropdown(function(){
				return utils.getPurchaseChoices();
			}), "PURCHASE_LIST");
		this.setPreviousStatement(true, 'Purchase');
		this.setColour("#f2f2f2");
		this.setTooltip(translator.translateText('Purchases a chosen contract.'));
		this.setHelpUrl('https://github.com/binary-com/binary-bot/wiki');
	},
	onchange: function(ev) {
		
		relationChecker.insideStrategy(this, ev, 'Purchase');
	},
};
