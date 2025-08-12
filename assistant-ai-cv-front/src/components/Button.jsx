// src/components/Button.jsx
import React from 'react';
import PropTypes from 'prop-types';


const Button = ({ children, variant = 'gradient', href, onClick }) => {
    let classes = '';
    switch (variant) {
        case 'solid':
            classes = 'inline-block rounded-md px-6 py-3 text-sm font-medium focus:ring-3 focus:outline-none transition-all bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
            break;
        case 'outline':
            classes = 'inline-block rounded-md px-6 py-3 text-sm font-medium focus:ring-3 focus:outline-none transition-all border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500';
            break;
        case 'gradient':
        default:
            classes = 'inline-block rounded-md px-6 py-3 text-sm font-medium focus:ring-3 focus:outline-none transition-all bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 focus:ring-blue-500';
            break;
    }

    if (href) {
        return (
            <a href={href} className={classes}>
                {children}
            </a>
        );
    }

    return (
        <button type="button" onClick={onClick} className={classes}>
            {children}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['gradient', 'solid', 'outline']),
    href: PropTypes.string,
    onClick: PropTypes.func,
};

export default Button;
