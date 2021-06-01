# i-hyper : Interactive Hypermedia Shell

_sample project to explore an interactive shell for hypermedia services_

## Summary
A simple command-line style shell for interacting with an online hypermedia service. Similar to the way text adventure games work/look. 

- type a command
- shell does the work, displays some data
- got to step one and repeat


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


