import { useState, useEffect, useCallback } from 'react';
import { BehaviorSubject } from 'rxjs';
import RoomRestService from '../rest/room.rest-service';

const useRoomRealtime = () => {
    const [channelName, setChannelName] = useState(localStorage.getItem('channel') || '');
    const [roomId, setRoomId] = useState(localStorage.getItem('roomId') || '');
    const [players, setPlayers] = useState([]);
    const [playing, setPlaying] = useState(false);
    const [finished, setFinished] = useState(false);
    const [playerInTurnId, setPlayerInTurnId] = useState('');
    const [messages, setMessages] = useState([]);
    const [dicesValue, setDicesValue] = useState([]);
    const [mixingDices, setMixingDices] = useState(false);
    const [hasTurnedADice, setHasTurnedADice] = useState(false);
    const [previousTurnedDice, setPreviousTurnedDice] = useState(-1);
    const actionsMadeBS = new BehaviorSubject(0);
    const [me, setMe] = useState({
        id: '',
        ready: false,
        username: localStorage.getItem('username') || ''
    });

    const pusherService = new PusherService();
    const roomRestService = new RoomRestService();

    const initializeChannel = useCallback(() => {
        pusherService.setChannel(channelName);

        pusherService.bind('pusher:subscription_succeeded', onSubscriptionSucceeded);
        pusherService.bind('pusher:subscription_error', onSubscriptionError);
        pusherService.bind('pusher:member_added', onMemberAdded);
        pusherService.bind('pusher:member_removed', onMemberRemoved);
        pusherService.bind(`client-${channelName}-messages`, onNewMessage);
        pusherService.bind(`client-${channelName}-ready`, onImReadyPlayer);
        pusherService.bind(`client-${channelName}-start-game`, onStartGame);
        pusherService.bind(`client-${channelName}-throw-dices`, onThrownDice);
        pusherService.bind(`client-${channelName}-dices-value`, onDicesValue);
        pusherService.bind(`client-${channelName}-dice-selection`, onDiceSelectionChanged);
        pusherService.bind(`client-${channelName}-deselect-dices`, onDeselectDices);
        pusherService.bind(`client-${channelName}-turned-dice`, onTurnedDice);
        pusherService.bind(`client-${channelName}-turn-finished`, onTurnFinished);
        pusherService.bind(`client-${channelName}-end-game`, onEndGame);
    }, [channelName]);

    useEffect(() => {
        initializeChannel();
    }, [initializeChannel]);

    const onSubscriptionSucceeded = () => {
        console.log('subscription succeed');
        resetPlayers();
        setMe((prevMe) => ({
            ...prevMe,
            id: pusherService.getChannel().members.me.id,
            ready: false
        }));

        roomRestService.getRoom(roomId).subscribe((res) => {
            setPlaying(res.playing);
            if (res.playing) {
                localStorage.setItem('playerInTurnId', res.playerInTurnId);
                setPlayerInTurnId(res.playerInTurnId);
                setDicesValue(Array.from({ length: 5 }, () => ({
                    selected: false,
                    value: Math.floor(Math.random() * 6) + 1
                })));
                setPlayers(res.players.map((resPlayer) => ({
                    id: resPlayer.id,
                    info: {
                        username: resPlayer.username,
                        ready: resPlayer.ready
                    },
                    scoreboard: resPlayer.scoreboard
                })));
            }
        });
    };

    const onSubscriptionError = () => {
        console.log('subscription error');
    };

    const onMemberAdded = (data) => {
        setMessages((prevMessages) => [...prevMessages, `${data.info.username} se ha unido.`]);
        setPlayers((prevPlayers) => [...prevPlayers, data]);
    };

    const onMemberRemoved = (data) => {
        setMessages((prevMessages) => [...prevMessages, `${data.info.username} ha salido.`]);
        setPlayers((prevPlayers) => prevPlayers.filter((player) => player.id !== data.id));
    };

    const onNewMessage = (data) => {
        setMessages((prevMessages) => [...prevMessages, `${data.username}: ${data.message}`]);
    };

    const onImReadyPlayer = (data) => {
        setPlayers((prevPlayers) => {
            const playerReady = prevPlayers.find((player) => player.id === data.playerReadyId);
            if (playerReady) {
                playerReady.info.ready = !playerReady.info.ready;
            }
            return [...prevPlayers];
        });
        if (data.playerReadyId === me.id) {
            setMe((prevMe) => ({ ...prevMe, ready: !prevMe.ready }));
        }
    };

    const onStartGame = (data) => {
        setPlayers((prevPlayers) => prevPlayers.map((player) => ({ ...player, scoreboard: {} })));
        localStorage.setItem('playerInTurnId', data.firstPlayer.id);
        setPlayerInTurnId(data.firstPlayer.id);
        setPlaying(true);
        setFinished(false);
        setDicesValue(Array.from({ length: 5 }, () => ({
            selected: false,
            value: Math.floor(Math.random() * 6) + 1
        })));
    };

    const onEndGame = (data) => {
        setFinished(true);
        setPlayerInTurnId(data.winner.id);
        setPlayers((prevPlayers) => {
            const playerInTurn = prevPlayers.find((player) => player.id === data.playerInTurn.id);
            if (playerInTurn) {
                playerInTurn.scoreboard = data.playerInTurn.scoreboard;
            }
            return prevPlayers.map((player) => ({ ...player, info: { ...player.info, ready: false } }));
        });
    };

    const onThrownDice = () => {
        setMixingDices(true);
    };

    const onDicesValue = (data) => {
        setMixingDices(false);
        setDicesValue(data);
    };

    const onDiceSelectionChanged = (data) => {
        setDicesValue((prevDicesValue) => {
            const newDicesValue = [...prevDicesValue];
            newDicesValue[data.diceIndex].selected = !newDicesValue[data.diceIndex].selected;
            return newDicesValue;
        });
    };

    const onDeselectDices = () => {
        setDicesValue((prevDicesValue) => prevDicesValue.map((dice) => ({ ...dice, selected: false })));
    };

    const onTurnedDice = () => {
        setDicesValue((prevDicesValue) => {
            const dice = prevDicesValue.find((dice) => dice.selected);
            if (dice) {
                dice.value = 7 - dice.value;
            }
            return [...prevDicesValue];
        });
    };

    const onTurnFinished = (data) => {
        setDicesValue((prevDicesValue) => prevDicesValue.map((dice) => ({ ...dice, selected: false })));
        setPlayers((prevPlayers) => {
            const playerInTurn = prevPlayers.find((player) => player.id === data.playerInTurn.id);
            if (playerInTurn) {
                playerInTurn.scoreboard = data.playerInTurn.scoreboard;
            }
            return [...prevPlayers];
        });
        localStorage.setItem('playerInTurnId', data.nextPlayer.id);
        setPlayerInTurnId(data.nextPlayer.id);
        setHasTurnedADice(false);
        actionsMadeBS.next(0);
        setPreviousTurnedDice(-1);
        setMixingDices(false);
    };

    const resetPlayers = () => {
        setPlayers([]);
        pusherService.getChannel().members.each((member) => {
            setPlayers((prevPlayers) => [...prevPlayers, member]);
        });
    };

    const sendMessage = (message) => {
        pusherService.triggerEvent(`client-${channelName}-messages`, {
            message,
            username: me.username,
        });
        setMessages((prevMessages) => [...prevMessages, `${me.username}: ${message}`]);
    };

    const getMe = () => {
        return this.me;
    }

    const generateRandomDicesValue = () => {
        setDicesValue((prevDicesValue) => prevDicesValue.map((dice) => {
            if (!dice.selected) {
                return { ...dice, value: Math.floor(Math.random() * 6) + 1 };
            }
            return dice;
        }));
    };

    const nextTurnAction = () => {
        const launchesMade = actionsMadeBS.value;
        if (launchesMade <= 1) {
            throwDices();
        }
        if (launchesMade === 2) {
            turnDice();
        }
    };

    const turnDice = () => {
        setHasTurnedADice(true);
        setDicesValue((prevDicesValue) => {
            const dice = prevDicesValue.find((dice) => dice.selected);
            if (dice) {
                dice.value = 7 - dice.value;
            }
            return [...prevDicesValue];
        });
        pusherService.triggerEvent(`client-${channelName}-turned-dice`, {});
        actionsMadeBS.next(actionsMadeBS.value + 1);
    };

    const throwDices = () => {
        setMixingDices(true);
        sendThrowDicesEvent();
        setTimeout(() => {
            generateRandomDicesValue();
            sendDicesValueEvent(dicesValue);
            setMixingDices(false);
            actionsMadeBS.next(actionsMadeBS.value + 1);
        }, 3000);
    };

    const sendThrowDicesEvent = () => {
        pusherService.triggerEvent(`client-${channelName}-throw-dices`, {});
    };

    const sendDicesValueEvent = (dices) => {
        pusherService.triggerEvent(`client-${channelName}-dices-value`, dices);
    };

    const deselectDices = () => {
        setDicesValue((prevDicesValue) => prevDicesValue.map((dice) => ({ ...dice, selected: false })));
        pusherService.triggerEvent(`client-${channelName}-deselect-dices`, {});
    };

    const hasSelectedDice = () => {
        return dicesValue.some((dice) => dice.selected);
    };

    const getPlayerInTurn = () => {
        return players.find((player) => player.id === playerInTurnId);
    };

    const prepareForGame = () => {
        setPlaying(false);
        setMe((prevMe) => ({ ...prevMe, ready: false }));
    };

    return {
        channelName,
        roomId,
        players,
        playing,
        finished,
        playerInTurnId,
        messages,
        dicesValue,
        mixingDices,
        hasTurnedADice,
        previousTurnedDice,
        actionsMadeBS,
        me,
        setMe,
        getMe,
        sendMessage,
        generateRandomDicesValue,
        nextTurnAction,
        turnDice,
        throwDices,
        sendThrowDicesEvent,
        sendDicesValueEvent,
        deselectDices,
        hasSelectedDice,
        getPlayerInTurn,
        prepareForGame,
    };
};

export default useRoomRealtime;