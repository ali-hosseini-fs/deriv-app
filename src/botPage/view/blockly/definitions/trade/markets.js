'use strict';
// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#zr2375

import { translator } from '../../../../../common/translator';
import { relationChecker } from '../../relationChecker';
import { bot } from '../../../../bot';

module.exports = function init(){
	
	var symbolNames = bot.symbol.activeSymbols.getSymbolNames();

	Object.keys(symbolNames).forEach(function(symbol){
		Blockly.Blocks[symbol.toLowerCase()] = {
			init: function() {
				this.appendDummyInput()
					.appendField(symbolNames[symbol]);
				this.appendDummyInput()
					.appendField(translator.translateText('Accepts') + ': (' + bot.symbol.getAllowedCategoryNames(symbol) + ')');
				this.appendStatementInput("CONDITION")
					.setCheck("Condition");
				this.setInputsInline(false);
				this.setPreviousStatement(true, "Submarket");
				this.setColour("#f2f2f2");
				this.setTooltip(translator.translateText('Chooses the symbol:') + ' ' + symbolNames[symbol]);
				this.setHelpUrl('https://github.com/binary-com/binary-bot/wiki');
			},
			onchange: function(ev){
				
				relationChecker.submarket(this, ev);
			}
		};
	});
};
