import React from 'react';

const Loader = () => {
    return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '300px' }}>
            <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
            </div>
            <p style={{ marginTop: '16px', color: '#64748b', fontWeight: '500' }}>Loading data...</p>
        </div>
    );
};

export default Loader;