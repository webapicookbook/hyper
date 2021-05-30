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

IF-NOT ACTIVATE list THEN ACTIVATE related
```


