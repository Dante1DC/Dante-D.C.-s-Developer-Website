import React from 'react';

const Index: React.FC = () => {
  const handleLinkClick = (url: string) => {
    window.location.href = url;
  };

  const gradients = [
    { background: 'radial-gradient(at 51% 47%, rgb(255, 0, 255) 0px, transparent 50%), radial-gradient(at 41% 27%, rgb(230, 236, 39) 0px, transparent 50%), radial-gradient(at 9% 66%, rgb(68, 175, 228) 0px, transparent 50%), radial-gradient(at 78% 51%, rgb(58, 203, 188) 0px, transparent 50%), radial-gradient(at 1% 11%, rgb(222, 23, 218) 0px, transparent 50%), rgb(201, 49, 196)' },
    { background: 'radial-gradient(at 63% 73%, rgb(255, 0, 255) 0px, transparent 50%), radial-gradient(at 90% 20%, rgb(230, 236, 39) 0px, transparent 50%), radial-gradient(at 24% 89%, rgb(68, 175, 228) 0px, transparent 50%), radial-gradient(at 25% 76%, rgb(58, 203, 188) 0px, transparent 50%), radial-gradient(at 12% 53%, rgb(222, 23, 218) 0px, transparent 50%), rgb(201, 49, 196)' },
    { background: 'radial-gradient(at 14% 44%, rgb(255, 0, 255) 0px, transparent 50%), radial-gradient(at 33% 14%, rgb(230, 236, 39) 0px, transparent 50%), radial-gradient(at 67% 54%, rgb(68, 175, 228) 0px, transparent 50%), radial-gradient(at 86% 95%, rgb(58, 203, 188) 0px, transparent 50%), radial-gradient(at 53% 29%, rgb(222, 23, 218) 0px, transparent 50%), rgb(201, 49, 196)' },
  ];

  return (
    <div style={{ ...gradients[0], minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '5rem', fontWeight: 'bold', color: 'black'}}>Reach Out!</h1>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <li style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', cursor: 'pointer', fontSize: '5.5rem', fontWeight: 'bold' }} onClick={() => handleLinkClick('https://github.com/dante1dc')}>
            <img src="/github.svg" alt="Home" style={{ marginRight: '0.5rem', width: '50px', height: '50px', filter: 'invert(1)' }} />
          </li>
          <li style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', cursor: 'pointer', fontSize: '5.5rem', fontWeight: 'bold' }} onClick={() => handleLinkClick('https://linkedin.com/in/dante-dc')}>
            <img src="/linkedin.svg" alt="About" style={{ marginRight: '0.5rem', width: '50px', height: '50px', filter: 'invert(1)' }} />
          </li>
          <li style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '5.5rem', fontWeight: 'bold' }} onClick={() => handleLinkClick('mailto:dantedycheschandler@gmail.com')}>
            <img src="/mail.svg" alt="dantedycheschandler@gmail.com" style={{ marginRight: '0.5rem', width: '50px', height: '50px', filter: 'invert(1)' }} />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Index;