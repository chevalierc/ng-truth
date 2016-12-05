angular.module( 'truth.service', [] )

.directive( 'truthWatcher', function ( $location, $rootScope, truth ) {
    return {
        scope: {},
        link: function ( vm, element, attrs ) {
            $rootScope.$on( '$locationChangeSuccess', on_page_change )

            function init() {
                console.log( "INIT (Document Ready Event)" )
                truth.update_from_url()
            }

            function on_page_change() {
                current_params = $location.search();
                expected_params = truth.get_expected_params();

                if ( expected_params == null ) {
                    console.log( "New Page (Location Change Event)" )
                    truth.update_from_url()
                } else if ( current_params != expected_params ) {
                    console.log( "User changed page (Location Change Event)" )
                    truth.update_from_url()
                }
            }

            init()
        }
    }
} )

.factory( 'truth', function ( $rootScope, $location ) {

    var truth = {}

    var config = {
        rules: null,
        on_update_from_url: null,
        debug_on: true,
        store_in_url: true
    }

    var values = {}
    var expected_params;

    //INIT

    function init() {
        //set the array variables to empty arrays. everything else objects
        for ( var key in config.rules ) {
            if ( !values[ key ] ) {
                if ( config.rules[ key ].type == "array" ) {
                    values[ key ] = []
                } else {
                    values[ key ] = {}
                }
            }
        }
    }

    truth.set_config = function ( new_config ) {
        if ( new_config.rules ) config.rules = new_config.rules
        if ( new_config.on_update_from_url ) config.on_update_from_url = new_config.on_update_from_url
        if ( new_config.debug_on ) config.debug_on = new_config.debug_on
        if ( new_config.store_in_url ) config.store_in_url = new_config.store_in_url
        console.log( "Config Set" )
        init()
    }

    //BASIC API GETTERS SETTERS

    truth.get = function ( key ) {
        key_exists( key )
        return values[ key ]
    }

    truth.get_all = function () {
        return values
    }

    truth.set = function ( key, object ) {
        key_exists( key )
        console.debug( "key '" + key + "' set to " + object )
        values[ key ] = object
        changed( key )
        return values[ key ]
    }

    truth.add = function ( key, object_to_add ) {
        key_exists( key )
        console.debug( object, "added to '", key, "'" )
        if ( config.rules[ key ].type == "array" ) {
            var pk = config.rules[ key ].pk
            var allow_dupes = config.rules[ key ].allow_dupes
            if ( pk ) {
                for ( var i = 0; i < values[ key ].length; i++ ) {
                    if ( values[ key ][ i ][ pk ] == object_to_add[ pk ] ) {
                        return values[ key ]
                    }
                }
            } else if ( !allow_dupes ) {
                for ( var i = 0; i < values[ key ].length; i++ ) {
                    if ( values[ key ][ i ] == object_to_add ) {
                        return values[ key ]
                    }
                }
            }
            values[ key ].unshift( object_to_add )
            changed( key )
            return values[ key ]
        }
    }

    truth.remove = function ( key, index ) {
        key_exists( key )
        console.debug( values[ key ], " removed from '", key, "'" )
        if ( config.rules[ key ].type == "array" ) {
            if ( values[ key ].length == 0 ) {
                values[ key ] = []
            } else if ( values[ key ].length == 1 ) {
                values[ key ] = []
            } else {
                values[ key ].splice( index, 1 )
            }
            changed( key )
            return values[ key ]
        }
    }

    //EVENTS

    function changed( key ) {
        call_events_for( key )
        update_url_for( key )
    }

    function call_events_for( key ) {
        if ( config.rules[ key ].on_change ) {
            console.debug( "Call events for '", key, "'" )
            var on_change = config.rules[ key ].on_change
            if ( on_change ) {
                if ( Array.isArray( on_change ) ) {
                    for ( var i = 0; i < on_change.length; i++ ) {
                        $rootScope.$emit( on_change[ i ] )
                    }
                } else {
                    $rootScope.$emit( on_change )
                }
            }
        }
    }

    //URL

    function update_url_for( key ) {
        console.debug( "update URL for '", key, "'" )
        if ( config.rules[ key ].store_in_url ) {
            $location.search( key, JSON.stringify( values[ key ] ) );
            expected_params = $location.search()
        }
    }

    truth.get_expected_params = function () {
        return expected_params
    }

    truth.update_from_url = function () {
        console.debug( "updating values from URL" )
        if ( config.store_in_url ) {

            var url_values = $location.search()
            console.log( url_values )
            init()

            var change_count = 0

            for ( var key in config.rules ) {
                if ( config.rules.hasOwnProperty( key ) ) {
                    if ( config.rules[ key ].store_in_url ) {
                        if ( url_values[ key ] ) {
                            console.log( "key " + key + " updated from ", values[ key ], " to ", url_values[ key ] )
                            values[ key ] = JSON.parse( url_values[ key ] )
                            changed( key )
                            change_count++
                        }
                    }
                }
            }

            if ( config.on_update_from_url && change_count > 0 ) {
                $rootScope.$emit( config.on_update_from_url )
            }

        }
    }

    //HELPERS

    function key_exists( key ) {
        if ( !config.rules ) {
            console.log( "No config for truth" )
        }
        if ( config.rules[ key ] ) {
            return true
        } else {
            console.log( "key: " + key + "doesn't exist" )
        }
    }

    return truth
} )
