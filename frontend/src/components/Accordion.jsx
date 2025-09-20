import React, { useState } from 'react';

const accordionStyles = {
  container: {
    width: '100%',
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    margin: '0 auto',
    maxWidth: 900,
  },
  item: {
    borderBottom: '1px solid #ececec',
  },
  header: (open) => ({
    cursor: 'pointer',
    padding: '18px 28px',
    fontWeight: 600,
    fontSize: '1.13rem',
    color: open ? '#ff5722' : '#232946',
    background: open ? 'rgba(255,87,34,0.07)' : 'none',
    borderLeft: open ? '4px solid #ff5722' : '4px solid transparent',
    transition: 'background 0.18s, color 0.18s, border-color 0.18s',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  }),
  content: (open) => ({
    maxHeight: open ? 800 : 0,
    overflow: 'hidden',
    transition: 'max-height 0.3s cubic-bezier(0.4,0,0.2,1)',
    background: '#faf9f6',
    padding: open ? '18px 28px' : '0 28px',
    opacity: open ? 1 : 0,
  }),
  icon: (open) => ({
    marginLeft: 'auto',
    fontSize: 18,
    transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
    transition: 'transform 0.2s',
    color: '#ff5722',
  })
};

const Accordion = ({ sections }) => {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div style={accordionStyles.container}>
      {sections.map((section, idx) => {
        const open = openIndex === idx;
        return (
          <div key={section.title} style={accordionStyles.item}>
            <div
              style={accordionStyles.header(open)}
              onClick={() => setOpenIndex(open ? -1 : idx)}
            >
              {section.icon && <span>{section.icon}</span>}
              {section.title}
              <span style={accordionStyles.icon(open)}>&#9654;</span>
            </div>
            <div style={accordionStyles.content(open)}>
              {open && section.content}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
