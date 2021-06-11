# i-hyper : Interactive Hypermedia Shell

_sample project to explore an interactive shell for hypermedia services_

## Summary
A simple command-line style shell for interacting with an online hypermedia service. Similar to the way text adventure games work/look. 

- type a command
- shell does the work, displays some data
- got to step one and repeat

_NOTE: this app makes synchronous HTTP requests! I did this for two reasons: 1) simplifies programming the shell and 2) makes supporting scripting (via pipes) much easier, too. This is a PoC so take this all w/ a grain of salt. If/when someone gets super-serious about all this, the shell can be re-architected to support async (and parallel) http requests._

## Feature tracking
This is a work in progress and totally unstable/unreliable. Here the current workplan and status for this project:

 - [x] : Initial CLI loop
 - [x] : support for piped scripts (in and out)
 - [x] : support for # - comment lines
 - [x] : support for CLEAR - clears the console
 - [x] : support for SHELL _{command}_ simple SHELL (bash/dos) support
 - [x] : support for .. LS|DIR _{folder/path}_
 - [x] : support for ACTIVATE|CALL|GO WITH-URL _{url}_ - make an http request (always synchronous)
 - [x] : support for ACTIVATE|CALL|GO WITH-REL _{string}_ - make a request using href on in-doc element (id, name, rel)
 - [x] : support for .. WITH-HEADERS _{n:v,...}_ - request headers
 - [x] : support for .. WITH-FORMAT - sets `accept` header w/ config value
 - [x] : support for .. WITH-PROFILE - sets `link` profile header w/ config value
 - [x] : support for .. WITH-QUERY _{n:v,...}_ - query string args as JSON nvps
 - [x] : support for .. WITH-BODY _name=value&..._ - for POST/PUT/PATCH (defaults to app/form-urlencoded)
 - [x] : support for .. WITH-ENCODING _{media-type}_ - to set custom encoding for POST/PUT/PATCH
 - [x] : support for .. WITH-METHOD _{string}_ - to set HTTP method (defaults to GET)
 - [x] : support for DISPLAY (PEEK) - show saved reponse (from top of the LIFO stack)
 - [x] : support for .. LENGTH - returns length of saved stack
 - [x] : support for .. POP remove response from top of the stack
 - [x] : support for .. PATH _{JSONPath}_ returns results of a JSONPath query from top-of-stack response
 - [x] : support for CJ returns a strong-typed version of response from top of the stack (`vnd.collection+json`)
 - [x] : support for .. LINKS returns links array from a collection+JSON response
 - [x] : support for .. ITEMS returns items array from a collection+JSON response
 - [x] : support for .. QUERIES returns queries array from a collection+JSON response
 - [x] : support for .. TEMPLATE returns template collection from a collection+JSON response
 - [x] : support for .. ID|NAME|REL _{string}_ returns results of a pre-set JSONPath query (shorthand)
 - [x] : support for .. PATH _{JSONPath}_ returns results of a JSONPath query from a collection+JSON response
 - [x] : support for HAL returns a strong-typed version of response from top of the stack (`vnd.hal+json`)
 - [x] : support for .. LINKS returns links array from a HAL response
 - [x] : support for .. EMBEDDED returns items array from a HAL response
 - [x] : support for .. KEY|ID|REL _{string}_ returns results of a pre-set JSONPath query (shorthand)
 - [x] : support for .. PATH _{JSONPath}_ returns results of a JSONPath query from a HAL response
 - [x] : support for SIREN returns a strong-typed version of response from top of the stack (`vnd.siren+json`)
 - [x] : support for .. LINKS returns links array from a SIREN response
 - [x] : support for .. ACTIONS returns actions array from a SIREN response
 - [x] : support for .. ENTITIES returns entities array from a SIREN response
 - [x] : support for .. PROPERTIES returns properties array from a SIREN response
 - [x] : support for .. ID _{string}_ returns an entitie associated with the ID
 - [x] : support for .. REL _{string}_ returns a link associated with the ID
 - [x] : support for .. NAME _{string}_ returns an action associated with the name
 - [x] : support for .. PATH _{JSONPath}_ returns results of a JSONPath query from a SIREN response
 - [x] : support for CONFIG (READ) returns NVP of saved config data
 - [x] : support for .. FILE|LOAD _{filename}_ loads config file (defaults to "hyper.cfg")
 - [x] : support for .. SAVE|WRITE _{filename}_ loads config file (defaults to "hyper.cfg")
 - [x] : support for .. SET _{n:v,...}_ shared config file write
 - [ ] : support for SHOW-ACTIONS - showing all actions (links & forms)
 - [ ] : support for $$_{name}_ return config value (read) 
 - [ ] : support for SESSION.USERNAME - session file (read/write)
 - [ ] : support for LOCAL.GIVENNAME - local properties file (read)
 - [ ] : support for ACTIVATE update WITH LOCAL.MAP - mapping inputs to local proeprties (auto-mapping, too)
 - [ ] : support for IF-ERROR - error checking (`4xx`, `5xx`)
 - [ ] : support for JUMP _{label}_ - jump to defined label in the script

## Dependencies

 * https://github.com/ForbesLindesay/sync-request
 * https://www.npmjs.com/package/jsonpath-plus
 * https://www.npmjs.com/package/stack-lifo
 * https://www.npmjs.com/package/html2json


