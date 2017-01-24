import pandas as pd


def group_and_get_aggregate_of_field(collection, group_by_field_address, aggregate_field_address, 
                                    group_by_field_output_name, aggregate_field_output_name, 
                                    aggregationFunction = '$avg' ):
    # querys the collection and groups by a field and applies an aggregation function over the field to aggregate
    # 'group_by_field_address' is the address of the field to group by in the database, needs to have a '$' sign!
    # 'group_by_field_output_name' is the name used for it in the output dict
    # if (group_by_field_address == 'get_global_aggregation'), then aggregates over all recipes (no grouping)
    # $avg and similar functions ignore the entry whenever it does not make sense
    # Example:
    #results = get_aggregate_ofFieldPerCountry(group_by_field_address='$ada-country', 
    #                            aggregate_field_address='$nutrition.calories.amount', 
    #                            group_by_field_output_name='country', 
    #                            aggregate_field_output_name='avgCalories', 
    #                            aggregationFunction = '$avg' 
    #                           )
    # returns a list of dicts
    #
    # errors: '$expressions are not allowed at the top-level of $project': output names cannot start with dollar sign
    
    if group_by_field_address != 'get_global_aggregation':
        aggregateQuery = [ 
            { "$unwind": 
             # e.g. '$ada-country'
                 group_by_field_address
            },
            { '$group': 
                {
                    '_id': { 'groupByField': group_by_field_address },
                    # e.g. 'avgCalories': { '$avg': '$nutrition.calories.amount' },
                    'aggregatedQuantity': {aggregationFunction: aggregate_field_address}, 
                    'nbRecipes': { "$sum": 1},
                }
            },
            { '$project': 
                {
                    '_id': 0,
                    # e.g. 'avgCalories': "$avgCalories",
                    group_by_field_output_name: "$_id.groupByField",
                    aggregate_field_output_name: "$aggregatedQuantity",
                    'nbRecipes': "$nbRecipes",
                }    
            }
        ]
        
    else:
        # when global aggregation should be performed
        
        aggregateQuery = [ 
            { '$group': 
                {
                    '_id': "null",
                    # e.g. 'avgCalories': { '$avg': '$nutrition.calories.amount' },
                    'aggregatedQuantity': {aggregationFunction: aggregate_field_address}, 
                    'nbRecipes': { "$sum": 1},
                }
            },
            { '$project': 
                {
                    '_id': 0,
                    # e.g. 'avgCalories': "$avgCalories",
                    group_by_field_output_name: { "$literal": "Global aggregation" }, # just one row
                    aggregate_field_output_name: "$aggregatedQuantity",
                    'nbRecipes': "$nbRecipes",
                }    
            }
        ]
        
    
    if 'group_by_field_address' == 'get_global_average':
        # remove unwind because global average
        aggregateQuery = aggregateQuery[1:]
        
    
    results = collection.aggregate(aggregateQuery)
    
    # avoid loosing the data
    return list(results)



def showFields(recipeObject, rowPrefix = '> '):
    # This methods recursively displays all fields in the dict structure (possibly dict of dicts of dicts ...)
    # row prefix is what appears before printing key:value
    # used to display a recipe
    for key, value in recipeObject.items():
        if isinstance(value, dict):
            print("{}{}".format(rowPrefix, key))
            showFields(value, rowPrefix = (rowPrefix + '->-'))
        else:
            valueToShow = "{}".format(value)
            if len(valueToShow) > 20:
                valueToShow = valueToShow[:20] + "..."
            print("{}{}: {}".format(rowPrefix, key, valueToShow))
            
            
def getAllDataframes(collection, groupBysToQuery, fieldArgumentsToQuery, dataframeNames):
    # returns a dict of dataframes for each distinct groupBy
    # merges all aggregations per groupBy
    # dict keys are 'dataframeNames', same order as 'groupBysToQuery'
    
    
    allDfs = dict()
    totalNbQueries = len(groupBysToQuery) * len(fieldArgumentsToQuery)
    i = 1
    for dataframeDictKey, groupByArguments in zip(dataframeNames, groupBysToQuery):
        df = None
        groupByColumnName = groupByArguments['group_by_field_output_name']

        for fieldArguments in fieldArgumentsToQuery:
            allArguments = dict(groupByArguments, **fieldArguments) # merge both dicts
            print('Query {}/{} with arguments: {}'.format(i, totalNbQueries, allArguments))
            results = group_and_get_aggregate_of_field(collection, **allArguments)

            localDf = pd.DataFrame.from_dict(results)
            #if groupByArguments['group_by_field_output_name'] == 'get_global_aggregation':
            #    localDf[]
                
            if df is None:
                df = localDf
            else:
                aggregateColumnName = fieldArguments['aggregate_field_output_name']
                #print("{}: {}".format(aggregateColumnName, groupByColumnName))

                df = df.merge(localDf[[groupByColumnName, aggregateColumnName]], how='outer', on=groupByColumnName)
                

            i = i+1

        df = df.set_index([groupByColumnName])
        df = df.sort_index()

        allDfs[dataframeDictKey] = df
        
    return allDfs


import json

def write_dataframes_to_json(json_filename, allDataframes):
    # writes dict of dataframes to file
    with open(json_filename, 'w') as file:
        # indent = spaces per tab for pretty printing
        json.dump(allDataframes, file, indent=4,
                  default=lambda df: json.loads(df.to_json(orient='index'))) # default gets called when cannot be serialized
    

#def load_dataframes_from_json(json_filename):
#    with open(json_filename, 'r') as file:
#        # indent = spaces per tab for pretty printing
#        allDataframes = json.load(file)#, object_hook=lambda myDict: pd.read_json(myDict))
#     
#    return allDataframes


def get_all_field_addresses(myObject, keyPrefix = "$", shortenLongStrings = True):
    # This methods recursively finds all keys and converts them to a string to see what we can aggregate over
    # e.g. with group_and_get_aggregate_of_field, getAllDataframes 
    # also provides examples of what is in the fields
    # limits strings to 20 characters (+3) if shortenLongStrings is True
    
    allKeysWithDescription = dict()
    for key, value in myObject.items():
        if isinstance(value, dict):
            newKeys = get_all_field_addresses(value, keyPrefix=keyPrefix + key + ".", shortenLongStrings=shortenLongStrings)
            allKeysWithDescription.update(newKeys)
            
        else:
            fullKey = keyPrefix + key
            
            valuesToShow = "{}".format(value)
            if shortenLongStrings and (len(valuesToShow) > 20):
                valuesToShow = valuesToShow[:20] + "..."
            allKeysWithDescription[fullKey] = valuesToShow
    
    return allKeysWithDescription # sort