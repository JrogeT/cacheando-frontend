import React, { useState } from "react";
import useRoomRestService from "../hooks/room.rest.tsx";
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [roomId, setRoomId] = useState('');
    const [loading, setLoading] = useState(false);
    const {getRoom, createRoom: createRoomrest} = useRoomRestService();
    const navigate = useNavigate();

    const goToRoom = () => {
        if(!isValidUsername()) return;
        if(!roomId){
            alert('Debes introducir un codigo de partida');
            return;
        }
        if(roomId.length > 6){
            alert('Codigo muy largo');
            return;
        }
        setLoading(true);
        getRoom(roomId).subscribe(
            (response) => {
                localStorage.setItem('roomId', roomId!);
                localStorage.setItem('channel', response.channelName);
                navigate('/room/' + roomId);
            },
            () => {
                alert('La partida no existe');
                setLoading(false);
            }
        )
    };

    const createRoom = () => {
        if(!isValidUsername()) return;
        setLoading(true);
        createRoomrest().subscribe(
            (response) => {
                localStorage.setItem('roomId', response.data.id);
                localStorage.setItem('channel', response.data.channelName);
                navigate('/room/' + response.data.id);
            },
            () => {
                alert('Error al crear la partida');
                setLoading(false);
            }
        )
    };

    const isValidUsername = () => {
        if(!username){
            alert('Debes introducir un nombre');
            return false;
        }
        if(username.length > 10){
            alert('Nombre muy largo');
            return false;
        }
        localStorage.setItem('username', username);
        return true;
    }

    return (
        <div className="container">
            <div className="row mt-5">
                <div className="col-11 col-sm-6 col-lg-6 mx-auto">
                    <h1 className="text-center">
                        Cacheando
                    </h1>
                    <form>
                        <div className="mb-5">
                            <label className="form-label">Tu Nombre</label>
                            <input type="text" name="username" className="form-control border-secondary" value={username} onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div className="col-11 col-md-9 col-lg-6 mx-auto mb-1 mt-5">
                            <label className="form-label">Codigo de partida:</label>
                            <input type="text" name="room" className="form-control border-secondary" value={roomId} onChange={(e) => setRoomId(e.target.value)} />
                        </div>
                        <div className="row">
                            <div className="col-11 col-md-9 col-lg-6 mx-auto d-grid">
                                {!loading ? (
                                    <button type="submit" className="btn btn-success" onClick={goToRoom}>
                                        Unirse a la partida
                                    </button>
                                ) : (
                                    <button className="btn btn-success" type="button" disabled>
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        Loading...
                                    </button>
                                )}
                            </div>
                        </div>
                        <hr className="border border-secondary opacity-100" />
                        <div className="row">
                            <div className="col-9 col-lg-6 mx-auto d-grid">
                                {!loading ? (
                                    <button type="submit" className="btn btn-outline-dark" onClick={createRoom}>
                                        Crear partida
                                    </button>
                                ) : (
                                    <button className="btn btn-dark" type="button" disabled>
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        Loading...
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;