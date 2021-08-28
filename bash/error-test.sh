#!/bin/bash
#
# testing bash/hyper interactions


# call hyper script
hyper < bad-request.hyper 

# check exit status
if [ $? -eq 1 ]
then
  echo "*** Bad Request"
fi  

# eof

