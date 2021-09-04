## Quick Tips

_Simple tips and tricks to get the most out of **HyperCLI** and **HyperLANG**_

* [It Varies](https://rwmbook.github.io/hyper/tips.html#it-varies)
* [Gimme Some Space, Dude](https://rwmbook.github.io/hyper/tips.html#gimme-some-space-dude)

### It Varies
**HyperLANG** supports the use of _variables_ in commands.  There are two types of variable references: `CONFIG ($$)` and `STACK (##)`.

#### `CONFIG` and `$$`
When you want to refer to a `CONFIG` value in a command, you use the `$$` variable marker. Here's an example:

```
CONFIG SET {"home-page":"https://company-atk.herokuapp.com"}
GOTO WITH-URL $$home-page$$
```

The above command looks for the `home-page` element in the current in-memory `CONFIG` and, if found, replaces the `$$home-page$$` with the associated value from the `CONFIG` file. 

#### `STACK` and `##`
When you want to refer to a `STACK` value in a command, you use the `##` variable marker. That looks like this:

```
STACK PUSH {"home-page":"https://company-atk.herokuapp.com"}
GOTO WITH-URL ##home-page##
```
This command looks for the `home-page` element in item at the top of the in-memory `STACK` and, if found, replaces the `##home-page##` with the associated value. Note that you can only address the item at the top of the `STACK`.

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
 
#### Embedded Strings 
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

Note that the last element (`{"title":"this is a test"}`) is treated a single block of text. The spaces _within_ the string `"this is a test"` are treated as part of the entire JSON element. All fine and good. 

#### Spaced Out
But... by adding some spaces in the JSON block of that previous example, we can confuse **HyperCLI**:

```
GOTO WITH-FORM filter WITH-DATA { "title" : "this is a test" }
```  

Now, what **HyperCLI** sees this time is _nine_ elements:

 * `GOTO`
 * `WITH-FORM`
 * `filter`
 * `WITH-DATA`
 * `{`
 * `"title"`
 * `:`
 * `"this is a test"`
 * `}`

The JSON block is now treated as multiple keywords on the command line. And that's not going to work!

#### Block Delimiters `[%` and `%]`
The good news is that, if you really want to include these extra spaces in your **HyperLANG** commands, you can use _block delimiters_ (`[% ... %]`) to better control how **HyperCLI** parses your command lines.

Here's the same (spaced-out) example but with the block delimiter added:

```
GOTO WITH-FORM filter WITH-DATA [% { "title" : "this is a test" } %]
```  

Now, what **HyperCLI** sees this time is _five_ elements (again):

 * `GOTO`
 * `WITH-FORM`
 * `filter`
 * `WITH-DATA`
 * `{ "title" : "this is a test" }`

And that will work just fine for **HyperCLI**.

The block delimiter syntax bascially tells **HyperCLI** to treat everything between the two delimiters as a single command-line element. Admittedly, this is a bit wonky but it works -- and it is pretty rare that you'll need to use it.

#### Spaces are Important

_Always remember SPACES ARE IMPORTANT in **HyperLANG**_
 
