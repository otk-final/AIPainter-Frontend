import React from 'react';
import { LoginProvider } from '@/uses';
import { history } from 'umi';

/**
 * 设置Provider
 * @param container
 */
 export function rootContainer(container: any) {
    return React.createElement(LoginProvider, null, container);
  }