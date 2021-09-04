_The home of HyperCLI and HyperLANG_

<p><img src="https://pbs.twimg.com/profile_images/1414606991268499457/Ko2YTikc_400x400.jpg" align="right" height="300"/></p>

### Links

* [**NPM Project**](https://www.npmjs.com/package/@mamund/hyper)
* [**README**](https://github.com/rwmbook/hyper#readme)
* [**Github Project**](https://github.com/rwmbook/hyper)
* [**Tweets**](tweets.md)
* [**Quick Tips**](tips.md)

### About
The **hyper** utility is a simple command-line style shell/REPL for interacting with an online services/APIs. While a fully-functional HTTP client, **hyper** is especially good at dealing with hypermedia services including Collection+JSON, SIREN, and HAL. There are plans to add support for PRAG+JSON, MASH+JSON, and possibly UBER in the future.

Along with HTTP- and mediatype-aware commands, **hyper** also supports some convience functionality like SHELL commands, configuration file management, and a LIFO stack to handle local memory variabes.

The idea for this shell comes from other REPL-style interactive CLIs like node and command-line tools like curl. You can start a stateful client session by typing **hyper** at the command line. Then you can make an HTTP request (ACTIVATE) and manipulate the responses. You can also write **hyper** commands in a file and pipe this file into **hyper** for a scripted experience: (`hyper < scripts/sample.txt > scripts/sample.log`).


