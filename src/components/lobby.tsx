import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useRoomRealtime from "../hooks/room.pusher";
import useRoomRestService from "../hooks/room.rest";

const Lobby: React.FC = () => {
    const navigate = useNavigate();
    const roomRealtimeService = useRoomRealtime();
    const roomRestService = useRoomRestService();
    const [username, setUsername] = useState(localStorage.getItem('username') || '');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [roomId, setRoomId] = useState(localStorage.getItem('roomId') || '');
    const messagesContainer = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollToBottom();
    }, [roomRealtimeService.messages]);

    const scrollToBottom = () => {
        if (messagesContainer.current) {
            messagesContainer.current.scrollTop = messagesContainer.current.scrollHeight;
        }
    };

    const sendMessage = () => {
        if (message.length > 30) {
            alert('Mensaje muy largo');
            return;
        }
        roomRealtimeService.sendMessage(message);
        setMessage('');
    };

    const toggleReady = () => {
        setLoading(true);
        roomRestService.setReady(roomId, roomRealtimeService.getMe().id).subscribe(
            () => {
                setTimeout(() => {
                    setLoading(false);
                }, 1000);
            }
        );
    };

    return (
        <div>
            <div className="row my-2">
                <div className="col-sm-10 mx-sm-auto col-md col-lg-4 me-lg-0">
                    <div className="border border-dark rounded-3">
                        <div className="overflow-y-auto" style={{ height: '10rem' }} ref={messagesContainer}>
                            {roomRealtimeService.messages.length > 0 ? (
                                roomRealtimeService.messages.map((msg, index) => (
                                    <div key={index}>{msg}</div>
                                ))
                            ) : (
                                <div>No hay mensajes</div>
                            )}
                        </div>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Mensaje"
                                aria-label="Mensaje"
                                aria-describedby="button-addon2"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <button className="btn btn-secondary" type="button" id="button-addon2" onClick={sendMessage}>
                                Enviar
                            </button>
                        </div>
                    </div>
                    <div className="row px-3 my-2">
                        {!loading ? (
                            <button
                                className={`btn ${roomRealtimeService.getMe().ready ? 'btn-outline-dark' : 'btn-success'}`}
                                onClick={toggleReady}
                            >
                                {roomRealtimeService.getMe().ready ? 'No estoy listo' : 'Estoy listo'}
                            </button>
                        ) : (
                            <button className="btn btn-outline-dark" type="button" disabled>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Loading...
                            </button>
                        )}
                    </div>
                </div>
                <div className="col-sm-10 mx-sm-auto col-md col-lg-4 ms-lg-0">
                    <label className="h4 pb-2">Jugadores</label>
                    {roomRealtimeService.players.map((player, index) => (
                        <div className="row" key={index}>
                            <label className="h6">
                                <small className={`p-1 rounded-3 status-text ${player.info.ready ? 'bg-success text-white' : 'bg-warning'}`}>
                                    {player.info.ready ? 'LISTO' : 'NO LISTO'}
                                </small>
                                --{player.info.username}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Lobby;