# ioda-ui

Web application UI for the IODA project (<https://ioda.live>)

## Install

1. Ensure PHP 7.2 or higher and node 16.x.x are running on your machine.
2. Clone repo locally
3. run `brew install composer yarn`
4. run `curl -sS https://get.symfony.com/cli/installer | bash`
5. run `composer install`
6. run `yarn install`

## Run

The code is run in two processes:

- yarn compiles the javascript, (watch keeps it checking for updates)

  ```bash
  yarn encore dev --watch
  ```

- symfony runs the server, there are two ways

  - if you have symfony:

    ```bash
    symfony server:start --no-tls
    ```

  - if you only have php:

  ```bash
  php -S 127.0.0.1:8000 -t public
  ```

Check localhost:8000 in browser

## Possible Problems and Error Messages

```bash
    [ErrorException]   curl_multi_setopt(): CURLPIPE_HTTP1 is no longer supported
```

Fix with:

1. Updating the global symfony/flex using `composer global require symfony/flex ^1.5`
2. Removing the `vendor/symfony/flex` directory in my project.
3. Running `composer update`.

```bash
    PHP Fatal error:  require(): Failed opening required '/.../ioda-ui/vendor/autoload.php' (include_path='.:/usr/local/Cellar/php@7.2/7.2.25/share/php@7.2/pear') in .../ioda-ui/config/bootstrap.php on line 5
```

Fix with:

1. run `composer install` in the /ioda-ui/ folder.
