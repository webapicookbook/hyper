_Simple tips and tricks to get the most out of *HyperCLI** and **HyperLANG**_


### Gimme Some Space, Dude
Spaces are VERY IMPORTANT in **HyperLANG**. It is the _space_ character that delimits commands on a line. Essentially, **HyperCLI** parses each line, one at a time, and uses spaces to determine what keywords and strings are on the line.

Here's a simple example:

```
GOTO WITH-URL http://rwcbook14.herokuapp.com/task/
```
**HyperCLI** sees three elements on that line:

 * `GOTO`
 * `WITH-URL`
 * `http://rwcbook14.herokuapp.com/tasks/`
 
The good news is that **HyperCLI** ignores spaces within a double-quoted string:

```
GOTO WITH-FORM filter WITH-DATA {"title":"this is a test"}
```  
**HyperCLI** parses the above line into:

 * `GOTO`
 * `WITH-FORM`
 * `filter`
 * `WITH-DATA`
 * `{"title":"this is a test"}`
 
However, by adding some spaces in the JSON block, we can confuse **HyperCLI**:

```
GOTO WITH-FORM filter WITH-DATA { "title" : "this is a test" }
```  
What **HyperCLI** sees is this:

 * 'GOTO',
 * 'WITH-FORM',
 * 'filter',
 * 'WITH-DATA',
 * '{',
 * '"title"',
 * ':',
 * '"this is a test"',
 * '}'

And that's not going to work!

Remember SPACES ARE IMPORTANT in **HyperLANG**
 
