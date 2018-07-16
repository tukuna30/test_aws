import React from 'react';  
import { render } from 'react-dom';  
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom';
import App from './components/App';  
import Articles from './components/Articles';  
import Events from './components/Events';  
import Games from './components/Games'; 
import configureStore from './store/configureStore';
import { Provider } from 'react-redux'; 
import {loadArticles} from './actions/articlesActions'; 

const store = configureStore();
store.dispatch(loadArticles());
//import routes from './routes';
render(  
<Provider store={store}>
 <App>
  <BrowserRouter>
    <div>
      <Link to={'/guest/articles'}>Articles</Link>{' '}
      <Link to="/guest/games">Games</Link>{' '}
      <Link to="/guest/events">Events</Link>{' '}

      <Switch>
        <Route path="/guest/articles" component={Articles} />
        <Route path="/guest/games" component={Games} />
        <Route path="/guest/events" component={Events} />
        <Route path="/guest" component={Articles} />
      </Switch>
    </div>
 </BrowserRouter>
 </App>
 </Provider>,
 document.getElementById('react-app')
);
