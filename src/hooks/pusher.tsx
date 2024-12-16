import { useEffect, useState, useCallback } from 'react';
import Pusher from 'pusher-js';

const usePusher = () => {
    const [pusher, setPusher] = useState<any>(null);
    const [pusherChannel, setPusherChannel] = useState<any>(null);

    const initializePusher = useCallback(() => {
        const roomId: string = localStorage.getItem('roomId')!;
        const username = localStorage.getItem('username')!;

        Pusher.logToConsole = true;

        const pusherInstance = new Pusher("672ce2e771fcd7bdc944", {
            cluster: "us2",
            authEndpoint: "https://cacheando-api-64de34de5015.herokuapp.com/pusher/auth",
            auth: {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                params: {
                    username,
                    roomId,
                }
            },
        });

        setPusher(pusherInstance);
    }, []);

    useEffect(() => {
        initializePusher();
    }, [initializePusher]);

    const setChannel = (channelName: string) => {
        if (pusher) {
            const channel = pusher.subscribe(channelName);
            setPusherChannel(channel);
        }
    };

    const getChannel = () => {
        return pusherChannel;
    };

    const bind = (eventName: string, callback: any) => {
        if (pusherChannel) {
            pusherChannel.bind(eventName, callback);
        }
    };

    const triggerEvent = (eventName: string, params: any) => {
        if (pusherChannel) {
            pusherChannel.trigger(eventName, params);
        }
    };

    return {
        setChannel,
        getChannel,
        bind,
        triggerEvent,
    };
};

export default usePusher;