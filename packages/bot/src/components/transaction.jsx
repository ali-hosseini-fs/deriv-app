import classNames               from 'classnames';
import {
    Money,
    Popover }                  from 'deriv-components';
import { localize }            from 'deriv-translations';
import React                   from 'react';
import ContentLoader           from 'react-content-loader';
import PropTypes               from 'prop-types';
import {
    BuyPriceIcon,
    ExitSpotIcon,
    EntrySpotIcon }            from './Icons.jsx';
import IconTradeType           from './icon-trade-types.jsx';
import { connect }             from '../stores/connect';
import { getContractTypeName } from '../utils/contract';

const TransactionIconWithText = ({ icon, title, message, className }) => (
    <React.Fragment>
        <Popover
            className={classNames(className, 'transactions__icon')}
            alignment='left'
            message={title}
        >
            { icon }
        </Popover>
        { message }
    </React.Fragment>
);

const TransactionFieldLoader = () => (
    <ContentLoader
        className='transactions__loader'
        height={10}
        width={80}
        speed={3}
        primaryColor={'var(--general-section-1)'}
        secondaryColor={'var(--general-hover)'}
    >
        <rect x='0' y='0' rx='0' ry='0' width='100' height='12' />
    </ContentLoader>
);

const PopoverItem = ({ title, children }) => (
    <div className='transactions__popover-item'>
        <div className='transactions__popover-title'>
            { title }
        </div>
        { children }
    </div>
);

const PopoverContent = ({ contract }) => (
    <React.Fragment>
        { contract.transaction_ids &&
            <PopoverItem title={localize('Reference IDs')}>
                { contract.transaction_ids.buy &&
                    <div className='transactions__popover-value'>
                        { `${contract.transaction_ids.buy} ${localize('(Buy)')}` }
                    </div>
                }
                { contract.transaction_ids.sell &&
                    <div className='transactions__popover-value'>
                        { `${contract.transaction_ids.sell} ${localize('(Sell)')}` }
                    </div>
                }
            </PopoverItem>
        }
        { contract.tick_count &&
            <PopoverItem title={localize('Duration')}>
                <div className='transactions__popover-value'>
                    { `${contract.tick_count} ${localize('ticks')}` }
                </div>
            </PopoverItem>
        }
        { contract.barrier &&
            <PopoverItem title={localize('Barrier')}>
                <div className='transactions__popover-value'>{ contract.barrier }</div>
            </PopoverItem>
            ||
            contract.high_barrier && contract.low_barrier &&
                <PopoverItem title={localize('Barriers')}>
                    <div className='transactions__popover-value'>{ `${contract.high_barrier} ${localize('(High)')}` }</div>
                    <div className='transactions__popover-value'>{ `${contract.low_barrier} ${localize('(Low)')}` }</div>
                </PopoverItem>
        }
        { contract.date_start &&
            <PopoverItem title={localize('Start time')}>
                <div className='transactions__popover-value'>{ contract.date_start }</div>
            </PopoverItem>
        }
        { contract.entry_tick &&
            <PopoverItem title={localize('Entry tick')}>
                <div className='transactions__popover-value'>{ contract.entry_tick }</div>
                { contract.entry_tick_time &&
                    <div className='transactions__popover-value'>{ contract.entry_tick_time }</div>
                }
            </PopoverItem>
            // TODO: Durations for non-tick contracts, requires helpers from Trader.
        }
        { contract.exit_tick && contract.exit_tick_time &&
            <PopoverItem title={localize('Exit tick')}>
                <div className='transactions__popover-value'>{ contract.exit_tick }</div>
                <div className='transactions__popover-value'>{ contract.exit_tick_time }</div>
            </PopoverItem>
            ||
            contract.exit_tick &&
                <PopoverItem title={localize('Exit time')}>
                    <div className='transactions__popover-value'>{ contract.exit_tick }</div>
                </PopoverItem>
        }
    </React.Fragment>
);

const Transaction = ({
    active_transaction_id,
    contract,
    index,
    setActiveTransaction,
}) => (
    <Popover
        alignment='left'
        className={classNames('transactions__item-wrapper', {
            'transactions__item-wrapper--active': contract.transaction_ids.buy === active_transaction_id,
            'transactions__item-wrapper--first' : index === 0,
        })}
        is_open={contract.transaction_ids.buy === active_transaction_id}
        message={<PopoverContent contract={contract} />}
    >
        <div
            className='transactions__item'
            onClick={() => setActiveTransaction(contract.transaction_ids.buy)}
        >
            {/* TODO: Re-enable when <Icon> is shared.
            <div className='transactions__cell transactions__symbol'>
                <TransactionIconWithText
                    icon={<UnderlyingIcon market={contract.underlying} />}
                    title={contract.display_name}
                />
            </div> */}
            <div className='transactions__cell transactions__trade-type'>
                <TransactionIconWithText
                    icon={<IconTradeType trade_type={contract.contract_type} />}
                    title={getContractTypeName(contract)}
                />
            </div>
            <div className='transactions__cell transactions__entry-spot'>
                <React.Fragment>
                    <Popover
                        className='transactions__icon'
                        alignment='left'
                        message={localize('Entry spot')}
                    >
                        <EntrySpotIcon />
                    </Popover>
                    { contract.entry_tick || <TransactionFieldLoader /> }
                </React.Fragment>
            </div>
            <div className='transactions__cell transactions__exit-spot'>
                <React.Fragment>
                    <Popover
                        className='transactions__icon'
                        alignment='left'
                        message={localize('Exit spot')}
                    >
                        <ExitSpotIcon />
                    </Popover>
                    { contract.exit_tick || <TransactionFieldLoader /> }
                </React.Fragment>
            </div>
            <div className='transactions__cell transactions__stake'>
                <TransactionIconWithText
                    icon={<BuyPriceIcon />}
                    title={localize('Buy price')}
                    message={<Money amount={contract.buy_price} currency={contract.currency} />}
                />
            </div>
            <div className='transactions__cell transactions__profit'>
                { contract.profit ?
                    <div className={classNames({
                        'transactions__profit--win' : contract.profit > 0,
                        'transactions__profit--loss': contract.profit < 0,
                    })}
                    >
                        <Money
                            amount={Math.abs(contract.profit)}
                            currency={contract.currency}
                        />
                    </div>
                    :
                    <TransactionFieldLoader />
                }
            </div>
        </div>
    </Popover>
);

Transaction.propTypes = {
    active_transaction_id: PropTypes.number,
    setActiveTransaction : PropTypes.func,
};

export default connect(({ transactions }) => ({
    active_transaction_id: transactions.active_transaction_id,
    setActiveTransaction : transactions.setActiveTransaction,
}))(Transaction);
