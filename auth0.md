## Auth0 Support


### Summary
Create an Auth0 plugin for hyperLANG

### Features
Below is the list of commands for the `AUTH0` plug-in:

```
AUTH0
  LIST [name|$#] (lists existing auth0 definitions using optional name filter
  DEFINE <name> <{"id":"...","secret":"...","audience":"...","type":"..."}> (creates a new definition)
  UPDATE <name|$#> <{"n":"...","v":"..."}> (updates existing <name> definition)
  REMOVE <name|$#> (removes <name> from auth0 collection
  GENERATE <auth-name|$#> (gets a token from Auth0 and loads it into the <name> definition)
```  
Then, for the `ACTIVATE` command:


`ACTIVATE WITH-URL http://secure-api.example.org/ WITH-AUTH0 example`

Note the `WITH-AUTH0 <name|$#>` option for `ACTIVATE` command. This looks up the named Auth0 definition, pulls the existing `token` and `token_type` and sets the `authorization` header for HTTP.

### Workflow

```
AUTH0 DEFINE my-example {...}
AUTH0 GENERATE my-example
GOTO WITH-URL http://secure-api.example.org WITH-AUTH0 my-example
STATUS 200
http://secure-api/example.org/home/
application/vnd.collection+json
```

### Internals

Creates the AUTH0.cfg file on disk.



  
  

