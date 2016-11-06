# ADAProject: World recipes viz
Project for Applied Data Analysis class at EPFL.

*Groupe composed by: Loïc Veyssière, Maximilian Mordig, David Rivollet*

## Abstract
The objectif of our project is to analyze recipes from around the world in order to observe cultural differences between world regions. We are going to use interactive and intuitive vizualisation to show these differences expressed through the type of food populations eat. One example of such interactive graph would be to show by countries the nutriments contented in the recipies (ex: fat, proteins, salt, etc..). We can also analyze where in the world a specific ingredient (ex: beef, rice, butter, etc..) is mostly consumed.

## Data description
For this project, we will need a lot of recipes in order to have relevant conclusion. Moreover, these recipes need to have the specific information on their geographical origin. The american website [allrecipes.com](http://allrecipes.com/) is one of the most famous webpage for recipes storage on internet. Thousands of recipes are accessible with all the information needed.

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
### Access to the data
Our data come from a free access website ruled by a private company. The major risk of the project would be to be enable to access the data we need. However, we already tested to fetch some recipes or other information from the website with good result. We are still vulnerable to a ban or any limited access from the website.

### Uncompleted data
An other problem that can occur is that we miss information in the data we'll have. For example, not all recipes have detailed quatities of nutriment they contain. Therefore, these recipes would not be usable for specific vizualisation.

### Missing data
One of the major problem would also be the fact that we won't have many recipes for specific region of the world. Therefore, the conclusion and statistic would not be relevant. In order to counter that, we can look for more recipies on other websites to fill the lack of information for specific countries. We can also regroup countries by relevant region and show statistical information on these bigger region.


## Deliverables

## Timeplan
