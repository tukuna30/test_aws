    var Router = {
        states: [],
        root: '/',
        appBaseUrl: '',
        configure: function(option) {
            this.appBaseUrl = option.appBaseUrl;
            return this;
        },
        init: function() {
            this.registerStates().updateView(true);
        },
        getFragment: function () {
            var fragment = '';
            fragment = this.clearSlashes(decodeURI(location.pathname));
            return this.clearSlashes(fragment);
        },
        clearSlashes: function (path) {
            return path.toString().replace(/\/$/, '').replace(/^\//, '');
        },
        addState: function (state) {
            this.states.push(state);
            return this;
        },
        removeState: function (state) {
            for (var i = 0; i < this.states.length; i++) {
                if (this.states[i].name === state) {
                    this.states.splice(i, 1);
                }
            }
            return this;
        },
        reset: function () {
            this.states = [];
            this.root = '/';
            return this;
        },
        findStateWithName: function(stateName) {
           return this.states.find(function (item, i) {
                return item.name.match(stateName);
            }) || {};
        },
        registerStates: function () {
            let that = this;
            this.reset();
            document.querySelectorAll('state').forEach(function (item, i) {
                if (item.getAttribute('name')) {
                    let state = {
                        name: item.getAttribute('name'), templateUrl: item.getAttribute('templateUrl'),
                        url: item.getAttribute('url'), stateUrl: item.getAttribute('stateUrl')
                    };
                    console.log(state);
                    that.addState(state);
                    if (!item.getAttribute('registered')) {
                        item.addEventListener('click', function (event) {
                            that.navigate(state, true);
                        });
                    };
                    item.setAttribute('registered', 'true');
                }
            });
            return this;
        },
        getStateWithParams: function (pathName) {
            pathName = pathName || this.getFragment();
            let keys, match, stateParams = {}, output = {}, that = this;
            this.states.find(function (state, i) {
                keys = state.stateUrl && state.stateUrl.match(/:([^\/]+)/g);
                if (keys) {
                    match = pathName.match(new RegExp(state.stateUrl.replace(/:([^\/]+)/g, "([^\/]*)")));
                    if (match) {
                        match.shift();
                        match.forEach(function (value, i) {
                            stateParams[keys[i].replace(":", "")] = value;
                        });
                        if (state.url.match(pathName)) {
                            output = { name: state.name, stateParams: stateParams, child: true, templateUrl: state.templateUrl };
                            return true;
                        }
                    }
                    else {
                        let currentState = that.findStateWithName(pathName) || {};
                        output = { name: currentState.name, stateParams: stateParams, templateUrl: currentState.templateUrl };
                    }
                }
            });
            if (!keys) {
                let currentState = this.findStateWithName(pathName);
                if (!currentState) {
                    console.log('state not found');
                    return {};
                }
                return { name: currentState.name, stateParams: stateParams, templateUrl: currentState.templateUrl };
            } else {
                return output;
            }
        },
        navigate: function (state, pushState) {
            if (pushState) {
                history.pushState(state, state.name, state.url);
            }
            this.updateView();
            return this;
        },
        getTemplate: function (template) {
            let templateUrl = template.match('.html') ? template : "assets/views/" + template + '.html';
            return new Promise((resolve, reject) => {
                let xhr = new XMLHttpRequest();
                xhr.open("GET", this.appBaseUrl + "/" + templateUrl + '?time=' + Date.now());
                xhr.send({});
                xhr.addEventListener("load", function reqListener() {
                    if (xhr.readyState === xhr.DONE) {
                        if (xhr.status === 200) {
                            resolve(xhr.response);
                        } else {
                            reject('Not found');
                        }
                    };
                });
            });
        },
        getScript: function () {
            return "(function(window) {" +
                "window.setTimeout(function(){ " +
                "console.log('hello2');" +
                "document.getElementById('books').append('<li> Mathermatics2</li>');" +
                "}, 1000);" +
                "})(window);"
        },
        updateView: function (isPageReload) {
            let that = this, state;
            state = this.getStateWithParams();
            if (isPageReload) {
                let path = this.getFragment();
                if (path.indexOf('/') == -1) {
                    state = this.findStateWithName(path);
                }
                else {
                    let fragments = path.split('/'), parent = fragments[0], child = fragments[1];
                    state = this.findStateWithName(parent);
                
                    if (state.name || state.templateUrl) {
                        this.getTemplate(state.templateUrl || state.name).then(function (templateContent) {
                            //check for child state and append to child-view
                            if (state.child) {
                                document.getElementById('child-state-view').innerHTML = templateContent;
                            } else {
                                document.getElementById('state-view').innerHTML = templateContent;
                                document.getElementById('child-state-view').innerHTML = '';
                            }
                            window.trythings[state.name] && window.trythings[state.name]();
                            that.registerStates();
                            let childState = that.findStateWithName(child);
                            let emptyMessage = document.createElement('h4');
                            emptyMessage.append(document.createTextNode('Not found'));
                            
                            if (childState.name || childState.templateUrl) {
                                that.getTemplate(childState.templateUrl || childState.name).then(function (templateContent) {
                                    document.getElementById('child-state-view').innerHTML = templateContent;
                                }, function(error) {
                                    document.getElementById('child-state-view').append(emptyMessage);
                                });
                            } 
                        });
                        
                    }

                }
            }

            if (state.name || state.templateUrl) {
                this.getTemplate(state.templateUrl || state.name).then(function (templateContent) {
                    //check for child state and append to child-view
                    if (state.child) {
                        document.getElementById('child-state-view').innerHTML = templateContent;
                    } else {
                        document.getElementById('state-view').innerHTML = templateContent;
                        document.getElementById('child-state-view').innerHTML = '';
                    }
                    window.trythings[state.name] && window.trythings[state.name]();
                    that.registerStates();
                }, function(error) {
                    let emptyMessage = document.createElement('h4');
                    emptyMessage.append(document.createTextNode('Not found'));
                    if (state.child) {
                        document.getElementById('child-state-view').innerHTML = '';                        
                        document.getElementById('child-state-view').append(emptyMessage);
                    } else {
                        document.getElementById('state-view').append(emptyMessage);
                        document.getElementById('child-state-view').innerHTML = '';
                    }
                });
                //eval(document.getElementById(state.template).text);
                //document.getElementById(state.template).outerHTML='';
            }
        }
    }
    window.onpopstate = function (event) {
        console.log('onpopstate'); console.log(event);
        Router.updateView(event.state);
    }
  export default Router;