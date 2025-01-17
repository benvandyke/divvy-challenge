Divvy Data Challenge
====================

This repository contains my entry to the Divvy [Data Challenge](https://divvybikes.com/datachallenge). As a Divvy member and civic data enthusiast, I enjoyed digging into the dataset. My entry is an interactive map that shows trip statistics at the station-level upon hovering over a station.

Visualization
-------------

I constructed the visualization using [D3.js](http://d3js.org/) for the interactive charts and [MapBox](https://www.mapbox.com/tour/) for the map tiles. Station-level statistics are grouped by the `from_station_name`. In my exploration, I found that most stations averaged an equal number of inbound trips and outbound trips, though the pattern is time-of-day specific in many stations as you can see by hovering over a station located near a commuter rail terminal such as Union Station. 

Analysis
--------

Analysis and preparation of the data was completed using Python and the [pandas](http://pandas.pydata.org/) library. In the notebooks directory of this repository, you'll find several IPython [notebooks](http://ipython.org/notebook) that show the code used to generate the CSV files used in the visualization and some of the observations below. To use the IPython notebooks, download this repository and a copy of the Divvy [data](https://divvybikes.com/datachallenge) which is larger than the recommended filesize on GitHub. Place unzipped Divvy directory into the data directory, and then launch an IPython notebook instance from inside the notebooks directory.

Observations
------------

In my exploration of the dataset, I discovered some interesting facts about how people are using the system.

* Total Trips: 760,000 or more than 4,000 per day
* Median Subscriber Age: 33 years
* Median Estimated Trip Distance: 1.4 miles, I used the Manhattan Distance function to approximate distance between two points
* Longest trip: 19 miles, from Lincoln and Eastwood to 55th and Shore Dr in an impressive 41 minutes
* Trip Duration 75th percentile: 22.5 minutes, well under the 30 minute time limit

Next
----

I've only scratched the surface of this extremely rich dataset. I'd love to spend more time working with it or discuss further, send me a message or submit a pull request if you have any other ideas or want to contribute.





