import React from 'react';
import { LoginProvider } from '@/uses';

/**
 * 设置Provider
 * @param container
 */
 export function rootContainer(container: any) {
    return React.createElement(LoginProvider, null, container);
  }