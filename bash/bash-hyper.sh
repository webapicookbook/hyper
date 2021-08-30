#!/bin/bash

# test hyper output values

# set local vars
script="bash-hyper.hyper"
log="bash-hyper.log"
file="bash-hyper.stack"

# check for old files
rm -f -- $log
rm -f -- $file

# run the script and pull results
echo "Checking for items to process..."
hyper < $script > $log
items=`cat $file`

# no output file
if [ ! -f $file ]
then
  echo "all done!"
  exit
fi

# test to see if we're done
if [ $items -eq "0" ]
then
  echo "all done!"
else
  echo "$items items found."
  echo "more work to do!"
  hyper < status-pending.hyper > status-pending.log
  bash ./bash-hyper.sh
fi

# EOF
  
