# Local Development  

### Setup : 

### Build Game:
1. Install node - https://nodejs.org/en/download/
2. You probably need to restart windows
3. In the command prompt window, run the following commands
4. Npm install -g typescript
5. Npm install -g tslint
6. Npm install
7. Npm run watch

You may hit ctrl-c to stop the watch process after it completes once

8. Install Vagrant to allow for local testing
9. Get Vagrant here: https://www.vagrantup.com/downloads.html
10. Install VirtualBox: https://www.virtualbox.org/wiki/Downloads
11. In a command prompt window, navigate to directory you installed the repo to
12. Type ‘vagrant up’ and press enter

### View game in browser
1. In a browser address window, enter: 192.168.33.15
2. You may need to run ‘vagrant up’ again if you rebooted during installation of node

### Editing Level Files
1. Install the tiled editor - http://www.mapeditor.org/
2. Run the tiled editor
3. Open a scenario file. File->open
4. The files are found at [repo directory]/map_editor_files
5. The scenario files are Scenario_1.json to Scenario_10.json
6. Level editing overview
7. The level editor has a 10 x 10 grid of spaces which corresponds to the given map space
8. There are two conceptual “layers” - one with the different building types on top, and another with the water/lake tiles.
9. There are also a set of properties that correspond to both the start conditions and win conditions of the map

### Object Placement
1. First, make sure the object layer is selected

2. Secondly, select the item that you wish to place in the world.

3. You can then place the item in the world.
4. IMPORTANT NOTE: The blue rectangles are lake types only, and should be placed on the Lake Layer

### Lake Placement
1. See object placement, but select the “Lake” layer first.
2. The blue square is a normal water tile
3. The blue square marked “LS” is a lake source, and has regenerating quality to help clear out dirtied water.

### Editing level goals and properties
To view a map’s properties, select Map -> Map Properties
You will see something similar to the following:

Descriptions of properties:
survey - a link to the survey that the player must take at the end of the scenario 
aquifer - controls if an aquifer exists and what it can contain
-1  - no aquifer present in scenario
>0 - Aquifer exists and contains that many units of water
 background_image  - the background image
world_happy
world_agri
world_arid
world_ind
world_ocean
world_wet
build_list - this is a list of items the player must build to finish the scenario.
Rules:
values must be separated by a |
Example: to require the user to build an agricultural and industrial building, it would be: agricultural|industrial
Valid items (which are the 'name' key for items defined in Tiles.json)
agricultural
industrial
pipe
residential
source
treatment (valid for any upgrade)
wastewatertreatment (valid for any upgrade)
watertower
ending_feedback - the string text the player receives when they finish the scenario
instructions_feedback - the string text the player receives when they start the scenario
link_all_items - when checked, makes sure that all items have water that flows into them
This restriction does not test that all paths lead back to the lake
The "number" arguments. How many of these tiles do you need to finish the scenario 
num_agr, num_ind, num_res
Numbers
-1 = ignore
>0 - number needed to finish
If you are using these numbers, do not put corresponding agricultural/industrial/residential items in build_list
start_money - if present, the amount of money the player starts with
win_complete_circuit - The player must have at least one complete source-to-lake circuit to win
win_money
-1 ignored
>0 the player must have at least this much money to end scenario
win_population
-1 ignored
>0 the player must have at least this much population to end scenario
disable_policy
This is an item of a "bool" type. If it is present and checked, the policy menu will not show up in the level

### Editing Tile Values
Tile values are stored in [repo directory]/json/Tiles.json
value explanations (if a value is listed but not explained in this list, it is a holdover from an earlier version and can be ignored)
"integrity" - the "strength" of an item that decreases every second, can be repaired
"cost" - cost to build 
"current_water_usage" - Multiplier used to determine a drop in quality.
    "max_water_storage": - The max storage for this item
    "current_population": - the starting population
    "money_generated_per_usage": - how much money is generated when water flows into this tile
    "population_generated_per_usage" - how much population is gained when water flows into this tile
    "evaporation_per_usage": how much water evaporates
    "quality_drop_per_usage": used in the formula current_water_usage * current_population * quality_drop_per_usage

### Editing Other Values:
Misc values are stored in [repo directory]/json/Vars.json
This currently stores the money cost of repairs and how many quality points an item degrades per second
"tutorial_text" is the text that shows up when the player clicks on the "help" button under CJ's head

### Linking the game to a survey:
Go to google forms: https://docs.google.com/forms/
Create a new form
Create all questions
Link it to game
Click the SEND button in the upper right corner
Click the "link" in the "Send Via" option. It will be the 2nd option
Copy the link url provided, go into the scenario in Tiled, and copy the link into the "survey" property for the map
Save the map
Save responses in an excel file
In the form creation window, click "Responses"
Then click the green button with the plus symbol on it "Save responses in sheets"
All responses will then be collated into the sheet 

### Deploying to web
To deploy to the web, copy the following files and directories to the web:
Files
howtoplay.html
index.html
about.html
Directories
build
fonts
lib
json
map_editor_files
sounds
sprites

