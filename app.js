import { checkSession, initAuth } from './auth.js';
import { initRouter } from './router.js';
import { initServices } from './services.js';
import { initOrion } from './orion.js';

document.addEventListener('DOMContentLoaded', () => {
    initRouter();
    initAuth();
    initServices();
    initOrion();
    checkSession();
});