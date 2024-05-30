import React from 'react';
import Calendar from './components/Calendar';
import axios from 'axios';

const App = () => {

    

    const handleAuthClick = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/auth/google');
            window.location.href = response.data.url;
        } catch (error) {
            console.error('Authorization failed:', error);
        }
    };
    

    return (
        <div>
            <button onClick={handleAuthClick} className='border-2 bg-black text-white'>Log in</button>
           <Calendar />
        </div>
    );
};

export default App;
