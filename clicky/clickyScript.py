import requests
import json
from datetime import date
from os.path import exists
import matplotlib.pyplot as plt 
 

# retrieves previous data from the json in the repo
# if there is no previous data, it creates a template to work with and returns that instead
# returns either as a python dictionary 
def getOldData():
    if exists('ClickyJson.json'):
        with open('ClickyJson.json') as json_file:
            oldDataDict = json.load(json_file)
    else:
        oldDataDict = { 
            'visitData': {
                'numTotalVisits':[],
                'numUniqueVisits':[],
            },
            'dates': []}
    return oldDataDict
        

# retrieves the new data from the clicky url
# returns it as a python list
def getNewData(clickyUrl):
    # this is a bandaid solution for the SSL, requires further attention
    # would need the certificates to be in place and removal of "verify=False"
    response = requests.get(clickyUrl, verify=False)
    json = response.json()
    newDataList = json[0]['dates'][0]['items']
    return newDataList

# takes the information in the new data and retrieves the relevant parts
# adds those parts to the old data
def merge(newData, oldData):
    numUniqueVisits = []
    oldData["visitData"]['numTotalVisits'].append(len(newData))
    for i in newData:
        ipAddress = i["ip_address"]
        if ipAddress not in numUniqueVisits:
            numUniqueVisits.append(ipAddress)
    oldData["visitData"]['numUniqueVisits'].append(len(numUniqueVisits))
    t = date.today()
    d = str(t.year) + '-' + str(t.month) + '-' + str(t.day)
    oldData["dates"].append(d)
    return oldData       

# plot the information on a graph
# save the graph to file
def plotData(allData):
    X1 = allData['dates']
    Y1 = allData["visitData"]['numTotalVisits']
    fig = plt.figure(figsize=(10,5))
    plt.plot(X1, Y1, 'o-', label = "Total Visits") 
    X2 = allData['dates']
    Y2 = allData["visitData"]['numUniqueVisits']
    plt.plot(X2, Y2, 'o-', label = "Unique Visits") 
    plt.xlabel('Date') 
    plt.ylabel('Number of Visits') 
    plt.title('SHC Verifier Use') 
    plt.legend() 
    plt.grid()
    fig.savefig('clickyGraph.jpg', bbox_inches='tight', dpi=150)

# save the data to a json file
def saveJson(allData):
    with open('ClickyJson.json', 'w') as json_file:
        json.dump(allData, json_file, indent=4)

# save the graph and json at the same time
def saveAll(allInfo):
    saveJson(allInfo)
    plotData(allInfo)