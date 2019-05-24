import gmplot
import sys
import itertools
import array as arr
import uuid
import os


sys.stdout = open('python.log', 'w')
print(sys.argv)

latitude_list = []
lat_list = sys.argv[1].split(',')
for val in lat_list:
    print(float(val))
    latitude_list.append(float(val))

latitude_list_float = arr.array('d', latitude_list)
#print(latitude_list_float)

longitude_list = []
long_list = sys.argv[2].split(',')
for val in long_list:
    print(float(val))
    longitude_list.append(float(val))

longitude_list_float = arr.array('d', longitude_list)
#print(latitude_list_float)

gmap3 = gmplot.GoogleMapPlotter(sys.argv[3], sys.argv[4], 13)

# scatter method of map object
# scatter points on the google map
gmap3.scatter(latitude_list, longitude_list, '#FF0000', size = 75, marker = False )

# Plot method Draw a line in
# between given coordinates
gmap3.plot(latitude_list, longitude_list, 'cornflowerblue', edge_width = 2.5)

#gmap3.apikey = "AIzaSyC7i91ryCltgVi0iYrolHR5qkdjHvzHoDc" # - bcsrivatsa@gmail.com
gmap3.apikey = "AIzaSyCT23IhVRap7jBluz-Y3_Ytj_WE2C0wNpc" # - sivatsabc@gmail.com

print(str(sys.argv[5]))
gmap3.draw(str(sys.argv[5]))
sys.exit(0)
