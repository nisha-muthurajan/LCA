import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#fff',
            textAlign: 'center',
            padding: '24px 16px',
            marginTop: '40px'
        }}>
            <div className="container">
                <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>
                    © 2026 EcoMine LCA System. All Rights Reserved.
                </p>
                <small style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Powering Sustainable Mining with AI
                </small>
            </div>
        </footer>
    );
};

export default Footer;