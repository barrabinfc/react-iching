import preact from "preact";
import { Provider } from "preact-redux";

import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";

import { HashRouter as Router, Route, Link } from "react-router-dom";
import enquire from 'enquire.js';

import { getAsset, parseQS } from "./constants/utils";

import { AppContainer } from "./pages";
import reducers from "./reducers";

// force to import&compile css
import "./styles/main.scss";
require("typeface-eb-garamond");

/**
 * Register (external) service worker
 */
const SW_URL = getAsset('sw.js')
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(SW_URL).then((v) => {
      console.info('ServiceWorker: ✔️');
    }).catch((err) => {
      console.error('ServiceWorker: ❌', err)
    });
  }
}

/**
 * Configure global store
 */
function configureStore(initialState) {
  let fCreateStore = compose(
    applyMiddleware(thunk),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )(createStore);

  const store = fCreateStore(reducers, initialState);

  return store;
}

/** Changes layout based on device screen real estate */
function mediaqueries(forceMedia = false) {
  const addBodyMedia = (name) => () => (document.body.classList.add(`media-${name}`));
  const rmBodyMedia = (name) => () => (document.body.classList.remove(`media-${name}`));
  const handlers = (name) => ({ 'match': addBodyMedia(name), 'unmatch': rmBodyMedia(name) })

  if (forceMedia !== false) {
    addBodyMedia(forceMedia)();
  } else {
    enquire.register('screen and (min-width: 320px) and (max-width: 767px)', handlers('small'));
    enquire.register('screen and (min-width: 768px) and (max-width: 1223px)', handlers('medium'));
    enquire.register('screen and (min-width: 1224px)', handlers('large'));
  }
}

/*
 * Render routes and display html
 */
function start() {
  let app = preact.render(
    <Provider store={window.store}>
      <Router>
        <AppContainer />
      </Router>
    </Provider>,
    document.getElementById("app-mount")
  );

  /* Loading complete */
  let load_el = document.getElementById("loading");
  requestAnimationFrame(() => {
    document.body.classList.toggle("loaded");
  });

  return app;
}

/*
 * Prefetch critical assets
 */
function bootstrap() {
  // Parse argv options
  const argv = parseQS(location.toString());

  // Create store
  window.store = configureStore();

  // Register layout changes
  mediaqueries(argv.media || false);

  requestIdleCallback(() => {
    window.react = preact;
    window.app = start();
  });
}

// Report Errors
// err: error message
// fileName: which file error occurs in
// lineNumber: what line error occurs on
//import "preact/devtools";
if (!__DEVELOPMENT__) {
  // SW only on production
  requestIdleCallback(registerSW);
}

bootstrap();