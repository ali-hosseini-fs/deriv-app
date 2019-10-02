import classNames           from 'classnames';
import PropTypes            from 'prop-types';
import React                from 'react';
import {
    Button,
    Dropdown,
    Input }                 from 'deriv-components';
import {
    Field,
    Formik,
    Form }                  from 'formik';
import CurrencyUtils        from 'deriv-shared/utils/currency';
import Localize             from 'App/Components/Elements/localize.jsx';
import { localize }         from 'App/i18n';
import Icon                 from 'Assets/icon.jsx';
import { connect }          from 'Stores/connect';
import {
    validNumber,
    getPreBuildDVRs }       from 'Utils/Validator/declarative-validation-rules';
import PaymentAgentReceipt  from './payment-agent-receipt.jsx';
import Error                from '../error.jsx';
import Loading              from '../../../../templates/_common/components/loading.jsx';

const validateWithdrawal = (values, { balance, currency, payment_agent }) => {
    const errors = {};

    if (values.payment_method === 'payment_agent' && (!values.payment_agent || !/^[A-Za-z]+[0-9]+$/.test(values.payment_agent))) {
        errors.payment_agent = localize('Please enter a valid payment agent ID.');
    }

    if (!values.amount) {
        errors.amount = localize('This field is required.');
    } else if (!validNumber(
        values.amount,
        {
            type    : 'float',
            decimals: CurrencyUtils.getDecimalPlaces(currency),
            ...(payment_agent.min_withdrawal && {
                min: payment_agent.min_withdrawal,
                max: payment_agent.max_withdrawal,
            }),
        },
    )) {
        errors.amount = getPreBuildDVRs().number.message;
    } else if (+balance < +values.amount) {
        errors.amount = localize('Insufficient balance.');
    }

    return errors;
};

// TODO: refactor this to use the main radio component for forms too if possible
const Radio = ({
    children,
    field,
    props,
}) => (
    <div>
        <input
            id={props.id}
            className={props.className}
            name={field.name}
            value={props.id}
            checked={field.value === props.id}
            onChange={field.onChange}
            type='radio'
        />
        <label htmlFor={props.id} className='payment-agent__radio-wrapper'>
            <span
                className={ classNames('payment-agent__radio-circle', {
                    'payment-agent__radio-circle--selected': field.value === props.id,
                }) }
            />
            {children}
        </label>
    </div>
);

const RadioDropDown = ({
    field,
    values,
    ...props
}) => (
    <Radio field={field} props={props}>
        <span className='payment-agent__radio-label cashier__paragraph'>
            <Localize i18n_default_text='By name' />
        </span>
        <Field name='payment_agents'>
            {(params) => (
                <Dropdown
                    className='cashier__drop-down payment-agent__drop-down'
                    classNameDisplay='cashier__drop-down-display'
                    classNameDisplaySpan='cashier__drop-down-display-span'
                    classNameItems='cashier__drop-down-items'
                    list={props.payment_agent_list}
                    value={values.payment_agents}
                    onChange={(e) => {
                        params.form.setFieldValue('payment_agents', e.target.value);
                    }}
                />
            )}
        </Field>
    </Radio>
);

const RadioInput = ({
    touched,
    errors,
    field,
    values,
    ...props
}) => (
    <Radio field={field} props={props}>
        <span className='payment-agent__radio-label cashier__paragraph'>
            <Localize i18n_default_text='By payment agent ID' />
        </span>
        <Field>
            {(params) => (
                <Input
                    name='payment_agent'
                    className='payment-agent__input'
                    classNameError='payment-agent__input-error'
                    type='text'
                    placeholder='CR'
                    error={ touched.payment_agent && errors.payment_agent }
                    autoComplete='off'
                    maxLength='20'
                    value={values.payment_agent}
                    onChange={params.field.onChange}
                    onFocus={() => {
                        params.form.setFieldValue('payment_method', props.id);
                    }}
                    onBlur={params.field.onBlur}
                />
            )}
        </Field>
    </Radio>
);

class PaymentAgentWithdraw extends React.Component {
    componentDidMount() {
        this.props.onMount();
    }

    validateWithdrawalPassthrough = (values) => (
        validateWithdrawal(values, {
            balance      : this.props.balance,
            currency     : this.props.currency,
            payment_agent: values.payment_method === 'payment_agent'
                ? {}
                : this.props.payment_agent_list.find(pa => pa.value === values.payment_agents),
        })
    );

