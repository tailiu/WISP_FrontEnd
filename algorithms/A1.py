#!/usr/bin/python

import sys
import json
import time

# Output format
output = {
	'bandwidth': 9787987987, 
	'costs': 12342,
	'nodes': [
		{
			'node': 7899,
			'nodeProperty': {
				'capacity': 8908098,
				'mountingHeight': 789787,
				'type': 'source'
			},
		},
		{
			'node': 30010,
			'nodeProperty': { 
				'capacity': 8908098,
				'mountingHeight': 789787,
				'type': 'intermediate'
			}
		},
		{
			'node': 20090,
			'nodeProperty': {
				'capacity': 123123123,
				'mountingHeight': 546456546,
				'type': 'sink'
			}
		}
	],
	'edges': [
		{
			'nodes': [7899, 30010],
			'edgeProperty': {
				'length': 1231213,
				'bandwidth': 88098098,
				'frequency': 1321312312
			}
		},
		{
			'nodes': [30010, 20090],
			'edgeProperty': {
				'length': 6546546456,
				'bandwidth': 7677777,
				'frequency': 1231231233123
			}
		}         
	]
}

print json.dumps(output)
