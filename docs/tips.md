## Quick Tips

_Simple tips and tricks to get the most out of **HyperCLI** and **HyperLANG**_

* [Try Using SOAP Next Time](https://rwmbook.github.io/hyper/tips.html#try-using-soap-next-time)
* [Hello, Hyper!](https://rwmbook.github.io/hyper/tips.html#hello-hyper)
* [It Varies](https://rwmbook.github.io/hyper/tips.html#it-varies)
* [Gimme Some Space, Dude](https://rwmbook.github.io/hyper/tips.html#gimme-some-space-dude)

### Try Using SOAP Next Time
Since **HyperCLI** is a fully-functional HTTP client, you can use it to make SOAP requests as well as simple HTTP requests.  Currently **HyperLANG* does not have a plug-in for SOAP services (more on that in a future release) but you can still use straight-up HTTP requests in XML format to perform SOAP interactions.

Here's a simple example.

First, using **HyperCLI**, let's pull the WSDL document from a known SOAP service endpoint:

```
# pull WSDL
> GOTO WITH-URL https://www.dataaccess.com/webservicesserver/NumberConversion.wso?WSDL
STATUS 200
https://www.dataaccess.com/webservicesserver/NumberConversion.wso?WSDL
text/xml; charset=utf-8
```

Next, you can use the XPATH command to peek into the WSDL response document:

```
> SHOW XPATH //*[local-name(.)='operation']/@name
<xml> name="NumberToWords" name="NumberToDollars" name="NumberToWords" name="NumberToDollars" name="NumberToWords" name="NumberToDollars"</xml>
```

Finally, with a bit of effort, you can craft a SOAP request to the `NumberToWords` operation and inspect the results:

```
GOTO WITH-URL https://www.dataaccess.com/webservicesserver/NumberConversion.wso WITH-BODY [% <?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><NumberToWords xmlns="http://www.dataaccess.com/webservicesserver/"><ubiNum>500</ubiNum></NumberToWords></soap:Body></soap:Envelope> %] WITH-METHOD post WITH-ENCODING text/xml
STATUS 200
https://www.dataaccess.com/webservicesserver/NumberConversion.wso
text/xml; charset=utf-8
> 
> # show full response
> SHOW RESPONSE
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <m:NumberToWordsResponse xmlns:m="http://www.dataaccess.com/webservicesserver/">
      <m:NumberToWordsResult>five hundred </m:NumberToWordsResult>
    </m:NumberToWordsResponse>
  </soap:Body>
</soap:Envelope>
```

You'll notice that **HyperLANG** now support `XPATH` queries, too!  The support here is minimnal and will improve in the hear future.

### Hello, Hyper!

Here's a super simple **HyperLANG** script:

```
GOTO https://company-atk.herokuapp.com
```

And here's how you do it:

 1. Make sure you've installed the latest update of the **HyperCLI** : `$> npm install -g @mamund/hyper`
 2. Launch the **HyperCLI** REPL : `$> hyper`
 3. Type the command and press ENTER : `> GOTO https://company-atk.herokuapp.com`

It may take a few seconds for the sample service to fire up but eventually, you should see the following response:

```
STATUS 200
https://company-atk.herokuapp.com
application/forms+json; charset=utf-8
```

You can also view the request/response details with these commands:

```
SHOW REQUEST
SHOW RESPONSE
SHOW METADATA
SHOW ALL
SHOW URL
SHOW STATUS
SHOW CONTENT-TYPE
SHOW HEADERS
```

Finally, you can place all the **HyperLANG** commands in a text file and then pipe that file into the **HyperCLI** like this:

```
$> hyper <hello-hyper.script
```
Congratualtions! You've just created your first **HyperLANG** program.

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
 
