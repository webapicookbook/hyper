#!/bin/bash

# test hyper output values

# set local vars
bash_script="./bash-hyper.sh"
read_script="bash-hyper.hyper"
write_script="status-pending.hyper"

read_log="bash-hyper.log"
write_log="status-pending.log"

stack_file="bash-hyper.stack"

# check for old files
rm -f -- $read_log
rm -f -- $write_log
rm -f -- $stack_file

# run the script and pull results
echo "Checking for items to process..."
hyper < $read_script 
items=`cat $file`

# test to see if we're done
if [ $? -eq 1 ]
then
  echo "all done! (ERR)"
  exit
fi

if [ "$items" == "null" ]
then
  echo "all done!"  
  exit
else
  echo "$items items found."
  echo "more work to do!"
  hyper < $write_script 
  bash ./bash-hyper.sh
fi

# EOF
  
