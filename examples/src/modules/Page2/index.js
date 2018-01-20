import React from 'react';
import { Link } from 'react-router-dom';

const Page2 = () => (
    <div className="content">
        <h2>Page 2</h2>
        <p>Not much to do here...</p>

        <button>
            <Link to="/">Back to home</Link>
        </button>
    </div>
);

export default Page2;
