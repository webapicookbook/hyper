## Conditionals 

_Notes on adding conditional support for #HyperLang and #HyperCLI_

```
IF <cond> <arg1> <arg2> <action>

IF

<cond>
- EQ <arg1> <arg2> <action>
- NEQ <arg1> <arg2> <action>
- GT <arg1> <arg2> <action>
- NGT <arg1> <arg2> <action>
- LT <arg1> <arg2> <action>
- NLT <arg1> <arg2> <action>
- GTE <arg1> <arg2> <action>
- NGTE <arg1> <arg2> <action>
- LTE <arg1> <arg2> <action>
- NLTE <arg1> <arg2> <action>
- EX <arg> <action>
- NEX <arg> <action>

<action>
- JUMP
- EXIT
- EXIT-ERR

```
