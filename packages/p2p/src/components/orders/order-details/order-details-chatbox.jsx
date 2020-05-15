import React, { useState } from 'react';
import { Loading } from '@deriv/components';
import { Channel, SendBirdProvider } from 'sendbird-uikit';
// import { getShortNickname, generateHexColourFromNickname } from 'Utils/string';
import 'sendbird-uikit/dist/index.css';

const OrderDetailsChatbox = ({ token, app_id, user_id, channel_url }) => {
    const [is_loading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const interval_header = setInterval(() => {
            const el_sendbird_conversation = document.querySelector('.sendbird-conversation');
            const el_chat_title = document.querySelector('.sendbird-chat-header__title');
            // const el_chat_avatars = document.getElementsByClassName('sendbird-avatar');

            if (el_chat_title && el_chat_title.innerText !== 'No title') {
                clearInterval(interval_header);
                setIsLoading(false);
                el_sendbird_conversation.setAttribute('style', 'display: flex;');
            }

            // if (el_chat_avatars) {
            //     const short_name = getShortNickname(nickname);
            //     Array.from(el_chat_avatars).map(element => {
            //         if (element.innerText !== short_name) {
            //             element.innerText = short_name;
            //             element.style.backgroundColor = generateHexColourFromNickname(nickname);
            //         }
            //     });
            // }
        }, 100);

        return () => {
            clearInterval(interval_header);
        };
    }, []);

    return (
        <div className='sendbird-container'>
            {is_loading && <Loading is_fullscreen={false} />}
            <SendBirdProvider appId={app_id} userId={user_id} accessToken={token}>
                <Channel channelUrl={channel_url} />
            </SendBirdProvider>
        </div>
    );
};

export default OrderDetailsChatbox;
