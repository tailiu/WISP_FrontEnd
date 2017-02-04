#include <iostream>
#include <unistd.h>
#include "json.hpp"

using json = nlohmann::json;
using namespace std;

int main()
{
	usleep(8000000);

	json output;
	output["bandwidth"] = 12323232;
	output["costs"] = 78787878;
	output["nodes"] = json::array(
		{
			{
				{"node", 1080},
				{"nodeProperty", {
					{"capacity", 95675675},
					{"mountingHeight", 21123},
					{"type", "sink"}}
				}
			},
			{
				{"node", 38989},
				{"nodeProperty", {
					{"capacity", 1233454353},
					{"mountingHeight", 2342343},
					{"type", "source"}}
				}
			},
			{
				{"node", 23890},
				{"nodeProperty", {
					{"capacity", 658768768},
					{"mountingHeight", 786549787},
					{"type", "sink"}}
				}
			}
		}
	);
	output["edges"] = json::array(
		{
			{
				{"edgeProperty", {
					{"length", 4546546},
					{"bandwidth", 123123},
					{"frequency", 3454654646}}
				}
			},
			{
				{"edgeProperty", {
					{"length", 123545345},
					{"bandwidth", 1231231},
					{"frequency", 56565756}}
				}
			}
		}
	);
	output["edges"][0]["nodes"] = json::array({1080, 38989});
	output["edges"][1]["nodes"] = json::array({38989, 23890});

	cout << output;
	return 0;
}