import React from 'react';

const Loader = () => {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
            <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
};

export default Loader;