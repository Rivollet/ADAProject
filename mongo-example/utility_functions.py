import json


def prettify_JSON(json_filename, output_json_filename='test.json'):
    # convert to 4 spaces to make json easier to read
    
    with open(json_filename, 'r') as file:
        # indent = spaces per tab for pretty printing
        fileContent = json.load(file)
    
    with open(output_json_filename, 'w') as file:
        # indent = spaces per tab for pretty printing
        json.dump(fileContent, file, indent=4)
    
def load_JSON(json_filename):
    with open(json_filename, 'r') as file:
        # indent = spaces per tab for pretty printing
        json_file_content = json.load(file)
    return json_file_content

def write_JSON(json_filename, data):
    with open(json_filename, 'w') as file:
        # indent = spaces per tab for pretty printing
        json.dump(data, file, indent=4)

def is_number(myStr):
    # str as input, returns true if is int or float
    try:
        float(myStr)
        return True
    except ValueError:
        return False
    
    
def write_dataframes_to_json(json_filename, allDataframes):
    # writes dict of dataframes to file
    # assumes indices are unique: TODO: remove below orient='index'
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