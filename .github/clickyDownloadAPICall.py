import requests
import json
import pandas as pd
from datetime import date
  
# don't need to instansiate it, can directly modify the json takin in from previous pulls


### this loads in the old information and stores it in clickyData
with open("clickyData.json", "r") as read_file:
    clickyData = json.load(read_file.read())

# get old data and combine it with the new data here, old data is a dictionary 
#example might be like this: think about how I would save it first before thinking about
# how to reload it
'''
clickyData = {
    visitorData = {
        'numTotalVisitors':[3,12,5],
        'numUniqueVisitors':[2,10,5],
    }
    date = ['2022-7-3','2022-7-10','2022-7-17']
}
'''
### this pulls in the new information from the clicky link
url = "https://api.clicky.com/api/stats/4?site_id=101369228&sitekey=6d6a506f44d45a59&type=visitors-list&date=last-week&output=json"
r = requests.get(url = url)
data = r.json()
jsonString = data.loads()
dataDict = json.loads(jsonString)

'''what it should look like right now: [
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

### this calculates and adds the new information to the old information 
uniqueVisitors = []
totalVisitors = 0
clickyData[visitorData][numTotalVisitors].append(len(dataDict[dates][items]))
for item in dataDict[dates][items]:
        if item not in uniqueVisitors:
            uniqueVisitors.append(item)
clickyData[visitorData][numUniqueVisitors].append(len(uniqueVisitors))
clickyData[date].append(date.today())

'''

now new dict should look like this I think?:
clickyData = {
    visitorData = {
        'numTotalVisitors':[3,12,5,4],
        'numUniqueVisitors':[2,10,5,4],
    }
    date = ['2022-7-3','2022-7-10','2022-7-17','2022-7-24']
}
'''

df = pd.DataFrame(visitorData, index = date)
lines = df.plot.line()

# save graph somewhere? yea that would make sense since this is automated and someone would want to 
# be able to just check it when they need to

# save the info as json somewhere
with open("ClickyData", "w") as fp:
    json.dump(clickyData, fp) 
