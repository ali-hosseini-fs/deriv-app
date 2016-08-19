'use strict';

import config from 'const';

module.exports = function init(){
	Object.keys(config.opposites).forEach(function(opposites){
		Blockly.JavaScript[opposites.toLowerCase()] = function(block) {
			if ( this.parentBlock_ === null ) {
				return '';
			}
			var duration = Blockly.JavaScript.valueToCode(block, 'DURATION', Blockly.JavaScript.ORDER_ATOMIC);
			var durationType = block.getFieldValue('DURATIONTYPE_LIST');
			var payouttype = block.getFieldValue('PAYOUTTYPE_LIST');
			var currency = block.getFieldValue('CURRENCY_LIST');
			var amount = Blockly.JavaScript.valueToCode(block, 'AMOUNT', Blockly.JavaScript.ORDER_ATOMIC);
			var prediction, barrierOffset, barrierOffsetType;
			if ( config.hasPrediction.indexOf(opposites) > -1 ) {
				prediction = Blockly.JavaScript.valueToCode(block, 'PREDICTION', Blockly.JavaScript.ORDER_ATOMIC);
				if ( prediction === '' ) {
					throw {message: 'All trade types are required'};
				}
			}
			if ( config.hasBarrierOffset.indexOf(opposites) > -1 ) {
				barrierOffset = Blockly.JavaScript.valueToCode(block, 'BARRIEROFFSET', Blockly.JavaScript.ORDER_ATOMIC);
				barrierOffsetType = block.getFieldValue('BARRIEROFFSETTYPE_LIST');
				if ( barrierOffset === '' ) {
					throw {message: 'All trade types are required'};
				}
			}
			if (opposites === '' || duration === '' || payouttype === '' || currency === '' || amount === ''){
				throw {message: 'All trade types are required'};
			}
			var code = '{\n'+
				'condition: \'' + opposites + '\',\n'+
				'duration: ' + duration + ',\n'+
				'duration_unit: \'' + durationType + '\',\n'+
				'basis: \'' + payouttype + '\',\n'+
				'currency: \'' + currency + '\',\n'+
				'amount: (' + amount + ').toFixed(2),\n'+
				((config.hasPrediction.indexOf(opposites) > -1 && prediction !== '' )? 'barrier: ' + prediction + ',\n' : '' )+
				((config.hasBarrierOffset.indexOf(opposites) > -1 && barrierOffset !== '' )? 'barrier: \'' + barrierOffsetType + barrierOffset + '\',\n' : '' );
			return code;
		};
	});
};
