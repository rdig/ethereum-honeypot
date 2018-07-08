#!/usr/bin/env bash

pid=$(lsof -i:8545 -t);

kill -9 $pid
