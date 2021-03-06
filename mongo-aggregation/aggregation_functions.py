# contains functions to do aggregations on mongodb database



import pandas as pd
#import json



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
            { '$match': 
                {
                    # filter out the recipes that don't have a country (because we want to compare it to the country average
                    'ada-country': { "$not": {"$size": 0}, "$exists": True }
                }
            },
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
            
            
def get_dataframe_per_groupby(collection,  groupBy_fields, aggregation_fields, dataframe_names):
    # computes all aggregations specified in aggregation_fields per entry in groupBy_fields
    # merges all aggregations per entry in groupBy_fields into a single dataframe
    # returns a dict of dataframes for each entry in groupBy_fields
    # dict keys are 'dataframeNames', same order as 'groupBy_fields'
    
    # note: the aggregation can also be done by a combined query, i.e. computing several values for each group
    # for simplicity, we query the database here separately for each aggregate value to compute
    
    assert (len(dataframe_names) == len(groupBy_fields)), 'must have same length' # don't put parentheses
    
    allDfs = dict()
    totalNbQueries = len(groupBy_fields) * len(aggregation_fields)
    i = 1
    for dataframeDictKey, groupByArguments in zip(dataframe_names, groupBy_fields):
        df = None
        groupByColumnName = groupByArguments['group_by_field_output_name']

        for fieldArguments in aggregation_fields:
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




def show_fields(recipeObject, rowPrefix = '> '):
    # recursively displays all fields in the dict structure (possibly dict of dicts of dicts ...)
    # row prefix is what appears before printing key:value
    # used to display a recipe
    for key, value in recipeObject.items():
        if isinstance(value, dict):
            print("{}{}".format(rowPrefix, key))
            show_fields(value, rowPrefix = (rowPrefix + '->-'))
        else:
            valueToShow = "{}".format(value)
            if len(valueToShow) > 20:
                valueToShow = valueToShow[:20] + "..."
            print("{}{}: {}".format(rowPrefix, key, valueToShow))
            

def get_all_field_addresses_with_description(myObject, keyPrefix = "$", shortenLongStrings = True):
    # recursively finds all keys and converts them to a string to see what we can aggregate over
    # e.g. with group_and_get_aggregate_of_field, getAllDataframes 
    # also provides examples of what is in the fields
    # limits strings to 20 characters (+3) if shortenLongStrings is True
    
    all_keys_with_description = dict()
    for key, value in myObject.items():
        if isinstance(value, dict):
            newKeys = get_all_field_addresses_with_description(value, keyPrefix=keyPrefix + key + ".", shortenLongStrings=shortenLongStrings)
            all_keys_with_description.update(newKeys)
            
        else:
            fullKey = keyPrefix + key
            
            valuesToShow = "{}".format(value)
            if shortenLongStrings and (len(valuesToShow) > 20):
                valuesToShow = valuesToShow[:20] + "..."
            all_keys_with_description[fullKey] = valuesToShow
    
    return all_keys_with_description

    
def make_column_name(myName):
    # creates a name inspired from myName removing leading '$' sign (for mongodb) and '.' because of Pandas
    return myName[1:].replace('.', '_') 