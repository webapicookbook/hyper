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
- CONTAINS <arg1> <arg2> <action>
- NOT-CONTAINS <arg1> <arg2> <action>
- EXISTS <arg> <action>
- NOT-EXISTS <arg> <action>

<action>
- JUMP-TO
- EXIT
- EXIT-ERR

CONTAINS RESPONSE <value>
CONTAINS PATH <path> <value>
```

### Use Cases, Examples

```
ACTIVATE http://locahost:8181/task
IF CONTAINS WITH-PATH $.collection.links user JUMP-TO :process-users
EXIT-ERR

ACTIVATE http://locahost:8181/task
IF GTE STATUS 400 EXIT-ERR Task\.\call\.\failed

CALL WITH-FORM createUserForm WITH-STACK
IF LT STATUS 400 JUMP-TO :next-step
EXIT-ERR createUserForm\.\failed.
:next-step
IF NOT-EXISTS REL home EXIT-ERR missing\.\home\.\link
GOTO WITH-REL home


```
