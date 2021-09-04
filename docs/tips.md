_Simple tips and tricks to get the most out of *HyperCLI** and **HyperLANG**_


### Gimme Some Space, Dude
Spaces are VERY IMPORTANT in **HyperLANG**. It is the _space_ character that delimits commands on a line. Essentially, **HyperCLI** parses each line, one at a time, and uses spaces to determine what keywords and strings are on the line.

Here's a simple example:

```
GOTO WITH-URL http://rwcbook14.herokuapp.com
```
**HyperCLI** sees three elements on that line:

 * `GOTO`
 * `WITH-URL`
 * `http://rwcbook14.herokuapp.com`
 
  
