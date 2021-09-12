#!/bin/bash

# test all the scripts in this folder

echo "running tests..."

rm -f -- test-all.log

for f in ./*.txt; do
  echo "$f" >> test-all.log
  echo "$f"
  hyper < "$f" >> test-all.log
  echo "===========================================================" >> test-all.log
done

for f in ./*.hyper; do
  echo "$f" >> test-all.log
  echo "$f"
  hyper < "$f" >> test-all.log
  echo "===========================================================" >> test-all.log
done

for f in ./*.script; do
  echo "$f" >> test-all.log
  echo "$f"
  hyper < "$f" >> test-all.log
  echo "===========================================================" >> test-all.log
done


echo "done!"
echo "check test-all.log for details"

# eof

