import { Dropdown, Input }            from 'deriv-components';
import { Formik, Field }    from 'formik';
import React, { Component } from 'react';
import { connect }          from 'Stores/connect';
import { localize }         from 'App/i18n';
import Localize             from 'App/Components/Elements/localize.jsx';
import FormSubmitButton     from './form-submit-button.jsx';

const InputField = (props) => {
    return (
        <Field name={props.name}>
            {
                ({
                    field,
                    form: { errors, touched },
                }) => (
                    <React.Fragment>
                        <Input
                            type='text'
                            autoComplete='off'
                            maxLength='30'
                            error={touched[field.name] && errors[field.name]}
                            {...field}
                            {...props}
                        />
                    </React.Fragment>
                )
            }
        </Field>
    );
};

class AddressDetails extends Component {
    constructor(props) {
        super(props);

        this.form = React.createRef();
    }

    componentDidMount() {
        this.props.fetchStatesList();
        this.form.current.getFormikActions().validateForm();
    }

    render() {
        return (
            <Formik
                initialValues={{
                    address_line_1  : this.props.value.address_line_1,
                    address_line_2  : this.props.value.address_line_2,
                    address_city    : this.props.value.address_city,
                    address_state   : this.props.value.address_state,
                    address_postcode: this.props.value.address_postcode,
                }}
                validate={this.validateAddressDetails}
                onSubmit={(values, actions) => {
                    this.props.onSubmit(this.props.index, values, actions.setSubmitting);
                }}
                ref={this.form}
            >
                {
                    ({
                        handleSubmit,
                        isSubmitting,
                        errors,
                        values,
                        handleChange,
                        handleBlur,
                    }) => (
                        <form onSubmit={handleSubmit}>
                            <div className='personal-details-form'>
                                <div className='personal-details-form__elements'>
                                    <InputField
                                        className='dc-input--no-placeholder'
                                        name='address_line_1'
                                        required
                                        label={localize('First line of address')}
                                        placeholder={localize('First line of address')}
                                    />
                                    <InputField
                                        name='address_line_2'
                                        className='dc-input--no-placeholder'
                                        label={localize('Second line of address (optional)')}
                                        placeholder={localize('Second line of address')}
                                    />
                                    <InputField
                                        name='address_city'
                                        required
                                        className='dc-input--no-placeholder'
                                        label={localize('Town/City')}
                                        placeholder={localize('Town/City')}
                                    />
                                    <Dropdown
                                        id='address_state'
                                        className='address_state-dropdown'
                                        classNameDisplay='dc-input address_state-dropdown__display'
                                        classNameDisplaySpan='address_state-dropdown__display__span'
                                        classNameItems='address_state-dropdown__items'
                                        classNameLabel='address_state-dropdown__label'
                                        label={localize('State/Province (optional)')}
                                        list={this.props.states_list}
                                        name='address_state'
                                        value={values.address_state}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        name='address_postcode'
                                        required
                                        className='dc-input--no-placeholder'
                                        label={localize('Postal/ZIP Code')}
                                        placeholder={localize('Postal/ZIP Code')}
                                    />
                                </div>
                                <p className='personal-details-form__description'>
                                    <Localize
                                        i18n_default_text={'Any information you provide is confidential and will be used for verification purposes only.'}
                                    />
                                </p>
                            </div>
                            <FormSubmitButton
                                is_disabled={
                                    // eslint-disable-next-line no-unused-vars
                                    isSubmitting ||
                                    Object.keys(errors).length > 0
                                }
                                label='Next'
                                has_cancel
                                cancel_label='Previous'
                                onCancel={this.props.onCancel}
                            />
                        </form>
                    )
                }
            </Formik>
        );
    }

    validateAddressDetails = (values) => {
        const validations = {
            address_line_1: [
                v => !!v,
                v => /^[\p{L}\p{Nd}\s'.,:;()@#/-]{1,70}$/gu.exec(v) !== null,
            ],
            address_line_2: [
                v => !v || (/^[\p{L}\p{Nd}\s'.,:;()@#/-]{0,70}$/gu.exec(v) !== null),
            ],
            address_city: [
                v => !!v,
                v => /^[\p{L}\s'.-]{1,35}$/gu.exec(v) !== null,
            ],
            address_state: [
                v => /^[\p{L}\p{Nd}\s'.,-]{0,35}$/gu.exec(v) !== null,
            ],
            address_postcode: [
                v => !!v,
                v => /^[^+]{0,20}$/gu.exec(v) !== null,
            ],
        };

        const mappedKey = {
            address_line_1  : localize('First line of address'),
            address_line_2  : localize('Second line of address'),
            address_city    : localize('Town/City'),
            address_state   : localize('State/Province'),
            address_postcode: localize('Postal/ZIP Code'),
        };

        const required_messages = [
            '%s is required',
            '%s is not in a proper format.',
        ];

        const optional_messages = [
            '%s is not in a proper format.',
        ];

        const errors = {};

        Object.entries(validations)
            .forEach(([key, rules]) => {
                const error_index = rules.findIndex(v => !v(values[key]));
                if (error_index !== -1) {
                    switch (key) {
                        case 'address_state':
                        case 'address_line_2':
                            errors[key] =
                                localize(optional_messages[error_index].replace('%s', mappedKey[key]));
                            break;
                        default:
                            errors[key] = localize(required_messages[error_index].replace('%s', mappedKey[key]));
                    }
                }
            });

        return errors;
    };
}

export default connect(({ client }) => ({
    fetchStatesList: client.fetchStatesList,
    states_list    : client.states_list,
}))(AddressDetails);
