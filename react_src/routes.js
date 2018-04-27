import React from 'react';  
import { Route, IndexRoute } from 'react-router';  
import App from './components/App';  
//import HomePage from './components/HomePage';  
import Articles from './components/Articles';  
import Article from './components/Article';

export default (  
  <Route path="/" component={App}>
    <Route path="/guest/articles" component={Articles} />
  </Route>
);