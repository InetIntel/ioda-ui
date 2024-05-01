# ioda-ui
Web application UI for the IODA project (https://ioda.live)

## Install
1. Ensure PHP 7.2 or higher is running on your machine.
    1. TODO: As of 4/30/2024 php 7.3.33 is the highest known working version
2. Clone repo locally 
3. run `brew install composer yarn`
4. run `curl -sS https://get.symfony.com/cli/installer | bash`
5. run `composer install`
6. run `yarn install`
    1. TODO: As of 4/30/2024 node 16.20.2 is the highest known working version

## Run 
The code is two processes:
- yarn compiles the javascript. The `watch-all` script from `package.json` watches for both sass and js changes.
    ~~~
    yarn run watch-all
    ~~~
- symfony runs the server, there are two ways
    - if you have symfony: 
    ~~~
    symfony server:start --no-tls
    ~~~
    - if you only have php:
    ~~~
    php -S 127.0.0.1:8000 -t public
    ~~~

Check localhost:8000 in browser

## Possible Problems and Error Messages

### Error 1:

~~~
    [ErrorException]   curl_multi_setopt(): CURLPIPE_HTTP1 is no longer supported
~~~

1. Update the global symfony/flex using `composer global require symfony/flex ^1.5` 
2. Remove the `vendor/symfony/flex` directory in my project.
3. Run `composer update`.

### Error 2:
~~~
    PHP Fatal error:  require(): Failed opening required '/.../ioda-ui/vendor/autoload.php' (include_path='.:/usr/local/Cellar/php@7.2/7.2.25/share/php@7.2/pear') in .../ioda-ui/config/bootstrap.php on line 5
~~~

1. Run `composer install` in the /ioda-ui/ folder.


### Error 3:
~~~
// error with "encore dev --watch" which gets run as part of "yarn run watch-all"

Error: digital envelope routines::unsupported

opensslErrorStack: [ 'error:03000086:digital envelope routines::initialization error' ],
library: 'digital envelope routines',
reason: 'unsupported',
code: 'ERR_OSSL_EVP_UNSUPPORTED'
~~~

1. Run `export NODE_OPTIONS=--openssl-legacy-provider` in the terminal.
