## Auth0 Support


### Summary
Create an Auth0 plugin for hyperLANG

### Features
Below is the list of commands for the `AUTH0` plug-in:

```
AUTH0
  LIST [name|$#] (lists existing auth0 definitions using optional name filter
  DEFINE <name> <{"ur":"...","id":"...","secret":"...","audience":"...","type":"..."}> (creates a new definition)
  UPDATE <name|$#> <{"n":"...","v":"..."}> (updates existing <name> definition)
  REMOVE <name|$#> (removes <name> from auth0 collection
  GENERATE <auth-name|$#> (gets a token from Auth0 and loads it into the <name> definition)
  SAVE [file-name|$#] saves entire configuration set to disk (defaults to auth0.env)
  LOAD [file-name|$#] reads entire configuration set from disk (defaults to auth0.env)
```  
Then, for the `ACTIVATE` command:

`ACTIVATE WITH-URL http://secure-api.example.org/ WITH-AUTH0 example`

Note the `WITH-AUTH0 <name|$#>` option for `ACTIVATE` command. This looks up the named Auth0 definition, pulls the existing `token` and `token_type` and sets the `authorization` header for HTTP.

### Example Workflow

```
AUTH0 DEFINE example {"url":"...","id":"...","secret":"...","audience":"...","type":"client_credentials"}
AUTH0 GENERATE example
GOTO WITH-URL http://secure-api.example.org WITH-AUTH0 example
STATUS 200
http://secure-api/example.org/home/
application/vnd.collection+json
```

### Internals

Creates the AUTH0.env file on disk.  **This file will contain important secrets and MUST NOT be checked into public repos.**

Consider working this as a full plugin (loaded at start time) and extensible for other auth engines.




  
  

