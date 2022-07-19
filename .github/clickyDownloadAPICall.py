import requests
import json
  
# api-endpoint
URL = "https://api.clicky.com/api/stats/4?site_id=101369228&sitekey=6d6a506f44d45a59&type=visitors-list&date=last-week&output=json"

# sending get request and saving the response as response object
r = requests.get(url = URL)
  
# extracting data in json format
data = r.json()
jsonString = data.loads()
dataDict = json.loads(jsonString)
            uniqueVisitorList = []
            for item in dataDict.items():
                if item != (ip_address | items):
                    del dataDict[item]
                    if !uniqueVisitorList.contains(dataDict.get(item)):
                        uniqueVisitorList.append(dataDict.get(item))
            totalVisitors = dataDict[items].length()
            uniqueVisitors = uniqueVisitorList.length()