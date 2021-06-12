# hyper : Interactive Hypermedia Shell

_sample project to explore an interactive shell for hypermedia services_

## Summary
A simple command-line style shell for interacting with an online services/APIs. Especially good at dealing with hypermedia services including [Collection+JSON](http://amundsen.com/media-types/collection/), [SIREN](https://github.com/kevinswiber/siren), and [HAL](https://datatracker.ietf.org/doc/html/draft-kelly-json-hal-08). Will be adding support for [PRAG+JSON](https://mamund.github.io/prag-json/) and [UBER](http://uberhypermedia.com/) sometime soon. 

- type a command
- shell does the work, displays some data
- got to step one and repeat

Also supports some convience functionality like SHELL commands, config file management, etc.

## Motivation
The idea for this shell comes from other REPL-style interactive CLIs like `node` and command-line tools like `curl`. You can start a stateful client session by typing `hyper` at the command line. Then you can make an HTTP request (`ACTIVATE`) and manipulate the responses. You can also write hyper commands in a file and pipe this file into hyper for a scripted experience: (`hyper < scripts/sample.txt > scripts/sample.log`).

**Hyper** is "mediatype-aware" -- that is, it recognizes well-known media types and offers convience methods for dealing with them. For example after loading a SIREN response, you can use the following commands:

```
# SIREN example
GOTO http://rwcbook10.herokuapp.com
SIREN LINKS
SIREN ENTITIES
SIREN ACTIONS

GOTO WITH-REL taskFormListByUser WITH-QUERY {"assignedUser" : "alice"}
```

That last command uses the `href` associated with the SIREN action element identified by the `rel:taskFormListByUser`, supplies a querystring argument and makes the request.

You can also use JSONPath to query the response:

```
SIREN PATH $.entities.*[?(@property==='id'&&@.match(/rmqzgqfq3d/i))]^.[id,title,href,type]
```

Similar methods exist for HAL, CollectionJSON, and other supported formats.

## Examples
See the [scripts](scripts/) folder for lots of working examples.

## Feature tracking
This is a work in progress and totally unstable/unreliable. Here the current workplan and status for this project:

 - [x] : Initial CLI loop
 - [x] : support for piped scripts (in and out)
 - [x] : support for **#** - comment lines
 - [x] : support for **CLEAR** - clears the console
 - [x] : support for **SHELL** _{command}_ simple SHELL (bash/dos) support
 - [x] : support for .. LS|DIR _{folder/path}_
 - [x] : support for **CONFIG** (READ) returns NVP of saved config data
 - [x] : support for .. FILE|LOAD _{filename}_ loads config file (defaults to "hyper.cfg")
 - [x] : support for .. SAVE|WRITE _{filename}_ loads config file (defaults to "hyper.cfg")
 - [x] : support for .. SET _{n:v,...}_ shared config file write
 - [x] : support for **STACK** _{command}_ _{arg}_ JSON object LIFO stack
 - [x] : support for .. CLEAR|FLUSH clears all the items from the stack
 - [x] : support for .. PEEK displays the JSON object at the stop of the stack
 - [x] : support for .. PUSH _{n:v,...}_ adds a new JSON object to the stack
 - [x] : support for .. POP removes the top item from the stack
 - [x] : support for .. LEN|LENGTH returns depth of the stack
 - [x] : support for .. SET _{"n":"v",...}_ update the JSON object on the top of the stack
 - [x] : support for .. LOAD|FILE _filename_  reads a single JSON object from disk onto the stack (defaults to hyper.dat)
 - [x] : support for .. SAVE|WRITE _filename_ writes the top item on the stack to disk (defaults to hyper.dat)
 - [x] : support for .. DUMP _filename_ writes the full stack to disk (defaults to hyper.dmp)
 - [x] : support for .. FILL _filename_ replaces the current stack with contents in disk file (defaults to hyper.dmp)
 - [x] : support for **ACTIVATE**|CALL|GO WITH-URL _{url}_ - make an http request (always synchronous)
 - [x] : support for **ACTIVATE**|CALL|GO WITH-REL _{string}_ - make a request using href on in-doc element (id, name, rel)
 - [x] : support for .. WITH-HEADERS _{n:v,...}_ - request headers
 - [x] : support for .. WITH-FORMAT - sets `accept` header w/ config value
 - [x] : support for .. WITH-PROFILE - sets `link` profile header w/ config value
 - [x] : support for .. WITH-QUERY _{n:v,...}_ - query string args as JSON nvps
 - [x] : support for .. WITH-BODY _name=value&..._ - for POST/PUT/PATCH (defaults to app/form-urlencoded)
 - [x] : support for .. WITH-ENCODING _{media-type}_ - to set custom encoding for POST/PUT/PATCH
 - [x] : support for .. WITH-METHOD _{string}_ - to set HTTP method (defaults to GET)
 - [x] : support for **DISPLAY** (PEEK) - show saved reponse (from top of the LIFO stack)
 - [x] : support for .. URL - returns actual URL of the response
 - [x] : support for .. STATUS - returns HTTP status of the response
 - [x] : support for .. CONTENT-TYPE - returns HTTP content-type of the response
 - [x] : support for .. HEADERS - returns the complete HTTP header collection of the response
 - [x] : support for .. POP remove response from top of the stack
 - [x] : support for .. LENGTH - returns length of saved stack
 - [x] : support for .. PATH _{JSONPath}_ returns results of a JSONPath query from top-of-stack response
 - [x] : support for **CJ** returns a strong-typed version of response from top of the stack (`vnd.collection+json`)
 - [x] : support for .. LINKS returns links array from a collection+JSON response
 - [x] : support for .. ITEMS returns items array from a collection+JSON response
 - [x] : support for .. QUERIES returns queries array from a collection+JSON response
 - [x] : support for .. TEMPLATE returns template collection from a collection+JSON response
 - [x] : support for .. ID|NAME|REL _{string}_ returns results of a pre-set JSONPath query (shorthand)
 - [x] : support for .. PATH _{JSONPath}_ returns results of a JSONPath query from a collection+JSON response
 - [x] : support for **HAL** returns a strong-typed version of response from top of the stack (`vnd.hal+json`)
 - [x] : support for .. LINKS returns links array from a HAL response
 - [x] : support for .. EMBEDDED returns items array from a HAL response
 - [x] : support for .. KEY|ID|REL _{string}_ returns results of a pre-set JSONPath query (shorthand)
 - [x] : support for .. PATH _{JSONPath}_ returns results of a JSONPath query from a HAL response
 - [x] : support for **SIREN** returns a strong-typed version of response from top of the stack (`vnd.siren+json`)
 - [x] : support for .. LINKS returns links array from a SIREN response
 - [x] : support for .. ACTIONS returns actions array from a SIREN response
 - [x] : support for .. ENTITIES returns entities array from a SIREN response
 - [x] : support for .. PROPERTIES returns properties array from a SIREN response
 - [x] : support for .. ID _{string}_ returns an entity associated with the ID
 - [x] : support for .. REL _{string}_ returns a link associated with the REL
 - [x] : support for .. NAME _{string}_ returns an action associated with the NAME
 - [x] : support for .. PATH _{JSONPath}_ returns results of a JSONPath query from a SIREN response
 - [ ] : support for **PRAG** returns a strong-typed version of response from top of the stack (`vnd.prag+json`)
 - [ ] : support for .. METADATA returns metadata array from a PRAG response
 - [ ] : support for .. LINKS returns links array from a PRAG response
 - [ ] : support for .. ITEMS returns items array from a PRAG response
 - [ ] : support for .. ID _{string}_ returns an element (metadata, link, item) associated with the ID
 - [ ] : support for .. REL _{string}_ returns a link associated with the REL
 - [ ] : support for .. NAME _{string}_ returns an element (metadata, link, property) associated with the NAME
 - [ ] : support for .. PATH _{JSONPath}_ returns results of a JSONPath query from a SIREN response
 
 ## Other possible features in the future
 - [ ] : support for STACK (PEEK) - reads an open data stack
 - [ ] : support for   PUSH - adds another record to the stack
 - [ ] : support for   POP - removes top level record from the stack
 - [ ] : support for   WITH-STACK - uses the top level item as a set of local vars for other operations (e.g. to fill in forms, supply querystring values, headers, etc.
 - [ ] : support for $$_{name}_ return config and/or stack value (read) 
 - [ ] : support for SHOW-ACTIONS - showing all actions (links & forms)
 - [ ] : support for ACTIVATE update WITH LOCAL.MAP - mapping inputs to local proeprties (auto-mapping, too)
 - [ ] : support for IF-ERROR - error checking (`4xx`, `5xx`)
 - [ ] : support for JUMP _{label}_ - jump to defined label in the script (might be forward-only jumping)

## Dependencies
These modules are used in the hyper app.

 * https://github.com/ForbesLindesay/sync-request
 * https://www.npmjs.com/package/jsonpath-plus
 * https://www.npmjs.com/package/stack-lifo
 * https://www.npmjs.com/package/html2json

## Source Code
You'll find the source code for this utility in the [src](src/) folder. 

**WARNING**: This is all proof-of-concept code and it's pretty messy. I spend time exploring new features much more than I do properly grooming the source code. If you're offended by this kind of behavior, don't look behind the curtain on this one -- I'll only disappoint you[grin]. -- @mamund

