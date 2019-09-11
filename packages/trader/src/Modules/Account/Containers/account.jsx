import PropTypes         from 'prop-types';
import React             from 'react';
// import Lazy          from 'App/Containers/Lazy';
import { withRouter }    from 'react-router-dom';
// import { localize }      from 'App/i18n';
import { FadeWrapper }   from 'App/Components/Animations';
// import VerticalTab       from 'App/Components/Elements/VerticalTabs/vertical-tab.jsx';
import MenuAccordion     from 'App/Components/Elements/MenuAccordion';
import AppRoutes         from 'Constants/routes';
import { connect }       from 'Stores/connect';
import 'Sass/app/modules/account.scss';

class Account extends React.Component {
    state = {
        header: this.props.routes[0].subroutes[0].title,
    };

    setWrapperRef = (node) => {
        this.wrapper_ref = node;
    };

    handleClickOutside = (event) => {
        if (this.wrapper_ref && !this.wrapper_ref.contains(event.target)) {
            this.props.history.push(AppRoutes.trade);
        }
    };

    componentDidMount() {
        this.props.enableRouteMode();
        document.addEventListener('mousedown', this.handleClickOutside);
        this.props.toggleAccount(true);
    }

    componentWillUnmount() {
        this.props.toggleAccount(false);
        this.props.disableRouteMode();
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    onChangeHeader = header => this.setState({ header });

    render () {
        // const action_bar_items = [
        //     {
        //         onClick: () => {
        //             this.props.history.push(AppRoutes.trade);
        //             this.props.toggleAccount(false);
        //         },
        //         icon : 'ModalIconClose',
        //         title: localize('Close'),
        //     },
        // ];

        return (
            <FadeWrapper
                is_visible={this.props.is_visible}
                className='account-page-wrapper'
                keyname='account-page-wrapper'
            >
                <div className='account' ref={this.setWrapperRef}>
                    {/* <VerticalTab
                        header_title={localize('Settings')}
                        action_bar={action_bar_items}
                        action_bar_classname='account__inset_header'
                        alignment='center'
                        id='account'
                        classNameHeader='account__tab-header'
                        current_path={this.props.location.pathname}
                        is_routed={true}
                        is_full_width={true}
                        list={menu_options()}
                    /> */}
                    <MenuAccordion
                        alignment='center'
                        classNameHeader='modal__tab-header'
                        is_routed={true}
                        list={this.props.routes}
                        onChangeHeader={this.onChangeHeader}
                    />
                </div>
            </FadeWrapper>
        );
    }
}

Account.propTypes = {
    disableRouteMode: PropTypes.func,
    enableRouteMode : PropTypes.func,
    history         : PropTypes.object,
    is_visible      : PropTypes.bool,
    location        : PropTypes.object,
    routes          : PropTypes.arrayOf(PropTypes.object),
    toggleAccount   : PropTypes.func,
};

export default connect(
    ({ ui }) => ({
        disableRouteMode: ui.disableRouteModal,
        enableRouteMode : ui.setRouteModal,
        is_visible      : ui.is_account_settings_visible,
        toggleAccount   : ui.toggleAccountSettings,
    })
)(withRouter(Account));
