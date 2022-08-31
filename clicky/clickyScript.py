# Unused?
import requests
import json
from datetime import date
from os.path import exists
import matplotlib.pyplot as plt 
 
'''
Retrieves visitor data from the json currently checked into the
repository.

If there is no previous data, creates a template to work with 
and returns that instead.

Returns: a python dictionary of the outdated visitor data
'''
def getOldData():
    if exists('clickyData.json'):
        with open('clickyData.json') as json_file:
            oldDataDict = json.load(json_file)
    else:
        oldDataDict = { 
            'visitData': {
                'numTotalVisits':[],
                'numUniqueVisits':[],
            },
            'dates': []}
    return oldDataDict
        
'''
Retrieves the new visitor data from the Clicky url.

Returns: python list containing new data from the clicky url
'''
def getNewData(clickyUrl):
    # Add a try/catch to throw a user friendly error if there is an error connecting to the Clicky network
    response = requests.get(clickyUrl, verify=False)
    json = response.json()
    newDataList = json[0]['dates'][0]['items']
    # print(newDataList)
    return newDataList

'''
Appends the relevant parts of the new visitor data to the existing
visitor data currently checked into the repository. This includes
the new number of visits, new IP addresses, new unique visits, and
the dates of the new visits.

Returns: the merged data
'''
def merge(newData, oldData):
    numUniqueVisits = []
    # I think we might want to store the unique IP address somehwere in the stored clickyData.json. I don't think we necesarilly care how many unique visitors
    # visit within each week's span, but rather how many new visitors visit each week. Otherwise put, comparing each newData entry to the entire list of ipAddresses
    # that have every visited the site versus just the new week's IP Addresses.

    # Note would also require changing the label in the plotData() function to something like "New Visits"
    oldData["visitData"]['numTotalVisits'].append(len(newData))
    for i in newData:
        ipAddress = i["ip_address"]

        if ipAddress not in numUniqueVisits:
            print(ipAddress)
            numUniqueVisits.append(ipAddress)
    oldData["visitData"]['numUniqueVisits'].append(len(numUniqueVisits))
    t = date.today()
    d = str(t.year) + '-' + str(t.month) + '-' + str(t.day)
    oldData["dates"].append(d)
    return oldData       

'''
Plots the information on a graph and saves the graph to file.
'''
def plotData(allData):
    X1 = allData['dates']
    Y1 = allData['visitData']['numTotalVisits']
    fig = plt.figure(figsize=(10,5))
    plt.plot(X1, Y1, 'o-', label = 'Total Visits') 

    X2 = allData['dates']
    Y2 = allData['visitData']['numUniqueVisits']
    plt.plot(X2, Y2, 'o-', label = 'Unique Visits') 
    
    plt.xlabel('Date') 
    plt.ylabel('Number of Visits') 
    plt.title('SHC Verifier Use') 
    plt.legend() 
    plt.grid()
    fig.savefig('clickyGraph.jpg', bbox_inches='tight', dpi=150) # Same with exact file path comment below

'''
Saves the data to a json file.
'''
def saveJson(allData):
    with open('clickyData.json', 'w') as json_file: #This may need to be a more specific filepath. If this is being run from the .github/workflows folder, I believe the file will be created there (check this)
        json.dump(allData, json_file, indent=4)

'''
Saves the graph and json at the same time
'''
def saveAll(allInfo):
    saveJson(allInfo)
    plotData(allInfo)