# ADAProject: World recipes viz
Project for Applied Data Analysis class at EPFL.

** PROJECT WEBSITE: http://cocotte-minute.ovh/ada/ **

*Group composed of: Loïc Veyssière, Maximilian Mordig, David Rivollet*

## Abstract
The objective of our project is to analyze recipes from around the world in order to observe cultural differences between world regions. We are going to use interactive and intuitive visualisation to show these differences expressed through the type of food populations eat. One example of such interactive graph would be to show by countries the nutriments contented in the recipes (ex: fat, proteins, salt, etc..). We can also analyze where in the world a specific ingredient (ex: beef, rice, butter, etc..) is mostly consumed.

## Data description
For this project, we will need a lot of recipes in order to have relevant conclusion. Moreover, these recipes need to have the specific information on their geographical origin. The American website [allrecipes.com](http://allrecipes.com/) is one of the most famous webpage for recipe storage on the internet. Thousands of recipes are accessible with all the information needed.

To collect the information on [allrecipes.com](http://allrecipes.com/), three steps are required:
  * Obtain the different categories
  * For each category, obtain a list of recipe ID
  * For each recipe ID, parse the corresponding recipe

For each recipe the information is
 * Basic: Author, Name, Summary, Ingredients, Steps of the description
 * Nutrition: Calories, Fat, Carbs, Protein, Cholesterol, Sodium
 * Community: Rating, reviewCount, Number of "Made It"
 * Time: Preparation, Cook, Ready In
 * Reviews: Number of Reviews, Most helpful reviews

## Feasibility and Risks
The project seems to be feasible as long as we have a well filled data based of recipes and that we have enough recipes for the different world regions. We already tried successfully to extract some recipes from the website [allrecipes.com](http://allrecipes.com/) so we should be able to fill our data based with their information. However, we are still exposed to some risks detailed in the following paragraphs.

### Access to the data
Our data come from a free accessible website ruled by a private company. Therefore, the major risk of the project would be to see our data access to be limited. If the website realizes that we are reading many recipes and decide to block our access, we will have to find another source for our data filling.

### Uncompleted data
Another problem that can occur is that our data can be uncompleted. This issue can appear during the data analysis process. An example of such missing information can be that not all the recipes have detailed quantities of nutriment they content. Therefore, we would not be able to use them in the nutriment consumed by the population of the different region or countries in the world.

### Missing data
Finally, another big risk of our problem would be an inconsistent repartition of the recipes throw world region. If we don't have enough recipes from a specific country/region, the statistical conclusion derived from them would not be relevant. Hence, we would have to look for recipes on other web platform, to fill the lack of information, but data structure can be really different and it could create further problems.

## Deliverables
Our project is going to be presented as a website form where the user will be able to "play" with different interactive visualizations. The principal viz is going to be a map of the world, where one can observe different food and nutriment consumption of the population depending on their world region and ethnic origins. For some specific output, we are also going to make link with other information as the percentage of obese or population mean lifetime to show how food influence health and lifestyle of people.

## Timeplan
**7 november 2016:** Start of the project

**14 november 2016:** Get data needed from the website

**30 november 2016:** Cleaned data divided correctly by world region

**12 december 2016:** Midterm checkpoint - Examples of vizualisations

**5 january 2017:** Start of the website design

**20 january 2017:** External research to extract relevant conclusion of the visualizations.

**31 january 2017:** End of the project. Final submission and update of the website
