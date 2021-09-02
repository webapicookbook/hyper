#!/bin/bash

hyper < ../scripts/exit-if.hyper
if [ $? -eq 1 ]
then
  echo ERROR!
fi