    onWithdrawalPassthrough = (values) => {
        this.props.requestPaymentAgentWithdraw({
            loginid          : values[values.payment_method],
            currency         : this.props.currency,
            amount           : values.amount,
            verification_code: this.props.verification_code,
        });
    };

    render() {
        return (
            <React.Fragment>
                {this.props.is_loading ?
                    <Loading className='cashier__loader' />
                    :
                    <React.Fragment>
                        {/* for errors with CTA hide the form and show the error,
                         for others show them at the bottom of the form next to submit button */}
                        {this.props.error.button_text ?
                            <Error error={this.props.error} />
                            :
                            <div className='cashier__wrapper--align-left'>
                                {this.props.is_withdraw_successful ?
                                    <PaymentAgentReceipt />
                                    :
                                    <React.Fragment>
                                        <h2 className='cashier__header'>
                                            <Localize i18n_default_text='Payment agent withdrawal' />
                                        </h2>
                                        <Formik
                                            initialValues={{
                                                amount        : '',
                                                payment_agent : '',
                                                payment_agents: (this.props.payment_agent_list[0] || {}).value,
                                                payment_method: 'payment_agents',
                                            }}
                                            validate={this.validateWithdrawalPassthrough}
                                            onSubmit={this.onWithdrawalPassthrough}
                                        >
                                            {
                                                ({ errors, isSubmitting, isValid, values, touched }) => (
                                                    <Form>
                                                        <div className='payment-agent__radio-group'>
                                                            <Field
                                                                id='payment_agents'
                                                                component={RadioDropDown}
                                                                payment_agent_list={this.props.payment_agent_list}
                                                                className='payment-agent__radio'
                                                                name='payment_method'
                                                                values={values}
                                                            />
                                                            <Field
                                                                id='payment_agent'
                                                                component={RadioInput}
                                                                touched={touched}
                                                                errors={errors}
                                                                values={values}
                                                                className='payment-agent__radio'
                                                                name='payment_method'
                                                            />
                                                        </div>
                                                        <Field name='amount'>
                                                            {({ field }) => (
                                                                <Input
                                                                    { ...field }
                                                                    className='cashier__input-long dc-input--no-placeholder'
                                                                    type='text'
                                                                    label={localize('Amount')}
                                                                    error={ touched.amount && errors.amount }
                                                                    required
                                                                    leading_icon={<span className={classNames('cashier__amount-symbol', 'symbols', `symbols--${this.props.currency.toLowerCase()}`)} />}
                                                                    autoComplete='off'
                                                                    maxLength='30'
                                                                />
                                                            )}
                                                        </Field>
                                                        <div className='cashier__form-submit'>
                                                            {this.props.error.message &&
                                                            <React.Fragment>
                                                                <Icon icon='IconEmergency' className='cashier__form-error-icon' />
                                                                <Icon icon='IconError' className='cashier__form-error-small-icon' />
                                                                <p className='cashier__form-error'>
                                                                    {this.props.error.message}
                                                                </p>
                                                            </React.Fragment>
                                                            }
                                                            <Button
                                                                className='cashier__form-submit-button btn--primary--default'
                                                                type='submit'
                                                                is_disabled={!isValid || isSubmitting}
                                                            >
                                                                <Localize i18n_default_text='Withdraw' />
                                                            </Button>
                                                        </div>
                                                    </Form>
                                                )
                                            }
                                        </Formik>
                                    </React.Fragment>
                                }
                            </div>
                        }
                    </React.Fragment>
                }
            </React.Fragment>
        );
    }
}

PaymentAgentWithdraw.propTypes = {
    balance                    : PropTypes.string,
    currency                   : PropTypes.string,
    error_message_withdraw     : PropTypes.string,
    is_loading                 : PropTypes.bool,
    is_withdraw_successful     : PropTypes.bool,
    onMount                    : PropTypes.func,
    payment_agent_list         : PropTypes.array,
    requestPaymentAgentWithdraw: PropTypes.func,
    verification_code          : PropTypes.string,
};

export default connect(
    ({ client, modules }) => ({
        balance                    : client.balance,
        currency                   : client.currency,
        error                      : modules.cashier.config.payment_agent.error,
        is_loading                 : modules.cashier.is_loading,
        is_withdraw_successful     : modules.cashier.config.payment_agent.is_withdraw_successful,
        onMount                    : modules.cashier.onMountPaymentAgentWithdraw,
        payment_agent_list         : modules.cashier.config.payment_agent.agents,
        requestPaymentAgentWithdraw: modules.cashier.requestPaymentAgentWithdraw,
    })
)(PaymentAgentWithdraw);
