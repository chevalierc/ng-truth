# ng-truth
ng-truth is an alternative way of sharing data between directives and modules, when the scope is inefficient. Your directives use the api store key values. When a value is updated a messages is sent on the rootscope for variables to react.

The messages for each key can be defined in the rules.

##USE:

###HTML:
```
<body id="body" ng-view truth-watcher></body>
<!-- stick the truth-watcher directive on the body if you are using the library to store vars in url -->
```

###JS:
```
angular.module( 'mainCtrl', [] )

.controller( 'mainController', function ( truth, $rootScope ) {

    var truth_rules: {
        debug_on: true,
        store_in_url: true,
        on_update_from_url: "updated_from_url",
        rules: {
            prefs: {
                type: "object",
                store_in_url: false,
                on_change: "params_refreshed"
            },
            users: {
                type: "array",
                store_in_url: true,
                on_change: ["params_refreshed", "user_refreshed"],
                allow_dupes: false
            }
        }
    }

    function init() {
      truth.set_config( truth_rules )

      truth.set("prefs", prefs)
      var new_prefs = truth.get("prefs")
    }

    $rootScope.$on( "params_refreshed", function () {
        console.log('yo')
    } )
    
})

```

##API:

```
truth.set_config()

truth.get_all()
truth.get("key")
truth.set("key", val)
truth.add("key", val)
truth.remove("key, index)
truth.update_from_url()

```

##using with $routeProvider

You will most likly want to use `reloadOnSearch` ofor the `$routeProvider` if you are storing the values in search paramters
