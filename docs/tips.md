## Quick Tips

_Simple tips and tricks to get the most out of **HyperCLI** and **HyperLANG**_

* [The SIREN's Call](https://webapicookbook.github.io/hyper/tips.html#the-sirens-call)
* [XPath Marks the Spot](https://webapicookbook.github.io/hyper/tips.html#xpath-marks-the-spot)
* [Try Using SOAP Next Time](https://webapicookbook.github.io/hyper/tips.html#try-using-soap-next-time)
* [Hello, Hyper!](https://webapicookbook.github.io/hyper/tips.html#hello-hyper)
* [It Varies](https://webapicookbook.github.io/hyper/tips.html#it-varies)
* [Gimme Some Space, Dude](https://webapicookbook.github.io/hyper/tips.html#gimme-some-space-dude)


### The SIREN's Call
One of the features of **HyperCLI** is the ability to write custom plug-ins to expand the **HyperLANG** and increase support for additional formats. One of the first plug-ins created for **HyperCLI** is one that supports the [SIREN](https://github.com/kevinswiber/siren#siren-a-hypermedia-specification-for-representing-entities) hypermedia format. 

You can use the `PLUGINS` command to confirm that your install of **HyperCLI** includes support for SIREN. The current default install has the following plugins:

```
> PLUGINS
["CJ","FJ","HAL","OAUTH","SIREN","WSTL"]
```

You can pull up a list of SIREN commands like this:

```
> SIREN HELP
SIREN
    LINKS
    ENTITIES
    ACTIONS|FORMS
    PROPERTIES
    IDS|RELS|NAMES|FORMS|TAGS|CLASSES (returns simple list)
    TAG|CLASS <string|$#> returns matching nodes
    ID|ENTITY <string|$#> (for Entities)
    REL|LINK <string|$#> (for Links)
    NAME|FORM|ACTION <string|$> (for Actions)
    PATH <jsonpath-string|$>
```

Let's explore SIREN support in **HyperCLI**. First, we'll make a simple HTTP request to a service that returns SIREN responses:

```
# make initial request
> REQUEST WITH-URL http://rwcbook10.herokuapp.com
STATUS 200
https://rwcbook10.herokuapp.com/task/
application/vnd.siren+json
```

Now, we can use common SIREN commands to inspect the response. Try the following commands and see what **HyperCLI** returns:

```
SIREN LINKS
SIREN ENTITIES
SIREN ACTIONS
SIREN PROPERTIES
```

Next, let's inspect the first entity in the list returned by the service:

```
> REQUEST WITH-PATH $.entities[0].href
STATUS 200
http://rwcbook10.herokuapp.com/task/1l9fz7bhaho
application/vnd.siren+json
> SHOW REQUEST
{
  "url": "http://rwcbook10.herokuapp.com/task/1l9fz7bhaho",
  "method": "GET",
  "query": {},
  "headers": {
    "user-agent": "hyper-cli"
  },
  "body"
}
```  

Note that we didn't type in a URL. We used the hypermedia information in the SIREN response instead.

We can also use the `STACK` command in **HyperLANG** to store parts of the response into local memory for later use.  

```
STACK PUSH WITH-PATH $.properties
{
  "content": "<div class=\"ui segment\"><h3>Manage your TPS Tasks here.</h3><p>You can do the following:</p><ul><li>Add, Edit and Delete tasks</li><li>Mark tasks \"complete\", assign tasks to a user</li><li>Filter the list by Title, Assigned User, and Completed Status</li></ul></div>",
  "id": "1l9fz7bhaho",
  "title": "extension",
  "tags": "fishing, skiing, hiking",
  "completeFlag": "false",
  "assignedUser": "bob",
  "dateCreated": "2016-02-01T01:08:15.205Z",
  "dateUpdated": "2021-09-15T23:24:48.933Z"
}
```

Now, we can modify one of the properties in the entry on the top of the `STACK`. Let's update the `tags` value:
```
STACK SET {"tags":"fishing, skiing, hiking, spelunking"}
```

One of the cool features of SIREN is that the service can send details on how to modify records on the server. For example, here are the details for updating an entity:

```
> SIREN FORM taskFormEdit
{
  "name": "taskFormEdit",
  "title": "Edit Task",
  "href": "http://rwcbook10.herokuapp.com/task/1l9fz7bhaho",
  "type": "application/x-www-form-urlencoded",
  "method": "PUT",
  "fields": [
    { "name": "id",
      "type": "text",
      "value": "",
      "title": "ID",
      "class": ["task"],
      "readOnly": true,
      "required": false },
    { "name": "title",
      "type": "text",
      "value": "",
      "title": "Title",
      "class": ["task"],
      "readOnly": false,
      "required": false },
    { "name": "tags",
      "type": "text",
      "value": "",
      "title": "Tags",
      "class": ["task"],
      "readOnly": false,
      "required": false },
    { "name": "completeFlag",
      "type": "select",
      "value": "false",
      "title": "Complete",
      "class": ["task"],
      "readOnly": false,
      "required": false,
      "pattern": "true|false" }
  ]
}
```
Now that we have an updated entity on the `STACK` and we know there is a hypermedia control availble for editing records, we can use **HyperLANG** to write that updated entity from the `STACK` back to the service:

```
> REQUEST WITH-FORM taskFormEdit WITH-STACK
STATUS 200
http://rwcbook10.herokuapp.com/task/
application/vnd.siren+json
> SHOW REQUEST
{
  "url": "http://rwcbook10.herokuapp.com/task/1l9fz7bhaho",
  "method": "PUT",
  "query": {},
  "headers": {
    "content-type": "application/x-www-form-urlencoded",
    "user-agent": "hyper-cli"
  },
  "body": "id=1l9fz7bhaho&title=extension&tags=fishing%2C%20skiing%2C%20hiking%2C%20spelunking&completeFlag=false"
}
``` 

Again, we didn't use any URL or HTTP method. That information is in the `taskFormEdit` hypermedia control. And we used the entity on the `STACK` so we didn't need to type any body parameters, either. 

Finally, we can confirm the update was completed by inspecting the last response:

```
> SIREN PATH $.entities[0]
$.entities[0]
{
  "class": [
    "task"
  ],
  "href": "//rwcbook10.herokuapp.com/task/1l9fz7bhaho",
  "rel": [
    "item"
  ],
  "type": "application/vnd.siren+json",
  "id": "1l9fz7bhaho",
  "title": "extension",
  "tags": "fishing, skiing, hiking, spelunking",
  "completeFlag": "false",
  "assignedUser": "bob",
  "dateCreated": "2016-02-01T01:08:15.205Z",
  "dateUpdated": "2021-09-15T23:42:45.608Z"
}
```

And there you have it. **HyperCLI** has been expanded to support SIREN operations and now we can explore and edit content on any server that supports the SIREN media type.

### XPath Marks the Spot
The **HyperCLI** supports basic XPATH queries for XML responses. That means you can do just about the same things with XML responses can you can with JSON responses.

Here's a simple example:

```
> GOTO WITH-URL http://www-db.deis.unibo.it/courses/TW/DOCS/w3schools/xsl/books.xml
STATUS 200
http://www-db.deis.unibo.it/courses/TW/DOCS/w3schools/xsl/books.xml
application/xml
```

Now let's do some XPath queries on the response

```
> SHOW XPATH /bookstore/book/title
/bookstore/book/title
<xml>
  <title lang="en">Everyday Italian</title>
  <title lang="en">Harry Potter</title>
  <title lang="en">XQuery Kick Start</title>
  <title lang="en">Learning XML</title>
</xml>
```

And here's another one:

```
> SHOW PATH /bookstore/book/title
/bookstore/book/title
<xml>
  <title lang="en">Everyday Italian</title>
  <title lang="en">Harry Potter</title>
  <title lang="en">XQuery Kick Start</title>
  <title lang="en">Learning XML</title>
</xml>
```

If you look carefully at the second example, you'll notice that the query command is `PATH`, not `XPATH`. That is because **HyperCLI** is smart enough to know that we're dealing with an XML document and will use the XPATH query engine instead of using the JSONPath query engine. 

To sum up, the `XPATH` and `JPATH` commands are explict calls to the XPath and JSONPath query engines in **HyperCLI**. But the `PATH` command uses the content type of the current document (`SHOW CONTENT-TYPE`) to help **HyperCLI** decide which query engine to use.

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
 
