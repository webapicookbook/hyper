# i-hyper : Interactive Hypermedia Shell

_sample project to explore an interactive shell for hypermedia services_

## Summary
A simple command-line style shell for interacting with an online hypermedia service. Similar to the way text adventure games work/look. 

- type a command
- shell does the work, displays some data
- got to step one and repeat

## Feature tracking
This is a work in progress and totally unstable/unreliable. Here the current workplan and status for this project:

 - [x] : Initial CLI loop
 - [x] : support for piped scripts (in and out)
 - [x] : support for # - comment lines
 - [x] : support for ACTIVATE _{url}_- sync http request
 - [ ] : support for ACTIVATE _{string}_ - use href on in-doc element (id, name, rel)
 - [x] : support for WITH-HEADERS _{n:v,...}_ - request headers
 - [x] : support for WITH-FORMAT - sets "accept" header w/ config value
 - [x] : support for WITH-PROFILE - sets "link" profile header w/ config value
 - [x] : support for WITH-BODY _name=value&..._ - for POST/PUT/PATCH (defaults to app/form-urlencoded)
 - [x] : support for WITH-ENCODING _{media-type}_ - to set custom encoding for POST/PUT/PATCH
 - [x] : support for WITH-METHOD _{string}_ - to set HTTP method (defaults to GET)
 - [x] : support for DISPLAY _{int}_ - show saved reponse
 - [x] : support for DISPLAY LENGTH - returns length of saved stack
 - [ ] : support for DISPLAY POP show and remove from stack
 - [ ] : support for SHOW-ACTIONS - showing all actions (links & forms)
 - [ ] : support for LOAD-CONFIG _{filename}_ shared config file (read)
 - [ ] : support for CONFIG.{name} return config value (read) 
 - [ ] : support for SESSION.USERNAME - session file (read/write)
 - [ ] : support for LOCAL.GIVENNAME - local properties file (read)
 - [ ] : support for ACTIVATE update WITH LOCAL.MAP - mapping inputs to local proeprties (auto-mapping, too)
 - [ ] : support for IF-ERROR - error checking (4xx, 5xx)
 - [ ] : support for JUMP _{label}_ - jump to defined label in the script

## Dependencies

 * https://github.com/ForbesLindesay/sync-request
 * JSONPATH?
 * STACK MGMT?

## Some Sample Commands

```
# make a direct http request 
ACTIVATE  http://api.example.org

# make a request using a rel name
ACTIVATE self

# make a request with query parameters
ACTIVATE search WITH familyName=smith

# make a request with body parameters
ACTIVATE update WITH BODY givenName=Mike&familyName=Amunsen

# conditional statement (????)
# consider interactive vs. scripted
# scripts need to be able to interpret the response and act accordingly

# simple pre-set workflow
CONFIG EXIT-ERROR ON
ACTIVATE http://api.example.org
ACTIVATE home
ATIVATE related
ACTIVATE search WITH QUERY id=123
ACTIVATE update WITH BODY givenName=Mike&familyName=Mork
STOP WITH RESPONSE

# status-checking pre-set workflow
CONFIG EXIT-ERROR OFF

ACTIVATE http://api.example.org
IF ERROR JUMP :EXIT

ACTIVATE home
IF ERROR JUMP :EXIT

ACTIVATE search 
IF ERROR ACTIVATE related
IF ERROR JUMP :EXIT

ACTIVATE search WITH QUERY id=123
IF ERROR JUMP :EXIT

ACTIVATE update WITH BODY givenName=Mike&familyName=Mork
JUMP :EXIT

:EXIT

#########################################
# i-hyper example
# 2021-06 @mamund
#########################################

# set temporal session vars
SESSION FORMAT application/vnd.collection+json
SESSION PROFILE http://profiles.example.org/person

# try connecting to a service, if error jump to the exit
ACTIVATE http://api.example.org
IF ERROR JUMP :EXIT

# try id='home', name[0]='home', rel.contains 'home'
ACTIVATE home
IF ERROR JUMP :EXIT

# try calling the search link  if error, try the 'related' link
# if that's an error, jump to the exit
ACTIVATE search 
IF ERROR ACTIVATE related
IF ERROR JUMP :EXIT

# assume we have search link, try a filter query. if error, exit
ACTIVATE search WITH QUERY id=123
IF ERROR JUMP :EXIT

# assume 200 OK on the query, so update this record
# map any local stored properties to any response.body.form inputs
ACTIVATE update WITH BODY LOCAL.PROPERTIES
JUMP :EXIT

# all done! exit and echo the last response on the stack
:EXIT
EXIT WITH RESPONSE

#########################################
# EOF
#########################################
      
```


