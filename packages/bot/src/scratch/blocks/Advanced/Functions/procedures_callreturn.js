import { localize } from 'deriv-translations/lib/i18n';

Blockly.Blocks.procedures_callreturn = {
    init() {
        this.arguments = [];
        this.previousDisabledState = false;

        this.jsonInit(this.definition());
    },
    definition(){
        return {
            message0: '%1 %2',
            args0   : [
                {
                    type: 'field_label',
                    name: 'NAME',
                    text: this.id,
                },
                {
                    type: 'input_dummy',
                    name: 'TOPROW',
                },
            ],
            output         : null,
            colour         : Blockly.Colours.Special2.colour,
            colourSecondary: Blockly.Colours.Special2.colourSecondary,
            colourTertiary : Blockly.Colours.Special2.colourTertiary,
            tooltip        : localize('Custom function'),
            category       : Blockly.Categories.Functions,
        };
    },
    meta(){
        return {
            'display_name': localize('Custom function'),
            'description' : '',
        };
    },
    onchange              : Blockly.Blocks.procedures_callnoreturn.onchange,
    getProcedureDefinition: Blockly.Blocks.procedures_callnoreturn.getProcedureDefinition,
    getProcedureCall      : Blockly.Blocks.procedures_callnoreturn.getProcedureCall,
    renameProcedure       : Blockly.Blocks.procedures_callnoreturn.renameProcedure,
    setProcedureParameters: Blockly.Blocks.procedures_callnoreturn.setProcedureParameters,
    updateShape           : Blockly.Blocks.procedures_callnoreturn.updateShape,
    mutationToDom         : Blockly.Blocks.procedures_callnoreturn.mutationToDom,
    domToMutation         : Blockly.Blocks.procedures_callnoreturn.domToMutation,
    getVarModels          : Blockly.Blocks.procedures_callnoreturn.getVarModels,
    customContextMenu     : Blockly.Blocks.procedures_callnoreturn.customContextMenu,
    defType               : 'procedures_defreturn',
};

Blockly.JavaScript.procedures_callreturn = block => {
    // eslint-disable-next-line no-underscore-dangle
    const functionName = Blockly.JavaScript.variableDB_.getName(
        block.getFieldValue('NAME'),
        Blockly.Procedures.NAME_TYPE
    );
    const args = block.arguments.map(
        (arg, i) => Blockly.JavaScript.valueToCode(block, `ARG${i}`, Blockly.JavaScript.ORDER_COMMA) || 'null'
    );

    const code = `${functionName}(${args.join(', ')})`;
    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};
