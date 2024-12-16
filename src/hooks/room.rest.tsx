import { useState } from 'react';
import useRestService from "./rest.tsx";

const useRoomRestService = () => {
    const [username, setUsername] = useState('');
    const [roomId, setRoomId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {get, post} = useRestService();

    const getRoom = (id: string) => {
        return get('/rooms/' + id);
    }

    const createRoom = () => {
        return post('/rooms', {});
    }

    const setReady = (roomId: string, playerId: string) => {
        return get(
            '/rooms/' + roomId + '/players/' +playerId + '/ready');
    }

    const getPossibleResults = (dicesValue: Array<number>, launchesMade: number, scoreboard: any) => {
        return post('/results', {dicesValue, launchesMade, scoreboard});
    }

    const sendResult = (roomId: string, playerId: string, result: any) => {
        return post('/rooms/' + roomId + '/players/' + playerId + '/results', {result});
    }

    return {
        username,
        setUsername,
        roomId,
        setRoomId,
        loading,
        error,
        createRoom,
        getRoom,
        setReady
    };
};

export default useRoomRestService;