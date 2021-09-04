## Quick Tips

_Simple tips and tricks to get the most out of *HyperCLI** and **HyperLANG**_


### Gimme Some Space, Dude
Spaces are VERY IMPORTANT in **HyperLANG**. It is the _space_ character that delimits keywords on a command line. Essentially, **HyperCLI** parses each line, one at a time, and uses spaces to determine what keywords and strings are on the line.

Here's a simple example. When you type this into **HyperCLI**:

```
GOTO WITH-URL http://rwcbook14.herokuapp.com/task/
```
The **HyperCLI** sees three elements on that line:

 * `GOTO`
 * `WITH-URL`
 * `http://rwcbook14.herokuapp.com/tasks/`
 
The good news is that **HyperCLI** ignores spaces within a double-quoted string. That means, when you type this command line:

```
GOTO WITH-FORM filter WITH-DATA {"title":"this is a test"}
```  
**HyperCLI** parses the that into the following five elements:

 * `GOTO`
 * `WITH-FORM`
 * `filter`
 * `WITH-DATA`
 * `{"title":"this is a test"}`

All fine and good. But... by adding some spaces in the JSON block of that previsou example, we can confuse **HyperCLI**:

```
GOTO WITH-FORM filter WITH-DATA { "title" : "this is a test" }
```  

Now, what **HyperCLI** sees rhia time is _nine_ elements:

 * `GOTO`
 * `WITH-FORM`
 * `filter`
 * `WITH-DATA`
 * `{`
 * `"title"`
 * `:`
 * `"this is a test"`
 * `}`

And that's not going to work!

_Always remember SPACES ARE IMPORTANT in **HyperLANG**_
 
