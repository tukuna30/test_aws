import {combineReducers} from 'redux';  
import articles from './articlesReducer';

const rootReducer = combineReducers({  
  articles
})

export default rootReducer;