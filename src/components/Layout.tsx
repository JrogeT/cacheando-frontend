import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const Layout: React.FC = () => {
    return (
        <div>
            <nav>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/login">Login</Link>
                    </li>
                </ul>
            </nav>
            <hr />
            <Outlet />
        </div>
    );
};

export default Layout;