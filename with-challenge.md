## WITH-* Challenge


I want to make the system more "plug-and-play" -- that's not too hard. already pulled the media type stuff into plugins that can be loaded at runtime (yay).

but here's the thing. the ACTIVATE code is native to the `index.js` (that's fine). But these keywords for the ACTIVATE functionality are troublesome now...

 * WITH-FORM
 * WITH-REL
 * WITH-ID
 * WITH-NAME
 
Why?

 1. They are all media-type specific (how you return a REL for CJ is diff than HAL, etc.).
 2. The media-type 'smarts' are now locked up in the dynamic-loading plugins.
 3. But I need the type-specific 'smarts' in the mainline code (`index.js`)
 
Resolving for these WITH- words will need to be dynamic, too. I'll need to use the CONTENT-TYPE value as a guide to know which module to use and then make a direct call (maybe a plugin call?) 

### Solution

Export the following functions from each plugin:

 - `mediaType`
 - `withForm`
 - `withRel`
 - `withId`
 - `withName`

and call them from `index.js` like this"

```
response = JSON.parse(responses.peek().getBody('UTF8'));
ctype = responses.peek().headers["content-type"];

for(var p in plugins) {
  if(ctype.indexOf(plugins[p].mediaType())!==-1) {
    url = plugins[p].withRel({response:response, thisWord:thisWord});
  }
}

``` 

_NOTE: might need to tweak the args hash._
 



