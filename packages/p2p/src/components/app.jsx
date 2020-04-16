import classNames from 'classnames';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ObjectUtils from '@deriv/shared/utils/object';
import { Tabs } from '@deriv/components';
import { Dp2pProvider } from 'Components/context/dp2p-context';
import ServerTime from 'Utils/server-time';
import { init as WebsocketInit, getModifiedP2POrderList, requestWS, subscribeWS } from 'Utils/websocket';
import { localize, setLanguage } from './i18next';
import BuySell from './buy-sell/buy-sell.jsx';
import MyAds from './my-ads/my-ads.jsx';
// import MyProfile  from './my-profile/my-profile.jsx';
import Orders from './orders/orders.jsx';
import './app.scss';

const allowed_currency = 'USD';

const path = {
    buy_sell: 0,
    orders: 1,
    my_ads: 2,
    // my_profile: 3,
};

class App extends Component {
    constructor(props) {
        super(props);

        setLanguage(this.props.lang);
        WebsocketInit(this.props.websocket_api, this.props.client.local_currency_config.decimal_places);
        ServerTime.init(this.props.server_time);

        this.state = {
            active_index: 0,
            orders: [],
            notification_count: 0,
            parameters: null,
            is_advertiser: false,
            advertiser_id: null,
            advertiser_name: null,
            chat_info: {
                app_id: '',
                user_id: '',
                token: '',
            },
        };
    }

    redirectTo = (path_name, params = null) => {
        this.setState({ active_index: path[path_name], parameters: params });
    };

    handleTabClick = idx => {
        this.setState({ active_index: idx, parameters: null });
    };

    setIsAdvertiser = advertiser_info => {
        /* if there is no error means it's an advertiser else it's a client */
        if (!advertiser_info.error) {
            const advertiser_id = ObjectUtils.getPropertyValue(advertiser_info, ['p2p_advertiser_info', 'id']);
            const advertiser_name = ObjectUtils.getPropertyValue(advertiser_info, ['p2p_advertiser_info', 'name']);
            this.setState({ advertiser_id, advertiser_name, is_advertiser: true });
        }
    };

    setChatInformation = advertiser_info => {
        if (!advertiser_info.error) {
            // This is using QA10 SendBird AppId, please change to production's SendBird AppId when we deploy to production.
            const app_id = '0D7CB7BD-554A-43D0-A34E-945C299B49D4';
            const user_id = ObjectUtils.getPropertyValue(advertiser_info, ['p2p_advertiser_info', 'chat_user_id']);
            const token =
                ObjectUtils.getPropertyValue(advertiser_info, ['p2p_advertiser_info', 'chat_token']) ||
                requestWS({ service_token: 1, service: 'sendbird' }).then(val => val);
            this.setState({ chat_info: { app_id, user_id, token } });
        }
    };

    handleNotifications = orders => {
        let p2p_notification_count = 0;

        orders.forEach(order => {
            const type = order.is_incoming
                ? ObjectUtils.getPropertyValue(order, ['advert_details', 'type'])
                : order.type;

            // show notifications for:
            // 1. buy orders that are pending buyer payment, or
            // 2. sell orders that are pending seller confirmation
            if (type === 'buy' ? order.status === 'pending' : order.status === 'buyer-confirmed') {
                p2p_notification_count++;
            }
        });
        this.setState({ notification_count: p2p_notification_count });
        this.props.setNotificationCount(p2p_notification_count);
    };

    setP2pOrderList = order_response => {
        // check if there is any error
        if (!order_response.error) {
            if (order_response.p2p_order_list) {
                // it's an array of orders from p2p_order_list
                this.setState({ orders: getModifiedP2POrderList(order_response.p2p_order_list.list) });
                this.handleNotifications(order_response.p2p_order_list.list);
            } else {
                // it's a single order from p2p_order_info
                const idx_order_to_update = this.state.orders.findIndex(order => order.id === order_response.id);
                const updated_orders = [...this.state.orders];
                // if it's a new order, add it to the top of the list
                if (idx_order_to_update < 0) {
                    updated_orders.unshift(order_response);
                } else {
                    // otherwise, update the correct order
                    updated_orders[idx_order_to_update] = order_response;
                }
                // trigger re-rendering by setting orders again
                this.setState({ orders: updated_orders });
                this.handleNotifications(updated_orders);
            }
        }
    };

    setAdvertiserName = advertiser_name => {
        this.setState({ advertiser_name });
    };

    componentDidMount() {
        subscribeWS({ p2p_advertiser_info: 1, subscribe: 1 }, [this.setIsAdvertiser, this.setChatInformation]);
        subscribeWS({ p2p_order_list: 1, subscribe: 1 }, [this.setP2pOrderList]);
    }

    render() {
        const { active_index, orders, parameters, notification_count, chat_info } = this.state;
        const {
            className,
            client: { currency, local_currency_config, is_virtual, residence },
            custom_strings,
        } = this.props;

        // TODO: remove allowed_currency check once we publish this to everyone
        if (is_virtual || currency !== allowed_currency) {
            return (
                <h1 className='p2p-not-allowed'>
                    {localize('This feature is only available for real-money USD accounts right now.')}
                </h1>
            );
        }

        return (
            <Dp2pProvider
                value={{
                    currency,
                    local_currency_config,
                    residence,
                    advertiser_id: this.state.advertiser_id,
                    advertiser_name: this.state.advertiser_name,
                    is_advertiser: this.state.is_advertiser,
                    email_domain: ObjectUtils.getPropertyValue(custom_strings, 'email_domain') || 'deriv.com',
                }}
            >
                <main className={classNames('deriv-p2p', className)}>
                    <Tabs onTabItemClick={this.handleTabClick} active_index={active_index} top>
                        <div label={localize('Buy/Sell')}>
                            <BuySell navigate={this.redirectTo} params={parameters} />
                        </div>
                        <div count={notification_count} label={localize('Orders')}>
                            <Orders
                                navigate={this.redirectTo}
                                orders={orders}
                                params={parameters}
                                chat_info={chat_info}
                            />
                        </div>
                        <div label={localize('My ads')}>
                            <MyAds navigate={this.redirectTo} params={parameters} />
                        </div>
                        {/* TODO [p2p-uncomment] uncomment this when profile is ready */}
                        {/* <div label={localize('My profile')}>
                            <MyProfile navigate={this.redirectTo} params={parameters} />
                        </div> */}
                    </Tabs>
                </main>
            </Dp2pProvider>
        );
    }
}

App.propTypes = {
    client: PropTypes.shape({
        currency: PropTypes.string.isRequired,
        custom_strings: PropTypes.shape({
            email_domain: PropTypes.string,
        }),
        is_virtual: PropTypes.bool.isRequired,
        local_currency_config: PropTypes.shape({
            currency: PropTypes.string.isRequired,
            decimal_places: PropTypes.number.isRequired,
        }).isRequired,
        residence: PropTypes.string.isRequired,
    }),
    lang: PropTypes.string,
    setNotificationCount: PropTypes.func,
    websocket_api: PropTypes.object.isRequired,
};

export default App;
