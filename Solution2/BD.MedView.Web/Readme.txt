Results:

a4apigen: - i dont know how to change header. There is no grouping by controller

a5apigen: - i believe it simply doesnt work

api-client-generator: - looks ok but same issue - no grouping, arguments separated to interface to provide options

nswag/nswagstudio: - only angular 5

nswag/swagger2tsclient: - only server side

Sthange:
Swagger has reference to nswag for generation client side code, but angular doesnt have it at all!!!

Conclusion:
the best is still a4apigen -  with minor changes possible to use. very close to SWAGGER definition and potentially the most usefull. 
better create my own...