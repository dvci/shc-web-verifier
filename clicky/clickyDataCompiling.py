import requests
import json
import pandas as pd
from datetime import date
from matplotlib import pyplot
from os.path import exists
import matplotlib.pyplot as plt 
 


# things to pass in/define outside:
    # the name of the old data file
    # the link to the new clicky data
    # the name that you are saving to (graph and json)

url = "https://api.clicky.com/api/stats/4?site_id=101369228&sitekey=6d6a506f44d45a59&type=visitors-list&date=last-week&output=json"

# successfully handles if there is no file existing
def getOldData():
    if exists('ClickyJson.json'):
        with open('ClickyJson.json') as json_file:
            data = json.load(json_file)
            print("This is the old data", data)
        return data




'''
clickyData = {
    visitorData = {
        'numTotalVisitors':[3,12,5],
        'numUniqueVisitors':[2,10,5],
    }
    dates = ['2022-7-3','2022-7-10','2022-7-17']
}
'''

# still broken because of the SSL issue
def getNewData(clickyUrl):
    response = requests.get(clickyUrl)
    dataDict = json.load(response.json)
    return dataDict


'''what it should look like right now: 
  [
  {
    "type": "visitors-list",
    "dates": [
      {
        "date": "2022-06-17,2022-06-30",
        "items": [
          { "time":"1656520164", "time_pretty":"Wed Jun 29 2022, 12:29p", "time_total":"84", "ip_address":"24.34.108.0", "uid":"1313781915", "session_id":"247859048", "actions":"2", "total_visits":"1", "first_visit": {"time":"1656520164", "session_id":"247859048"}, "landing_page":"http://dvci.github.io/shc-web-verifier/", "web_browser":"Google Chrome 103.0", "operating_system":"Mac OS X", "screen_resolution":"1792x1120", "javascript":"1", "language":"English", "referrer_type":"direct", "geolocation":"Arlington, Massachusetts, USA", "country_code":"us", "latitude":"42.4188", "longitude":"-71.1557", "hostname":"comcast.net", "organization":"Comcast Cable", "stats_url":"https://clicky.com/stats/visitors-actions?site_id=101369228&session_id=247859048"},
          { "time":"1656519562", "time_pretty":"Wed Jun 29 2022, 12:19p", "time_total":"992", "ip_address":"24.34.108.0", "uid":"3166136560", "session_id":"247853892", "actions":"4", "total_visits":"1", "first_visit": {"time":"1656519562", "session_id":"247853892"}, "landing_page":"http://dvci.github.io/shc-web-verifier/", "web_browser":"Safari 15.2", "operating_system":"Mac OS X", "screen_resolution":"1920x1200", "javascript":"1", "language":"English", "referrer_type":"direct", "geolocation":"Arlington, Massachusetts, USA", "country_code":"us", "latitude":"42.4188", "longitude":"-71.1557", "hostname":"comcast.net", "organization":"Comcast Cable", "stats_url":"https://clicky.com/stats/visitors-actions?site_id=101369228&session_id=247853892"},
          { "time":"1656519103", "time_pretty":"Wed Jun 29 2022, 12:11p", "time_total":"122", "ip_address":"73.149.20.0", "uid":"951136834", "session_id":"247850157", "actions":"1", "total_visits":"1", "first_visit": {"time":"1656519103", "session_id":"247850157"}, "landing_page":"http://dvci.github.io/shc-web-verifier/", "web_browser":"Microsoft Edge 102", "operating_system":"Mac OS X", "screen_resolution":"1792x1120", "javascript":"1", "language":"English", "referrer_type":"direct", "geolocation":"Cambridge, Massachusetts, USA", "country_code":"us", "latitude":"42.3649", "longitude":"-71.0987", "hostname":"comcast.net", "organization":"Comcast Cable", "stats_url":"https://clicky.com/stats/visitors-actions?site_id=101369228&session_id=247850157"},
          { "time":"1656518793", "time_pretty":"Wed Jun 29 2022, 12:06p", "time_total":"602", "ip_address":"216.10.170.0", "uid":"2415498954", "session_id":"247847735", "actions":"1", "total_visits":"1", "first_visit": {"time":"1656518793", "session_id":"247847735"}, "landing_page":"http://dvci.github.io/shc-web-verifier/", "web_browser":"Google Chrome 103.0", "operating_system":"Mac OS X", "screen_resolution":"1680x1050", "javascript":"1", "language":"English", "referrer_type":"direct", "geolocation":"Laconia, New Hampshire, USA", "country_code":"us", "latitude":"43.5728", "longitude":"-71.4787", "hostname":"atlanticbb.net", "organization":"Atlantic Broadband", "stats_url":"https://clicky.com/stats/visitors-actions?site_id=101369228&session_id=247847735"}
           ]
      }
    ]
  }
]'''


# this needs some work, it's a bit weird since I can't see how newData interacts with it
def mergeData(newData, oldData):
    uniqueVisitors = []
    # print(oldData.keys())
    newData['visitorData']['numTotalVisitors'].append(len(oldData['dates']['items']))
    for item in oldData[dates][items]:
        if item not in uniqueVisitors:
            'uniqueVisitors'.append(item)
    newData["visitorData"]['numUniqueVisitors'].append(len('uniqueVisitors'))
    newData['dates'].append(date.today())
    return newData # ?
### this calculates and adds the new information to the old information 

# kind of just testing here with accessing the right parts of the dictionary 
# steps: take new data and extract the info you need
# add it to the old data 
def newMerge(newData, oldData):
    print(oldData["dates"])
    print(newData["dates"])


'''
now new dict should look like this I think?:
clickyData = {
    "visitorData": {
        'numTotalVisitors':[3,12,5,4],
        'numUniqueVisitors':[2,10,5,4],
    },
    "dates": ['2022-7-3','2022-7-10','2022-7-17','2022-7-24']
}
'''

# allData["visitorData"]['numTotalVisitors']  this does access the right numbers
# this seems to work but I haven't saved it anywhere, check out that link you saw the other day
# and see if that works
def plotData(allData):
    # Declaring the points for first line plot
    X1 = allData['dates']
    Y1 = allData["visitorData"]['numTotalVisitors']
    fig = plt.figure(figsize=(10,5))
    plt.plot(X1, Y1, label = "Total Visits") 
    X2 = allData['dates']
    Y2 = allData["visitorData"]['numUniqueVisitors']
    plt.plot(X2, Y2, label = "Unique Visits") 
    plt.xlabel('Date') 
    plt.ylabel('Number of Visits') 
    plt.title('SHC Verifier Use') 
    plt.legend() 
    fig.savefig('clickyGraph.jpg', bbox_inches='tight', dpi=150)
    # remove after testing
    plt.show() 



# save graph somewhere? yea that would make sense since this is automated and someone would want to 
# be able to just check it when they need to

# save the info as json somewhere
def saveJson(allData):
    with open('ClickyJson.json', 'w') as json_file:
        json.dump(allData, json_file)

# call the saves all at once
def saveAll(allInfo):
    plotData(allInfo)
    saveJson(allInfo)

# things left to do: 
    # clean up code
    # figure out where/how to store the graph
    # clean up where everything is stored
    # test


# example call: 
    # combinedData = mergeData(getNewData(url), getOldData())
    # saveAll(combinedData)
